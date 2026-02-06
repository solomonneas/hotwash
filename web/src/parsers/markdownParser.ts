/**
 * Markdown Parser for Playbook Forge (Client-Side)
 *
 * TypeScript port of api/parsers/markdown_parser.py
 *
 * Converts structured markdown playbooks into a node/edge graph format
 * compatible with React Flow.
 *
 * Parsing Rules:
 * - H1/H2 headers become phase nodes
 * - Numbered lists become sequential step nodes
 * - Bullet points with 'if/when/else' become decision nodes with branches
 * - Code blocks become 'execute' nodes with code content
 * - Automatic edges between sequential elements
 */

import {
  PlaybookNode,
  PlaybookEdge,
  PlaybookGraph,
  PlaybookMetadata,
  ParseResult,
  NodeType,
} from '../types';

class MarkdownParser {
  private nodes: PlaybookNode[] = [];
  private edges: PlaybookEdge[] = [];
  private nodeCounter = 0;
  private edgeCounter = 0;
  private lastNodeId: string | null = null;
  private phaseStack: string[] = [];

  /**
   * Parse markdown content into a flowchart graph.
   */
  parse(content: string): PlaybookGraph {
    // Reset state for fresh parse
    this.nodes = [];
    this.edges = [];
    this.nodeCounter = 0;
    this.edgeCounter = 0;
    this.lastNodeId = null;
    this.phaseStack = [];

    const lines = content.split('\n');
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];
      const stripped = line.trim();

      // Skip empty lines
      if (!stripped) {
        i++;
        continue;
      }

      // Parse headers (H1/H2) as phase nodes
      if (stripped.startsWith('#')) {
        this.parseHeader(stripped);
        i++;
        continue;
      }

      // Parse numbered lists as sequential steps
      if (/^\d+\./.test(stripped)) {
        this.parseNumberedListItem(stripped);
        i++;
        continue;
      }

      // Parse bullet points (check for decision keywords)
      if (stripped.startsWith('-') || stripped.startsWith('*')) {
        i = this.parseBulletPoint(lines, i);
        continue;
      }

      // Parse code blocks as execute nodes
      if (stripped.startsWith('```')) {
        i = this.parseCodeBlock(lines, i);
        continue;
      }

