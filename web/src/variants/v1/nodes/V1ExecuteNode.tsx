/**
 * V1ExecuteNode — Code execution node for React Flow
 *
 * Muted gold border with monospace code preview.
 * Technical reference card aesthetic.
 */

import React, { memo } from 'react';
import { Handle, Position } from 'react-flow-renderer';

interface V1ExecuteNodeProps {
  data: {
    label: string;
    metadata?: Record<string, any>;
  };
}

const V1ExecuteNode: React.FC<V1ExecuteNodeProps> = ({ data }) => {
  const language = data.metadata?.language || '';
  const code = data.metadata?.code || '';
  const codePreview = code.length > 60 ? code.substring(0, 57) + '...' : code;

  return (
    <div
      style={{
        background: '#F0ECD0',
        border: '2px solid #B8860B',
        borderRadius: '2px',
        padding: '10px 14px',
        minWidth: 200,
        maxWidth: 280,
        fontFamily: "'Courier Prime', 'Courier New', Courier, monospace",
        color: '#1A1A1A',
        boxShadow: '2px 2px 0px #D4CEB8',
        position: 'relative',
      }}
    >
      <Handle
        type="target"
        position={Position.Top}
        style={{ background: '#B8860B', width: 8, height: 8, border: '2px solid #8B6914' }}
      />
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          marginBottom: '4px',
        }}
      >
        <span
          style={{
            fontSize: '9px',
            fontFamily: "'Oswald', 'Arial Narrow', sans-serif",
            fontWeight: 700,
            letterSpacing: '1.5px',
            textTransform: 'uppercase' as const,
            color: '#B8860B',
          }}
        >
          EXECUTE
        </span>
        {language && (
          <span
            style={{
              fontSize: '9px',
              fontFamily: "'Oswald', 'Arial Narrow', sans-serif",
              fontWeight: 400,
              letterSpacing: '1px',
              textTransform: 'uppercase' as const,
              color: '#8B6914',
              background: '#E8E0C0',
              padding: '1px 6px',
              borderRadius: '1px',
            }}
          >
            {language}
          </span>
        )}
      </div>
      <div
        style={{
          fontSize: '11px',
          fontWeight: 600,
          lineHeight: 1.4,
          wordWrap: 'break-word' as const,
          marginBottom: codePreview ? '6px' : 0,
        }}
      >
        {data.label}
      </div>
      {codePreview && (
        <div
          style={{
            fontSize: '10px',
            fontFamily: "'Courier Prime', 'Courier New', monospace",
            color: '#4A5D23',
            background: '#E8E3D0',
            padding: '4px 6px',
            borderRadius: '1px',
            border: '1px solid #D4CEB8',
            whiteSpace: 'pre-wrap' as const,
            wordBreak: 'break-all' as const,
            lineHeight: 1.3,
          }}
        >
          {codePreview}
        </div>
      )}
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ background: '#B8860B', width: 8, height: 8, border: '2px solid #8B6914' }}
      />
    </div>
  );
};

export default memo(V1ExecuteNode);
