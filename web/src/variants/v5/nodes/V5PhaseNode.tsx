/**
 * V5PhaseNode — Bold-border section node
 *
 * Thicker border to denote a major phase/section. No fill, no shadow.
 * The heavier stroke weight communicates hierarchy.
 */

import React, { memo } from 'react';
import { Handle, Position } from 'react-flow-renderer';

interface V5PhaseNodeProps {
  data: {
    label: string;
    metadata?: Record<string, any>;
  };
}

const V5PhaseNode: React.FC<V5PhaseNodeProps> = ({ data }) => {
  const level = data.metadata?.level || 2;
  const isH1 = level === 1;

  return (
    <div
      style={{
        background: '#FFFFFF',
        border: isH1 ? '2.5px solid #1C1917' : '2px solid #1C1917',
        padding: isH1 ? '12px 18px' : '10px 16px',
        minWidth: isH1 ? 200 : 170,
        maxWidth: 280,
        fontFamily: "'Fraunces', Georgia, serif",
        color: '#1C1917',
        position: 'relative',
      }}
    >
      <Handle
        type="target"
        position={Position.Top}
        style={{
          background: '#1C1917',
          width: 5,
          height: 5,
          border: 'none',
        }}
      />

      <div
        style={{
          fontSize: isH1 ? '16px' : '14px',
          fontWeight: isH1 ? 700 : 600,
          lineHeight: 1.3,
          wordWrap: 'break-word' as const,
          textAlign: 'center',
          letterSpacing: '-0.01em',
        }}
      >
        {data.label}
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        style={{
          background: '#1C1917',
          width: 5,
          height: 5,
          border: 'none',
        }}
      />
    </div>
  );
};

export default memo(V5PhaseNode);
