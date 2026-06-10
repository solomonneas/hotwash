import { describe, expect, it } from 'vitest';

import { parseMarkdown, parseMarkdownToGraph } from './markdownParser';

describe('parseMarkdownToGraph', () => {
  it('returns an empty graph for empty input', () => {
    const graph = parseMarkdownToGraph('');
    expect(graph.nodes).toEqual([]);
    expect(graph.edges).toEqual([]);
  });

  it('parses H1/H2 headers as phase nodes with level metadata', () => {
    const graph = parseMarkdownToGraph('# Detection\n\n## Triage\n');
    expect(graph.nodes).toHaveLength(2);
    expect(graph.nodes[0]).toMatchObject({
      label: 'Detection',
      type: 'phase',
      metadata: { level: 1, header_type: 'h1' },
    });
    expect(graph.nodes[1]).toMatchObject({
      label: 'Triage',
      type: 'phase',
      metadata: { level: 2, header_type: 'h2' },
    });
    expect(graph.edges).toHaveLength(1);
    expect(graph.edges[0]).toMatchObject({
      source: graph.nodes[0].id,
      target: graph.nodes[1].id,
    });
  });

  it('parses numbered lists as sequential step nodes chained by edges', () => {
    const graph = parseMarkdownToGraph(
      '# Phase\n1. Identify hosts\n2. Collect evidence\n3. Notify on-call\n'
    );
    const steps = graph.nodes.filter((n) => n.type === 'step');
    expect(steps.map((s) => s.label)).toEqual([
      'Identify hosts',
      'Collect evidence',
      'Notify on-call',
    ]);
    steps.forEach((s) => expect(s.metadata?.step_type).toBe('sequential'));
    // phase -> step1 -> step2 -> step3
    expect(graph.edges).toHaveLength(3);
  });

  it('parses plain bullets as bullet steps', () => {
    const graph = parseMarkdownToGraph('- Check EDR alerts\n* Review SIEM\n');
    expect(graph.nodes).toHaveLength(2);
    graph.nodes.forEach((n) => {
      expect(n.type).toBe('step');
      expect(n.metadata?.step_type).toBe('bullet');
    });
  });

  it('detects decision bullets via if/when keywords and captures branches', () => {
    const md = [
      '# Analysis',
      '- If the host is critical?',
      '  - YES: Isolate from network',
      '  - NO: Begin forensic collection',
      '',
    ].join('\n');
    const graph = parseMarkdownToGraph(md);
    const decision = graph.nodes.find((n) => n.type === 'decision');
    expect(decision).toBeDefined();
    expect(decision?.metadata?.condition).toContain('If the host is critical');
    // Decision should fan out to more than one downstream node.
    const outgoing = graph.edges.filter((e) => e.source === decision?.id);
    expect(outgoing.length).toBeGreaterThanOrEqual(2);
  });

  it('parses fenced code blocks as execute nodes', () => {
    const md = '# Contain\n```bash\nwazuh-control restart\n```\n';
    const graph = parseMarkdownToGraph(md);
    const execute = graph.nodes.find((n) => n.type === 'execute');
    expect(execute).toBeDefined();
    expect(JSON.stringify(execute?.metadata)).toContain('wazuh-control restart');
  });

  it('produces unique node ids', () => {
    const md = '# A\n1. one\n2. two\n- bullet\n';
    const graph = parseMarkdownToGraph(md);
    const ids = graph.nodes.map((n) => n.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('parseMarkdown', () => {
  it('returns a ParseResult with no errors for valid input', () => {
    const result = parseMarkdown('# Title\n1. step one\n');
    expect(result.errors).toEqual([]);
    expect(result.graph.nodes.length).toBeGreaterThan(0);
    expect(result.parseTimeMs).toBeGreaterThanOrEqual(0);
  });

  it('extracts difficulty and estimated time metadata', () => {
    const md = [
      '# Ransomware Response',
      '**Difficulty:** Intermediate',
      '**Estimated Time:** 45 minutes',
      '1. Triage',
    ].join('\n');
    const result = parseMarkdown(md);
    expect(result.metadata.difficulty).toBe('Intermediate');
    expect(result.metadata.estimatedTime).toBe('45 minutes');
  });

  it('never throws on malformed input', () => {
    const weird = '```\nunclosed fence\n# Header inside?\n- if maybe\n';
    const result = parseMarkdown(weird);
    expect(result.graph).toBeDefined();
  });
});
