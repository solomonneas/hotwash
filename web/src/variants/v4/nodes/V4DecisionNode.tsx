/**
 * V4DecisionNode — Blueprint-style decision diamond
 *
 * CSS-rotated diamond with orange border, monospace label.
 * Looks like a decision gate on an engineering schematic.
 */

import React, { memo } from 'react';
import { Handle, Position } from 'react-flow-renderer';

interface V4DecisionNodeProps {
  data: {
    label: string;
    metadata?: Record<string, any>;
  };
}

const V4DecisionNode: React.FC<V4DecisionNodeProps> = ({ data }) => {
  return (
    <div
      style={{
        position: 'relative',
        width: 200,
        height: 130,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Diamond shape */}
      <div
        style={{
          position: 'absolute',
          width: 110,
          height: 110,
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%) rotate(45deg)',
          background: '#1F1208',
          border: '1px solid #FB923C',
          borderRadius: '2px',
          boxShadow: '0 0 10px rgba(251, 146, 60, 0.12)',
        }}
      />

      <Handle
        type="target"
        position={Position.Top}
        style={{
          background: '#FB923C',
          width: 6,
          height: 6,
          border: '1px solid #0A1628',
          zIndex: 10,
        }}
      />

      {/* Content overlay */}
      <div
        style={{
          position: 'relative',
          zIndex: 5,
          textAlign: 'center',
          padding: '4px 10px',
          maxWidth: 160,
        }}
      >
        <div
          style={{
            fontSize: '9px',
            fontFamily: "'IBM Plex Mono', monospace",
            fontWeight: 600,
            letterSpacing: '0.12em',
            textTransform: 'uppercase' as const,
            color: '#FB923C',
            marginBottom: '2px',
            opacity: 0.8,
          }}
        >
          DECISION
        </div>
        <div
          style={{
            fontSize: '10px',
            fontFamily: "'IBM Plex Mono', monospace",
            fontWeight: 400,
            lineHeight: 1.3,
            color: '#E8F0FE',
            wordWrap: 'break-word' as const,
          }}
        >
          {data.label}
        </div>
      </div>

      {/* Bottom handle (Yes/True path) */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="a"
        style={{
          background: '#FB923C',
          width: 6,
          height: 6,
          border: '1px solid #0A1628',
          zIndex: 10,
        }}
      />

      {/* Right handle (No/False path) */}
      <Handle
        type="source"
        position={Position.Right}
        id="b"
        style={{
          background: '#FB923C',
          width: 6,
          height: 6,
          border: '1px solid #0A1628',
          zIndex: 10,
        }}
      />
    </div>
  );
};

export default memo(V4DecisionNode);
