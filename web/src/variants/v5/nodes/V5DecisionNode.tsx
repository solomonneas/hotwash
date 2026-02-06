/**
 * V5DecisionNode — Minimal diamond
 *
 * No fill, no shadow, no color. CSS-rotated diamond shape.
 * Shape alone communicates type: diamond = decision/branch.
 */

import React, { memo } from 'react';
import { Handle, Position } from 'react-flow-renderer';

interface V5DecisionNodeProps {
  data: {
    label: string;
    metadata?: Record<string, any>;
  };
}

const V5DecisionNode: React.FC<V5DecisionNodeProps> = ({ data }) => {
  return (
    <div
      style={{
        position: 'relative',
        width: 180,
        height: 120,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Diamond shape */}
      <div
        style={{
          position: 'absolute',
          width: 95,
          height: 95,
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%) rotate(45deg)',
          background: '#FFFFFF',
          border: '1px solid #1C1917',
        }}
      />

      <Handle
        type="target"
        position={Position.Top}
        style={{
          background: '#1C1917',
          width: 5,
          height: 5,
          border: 'none',
          zIndex: 10,
        }}
      />

      {/* Content overlay */}
      <div
        style={{
          position: 'relative',
          zIndex: 5,
          textAlign: 'center',
          padding: '4px 8px',
          maxWidth: 140,
        }}
      >
        <div
          style={{
            fontSize: '13px',
            fontFamily: "'Crimson Pro', Georgia, serif",
            fontWeight: 400,
            lineHeight: 1.3,
            color: '#1C1917',
            wordWrap: 'break-word' as const,
          }}
        >
          {data.label}
        </div>
      </div>

      {/* Bottom handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="a"
        style={{
          background: '#1C1917',
          width: 5,
          height: 5,
          border: 'none',
          zIndex: 10,
        }}
      />

      {/* Right handle */}
      <Handle
        type="source"
        position={Position.Right}
        id="b"
        style={{
          background: '#1C1917',
          width: 5,
          height: 5,
          border: 'none',
          zIndex: 10,
        }}
      />
    </div>
  );
};

export default memo(V5DecisionNode);
