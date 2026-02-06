/**
 * V4ExecuteNode — Blueprint-style execute/command node
 *
 * Rectangle with gear icon, green border, code preview.
 * Represents an executable component on the schematic.
 */

import React, { memo, useState, useCallback } from 'react';
import { Handle, Position } from 'react-flow-renderer';

interface V4ExecuteNodeProps {
  data: {
    label: string;
    metadata?: Record<string, any>;
  };
}

const V4ExecuteNode: React.FC<V4ExecuteNodeProps> = ({ data }) => {
  const language = data.metadata?.language || '';
  const code = data.metadata?.code || '';
  const codePreview = code.length > 45 ? code.substring(0, 42) + '...' : code;
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (!code) return;
    try {
      navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // silent fallback
    }
  }, [code]);

  return (
    <div
      style={{
        background: '#0A1F12',
        border: '1px solid #4ADE80',
        borderRadius: '2px',
        padding: '10px 14px',
        minWidth: 190,
        maxWidth: 280,
        fontFamily: "'IBM Plex Mono', monospace",
        color: '#E8F0FE',
        position: 'relative',
        boxShadow: '0 0 8px rgba(74, 222, 128, 0.08)',
      }}
    >
      <Handle
        type="target"
        position={Position.Top}
        style={{
          background: '#4ADE80',
          width: 6,
          height: 6,
          border: '1px solid #0A1628',
        }}
      />

      {/* Header row with gear icon */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
        <span style={{ fontSize: '11px', color: '#4ADE80', opacity: 0.9 }}>⚙</span>
        <span
          style={{
            fontSize: '9px',
            fontWeight: 600,
            letterSpacing: '0.12em',
            textTransform: 'uppercase' as const,
            color: '#4ADE80',
            opacity: 0.8,
          }}
        >
          EXECUTE
        </span>
        {language && (
          <span
            style={{
              fontSize: '8px',
              fontWeight: 500,
              color: '#94A3B8',
              background: 'rgba(74, 222, 128, 0.1)',
              padding: '1px 5px',
              borderRadius: '2px',
              border: '1px solid rgba(74, 222, 128, 0.2)',
              letterSpacing: '0.05em',
            }}
          >
            {language}
          </span>
        )}
        {code && (
          <button
            onClick={handleCopy}
            style={{
              marginLeft: 'auto',
              padding: '1px 5px',
              border: '1px solid rgba(74, 222, 128, 0.3)',
              borderRadius: '2px',
              background: copied ? 'rgba(74, 222, 128, 0.15)' : 'transparent',
              color: copied ? '#4ADE80' : '#94A3B8',
              fontSize: '9px',
              fontWeight: 500,
              cursor: 'pointer',
              fontFamily: "'IBM Plex Mono', monospace",
              transition: 'all 0.15s ease',
            }}
          >
            {copied ? '✓' : '⎘'}
          </button>
        )}
      </div>

      {/* Label */}
      <div
        style={{
          fontSize: '11px',
          fontWeight: 400,
          lineHeight: 1.5,
          wordWrap: 'break-word' as const,
          color: '#E8F0FE',
          marginBottom: codePreview ? '6px' : 0,
        }}
      >
        {data.label}
      </div>

      {/* Code preview */}
      {codePreview && (
        <div
          style={{
            fontSize: '10px',
            fontFamily: "'IBM Plex Mono', monospace",
            color: '#4ADE80',
            background: 'rgba(10, 22, 40, 0.8)',
            padding: '5px 7px',
            borderRadius: '2px',
            border: '1px solid rgba(74, 222, 128, 0.15)',
            whiteSpace: 'pre-wrap' as const,
            wordBreak: 'break-all' as const,
            lineHeight: 1.4,
          }}
        >
          {codePreview}
        </div>
      )}

      <Handle
        type="source"
        position={Position.Bottom}
        style={{
          background: '#4ADE80',
          width: 6,
          height: 6,
          border: '1px solid #0A1628',
        }}
      />
    </div>
  );
};

export default memo(V4ExecuteNode);
