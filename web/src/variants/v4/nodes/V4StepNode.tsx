/**
 * V4StepNode — Blueprint-style step node
 *
 * Thin-line rectangle with cyan borders, monospace label,
 * small type badge. Looks like a component on a schematic.
 */

import React, { memo } from 'react';
import { Handle, Position } from 'react-flow-renderer';

interface V4StepNodeProps {
  data: {
    label: string;
    metadata?: Record<string, any>;
  };
}

const V4StepNode: React.FC<V4StepNodeProps> = ({ data }) => {
  return (
    <div
      style={{
        background: '#081C2E',
        border: '1px solid #38BDF8',
        borderRadius: '2px',
        padding: '10px 14px',
        minWidth: 180,
        maxWidth: 260,
        fontFamily: "'IBM Plex Mono', monospace",
        color: '#E8F0FE',
        position: 'relative',
        boxShadow: '0 0 8px rgba(56, 189, 248, 0.1)',
      }}
    >
      <Handle
        type="target"
        position={Position.Top}
        style={{
          background: '#38BDF8',
          width: 6,
          height: 6,
          border: '1px solid #0A1628',
        }}
      />

      {/* Type badge */}
      <div
        style={{
          fontSize: '9px',
          fontWeight: 600,
          letterSpacing: '0.12em',
          textTransform: 'uppercase' as const,
          color: '#38BDF8',
          marginBottom: '4px',
          opacity: 0.8,
        }}
      >
        STEP
      </div>

      {/* Label */}
      <div
        style={{
          fontSize: '11px',
          fontWeight: 400,
          lineHeight: 1.5,
          wordWrap: 'break-word' as const,
          color: '#E8F0FE',
        }}
      >
        {data.label}
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        style={{
          background: '#38BDF8',
          width: 6,
          height: 6,
          border: '1px solid #0A1628',
        }}
      />
    </div>
  );
};

export default memo(V4StepNode);
