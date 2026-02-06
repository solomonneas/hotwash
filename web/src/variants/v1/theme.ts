/**
 * V1 Theme — Technical Manual / Field Guide
 *
 * Military field manual aesthetic with cream paper,
 * olive drab accents, and typewriter typography.
 */

import { PlaybookTheme } from '../../types';

export const v1Theme: PlaybookTheme = {
  name: 'technical-manual',
  colors: {
    background: '#F5F0E1',   // Cream paper
    surface: '#EDE8D5',       // Slightly darker cream
    border: '#4A5D23',        // Olive drab
    text: '#1A1A1A',          // Ink black
    textSecondary: '#4A5D23', // Olive drab for secondary
    accent: '#2D3B12',        // Dark olive
    accentHover: '#4A5D23',   // Olive drab hover
  },
  fonts: {
    body: "'Courier Prime', 'Courier New', Courier, monospace",
    heading: "'Oswald', 'Arial Narrow', Impact, sans-serif",
    mono: "'Courier Prime', 'Courier New', Courier, monospace",
  },
  nodeColors: {
    phase: { border: '#2D3B12', bg: '#E8E3D0', badge: '#4A5D23' },
    step: { border: '#4A5D23', bg: '#EDE8D5', badge: '#2D3B12' },
    decision: { border: '#CC0000', bg: '#F5E6E6', badge: '#CC0000' },
    execute: { border: '#B8860B', bg: '#F0ECD0', badge: '#B8860B' },
  },
  edgeColor: '#4A5D23',
};

/** Classification banner text */
export const CLASSIFICATION_TEXT = 'UNCLASSIFIED // FOR TRAINING USE ONLY';

/** V1 color constants for direct use in CSS-in-JS */
export const V1_COLORS = {
  creamPaper: '#F5F0E1',
  oliveDrab: '#4A5D23',
  darkOlive: '#2D3B12',
  inkBlack: '#1A1A1A',
  classificationRed: '#CC0000',
  mutedGold: '#B8860B',
  surfaceCream: '#EDE8D5',
  lightCream: '#FAF7EE',
} as const;
