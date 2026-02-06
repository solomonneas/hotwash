/**
 * V1DecisionNode — Diamond decision node for React Flow
 *
 * Classification-red border diamond shape with conditional text.
 * Military field manual decision point aesthetic.
 */

import React, { memo } from 'react';
import { Handle, Position } from 'react-flow-renderer';

interface V1DecisionNodeProps {
  data: {
    label: string;
    metadata?: Record<string, any>;
  };
}

const V1DecisionNode: React.FC<V1DecisionNodeProps> = ({ data }) => {
  return (
    <div
      style={{
        position: 'relative',
        width: 200,
        height: 120,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Diamond shape via rotated inner div */}
      <div
        style={{
          position: 'absolute',
          width: 140,
          height: 140,
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%) rotate(45deg)',
          background: '#F5E6E6',
          border: '2px solid #CC0000',
          boxShadow: '2px 2px 0px #D4CEB8',
        }}
      />
      <Handle
        type="target"
        position={Position.Top}
        style={{
          background: '#CC0000',
          width: 8,
          height: 8,
          border: '2px solid #990000',
          zIndex: 10,
        }}
      />
      <div
        style={{
          position: 'relative',
          zIndex: 5,
          textAlign: 'center',
          padding: '4px 12px',
          maxWidth: 160,
        }}
      >
        <div
          style={{
            fontSize: '9px',
            fontFamily: "'Oswald', 'Arial Narrow', sans-serif",
            fontWeight: 700,
            letterSpacing: '1.5px',
            textTransform: 'uppercase' as const,
            color: '#CC0000',
            marginBottom: '2px',
          }}
        >
          DECISION
        </div>
        <div
          style={{
            fontSize: '11px',
            fontFamily: "'Courier Prime', 'Courier New', monospace",
            fontWeight: 600,
            lineHeight: 1.3,
            color: '#1A1A1A',
            wordWrap: 'break-word' as const,
          }}
        >
          {data.label}
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        id="a"
        style={{
          background: '#CC0000',
          width: 8,
          height: 8,
          border: '2px solid #990000',
          zIndex: 10,
        }}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="b"
        style={{
          background: '#CC0000',
          width: 8,
          height: 8,
          border: '2px solid #990000',
          zIndex: 10,
        }}
      />
    </div>
  );
};

export default memo(V1DecisionNode);
