/**
 * Type definitions for Playbook Forge
 *
 * Defines the data structures used throughout the application,
 * matching the API response format.
 */

import { Node, Edge } from 'react-flow-renderer';

/**
 * Node type enumeration
 * Defines the different types of nodes in a playbook flowchart
 */
export type NodeType = 'phase' | 'step' | 'decision' | 'execute' | 'merge' | 'start' | 'end' | 'default';

/**
 * Playbook node from API
 */
export interface PlaybookNode {
  id: string;
  label: string;
  type: NodeType;
  metadata?: Record<string, any>;
}

/**
 * Playbook edge from API
 */
export interface PlaybookEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
}

/**
 * Complete playbook graph structure from API
 */
export interface PlaybookGraph {
  nodes: PlaybookNode[];
  edges: PlaybookEdge[];
}

/**
 * Extended data for custom React Flow nodes
 */
export interface CustomNodeData {
  label: string;
  type: NodeType;
  metadata?: Record<string, any>;
}

/**
 * Custom React Flow node with typed data
 */
export type FlowNode = Node<CustomNodeData>;

/**
 * Custom React Flow edge with typed data
 */
export type FlowEdge = Edge;

// ============================================================
// Extended types for multi-variant frontend foundation
// ============================================================

/**
 * Playbook metadata extracted from markdown frontmatter/headers
 */
export interface PlaybookMetadata {
  title: string;
  type: string;
  tooling: string;
  difficulty?: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedTime?: string;
  lastUpdated?: string;
}

/**
 * Category for organizing playbooks in the library
 */
export type PlaybookCategory =
  | 'vulnerability-remediation'
  | 'incident-response'
  | 'threat-hunting'
  | 'compliance'
  | 'siem-operations'
  | 'template';

/**
 * Library item representing a playbook in the catalog
 */
export interface PlaybookLibraryItem {
  slug: string;
  metadata: PlaybookMetadata;
  category: PlaybookCategory;
  markdown: string;
  graph: PlaybookGraph;
  description: string;
  tags: string[];
}

/**
 * Dashboard statistics for playbook overview
 */
export interface DashboardStats {
  totalPlaybooks: number;
  byCategory: Record<PlaybookCategory, number>;
  totalNodes: number;
  totalEdges: number;
  avgNodesPerPlaybook: number;
}

/**
 * Theme configuration for visual customization per variant
 */
export interface PlaybookTheme {
  name: string;
  colors: {
    background: string;
    surface: string;
    border: string;
    text: string;
    textSecondary: string;
    accent: string;
    accentHover: string;
  };
  fonts: {
    body: string;
    heading: string;
    mono: string;
  };
  nodeColors: {
    phase: { border: string; bg: string; badge: string };
    step: { border: string; bg: string; badge: string };
    decision: { border: string; bg: string; badge: string };
    execute: { border: string; bg: string; badge: string };
  };
  edgeColor: string;
}

/**
 * Configuration for a specific variant app
 */
export interface VariantConfig {
  id: number;
  name: string;
  description: string;
  theme: PlaybookTheme;
  features: string[];
}

/**
 * Hash router state
 */
export interface RouterState {
  path: string;
  variant: number | null;
  page: string;
  params: Record<string, string>;
}

/**
 * Result from the client-side markdown parser
 */
export interface ParseResult {
  graph: PlaybookGraph;
  metadata: PlaybookMetadata;
  errors: string[];
  parseTimeMs: number;
}
