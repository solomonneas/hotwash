/**
 * V4PhaseNode — Blueprint-style phase/section node
 *
 * Double-border rectangle with gold accents, monospace label.
 * Represents a major section header on the schematic.
 */

import React, { memo } from 'react';
import { Handle, Position } from 'react-flow-renderer';

interface V4PhaseNodeProps {
  data: {
    label: string;
    metadata?: Record<string, any>;
  };
}

const V4PhaseNode: React.FC<V4PhaseNodeProps> = ({ data }) => {
  const level = data.metadata?.level || 2;
  const isH1 = level === 1;

  return (
    <div
      style={{
        background: '#1A1608',
        border: '1px solid #FBBF24',
        borderRadius: '2px',
        padding: '3px',
        minWidth: isH1 ? 220 : 190,
        maxWidth: 300,
        fontFamily: "'IBM Plex Mono', monospace",
        position: 'relative',
        boxShadow: '0 0 12px rgba(251, 191, 36, 0.1)',
      }}
    >
      {/* Inner border for double-border effect */}
      <div
        style={{
          border: '1px solid rgba(251, 191, 36, 0.4)',
          borderRadius: '1px',
          padding: isH1 ? '12px 14px' : '10px 12px',
        }}
      >
        <Handle
          type="target"
          position={Position.Top}
          style={{
            background: '#FBBF24',
            width: 6,
            height: 6,
            border: '1px solid #0A1628',
            top: -6,
          }}
        />

        {/* Type badge */}
        <div
          style={{
            fontSize: '9px',
            fontWeight: 600,
            letterSpacing: '0.12em',
            textTransform: 'uppercase' as const,
            color: '#FBBF24',
            marginBottom: '4px',
            fontFamily: "'Oswald', 'IBM Plex Mono', sans-serif",
          }}
        >
          {isH1 ? '■ SECTION' : '▸ PHASE'}
        </div>

        {/* Label */}
        <div
          style={{
            fontSize: isH1 ? '13px' : '11px',
            fontWeight: isH1 ? 600 : 500,
            lineHeight: 1.3,
            color: '#FBBF24',
            wordWrap: 'break-word' as const,
            letterSpacing: '0.02em',
          }}
        >
          {data.label}
        </div>

        <Handle
          type="source"
          position={Position.Bottom}
          style={{
            background: '#FBBF24',
            width: 6,
            height: 6,
            border: '1px solid #0A1628',
            bottom: -6,
          }}
        />
      </div>
    </div>
  );
};

export default memo(V4PhaseNode);
