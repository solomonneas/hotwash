/**
 * V5 PlaybookViewer — Long-form Academic Document
 *
 * Reads like a research paper. "Figure N: Title" flowcharts with captions,
 * footnotes, references section. Tabs for figure (flowchart), content, source.
 */

import React, { useState, useCallback, useMemo } from 'react';
import { usePlaybook } from '../../../hooks/usePlaybook';
import FlowCanvas from '../../../components/FlowCanvas';
import MarkdownRenderer from '../../../components/MarkdownRenderer';
import { v5Theme } from '../theme';
import { v5NodeTypes } from '../nodes';
import './PlaybookViewer.css';

interface PlaybookViewerProps {
  slug?: string;
  onNavigate: (path: string) => void;
}

type TabId = 'figure' | 'content' | 'source';

const TABS: Array<{ id: TabId; label: string }> = [
  { id: 'figure', label: 'Figure' },
  { id: 'content', label: 'Full Text' },
  { id: 'source', label: 'Source' },
];

const PlaybookViewer: React.FC<PlaybookViewerProps> = ({ slug, onNavigate }) => {
  const { playbook, found } = usePlaybook(slug);
  const [activeTab, setActiveTab] = useState<TabId>('figure');
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    if (!playbook) return;
    try {
      await navigator.clipboard.writeText(playbook.markdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = playbook.markdown;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [playbook]);

  // Build footnotes from node type counts
  const footnotes = useMemo(() => {
    if (!playbook) return [];
    const counts: Record<string, number> = {};
    playbook.graph.nodes.forEach((n) => {
      counts[n.type] = (counts[n.type] || 0) + 1;
    });
    const notes: string[] = [];
    notes.push(
      `The flowchart in Figure 1 contains ${playbook.graph.nodes.length} nodes ` +
      `and ${playbook.graph.edges.length} edges.`
    );
    if (counts.phase) {
      notes.push(`Phase nodes (bold border) represent ${counts.phase} major operational sections.`);
    }
    if (counts.decision) {
      notes.push(`Decision nodes (diamond) encode ${counts.decision} conditional branch points.`);
    }
    if (counts.execute) {
      notes.push(`Execute nodes (dashed border) denote ${counts.execute} executable code blocks.`);
    }
    return notes;
  }, [playbook]);

  if (!found || !playbook) {
    return (
      <div className="v5-viewer">
        <div className="v5-viewer-notfound">
          <p>The requested reference was not found in the bibliography.</p>
          <button
            className="v5-text-link"
            onClick={() => onNavigate('#/5/library')}
          >
            Return to Bibliography
          </button>
        </div>
      </div>
    );
  }

  const { metadata, graph, markdown, tags, category } = playbook;

  return (
    <div className="v5-viewer">
      {/* Navigation breadcrumb */}
      <div className="v5-viewer-breadcrumb">
        <button
          className="v5-text-link"
          onClick={() => onNavigate('#/5/library')}
        >
          Bibliography
        </button>
        <span className="v5-breadcrumb-sep">/</span>
        <span className="v5-breadcrumb-current">{metadata.title}</span>
      </div>

      {/* Paper title */}
      <h1 className="v5-viewer-title">{metadata.title}</h1>

      {/* Author line / metadata */}
      <div className="v5-viewer-meta">
        <span className="v5-viewer-meta-item">{metadata.tooling}</span>
        <span className="v5-meta-sep">·</span>
        <span className="v5-viewer-meta-item">{metadata.type}</span>
        <span className="v5-meta-sep">·</span>
        <span className="v5-viewer-meta-item" style={{ textTransform: 'capitalize' }}>
          {category.replace(/-/g, ' ')}
        </span>
      </div>

      {tags.length > 0 && (
        <div className="v5-viewer-keywords">
          <em>Keywords: </em>{tags.join(', ')}
        </div>
      )}

      <hr className="v5-section-rule" />

      {/* Abstract */}
      <section className="v5-viewer-abstract">
        <h2>Abstract</h2>
        <p>{playbook.description}</p>
        <p>
          This playbook comprises {graph.nodes.length} operational nodes connected
          by {graph.edges.length} directed edges, encoding a complete procedural
          workflow for {metadata.type.toLowerCase()} using {metadata.tooling}.
        </p>
      </section>

      <hr className="v5-section-rule" />

      {/* Tab navigation */}
      <div className="v5-viewer-tabs">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`v5-tab ${activeTab === tab.id ? 'v5-tab--active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'figure' && (
        <section className="v5-viewer-figure-section">
          <div className="v5-figure-container">
            <div className="v5-figure-canvas">
              <FlowCanvas
                graph={graph}
                theme={v5Theme}
                customNodeTypes={v5NodeTypes}
              />
            </div>
            <figcaption className="v5-figure-caption">
              <strong>Figure 1.</strong> Procedural flowchart for <em>{metadata.title}</em>.
              Rectangles represent steps, bold-bordered rectangles denote phases,
              diamonds indicate decision points, and dashed rectangles mark executable
              code blocks. Directed edges show operational flow.
            </figcaption>
          </div>

          <hr className="v5-section-rule" />

          {/* Footnotes */}
          <section className="v5-footnotes">
            <h3>Notes</h3>
            <ol className="v5-footnote-list">
              {footnotes.map((note, i) => (
                <li key={i}>{note}</li>
              ))}
            </ol>
          </section>

          <hr className="v5-section-rule" />

          {/* References section */}
          <section className="v5-references">
            <h3>Metadata</h3>
            <dl className="v5-ref-list">
              <div className="v5-ref-row">
                <dt>Title</dt>
                <dd>{metadata.title}</dd>
              </div>
              <div className="v5-ref-row">
                <dt>Type</dt>
                <dd>{metadata.type}</dd>
              </div>
              <div className="v5-ref-row">
                <dt>Tooling</dt>
                <dd>{metadata.tooling}</dd>
              </div>
              <div className="v5-ref-row">
                <dt>Category</dt>
                <dd style={{ textTransform: 'capitalize' }}>{category.replace(/-/g, ' ')}</dd>
              </div>
              <div className="v5-ref-row">
                <dt>Nodes</dt>
                <dd>{graph.nodes.length}</dd>
              </div>
              <div className="v5-ref-row">
                <dt>Edges</dt>
                <dd>{graph.edges.length}</dd>
              </div>
              {metadata.lastUpdated && (
                <div className="v5-ref-row">
                  <dt>Last Updated</dt>
                  <dd>{metadata.lastUpdated}</dd>
                </div>
              )}
            </dl>
          </section>
        </section>
      )}

      {activeTab === 'content' && (
        <section className="v5-viewer-content">
          <MarkdownRenderer content={markdown} className="v5-md" />
        </section>
      )}

      {activeTab === 'source' && (
        <section className="v5-viewer-source">
          <div className="v5-source-header">
            <span className="v5-source-label">Raw Markdown Source</span>
            <button
              className={`v5-source-copy ${copied ? 'v5-source-copy--done' : ''}`}
              onClick={handleCopy}
            >
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
          <pre className="v5-source-pre">{markdown}</pre>
        </section>
      )}
    </div>
  );
};

export default PlaybookViewer;
