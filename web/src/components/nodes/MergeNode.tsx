/**
 * MergeNode Component
 *
 * Represents a merge point where decision branches rejoin in the playbook.
 * Displayed as a diamond shape to visually indicate convergence of paths.
 */

import React, { memo } from 'react';
import { Handle, Position } from 'react-flow-renderer';
import './NodeStyles.css';

interface MergeNodeProps {
  data: {
    label: string;
    metadata?: Record<string, any>;
  };
}

const MergeNode: React.FC<MergeNodeProps> = ({ data }) => {
  return (
    <div className="custom-node merge-node">
      <Handle type="target" position={Position.Top} className="node-handle" id="a" />
      <Handle type="target" position={Position.Left} className="node-handle" id="b" />
      <div className="node-icon">🔀</div>
      <div className="node-content">
        <div className="node-label">{data.label}</div>
        <div className="node-type-badge">Merge</div>
      </div>
      <Handle type="source" position={Position.Bottom} className="node-handle" />
    </div>
  );
};

export default memo(MergeNode);
