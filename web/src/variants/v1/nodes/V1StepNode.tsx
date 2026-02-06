/**
 * V1StepNode — Manual-style step node for React Flow
 *
 * Rectangular box with typewriter font, section numbering aesthetic.
 * Olive drab border, cream background.
 */

import React, { memo } from 'react';
import { Handle, Position } from 'react-flow-renderer';

interface V1StepNodeProps {
  data: {
    label: string;
    metadata?: Record<string, any>;
  };
}

const V1StepNode: React.FC<V1StepNodeProps> = ({ data }) => {
  return (
    <div
      style={{
        background: '#EDE8D5',
        border: '2px solid #4A5D23',
        borderRadius: '2px',
        padding: '10px 14px',
        minWidth: 180,
        maxWidth: 260,
        fontFamily: "'Courier Prime', 'Courier New', Courier, monospace",
        color: '#1A1A1A',
        boxShadow: '2px 2px 0px #D4CEB8',
        position: 'relative',
      }}
    >
      <Handle
        type="target"
        position={Position.Top}
        style={{ background: '#4A5D23', width: 8, height: 8, border: '2px solid #2D3B12' }}
      />
      <div
        style={{
          fontSize: '9px',
          fontFamily: "'Oswald', 'Arial Narrow', sans-serif",
          fontWeight: 700,
          letterSpacing: '1.5px',
          textTransform: 'uppercase' as const,
          color: '#4A5D23',
          marginBottom: '4px',
        }}
      >
        PROCEDURE
      </div>
      <div
        style={{
          fontSize: '12px',
          fontWeight: 600,
          lineHeight: 1.4,
          wordWrap: 'break-word' as const,
        }}
      >
        {data.label}
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ background: '#4A5D23', width: 8, height: 8, border: '2px solid #2D3B12' }}
      />
    </div>
  );
};

export default memo(V1StepNode);
