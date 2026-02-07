/**
 * Playbook Forge - Main Application Component
 *
 * Root component with hash-based routing.
 * Routes:
 *   #/          → VariantPicker (landing)
 *   #/1 .. #/5  → Variant apps
 *   Legacy      → ImportView still accessible as a variant sub-page
 */

import React, { useEffect } from 'react';
import './App.css';
import { useHashRouter } from './router';
import VariantPicker from './pages/VariantPicker';
import V1App from './variants/v1';
import V2App from './variants/v2';
import V3App from './variants/v3';
import V4App from './variants/v4';
import V5App from './variants/v5';

const variantComponents: Record<number, React.FC<{ route: any; onNavigate: (path: string) => void }>> = {
  1: V1App,
  2: V2App,
  3: V3App,
  4: V4App,
  5: V5App,
};

function App() {
  const { route, navigate, navigateTo } = useHashRouter();

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const num = parseInt(e.key);
      if (num >= 1 && num <= 5) navigateTo(num);
      else if (e.key === 'Escape' || e.key === '0') window.location.hash = '#/';
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [navigateTo]);

  // Variant picker (landing)
  if (route.page === 'picker' || route.variant === null) {
    return (
      <div className="App">
        <VariantPicker onSelect={(v) => navigateTo(v)} />
      </div>
    );
  }

  // Variant app
  const VariantApp = variantComponents[route.variant];
  if (VariantApp) {
    return (
      <div className="App">
        <VariantApp route={route} onNavigate={navigate} />
      </div>
    );
  }

  // Fallback
  return (
    <div className="App">
      <VariantPicker onSelect={(v) => navigateTo(v)} />
    </div>
  );
}

export default App;
