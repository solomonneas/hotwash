/**
 * ImportView Component
 *
 * Main view for markdown/mermaid import workflow.
 * Provides textarea input, parse button, loading state, error handling,
 * and displays the resulting flowchart using FlowCanvas.
 */

import React, { useState } from 'react';
import FlowCanvas from '../components/FlowCanvas';
import { PlaybookGraph } from '../types';
import { apiUrl } from '../lib/api';
import './ImportView.css';

/**
 * Sample playbook for demonstration purposes
 */
const SAMPLE_PLAYBOOK = `# Incident Response Playbook

## Phase 1: Detection
Initial detection of security incident

## Step 1.1: Alert Triage
Review incoming security alerts
- Check alert severity
- Verify alert legitimacy
- Document findings

## Decision: Is this a real incident?
Determine if the alert represents an actual security incident

## Step 1.2: Escalate
If confirmed, escalate to security team

## Phase 2: Containment
Contain the threat to prevent further damage

## Step 2.1: Isolate Systems
Disconnect affected systems from network

## Step 2.2: Preserve Evidence
Create forensic copies of affected systems

## Phase 3: Eradication
Remove the threat from the environment

## Step 3.1: Remove Malware
Clean infected systems

## Step 3.2: Patch Vulnerabilities
Apply security patches

## Phase 4: Recovery
Restore normal operations

## Step 4.1: Restore Systems
Bring systems back online

## Step 4.2: Monitor
Watch for signs of reinfection

## Complete: Document Lessons Learned
Create post-incident report`;

const ImportView: React.FC = () => {
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [graph, setGraph] = useState<PlaybookGraph | null>(null);
  const [format, setFormat] = useState<string>('markdown');

  /**
   * Handle parse button click
   * Calls POST /api/parse with the textarea content
   */
  const handleParse = async () => {
    if (!content.trim()) {
      setError('Please enter some content to parse');
      return;
    }

    setLoading(true);
    setError(null);
    setGraph(null);

    try {
      const response = await fetch(apiUrl('/api/parse'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: content,
          format: format,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.detail || `Server error: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();

      // Build PlaybookGraph from response
      const parsedGraph: PlaybookGraph = {
        nodes: data.nodes,
        edges: data.edges,
      };

      setGraph(parsedGraph);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse playbook');
      console.error('Parse error:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Load sample playbook into textarea
   */
  const handleLoadSample = () => {
    setContent(SAMPLE_PLAYBOOK);
    setError(null);
    setGraph(null);
  };

  /**
   * Clear all state and start fresh
   */
  const handleClear = () => {
    setContent('');
    setError(null);
    setGraph(null);
  };

  return (
    <div className="import-view">
      <div className="import-header">
        <h1>Playbook Forge</h1>
        <p className="import-subtitle">
          Convert markdown or mermaid playbooks into visual flowcharts
        </p>
      </div>

      <div className="import-container">
        {/* Input Section */}
        <div className="import-input-section">
          <div className="import-controls">
            <div className="format-selector">
              <label className="format-label">Format:</label>
              <label className="radio-option">
                <input
                  type="radio"
                  name="format"
                  value="markdown"
                  checked={format === 'markdown'}
                  onChange={(e) => setFormat(e.target.value)}
                  disabled={loading}
                />
                <span>Markdown</span>
              </label>
              <label className="radio-option">
                <input
                  type="radio"
                  name="format"
                  value="mermaid"
                  checked={format === 'mermaid'}
                  onChange={(e) => setFormat(e.target.value)}
                  disabled={loading}
                />
                <span>Mermaid</span>
              </label>
            </div>

            <div className="action-buttons">
              <button
                className="btn btn-secondary"
                onClick={handleLoadSample}
                disabled={loading}
              >
                Load Sample
              </button>
              <button
                className="btn btn-secondary"
                onClick={handleClear}
                disabled={loading || !content}
              >
                Clear
              </button>
              <button
                className="btn btn-primary"
                onClick={handleParse}
                disabled={loading || !content.trim()}
              >
                {loading ? 'Parsing...' : 'Parse Playbook'}
              </button>
            </div>
          </div>

          <textarea
            className="import-textarea"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={`Paste your ${format} playbook here...\n\nTip: Click "Load Sample" to see an example`}
            disabled={loading}
          />

          {error && (
            <div className="error-message">
              <strong>Error:</strong> {error}
            </div>
          )}
        </div>

        {/* Flowchart Display Section */}
        {graph && (
          <div className="import-output-section">
            <div className="output-header">
              <h2>Flowchart Visualization</h2>
              <div className="graph-stats">
                <span className="stat">
                  <strong>{graph.nodes.length}</strong> nodes
                </span>
                <span className="stat">
                  <strong>{graph.edges.length}</strong> edges
                </span>
              </div>
            </div>
            <div className="flowchart-container">
              <FlowCanvas graph={graph} />
            </div>
          </div>
        )}

        {loading && (
          <div className="loading-indicator">
            <div className="spinner"></div>
            <p>Parsing your playbook...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImportView;
