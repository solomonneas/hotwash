/**
 * V5ExecuteNode — Dashed-border rectangle
 *
 * No fill, no shadow. Dashed border communicates "executable/action"
 * distinct from the solid-border step node.
 */

import React, { memo } from 'react';
import { Handle, Position } from 'react-flow-renderer';

interface V5ExecuteNodeProps {
  data: {
    label: string;
    metadata?: Record<string, any>;
  };
}

const V5ExecuteNode: React.FC<V5ExecuteNodeProps> = ({ data }) => {
  const language = data.metadata?.language || '';

  return (
    <div
      style={{
        background: '#FFFFFF',
        border: '1px dashed #1C1917',
        padding: '10px 16px',
        minWidth: 160,
        maxWidth: 240,
        fontFamily: "'IBM Plex Mono', Menlo, monospace",
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

      {/* Optional language tag */}
      {language && (
        <div
          style={{
            fontSize: '10px',
            fontWeight: 500,
            color: '#78716C',
            marginBottom: '4px',
            letterSpacing: '0.04em',
            textTransform: 'uppercase' as const,
          }}
        >
          {language}
        </div>
      )}

      <div
        style={{
          fontSize: '12px',
          fontWeight: 400,
          lineHeight: 1.4,
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

export default memo(V5ExecuteNode);
