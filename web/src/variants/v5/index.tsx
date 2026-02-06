/**
 * Variant 5: Minimal
 *
 * Stripped-down interface focused on the flowchart with floating controls.
 * Shell file — to be implemented.
 */

import React from 'react';
import { RouteMatch } from '../../router';

interface V5AppProps {
  route: RouteMatch;
  onNavigate: (path: string) => void;
}

const V5App: React.FC<V5AppProps> = ({ route, onNavigate }) => {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0d1117', color: '#c9d1d9', padding: '2rem' }}>
      <header style={{ marginBottom: '2rem' }}>
        <button
          onClick={() => onNavigate('#/')}
          style={{ background: 'none', border: 'none', color: '#ffa657', cursor: 'pointer', fontSize: '0.9rem', padding: 0, marginBottom: '1rem', fontFamily: 'inherit' }}
        >
          ← Back to Variants
        </button>
        <h1 style={{ margin: 0, color: '#f0f6fc' }}>⚒️ Playbook Forge — Minimal</h1>
        <p style={{ color: '#8b949e' }}>Variant 5 • {route.page} view</p>
      </header>
      <nav style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        {['home', 'library', 'import', 'dashboard'].map((p) => (
          <button
            key={p}
            onClick={() => onNavigate(`#/5${p === 'home' ? '' : '/' + p}`)}
            style={{
              padding: '0.5rem 1rem', borderRadius: '6px',
              border: route.page === p ? '2px solid #ffa657' : '1px solid #30363d',
              background: route.page === p ? '#ffa65722' : '#161b22',
              color: route.page === p ? '#ffa657' : '#8b949e',
              cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.9rem', textTransform: 'capitalize',
            }}
          >
            {p}
          </button>
        ))}
      </nav>
      <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: '8px', padding: '2rem', textAlign: 'center' }}>
        <p style={{ color: '#8b949e', fontSize: '1.1rem' }}>🚧 Variant 5 (Minimal) — Coming Soon</p>
        <p style={{ color: '#484f58' }}>Current route: {route.path}{route.params.slug && ` | slug: ${route.params.slug}`}</p>
      </div>
    </div>
  );
};

export default V5App;
