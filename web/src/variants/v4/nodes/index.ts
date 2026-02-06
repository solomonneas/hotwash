/**
 * V4 Node Types — Barrel Export
 *
 * Maps node type strings to V4-themed React Flow node components.
 * Blueprint / engineering schematic aesthetic.
 */

import { NodeTypes } from 'react-flow-renderer';
import V4PhaseNode from './V4PhaseNode';
import V4StepNode from './V4StepNode';
import V4DecisionNode from './V4DecisionNode';
import V4ExecuteNode from './V4ExecuteNode';

export const v4NodeTypes: NodeTypes = {
  phase: V4PhaseNode,
  step: V4StepNode,
  decision: V4DecisionNode,
  execute: V4ExecuteNode,
};

export { V4PhaseNode, V4StepNode, V4DecisionNode, V4ExecuteNode };
