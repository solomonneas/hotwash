/**
 * V1PhaseNode — Section header phase node for React Flow
 *
 * Dark olive background, bold Oswald heading.
 * Represents major manual sections (H1/H2/H3).
 */

import React, { memo } from 'react';
import { Handle, Position } from 'react-flow-renderer';

interface V1PhaseNodeProps {
  data: {
    label: string;
    metadata?: Record<string, any>;
  };
}

const V1PhaseNode: React.FC<V1PhaseNodeProps> = ({ data }) => {
  const level = data.metadata?.level || 2;
  const isH1 = level === 1;

  return (
    <div
      style={{
        background: isH1 ? '#2D3B12' : '#E8E3D0',
        border: `${isH1 ? 3 : 2}px solid #2D3B12`,
        borderRadius: '2px',
        padding: isH1 ? '14px 18px' : '10px 14px',
        minWidth: isH1 ? 240 : 200,
        maxWidth: 300,
        boxShadow: '2px 2px 0px #D4CEB8',
        position: 'relative',
      }}
    >
      <Handle
        type="target"
        position={Position.Top}
        style={{ background: '#2D3B12', width: 8, height: 8, border: '2px solid #1A1A1A' }}
      />
      <div
        style={{
          fontSize: '9px',
          fontFamily: "'Oswald', 'Arial Narrow', sans-serif",
          fontWeight: 700,
          letterSpacing: '1.5px',
          textTransform: 'uppercase' as const,
          color: isH1 ? '#B8860B' : '#4A5D23',
          marginBottom: '4px',
        }}
      >
        {isH1 ? 'MANUAL SECTION' : `SECTION (H${level})`}
      </div>
      <div
        style={{
          fontSize: isH1 ? '14px' : '12px',
          fontFamily: "'Oswald', 'Arial Narrow', sans-serif",
          fontWeight: 700,
          lineHeight: 1.3,
          textTransform: 'uppercase' as const,
          letterSpacing: '0.5px',
          color: isH1 ? '#F5F0E1' : '#1A1A1A',
          wordWrap: 'break-word' as const,
        }}
      >
        {data.label}
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ background: '#2D3B12', width: 8, height: 8, border: '2px solid #1A1A1A' }}
      />
    </div>
  );
};

export default memo(V1PhaseNode);
