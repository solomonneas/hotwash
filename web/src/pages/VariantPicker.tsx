/**
 * VariantPicker — Landing page for choosing a UI variant
 *
 * Displays cards for variants 1-5 with descriptions.
 * Navigates to #/N on click.
 */

import React from 'react';

interface VariantPickerProps {
  onSelect: (variant: number) => void;
}

interface VariantInfo {
  id: number;
  name: string;
  description: string;
  accent: string;
}

const variants: VariantInfo[] = [
  {
    id: 1,
    name: 'Classic',
    description: 'Clean, professional layout with a sidebar library and traditional flowchart view.',
    accent: '#58a6ff',
  },
  {
    id: 2,
    name: 'Command Center',
    description: 'Dashboard-first design with statistics, alerts overview, and split-pane editing.',
    accent: '#f78166',
  },
  {
    id: 3,
    name: 'Notebook',
    description: 'Markdown-forward view with inline flowchart rendering and document-style navigation.',
    accent: '#3fb950',
  },
  {
    id: 4,
    name: 'Blueprint',
    description: 'Engineering blueprint aesthetic with grid backgrounds and technical node styling.',
    accent: '#bc8cff',
  },
  {
    id: 5,
    name: 'Minimal',
    description: 'Stripped-down interface focused on the flowchart with floating controls.',
    accent: '#ffa657',
  },
];

const VariantPicker: React.FC<VariantPickerProps> = ({ onSelect }) => {
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>⚒️ Solomon's Playbook Forge</h1>
        <p style={styles.subtitle}>
          SOC Playbook Visualization Tool — Choose a UI variant to explore
        </p>
      </div>

      <div style={styles.grid}>
        {variants.map((v) => (
          <button
            key={v.id}
            onClick={() => onSelect(v.id)}
            style={{
              ...styles.card,
              borderColor: v.accent,
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)';
              (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 24px ${v.accent}33`;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
              (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
            }}
          >
            <div style={{ ...styles.variantNumber, color: v.accent }}>
              V{v.id}
            </div>
            <h2 style={styles.variantName}>{v.name}</h2>
            <p style={styles.variantDesc}>{v.description}</p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
              <div style={{ ...styles.launchBtn, backgroundColor: v.accent, flex: 1 }}>
                Launch →
              </div>
              <kbd style={{
                fontSize: 12,
                fontFamily: 'monospace',
                padding: '2px 8px',
                borderRadius: 4,
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.12)',
                color: 'rgba(255,255,255,0.4)',
              }}>
                {v.id}
              </kbd>
            </div>
          </button>
        ))}
      </div>

      <footer style={styles.footer}>
        <p>
          Built with React + TypeScript + react-flow-renderer
        </p>
      </footer>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#0d1117',
    color: '#c9d1d9',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '2rem',
  },
  header: {
    textAlign: 'center',
    marginBottom: '3rem',
  },
  title: {
    fontSize: '3rem',
    fontWeight: 800,
    color: '#f0f6fc',
    margin: '1rem 0 0.5rem',
  },
  subtitle: {
    fontSize: '1.15rem',
    color: '#8b949e',
    maxWidth: '600px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '1.5rem',
    maxWidth: '1000px',
    width: '100%',
  },
  card: {
    background: '#161b22',
    border: '2px solid',
    borderRadius: '12px',
    padding: '1.5rem',
    cursor: 'pointer',
    textAlign: 'left' as const,
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.75rem',
    color: '#c9d1d9',
    fontFamily: 'inherit',
    fontSize: 'inherit',
    width: '100%',
  },
  variantNumber: {
    fontSize: '0.85rem',
    fontWeight: 700,
    letterSpacing: '1px',
    textTransform: 'uppercase' as const,
  },
  variantName: {
    fontSize: '1.4rem',
    fontWeight: 700,
    color: '#f0f6fc',
    margin: 0,
  },
  variantDesc: {
    fontSize: '0.95rem',
    color: '#8b949e',
    lineHeight: 1.5,
    flex: 1,
    margin: 0,
  },
  launchBtn: {
    marginTop: '0.5rem',
    padding: '0.5rem 1rem',
    borderRadius: '6px',
    color: '#0d1117',
    fontWeight: 700,
    fontSize: '0.9rem',
    textAlign: 'center' as const,
  },
  footer: {
    marginTop: '3rem',
    color: '#484f58',
    fontSize: '0.85rem',
  },
};

export default VariantPicker;
