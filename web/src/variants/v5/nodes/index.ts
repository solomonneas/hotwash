/**
 * V5 Node Types — Barrel Export
 *
 * Maps node type strings to V5-themed React Flow node components.
 * Minimal academic diagram aesthetic: shapes communicate type,
 * no color, no fill, no shadow.
 */

import { NodeTypes } from 'react-flow-renderer';
import V5PhaseNode from './V5PhaseNode';
import V5StepNode from './V5StepNode';
import V5DecisionNode from './V5DecisionNode';
import V5ExecuteNode from './V5ExecuteNode';

export const v5NodeTypes: NodeTypes = {
  phase: V5PhaseNode,
  step: V5StepNode,
  decision: V5DecisionNode,
  execute: V5ExecuteNode,
};

export { V5PhaseNode, V5StepNode, V5DecisionNode, V5ExecuteNode };
