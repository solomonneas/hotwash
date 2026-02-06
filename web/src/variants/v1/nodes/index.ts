/**
 * V1 Node Types — Barrel Export
 *
 * Maps node type strings to V1-themed React Flow node components.
 */

import { NodeTypes } from 'react-flow-renderer';
import V1PhaseNode from './V1PhaseNode';
import V1StepNode from './V1StepNode';
import V1DecisionNode from './V1DecisionNode';
import V1ExecuteNode from './V1ExecuteNode';

export const v1NodeTypes: NodeTypes = {
  phase: V1PhaseNode,
  step: V1StepNode,
  decision: V1DecisionNode,
  execute: V1ExecuteNode,
};

export { V1PhaseNode, V1StepNode, V1DecisionNode, V1ExecuteNode };
