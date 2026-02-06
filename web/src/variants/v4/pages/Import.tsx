/**
 * V4 Import — New Schematic Creation Form
 *
 * Blueprint-style import form. "Create a new schematic" by pasting markdown.
 * Dark textarea, parse action, and inline flowchart results rendered
 * with V4 blueprint nodes.
 */

import React, { useState } from 'react';
import { useParser } from '../../../hooks/useParser';
import FlowCanvas from '../../../components/FlowCanvas';
import { v4Theme } from '../theme';
import { v4NodeTypes } from '../nodes';
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
    <div className="v4-import">
      {/* Header */}
      <div className="v4-import-header">
        <h1>New Schematic</h1>
        <p className="v4-import-subtitle">
          // INPUT SOURCE MARKDOWN — GENERATE INTERACTIVE SCHEMATIC
        </p>
      </div>

      {/* Input Section */}
      <div className="v4-input-section">
        <div className="v4-input-label">
          <span className="v4-input-label-text">Markdown Input</span>
          <span className="v4-input-stats">
            {lineCount} lines · {charCount} chars
          </span>
        </div>
        <div className="v4-textarea-wrapper">
          <textarea
            className="v4-import-textarea"
            value={markdownInput}
            onChange={(e) => setMarkdownInput(e.target.value)}
            placeholder="# Paste your playbook markdown here..."
            spellCheck={false}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="v4-import-actions">
        <button
          className="v4-btn v4-btn--primary"
          onClick={handleParse}
          disabled={!markdownInput.trim()}
        >
          ⚙ Compile Schematic
        </button>
        <button
          className="v4-btn v4-btn--secondary"
          onClick={handleLoadSample}
        >
          Load Sample
        </button>
        <button
          className="v4-btn v4-btn--secondary"
          onClick={handleClear}
        >
          Clear
        </button>
      </div>

      {/* Parse Results */}
      {parsed && result && (
        <div className="v4-parse-results">
          {/* Success Header */}
          <div className="v4-parse-results-header">
            <div className="v4-parse-results-header-left">
              <span className="v4-parse-results-icon" />
              <span className="v4-parse-results-title">Compilation Complete</span>
            </div>
            <span className="v4-parse-results-time">{result.parseTimeMs.toFixed(1)}ms</span>
          </div>

          {/* Warnings */}
          {result.errors.length > 0 && (
            <div className="v4-parse-warnings">
              <div className="v4-parse-warnings-header">
                ⚠ WARNINGS ({result.errors.length})
              </div>
              <ul className="v4-parse-warnings-list">
                {result.errors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Stats */}
          <div className="v4-parse-stats">
            <div className="v4-parse-stat">
              <span className="v4-parse-stat-value">{result.graph.nodes.length}</span>
              <span className="v4-parse-stat-label">Components</span>
            </div>
            <div className="v4-parse-stat">
              <span className="v4-parse-stat-value">{result.graph.edges.length}</span>
              <span className="v4-parse-stat-label">Connections</span>
            </div>
            <div className="v4-parse-stat">
              <span className="v4-parse-stat-value" style={{ fontSize: '14px', color: '#FBBF24' }}>
                {result.metadata.title || 'Untitled'}
              </span>
              <span className="v4-parse-stat-label">Schematic ID</span>
            </div>
          </div>

          {/* Flowchart */}
          {result.graph.nodes.length > 0 && (
            <div className="v4-parse-flow">
              <FlowCanvas
                graph={result.graph}
                theme={v4Theme}
                customNodeTypes={v4NodeTypes}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Import;
