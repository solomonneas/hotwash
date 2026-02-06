/**
 * V5StepNode — Minimal thin-border rectangle
 *
 * No fill, no shadow, no color. Clean academic diagram node.
 * Shape alone communicates type: simple rectangle = step.
 */

import React, { memo } from 'react';
import { Handle, Position } from 'react-flow-renderer';

interface V5StepNodeProps {
  data: {
    label: string;
    metadata?: Record<string, any>;
  };
}

const V5StepNode: React.FC<V5StepNodeProps> = ({ data }) => {
  return (
    <div
      style={{
        background: '#FFFFFF',
        border: '1px solid #1C1917',
        padding: '10px 16px',
        minWidth: 160,
        maxWidth: 240,
        fontFamily: "'Crimson Pro', Georgia, serif",
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
          fontSize: '14px',
          fontWeight: 400,
          lineHeight: 1.5,
          wordWrap: 'break-word' as const,
          textAlign: 'center',
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

export default memo(V5StepNode);
