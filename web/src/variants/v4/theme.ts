/**
 * V4 Theme — Interactive Blueprint / Engineering Schematic
 *
 * Deep blueprint blue backgrounds, white/cyan line work, engineering grid overlay,
 * IBM Plex Mono for everything, Oswald for title block headers.
 * Feels like reading an architectural drawing or engineering schematic.
 */

import { PlaybookTheme } from '../../types';

export const v4Theme: PlaybookTheme = {
  name: 'interactive-blueprint',
  colors: {
    background: '#0A1628',     // Blueprint deep blue
    surface: '#0F1D32',        // Slightly lighter blue surface
    border: '#1E3A5F',         // Blueprint line blue
    text: '#E8F0FE',           // White line
    textSecondary: '#94A3B8',  // Dimension gray
    accent: '#38BDF8',         // Cyan line
    accentHover: '#7DD3FC',    // Light cyan hover
  },
  fonts: {
    body: "'IBM Plex Mono', 'Fira Code', 'Cascadia Code', monospace",
    heading: "'Oswald', 'Barlow Condensed', 'Impact', sans-serif",
    mono: "'IBM Plex Mono', 'Fira Code', 'Cascadia Code', monospace",
  },
  nodeColors: {
    phase: { border: '#FBBF24', bg: '#1A1608', badge: '#FBBF24' },
    step: { border: '#38BDF8', bg: '#081C2E', badge: '#38BDF8' },
    decision: { border: '#FB923C', bg: '#1F1208', badge: '#FB923C' },
    execute: { border: '#4ADE80', bg: '#0A1F12', badge: '#4ADE80' },
  },
  edgeColor: '#38BDF8',
};

/** V4 color constants for direct use in components */
export const V4_COLORS = {
  // Core palette
  blueprintBg: '#0A1628',
  blueprintSurface: '#0F1D32',
  blueprintDark: '#060E1A',
  lineWhite: '#E8F0FE',
  lineCyan: '#38BDF8',
  lineCyanDim: '#1E6B9A',
  dimensionGray: '#94A3B8',
  titleGold: '#FBBF24',
  titleGoldDim: '#92700E',
  annotationGreen: '#4ADE80',
  annotationGreenDim: '#166534',
  highlightOrange: '#FB923C',
  highlightOrangeDim: '#9A3412',

  // Borders
  borderBlue: '#1E3A5F',
  borderCyan: '#164E63',
  borderGold: '#713F12',

  // Grid
  gridLine: 'rgba(56, 189, 248, 0.06)',
  gridLineBright: 'rgba(56, 189, 248, 0.12)',

  // Tick marks
  tickMark: 'rgba(232, 240, 254, 0.2)',
  tickMarkBright: 'rgba(232, 240, 254, 0.4)',

  // Corner markers
  cornerMarker: 'rgba(56, 189, 248, 0.3)',
} as const;