      i++;
    }

    return { nodes: this.nodes, edges: this.edges };
  }

  /**
   * Parse markdown header into a phase node.
   */
  private parseHeader(line: string): void {
    let level = 0;
    for (const char of line) {
      if (char === '#') {
        level++;
      } else {
        break;
      }
    }

    const label = line.replace(/^#+\s*/, '').trim();
    // Skip emoji-only or empty labels
    if (!label) return;

    const nodeId = this.createNodeId();

    const node: PlaybookNode = {
      id: nodeId,
      label,
      type: 'phase',
      metadata: { level, header_type: `h${level}` },
    };
    this.nodes.push(node);

    // Connect to previous node if exists
    if (this.lastNodeId) {
      this.createEdge(this.lastNodeId, nodeId);
    }

    this.lastNodeId = nodeId;

    // Update phase stack
    if (level === 1) {
      this.phaseStack = [nodeId];
    } else if (level === 2 && this.phaseStack.length > 0) {
      this.phaseStack = [this.phaseStack[0], nodeId];
    }
  }

  /**
   * Parse numbered list item into a sequential step node.
   */
  private parseNumberedListItem(line: string): void {
    const match = line.match(/^\d+\.\s*(.+)$/);
    if (!match) return;

    const label = match[1].trim();
    const nodeId = this.createNodeId();

    const node: PlaybookNode = {
      id: nodeId,
      label,
      type: 'step',
      metadata: { step_type: 'sequential' },
    };
    this.nodes.push(node);

    if (this.lastNodeId) {
      this.createEdge(this.lastNodeId, nodeId);
    }

    this.lastNodeId = nodeId;
  }

  /**
   * Parse bullet point, detecting decision nodes with if/when/else keywords.
   */
  private parseBulletPoint(lines: string[], startIdx: number): number {
    const line = lines[startIdx].trim();

    let content: string;
    if (line.startsWith('-')) {
      content = line.slice(1).trim();
    } else if (line.startsWith('*')) {
      content = line.slice(1).trim();
    } else {
      return startIdx + 1;
    }

    // Check for decision keywords
    const decisionKeywords = ['if ', 'when ', 'else', 'otherwise', 'or if', 'elif'];
    const isDecision = decisionKeywords.some((kw) =>
      content.toLowerCase().includes(kw)
    );

    if (isDecision) {
      return this.parseDecisionNode(lines, startIdx, content);
    } else {
      // Regular bullet point - treat as step
      const nodeId = this.createNodeId();
      const node: PlaybookNode = {
        id: nodeId,
        label: content,
        type: 'step',
        metadata: { step_type: 'bullet' },
      };
      this.nodes.push(node);

      if (this.lastNodeId) {
        this.createEdge(this.lastNodeId, nodeId);
      }

      this.lastNodeId = nodeId;
      return startIdx + 1;
    }
  }

  /**
   * Parse a decision node with branches.
   */
  private parseDecisionNode(
    lines: string[],
    startIdx: number,
    content: string
  ): number {
    const decisionId = this.createNodeId();
    const condition = this.extractCondition(content);

    const node: PlaybookNode = {
      id: decisionId,
      label: condition,
      type: 'decision',
      metadata: { condition: content },
    };
    this.nodes.push(node);

    if (this.lastNodeId) {
      this.createEdge(this.lastNodeId, decisionId);
    }

    // Look ahead for nested items (branches)
    let idx = startIdx + 1;
    const branches: Array<{ label: string; content: string }> = [];

    while (idx < lines.length) {
      const nextLine = lines[idx];
      const stripped = nextLine.trim();

      // Check if this is an indented item (branch)
      if (
        nextLine.startsWith('  -') ||
        nextLine.startsWith('  *') ||
        nextLine.startsWith('    -') ||
        nextLine.startsWith('    *')
      ) {
        const branchContent = stripped.slice(1).trim();

        // Determine branch label
        let branchLabel: string;
        if (
          content.toLowerCase().includes('else') ||
          content.toLowerCase().includes('otherwise')
        ) {
          branchLabel = 'no';
        } else if (branches.length > 0) {
          branchLabel = 'no';
        } else {
          branchLabel = 'yes';
        }

        branches.push({ label: branchLabel, content: branchContent });
        idx++;
      } else {
        break;
      }
    }

    // Create branch nodes
    let mergeNodeId: string | null = null;

    for (const branch of branches) {
      const branchNodeId = this.createNodeId();
      const branchNode: PlaybookNode = {
        id: branchNodeId,
        label: branch.content,
        type: 'step',
        metadata: { branch: branch.label },
      };
      this.nodes.push(branchNode);

      // Connect decision to branch
      this.createEdge(decisionId, branchNodeId, branch.label);

      // Create merge point if multiple branches
      if (!mergeNodeId && branches.length > 1) {
        mergeNodeId = this.createNodeId();
        const mergeNode: PlaybookNode = {
          id: mergeNodeId,
          label: 'Continue',
          type: 'step' as NodeType, // 'merge' maps to step for rendering
          metadata: { merge_type: 'decision' },
        };
        this.nodes.push(mergeNode);
      }

      // Connect branch to merge
      if (mergeNodeId) {
        this.createEdge(branchNodeId, mergeNodeId);
      }
    }

    // Update lastNodeId to merge point or decision node
    this.lastNodeId = mergeNodeId ?? decisionId;

    return idx;
  }

  /**
   * Parse code block into an execute node.
   */
  private parseCodeBlock(lines: string[], startIdx: number): number {
    const openingLine = lines[startIdx].trim();
    const language =
      openingLine.length > 3 ? openingLine.slice(3).trim() : '';

    const codeLines: string[] = [];
    let idx = startIdx + 1;

    while (idx < lines.length) {
      if (lines[idx].trim().startsWith('```')) {
        break;
      }
      codeLines.push(lines[idx]);
      idx++;
    }

    const codeContent = codeLines.join('\n');
    const nodeId = this.createNodeId();

    const node: PlaybookNode = {
      id: nodeId,
      label: language ? `Execute ${language}` : 'Execute code',
      type: 'execute',
      metadata: {
        code: codeContent,
        language,
      },
    };
    this.nodes.push(node);

    if (this.lastNodeId) {
      this.createEdge(this.lastNodeId, nodeId);
    }

    this.lastNodeId = nodeId;

    // Return index after closing backticks
    return idx + 1;
  }

  /**
   * Extract clean condition text from decision content.
   */
  private extractCondition(content: string): string {
    let cleaned = content;
    const prefixes = [
      'if ',
      'when ',
      'else ',
      'otherwise ',
      'or if ',
      'elif ',
    ];

    for (const prefix of prefixes) {
      if (cleaned.toLowerCase().startsWith(prefix)) {
        cleaned = cleaned.slice(prefix.length).trim();
        break;
      }
    }

    // Capitalize first letter
    if (cleaned) {
      cleaned = cleaned[0].toUpperCase() + cleaned.slice(1);
    }

    // Add question mark if not present
    if (cleaned && !cleaned.endsWith('?')) {
      cleaned += '?';
    }

    return cleaned;
  }

  /**
   * Generate unique node ID.
   */
  private createNodeId(): string {
    const id = `node_${this.nodeCounter}`;
    this.nodeCounter++;
    return id;
  }

  /**
   * Create an edge between two nodes.
   */
  private createEdge(
    source: string,
    target: string,
    label?: string
  ): void {
    const id = `edge_${this.edgeCounter}`;
    this.edgeCounter++;

    const edge: PlaybookEdge = {
      id,
      source,
      target,
      ...(label ? { label } : {}),
    };
    this.edges.push(edge);
  }
}

