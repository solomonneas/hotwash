"""
Markdown Parser for Hotwash

Converts structured markdown playbooks into a node/edge graph format compatible with React Flow.

Parsing Rules:
- H1/H2 headers become phase nodes
- Numbered lists become sequential step nodes
- Bullet points with 'if/when/else' become decision nodes with branches
- Code blocks become 'execute' nodes with code content
"""

import re
from typing import List, Dict, Any, Tuple, Optional
from api.models import PlaybookNode, PlaybookEdge, PlaybookGraph


class MarkdownParser:
    """Parser for converting markdown playbooks to flowchart graphs."""

    def __init__(self):
        """Initialize the markdown parser."""
        self.nodes: List[PlaybookNode] = []
        self.edges: List[PlaybookEdge] = []
        self.node_counter = 0
        self.edge_counter = 0
        self.last_node_id: Optional[str] = None
        self.phase_stack: List[str] = []  # Track current phase hierarchy

    def parse(self, content: str) -> PlaybookGraph:
        """
        Parse markdown content into a flowchart graph.

        Args:
            content: Markdown string to parse

        Returns:
            PlaybookGraph with nodes and edges
        """
        # Reset state for fresh parse
        self.nodes = []
        self.edges = []
        self.node_counter = 0
        self.edge_counter = 0
        self.last_node_id = None
        self.phase_stack = []

        lines = content.split('\n')
        i = 0

        while i < len(lines):
            line = lines[i]
            stripped = line.strip()

            # Skip empty lines
            if not stripped:
                i += 1
                continue

            # Parse headers (H1/H2) as phase nodes
            if stripped.startswith('#'):
                self._parse_header(stripped)
                i += 1
                continue

            # Parse numbered lists as sequential steps
            if re.match(r'^\d+\.', stripped):
                self._parse_numbered_list_item(stripped)
                i += 1
                continue

            # Parse bullet points (check for decision keywords)
            if stripped.startswith('-') or stripped.startswith('*'):
                i = self._parse_bullet_point(lines, i)
                continue

            # Parse code blocks as execute nodes
            if stripped.startswith('```'):
                i = self._parse_code_block(lines, i)
                continue

            i += 1

        return PlaybookGraph(nodes=self.nodes, edges=self.edges)

    def _parse_header(self, line: str) -> None:
        """
        Parse markdown header into a phase node.

        Args:
            line: Header line (e.g., "# Phase 1" or "## Setup")
        """
        # Count hashes to determine header level
        level = 0
        for char in line:
            if char == '#':
                level += 1
            else:
                break

        label = line.lstrip('#').strip()
        node_id = self._create_node_id()

        # Create phase node
        node = PlaybookNode(
            id=node_id,
            label=label,
            type="phase",
            metadata={"level": level, "header_type": f"h{level}"}
        )
        self.nodes.append(node)

        # Connect to previous node if exists
        if self.last_node_id:
            self._create_edge(self.last_node_id, node_id)

        self.last_node_id = node_id

        # Update phase stack
        if level == 1:
            self.phase_stack = [node_id]
        elif level == 2 and self.phase_stack:
            self.phase_stack = [self.phase_stack[0], node_id]

    def _parse_numbered_list_item(self, line: str) -> None:
        """
        Parse numbered list item into a sequential step node.

        Args:
            line: Numbered list line (e.g., "1. Install dependencies")
        """
        # Extract the text after the number
        match = re.match(r'^\d+\.\s*(.+)$', line)
        if not match:
            return

        label = match.group(1).strip()
        node_id = self._create_node_id()

        # Create step node
        node = PlaybookNode(
            id=node_id,
            label=label,
            type="step",
            metadata={"step_type": "sequential"}
        )
        self.nodes.append(node)

        # Connect to previous node
        if self.last_node_id:
            self._create_edge(self.last_node_id, node_id)

        self.last_node_id = node_id

    def _parse_bullet_point(self, lines: List[str], start_idx: int) -> int:
        """
        Parse bullet point, detecting decision nodes with if/when/else keywords.

        Args:
            lines: All lines in the document
            start_idx: Current line index

        Returns:
            Next line index to process
        """
        line = lines[start_idx].strip()

        # Extract bullet content
        if line.startswith('-'):
            content = line[1:].strip()
        elif line.startswith('*'):
            content = line[1:].strip()
        else:
            return start_idx + 1

        # Check for decision keywords
        decision_keywords = ['if ', 'when ', 'else', 'otherwise', 'or if', 'elif']
        is_decision = any(keyword in content.lower() for keyword in decision_keywords)

        if is_decision:
            return self._parse_decision_node(lines, start_idx, content)
        else:
            # Regular bullet point - treat as step
            node_id = self._create_node_id()
            node = PlaybookNode(
                id=node_id,
                label=content,
                type="step",
                metadata={"step_type": "bullet"}
            )
            self.nodes.append(node)

            if self.last_node_id:
                self._create_edge(self.last_node_id, node_id)

            self.last_node_id = node_id
            return start_idx + 1

    def _parse_decision_node(self, lines: List[str], start_idx: int, content: str) -> int:
        """
        Parse a decision node with branches.

        Args:
            lines: All lines in the document
            start_idx: Current line index
            content: Content of the decision line

        Returns:
            Next line index to process
        """
        # Create decision node
        decision_id = self._create_node_id()

        # Extract condition text
        condition = self._extract_condition(content)

        node = PlaybookNode(
            id=decision_id,
            label=condition,
            type="decision",
            metadata={"condition": content}
        )
        self.nodes.append(node)

        # Connect to previous node
        if self.last_node_id:
            self._create_edge(self.last_node_id, decision_id)

        # Look ahead for nested items (branches)
        idx = start_idx + 1
        branches: List[Tuple[str, str]] = []  # (label, content) pairs

        while idx < len(lines):
            next_line = lines[idx]
            stripped = next_line.strip()

            # Check if this is an indented item (branch)
            if next_line.startswith('  -') or next_line.startswith('  *') or next_line.startswith('    -') or next_line.startswith('    *'):
                branch_content = stripped[1:].strip()

                # Determine branch label
                if 'else' in content.lower() or 'otherwise' in content.lower():
                    branch_label = 'no'
                elif branches:
                    branch_label = 'no'
                else:
                    branch_label = 'yes'

                branches.append((branch_label, branch_content))
                idx += 1
            else:
                break

        # Create branch nodes
        merge_node_id: Optional[str] = None

        for branch_label, branch_content in branches:
            branch_node_id = self._create_node_id()
            branch_node = PlaybookNode(
                id=branch_node_id,
                label=branch_content,
                type="step",
                metadata={"branch": branch_label}
            )
            self.nodes.append(branch_node)

            # Connect decision to branch
            self._create_edge(decision_id, branch_node_id, label=branch_label)

            # Create merge point if multiple branches
            if not merge_node_id and len(branches) > 1:
                merge_node_id = self._create_node_id()
                merge_node = PlaybookNode(
                    id=merge_node_id,
                    label="Continue",
                    type="merge",
                    metadata={"merge_type": "decision"}
                )
                self.nodes.append(merge_node)

            # Connect branch to merge
            if merge_node_id:
                self._create_edge(branch_node_id, merge_node_id)

        # Update last_node_id to merge point or decision node
        self.last_node_id = merge_node_id if merge_node_id else decision_id

        return idx

    def _parse_code_block(self, lines: List[str], start_idx: int) -> int:
        """
        Parse code block into an execute node.

        Args:
            lines: All lines in the document
            start_idx: Current line index (should be opening ```)

        Returns:
            Next line index to process
        """
        opening_line = lines[start_idx].strip()
        language = opening_line[3:].strip() if len(opening_line) > 3 else ""

        # Collect code content
        code_lines = []
        idx = start_idx + 1

        while idx < len(lines):
            if lines[idx].strip().startswith('```'):
                # Found closing backticks
                break
            code_lines.append(lines[idx])
            idx += 1

        code_content = '\n'.join(code_lines)

        # Create execute node
        node_id = self._create_node_id()
        node = PlaybookNode(
            id=node_id,
            label=f"Execute {language}" if language else "Execute code",
            type="execute",
            metadata={
                "code": code_content,
                "language": language
            }
        )
        self.nodes.append(node)

        # Connect to previous node
        if self.last_node_id:
            self._create_edge(self.last_node_id, node_id)

        self.last_node_id = node_id

        # Return index after closing backticks
        return idx + 1

    def _extract_condition(self, content: str) -> str:
        """
        Extract clean condition text from decision content.

        Args:
            content: Full content of decision line

        Returns:
            Cleaned condition text
        """
        # Remove common prefixes
        for prefix in ['if ', 'when ', 'else ', 'otherwise ', 'or if ', 'elif ']:
            if content.lower().startswith(prefix):
                content = content[len(prefix):].strip()
                break

        # Capitalize first letter
        if content:
            content = content[0].upper() + content[1:]

        # Add question mark if not present
        if content and not content.endswith('?'):
            content += '?'

        return content

    def _create_node_id(self) -> str:
        """
        Generate unique node ID.

        Returns:
            Node ID string
        """
        node_id = f"node_{self.node_counter}"
        self.node_counter += 1
        return node_id

    def _create_edge(self, source: str, target: str, label: Optional[str] = None) -> None:
        """
        Create an edge between two nodes.

        Args:
            source: Source node ID
            target: Target node ID
            label: Optional edge label
        """
        edge_id = f"edge_{self.edge_counter}"
        self.edge_counter += 1

        edge = PlaybookEdge(
            id=edge_id,
            source=source,
            target=target,
            label=label
        )
        self.edges.append(edge)
