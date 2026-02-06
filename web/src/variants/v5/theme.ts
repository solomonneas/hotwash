/**
 * V5 Theme — Minimal Academic / Research Paper
 *
 * White/paper backgrounds, serif typography (Crimson Pro body, Fraunces headings),
 * IBM Plex Mono for code. Vermillion accent used sparingly for footnote numbers.
 * Academic research paper aesthetic — let typography do the work.
 */

import { PlaybookTheme } from '../../types';

export const v5Theme: PlaybookTheme = {
  name: 'minimal-academic',
  colors: {
    background: '#FFFFFF',     // Pure white
    surface: '#FAFAF8',        // Paper off-white
    border: '#D6D3D1',         // Rule gray
    text: '#1C1917',           // Near-black text
    textSecondary: '#78716C',  // Warm gray secondary
    accent: '#DC2626',         // Vermillion (footnotes only)
    accentHover: '#B91C1C',    // Darker vermillion
  },
  fonts: {
    body: "'Crimson Pro', 'Georgia', 'Times New Roman', serif",
    heading: "'Fraunces', 'Georgia', serif",
    mono: "'IBM Plex Mono', 'Menlo', 'Consolas', monospace",
  },
  nodeColors: {
    phase: { border: '#1C1917', bg: '#FFFFFF', badge: '#1C1917' },
    step: { border: '#1C1917', bg: '#FFFFFF', badge: '#78716C' },
    decision: { border: '#1C1917', bg: '#FFFFFF', badge: '#78716C' },
    execute: { border: '#1C1917', bg: '#FFFFFF', badge: '#78716C' },
  },
  edgeColor: '#1C1917',
};

/** V5 color constants for direct use in components */
export const V5_COLORS = {
  white: '#FFFFFF',
  paper: '#FAFAF8',
  text: '#1C1917',
  textSecondary: '#78716C',
  textTertiary: '#A8A29E',
  vermillion: '#DC2626',
  ruleGray: '#D6D3D1',
  ruleLight: '#E7E5E4',
  ruleDark: '#A8A29E',
} as const;
