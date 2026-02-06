/**
 * V4 PlaybookViewer — Full-Viewport Flowchart Hero
 *
 * The flowchart dominates 70%+ of the viewport. An annotation panel
 * on the right shows metadata, tags, and stats. Tabs switch between
 * flowchart (default), content, and raw views.
 */

import React, { useState, useCallback } from 'react';
import { usePlaybook } from '../../../hooks/usePlaybook';
import FlowCanvas from '../../../components/FlowCanvas';
import MarkdownRenderer from '../../../components/MarkdownRenderer';
import { v4Theme } from '../theme';
import { v4NodeTypes } from '../nodes';
import './PlaybookViewer.css';

interface PlaybookViewerProps {
  slug?: string;
  onNavigate: (path: string) => void;
}

type TabId = 'flowchart' | 'content' | 'raw';

const TABS: Array<{ id: TabId; label: string }> = [
  { id: 'flowchart', label: 'Schematic' },
  { id: 'content', label: 'Documentation' },
  { id: 'raw', label: 'Source' },
];

const PlaybookViewer: React.FC<PlaybookViewerProps> = ({ slug, onNavigate }) => {
  const { playbook, found } = usePlaybook(slug);
  const [activeTab, setActiveTab] = useState<TabId>('flowchart');
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

  if (!found || !playbook) {
    return (
      <div className="v4-viewer" style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div className="v4-viewer-notfound">
          <span className="v4-viewer-notfound-icon">⚙</span>
          Schematic not found in catalog.
          <br />
          <button
            className="v4-viewer-notfound-link"
            onClick={() => onNavigate('#/4/library')}
          >
            BROWSE PARTS CATALOG →
          </button>
        </div>
      </div>
    );
  }

  const { metadata, graph, markdown, tags, category } = playbook;

  // Count node types
  const nodeTypeCounts = graph.nodes.reduce(
    (acc, n) => {
      acc[n.type] = (acc[n.type] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <div className="v4-viewer">
      {/* Header bar */}
      <div className="v4-viewer-header">
        <button
          className="v4-viewer-back"
          onClick={() => onNavigate('#/4/library')}
        >
          ← CATALOG
        </button>
        <span className="v4-viewer-title">{metadata.title}</span>
        <div className="v4-viewer-meta-pills">
          <span className="v4-viewer-meta-pill">{metadata.type}</span>
          <span className="v4-viewer-meta-pill">{metadata.tooling}</span>
          <span className="v4-viewer-meta-pill">
            {graph.nodes.length}N / {graph.edges.length}E
          </span>
        </div>
      </div>

      {/* Tab bar */}
      <div className="v4-viewer-tabs">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`v4-viewer-tab ${activeTab === tab.id ? 'v4-viewer-tab--active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Body */}
      <div className="v4-viewer-body">
        {/* Main content area */}
        {activeTab === 'flowchart' && (
          <div className="v4-flowchart-hero">
            <FlowCanvas
              graph={graph}
              theme={v4Theme}
              customNodeTypes={v4NodeTypes}
            />
          </div>
        )}

        {activeTab === 'content' && (
          <div className="v4-content-view">
            <MarkdownRenderer content={markdown} className="v4-md" />
          </div>
        )}

        {activeTab === 'raw' && (
          <div className="v4-raw-view">
            <div className="v4-raw-header">
              <span className="v4-raw-label">Raw Markdown Source</span>
              <button
                className={`v4-raw-copy-btn ${copied ? 'v4-raw-copy-btn--copied' : ''}`}
                onClick={handleCopy}
              >
                {copied ? '✓ COPIED' : 'COPY'}
              </button>
            </div>
            <pre className="v4-raw-content">{markdown}</pre>
          </div>
        )}

        {/* Annotation panel (visible on flowchart tab) */}
        {activeTab === 'flowchart' && (
          <div className="v4-annotation-panel">
            <div className="v4-annotation-header">
              Annotations
            </div>

            {/* Description */}
            <div className="v4-annotation-section">
              <div className="v4-annotation-section-label">Description</div>
              <div className="v4-annotation-section-value">{playbook.description}</div>
            </div>

            {/* Stats */}
            <div className="v4-annotation-section">
              <div className="v4-annotation-section-label">Component Count</div>
              <div className="v4-annotation-stats">
                <div className="v4-annotation-stat">
                  <span className="v4-annotation-stat-value">{graph.nodes.length}</span>
                  <span className="v4-annotation-stat-label">Nodes</span>
                </div>
                <div className="v4-annotation-stat">
                  <span className="v4-annotation-stat-value">{graph.edges.length}</span>
                  <span className="v4-annotation-stat-label">Edges</span>
                </div>
              </div>
            </div>

            {/* Node type breakdown */}
            <div className="v4-annotation-section">
              <div className="v4-annotation-section-label">Node Breakdown</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {Object.entries(nodeTypeCounts).map(([type, count]) => (
                  <div
                    key={type}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '10px',
                    }}
                  >
                    <span style={{ color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {type}
                    </span>
                    <span style={{ color: '#38BDF8', fontWeight: 600 }}>{count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Metadata */}
            <div className="v4-annotation-section">
              <div className="v4-annotation-section-label">Specifications</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px' }}>
                  <span style={{ color: '#94A3B8' }}>TYPE</span>
                  <span style={{ color: '#E8F0FE' }}>{metadata.type}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px' }}>
                  <span style={{ color: '#94A3B8' }}>TOOLING</span>
                  <span style={{ color: '#E8F0FE' }}>{metadata.tooling}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px' }}>
                  <span style={{ color: '#94A3B8' }}>CATEGORY</span>
                  <span style={{ color: '#E8F0FE', textTransform: 'capitalize' }}>
                    {category.replace(/-/g, ' ')}
                  </span>
                </div>
                {metadata.lastUpdated && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px' }}>
                    <span style={{ color: '#94A3B8' }}>UPDATED</span>
                    <span style={{ color: '#E8F0FE' }}>{metadata.lastUpdated}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Tags */}
            {tags.length > 0 && (
              <div className="v4-annotation-section">
                <div className="v4-annotation-section-label">Tags</div>
                <div className="v4-annotation-tag-list">
                  {tags.map((tag) => (
                    <span key={tag} className="v4-annotation-tag">{tag}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PlaybookViewer;
