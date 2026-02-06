/**
 * V1 PlaybookViewer — Playbook Detail Page
 *
 * Displays a single playbook with:
 * - Figure-numbered flowchart (React Flow with V1 node types)
 * - Metadata reference table
 * - Full markdown manual content via MarkdownRenderer
 */

import React from 'react';
import { usePlaybook } from '../../../hooks/usePlaybook';
import FlowCanvas from '../../../components/FlowCanvas';
import MarkdownRenderer from '../../../components/MarkdownRenderer';
import { v1Theme } from '../theme';
import { v1NodeTypes } from '../nodes';
import './PlaybookViewer.css';

interface PlaybookViewerProps {
  slug?: string;
  onNavigate: (path: string) => void;
  /** Figure number for cross-reference */
  figureNumber?: number;
}

const PlaybookViewer: React.FC<PlaybookViewerProps> = ({
  slug,
  onNavigate,
  figureNumber = 1,
}) => {
  const { playbook, found } = usePlaybook(slug);

  if (!found || !playbook) {
    return (
      <div className="v1-viewer">
        <button className="v1-viewer-back" onClick={() => onNavigate('#/1/library')}>
          ◄ Return to Library Index
        </button>
        <div className="v1-viewer-notfound">
          ⚠ PLAYBOOK NOT FOUND — CHECK REFERENCE NUMBER
        </div>
      </div>
    );
  }

  const { metadata, graph, markdown, tags, category } = playbook;

  return (
    <div className="v1-viewer">
      <button className="v1-viewer-back" onClick={() => onNavigate('#/1/library')}>
        ◄ Return to Library Index (Section 2.0)
      </button>

      <div className="v1-content-header">
        <div className="v1-section-number">Appendix A.{figureNumber}</div>
        <h1>{metadata.title}</h1>
      </div>

      <div className="v1-doc-ref">
        REF: PBF-{slug?.toUpperCase().replace(/-/g, '_') || 'UNKNOWN'} // OPERATIONAL PLAYBOOK
      </div>

      {/* Metadata Table */}
      <div className="v1-meta-block">
        <h3>Reference Data</h3>
        <table className="v1-meta-table">
          <tbody>
            <tr>
              <td>Type</td>
              <td>{metadata.type}</td>
            </tr>
            <tr>
              <td>Tooling</td>
              <td>{metadata.tooling}</td>
            </tr>
            {metadata.lastUpdated && (
              <tr>
                <td>Last Updated</td>
                <td>{metadata.lastUpdated}</td>
              </tr>
            )}
            <tr>
              <td>Category</td>
              <td style={{ textTransform: 'uppercase', letterSpacing: '1px', fontSize: '12px' }}>
                {category.replace(/-/g, ' ')}
              </td>
            </tr>
            <tr>
              <td>Graph Size</td>
              <td>{graph.nodes.length} nodes / {graph.edges.length} edges</td>
            </tr>
            {tags.length > 0 && (
              <tr>
                <td>Tags</td>
                <td>{tags.join(', ')}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Figure: Flowchart */}
      <figure className="v1-figure">
        <div className="v1-figure-canvas">
          <FlowCanvas
            graph={graph}
            theme={v1Theme}
            customNodeTypes={v1NodeTypes}
          />
        </div>
        <figcaption className="v1-figure-caption">
          <span className="v1-figure-number">Figure A.{figureNumber}-1</span>
          Operational Flow Diagram — {metadata.title}
        </figcaption>
      </figure>

      {/* Full Manual Content */}
      <div className="v1-manual-content">
        <MarkdownRenderer content={markdown} className="v1-md" />
      </div>
    </div>
  );
};

export default PlaybookViewer;