/**
 * Extract metadata from markdown content (frontmatter/headers).
 */
function extractMetadata(content: string): PlaybookMetadata {
  const metadata: PlaybookMetadata = {
    title: 'Untitled Playbook',
    type: 'General',
    tooling: 'N/A',
  };

  const lines = content.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();

    // Title from first H1
    if (trimmed.startsWith('# ') && metadata.title === 'Untitled Playbook') {
      metadata.title = trimmed.replace(/^#\s*/, '').trim();
    }

    // Type from **Type:** pattern
    const typeMatch = trimmed.match(/\*\*Type:\*\*\s*(.+)/);
    if (typeMatch) {
      metadata.type = typeMatch[1].trim();
    }

    // Tooling from **Tooling:** pattern
    const toolingMatch = trimmed.match(/\*\*Tooling:\*\*\s*(.+)/);
    if (toolingMatch) {
      metadata.tooling = toolingMatch[1].trim();
    }

    // Difficulty from **Difficulty:** pattern
    const difficultyMatch = trimmed.match(/\*\*Difficulty:\*\*\s*(.+)/);
    if (difficultyMatch) {
      const d = difficultyMatch[1].trim();
      if (d === 'Beginner' || d === 'Intermediate' || d === 'Advanced') {
        metadata.difficulty = d;
      }
    }

    // Estimated time
    const timeMatch = trimmed.match(/\*\*Estimated Time:\*\*\s*(.+)/);
    if (timeMatch) {
      metadata.estimatedTime = timeMatch[1].trim();
    }

    // Last updated
    const updatedMatch = trimmed.match(/\*\*Last Updated:\*\*\s*(.+)/);
    if (updatedMatch) {
      metadata.lastUpdated = updatedMatch[1].trim();
    }
  }

  return metadata;
}

/**
 * Main parse function — returns a full ParseResult including metadata.
 */
export function parseMarkdown(content: string): ParseResult {
  const start = performance.now();
  const parser = new MarkdownParser();
  const errors: string[] = [];

  let graph: PlaybookGraph;
  try {
    graph = parser.parse(content);
  } catch (err) {
    errors.push(err instanceof Error ? err.message : 'Unknown parse error');
    graph = { nodes: [], edges: [] };
  }

  const metadata = extractMetadata(content);
  const parseTimeMs = performance.now() - start;

  return { graph, metadata, errors, parseTimeMs };
}

/**
 * Quick-parse that returns just the PlaybookGraph.
 */
export function parseMarkdownToGraph(content: string): PlaybookGraph {
  const parser = new MarkdownParser();
  return parser.parse(content);
}

export default MarkdownParser;
