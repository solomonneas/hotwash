/**
 * V5 Import — Clean Academic Submission Form
 *
 * Minimal form with serif typography. "Submit a new playbook" in the style
 * of a journal manuscript submission. Clean, unadorned.
 */

import React, { useState } from 'react';
import { useParser } from '../../../hooks/useParser';
import FlowCanvas from '../../../components/FlowCanvas';
import { v5Theme } from '../theme';
import { v5NodeTypes } from '../nodes';
import './Import.css';

const SAMPLE_MARKDOWN = `# Incident Response Playbook
**Type:** Incident Response
**Tooling:** SIEM + EDR + SOAR

---

## Phase 1: Detection & Triage
### Alert Assessment
- If alert severity is Critical then escalate to Tier 3
- If alert is false positive then close and document

### Context Gathering
\`\`\`bash
grep -i "malicious" /var/log/syslog | tail -50
\`\`\`

## Phase 2: Containment
1. Isolate affected endpoint from network
2. Block IOCs at perimeter firewall
3. Preserve forensic evidence

## Phase 3: Eradication
\`\`\`powershell
Remove-Item -Path C:\\malware -Recurse -Force
Get-Process | Where {$_.Path -like "*suspicious*"} | Stop-Process
\`\`\`

## Phase 4: Recovery & Lessons Learned
1. Restore systems from verified clean backup
2. Validate system integrity with baseline check
3. Conduct post-incident review within 48 hours
4. Update detection rules based on findings
`;

const Import: React.FC = () => {
  const [markdownInput, setMarkdownInput] = useState('');
  const { result, parse, parsed, clear } = useParser();

  const handleParse = () => {
    if (markdownInput.trim()) {
      parse(markdownInput);
    }
  };

  const handleLoadSample = () => {
    setMarkdownInput(SAMPLE_MARKDOWN);
  };

  const handleClear = () => {
    setMarkdownInput('');
    clear();
  };

  const lineCount = markdownInput.split('\n').length;
  const charCount = markdownInput.length;

  return (
    <div className="v5-import">
      {/* Header */}
      <h1 className="v5-import-title">Submit Manuscript</h1>
      <p className="v5-import-subtitle">
        Paste playbook markdown below to generate a structured flowchart.
        The parser will extract phases, steps, decision points, and executable blocks.
      </p>

      <hr className="v5-section-rule" />

      {/* Input */}
      <section className="v5-import-input-section">
        <div className="v5-import-input-header">
          <label className="v5-import-label" htmlFor="v5-import-textarea">
            Manuscript Body
          </label>
          <span className="v5-import-stats">
            {lineCount} lines · {charCount} characters
          </span>
        </div>
        <textarea
          id="v5-import-textarea"
          className="v5-import-textarea"
          value={markdownInput}
          onChange={(e) => setMarkdownInput(e.target.value)}
          placeholder="Paste your playbook markdown here..."
          spellCheck={false}
        />
      </section>

      {/* Actions */}
      <div className="v5-import-actions">
        <button
          className="v5-btn v5-btn--primary"
          onClick={handleParse}
          disabled={!markdownInput.trim()}
        >
          Parse
        </button>
        <button
          className="v5-btn v5-btn--secondary"
          onClick={handleLoadSample}
        >
          Load Sample
        </button>
        <button
          className="v5-btn v5-btn--secondary"
          onClick={handleClear}
        >
          Clear
        </button>
      </div>

      {/* Results */}
      {parsed && result && (
        <>
          <hr className="v5-section-rule" />

          <section className="v5-parse-results">
            <h2>Parse Results</h2>
            <p>
              The manuscript was successfully parsed in{' '}
              <strong>{result.parseTimeMs.toFixed(1)}ms</strong>, yielding{' '}
              <strong>{result.graph.nodes.length} nodes</strong> and{' '}
              <strong>{result.graph.edges.length} edges</strong>.
              {result.metadata.title && (
                <> Title: <em>{result.metadata.title}</em>.</>
              )}
            </p>

            {/* Warnings */}
            {result.errors.length > 0 && (
              <div className="v5-parse-warnings">
                <h3>Warnings ({result.errors.length})</h3>
                <ol className="v5-warning-list">
                  {result.errors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ol>
              </div>
            )}

            {/* Generated figure */}
            {result.graph.nodes.length > 0 && (
              <div className="v5-parse-figure">
                <div className="v5-figure-canvas">
                  <FlowCanvas
                    graph={result.graph}
                    theme={v5Theme}
                    customNodeTypes={v5NodeTypes}
                  />
                </div>
                <figcaption className="v5-figure-caption">
                  <strong>Figure 1.</strong> Generated flowchart from parsed manuscript.
                </figcaption>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
};

export default Import;
