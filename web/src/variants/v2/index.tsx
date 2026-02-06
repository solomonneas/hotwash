/**
 * Variant 2: Command Center
 *
 * Dashboard-first design with statistics, alerts overview, and split-pane editing.
 * Shell file — to be implemented.
 */

import React from 'react';
import { RouteMatch } from '../../router';

interface V2AppProps {
  route: RouteMatch;
  onNavigate: (path: string) => void;
}

const V2App: React.FC<V2AppProps> = ({ route, onNavigate }) => {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0d1117', color: '#c9d1d9', padding: '2rem' }}>
      <header style={{ marginBottom: '2rem' }}>
        <button
          onClick={() => onNavigate('#/')}
          style={{ background: 'none', border: 'none', color: '#f78166', cursor: 'pointer', fontSize: '0.9rem', padding: 0, marginBottom: '1rem', fontFamily: 'inherit' }}
        >
          ← Back to Variants
        </button>
        <h1 style={{ margin: 0, color: '#f0f6fc' }}>⚒️ Playbook Forge — Command Center</h1>
        <p style={{ color: '#8b949e' }}>Variant 2 • {route.page} view</p>
      </header>
      <nav style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        {['home', 'library', 'import', 'dashboard'].map((p) => (
          <button
            key={p}
            onClick={() => onNavigate(`#/2${p === 'home' ? '' : '/' + p}`)}
            style={{
              padding: '0.5rem 1rem', borderRadius: '6px',
              border: route.page === p ? '2px solid #f78166' : '1px solid #30363d',
              background: route.page === p ? '#f7816622' : '#161b22',
              color: route.page === p ? '#f78166' : '#8b949e',
              cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.9rem', textTransform: 'capitalize',
            }}
          >
            {p}
          </button>
        ))}
      </nav>
      <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: '8px', padding: '2rem', textAlign: 'center' }}>
        <p style={{ color: '#8b949e', fontSize: '1.1rem' }}>🚧 Variant 2 (Command Center) — Coming Soon</p>
        <p style={{ color: '#484f58' }}>Current route: {route.path}{route.params.slug && ` | slug: ${route.params.slug}`}</p>
      </div>
    </div>
  );
};

export default V2App;
