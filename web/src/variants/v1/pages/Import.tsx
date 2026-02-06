/**
 * V1 Import — Markdown Import / Parse Page
 *
 * Allows pasting raw markdown and parsing it into a playbook graph.
 * Displays the resulting flowchart using V1 node types.
 */

import React, { useState } from 'react';
import { useParser } from '../../../hooks/useParser';
import FlowCanvas from '../../../components/FlowCanvas';
import { v1Theme } from '../theme';
import { v1NodeTypes } from '../nodes';
import './Import.css';

const SAMPLE_MARKDOWN = `# Sample Incident Response Playbook
**Type:** Incident Response
**Tooling:** SIEM + EDR

---

## Phase 1: Detection
### Alert Triage
- If alert severity is Critical then escalate immediately
- If alert is false positive then close ticket

### Gather Context
\`\`\`bash
grep -i "suspicious" /var/log/syslog
\`\`\`

## Phase 2: Containment
1. Isolate affected host
2. Block malicious IPs at firewall
3. Preserve evidence

## Phase 3: Eradication
\`\`\`powershell
Remove-Item -Path C:\\malware -Recurse -Force
\`\`\`

## Phase 4: Recovery
1. Restore from clean backup
2. Verify system integrity
3. Monitor for recurrence
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

  return (
    <div className="v1-import">
      <div className="v1-content-header">
        <div className="v1-section-number">Section 3.0</div>
        <h1>Import / Parse Markdown</h1>
      </div>

      <div className="v1-doc-ref">
        REF: PBF-IMPORT-001 // FIELD DATA ENTRY PROCEDURE
      </div>

      {/* Instructions */}
      <div className="v1-import-instructions">
        <h3>3.1 — Operating Instructions</h3>
        <ol>
          <li>Paste structured markdown into the input area below.</li>
          <li>Markdown should use H1/H2/H3 headers for sections, numbered lists for steps,
            bullet points with "if/when" for decision nodes, and fenced code blocks for commands.</li>
          <li>Press <strong>PARSE DOCUMENT</strong> to generate the operational flow diagram.</li>
          <li>Review the resulting graph for completeness and accuracy.</li>
        </ol>
      </div>

      {/* Textarea Input */}
      <textarea
        className="v1-import-textarea"
        value={markdownInput}
        onChange={(e) => setMarkdownInput(e.target.value)}
        placeholder="Paste operational playbook markdown here..."
        spellCheck={false}
      />

      {/* Action Buttons */}
      <div className="v1-import-actions">
        <button
          className="v1-import-btn"
          onClick={handleParse}
          disabled={!markdownInput.trim()}
        >
          Parse Document
        </button>
        <button
          className="v1-import-btn v1-import-btn--secondary"
          onClick={handleLoadSample}
        >
          Load Sample
        </button>
        <button
          className="v1-import-btn v1-import-btn--secondary"
          onClick={handleClear}
        >
          Clear
        </button>
      </div>

      {/* Parse Results */}
      {parsed && result && (
        <div className="v1-parse-result">
          <div className="v1-parse-result-header">
            <h3>Parse Results</h3>
            <span className="v1-parse-time">
              Parsed in {result.parseTimeMs.toFixed(1)}ms
            </span>
          </div>

          {/* Errors */}
          {result.errors.length > 0 && (
            <div className="v1-parse-errors">
              <h4>⚠ Parse Warnings</h4>
              <ul>
                {result.errors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Stats */}
          <div className="v1-parse-stats">
            <div className="v1-parse-stat">
              <strong>{result.graph.nodes.length}</strong>
              NODES EXTRACTED
            </div>
            <div className="v1-parse-stat">
              <strong>{result.graph.edges.length}</strong>
              EDGES MAPPED
            </div>
            <div className="v1-parse-stat">
              <strong>{result.metadata.title || 'Untitled'}</strong>
              DOCUMENT TITLE
            </div>
          </div>

          {/* Flow Canvas */}
          {result.graph.nodes.length > 0 && (
            <figure className="v1-figure">
              <div className="v1-figure-canvas">
                <FlowCanvas
                  graph={result.graph}
                  theme={v1Theme}
                  customNodeTypes={v1NodeTypes}
                />
              </div>
              <figcaption className="v1-figure-caption">
                <span className="v1-figure-number">Figure 3.1-1</span>
                Parsed Operational Flow — {result.metadata.title || 'Imported Document'}
              </figcaption>
            </figure>
          )}
        </div>
      )}
    </div>
  );
};

export default Import;
