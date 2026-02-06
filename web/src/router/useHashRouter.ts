/**
 * useHashRouter — Custom hash-based routing hook
 *
 * Reads window.location.hash and returns a parsed RouteMatch.
 * Listens for hashchange events and re-renders on navigation.
 * No external dependencies required.
 */

import { useState, useEffect, useCallback } from 'react';
import { RouteMatch, matchRoute, buildPath } from './routes';

export interface HashRouter {
  /** Current matched route */
  route: RouteMatch;
  /** Navigate to a new hash path (string or builder) */
  navigate: (path: string) => void;
  /** Navigate to a variant page using builder */
  navigateTo: (variant?: number, page?: string, params?: Record<string, string>) => void;
  /** Go back in hash history */
  goBack: () => void;
}

export function useHashRouter(): HashRouter {
  const [route, setRoute] = useState<RouteMatch>(() =>
    matchRoute(window.location.hash)
  );

  useEffect(() => {
    const handleHashChange = () => {
      setRoute(matchRoute(window.location.hash));
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigate = useCallback((path: string) => {
    window.location.hash = path.startsWith('#') ? path : `#${path}`;
  }, []);

  const navigateTo = useCallback(
    (variant?: number, page?: string, params?: Record<string, string>) => {
      window.location.hash = buildPath(variant, page, params);
    },
    []
  );

  const goBack = useCallback(() => {
    window.history.back();
  }, []);

  return { route, navigate, navigateTo, goBack };
}
