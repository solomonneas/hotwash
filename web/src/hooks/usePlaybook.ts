/**
 * usePlaybook — Hook for loading a single playbook by slug
 *
 * Returns the PlaybookLibraryItem or undefined if not found.
 */

import { useMemo } from 'react';
import { PlaybookLibraryItem } from '../types';
import { allPlaybooks } from '../data';

export interface UsePlaybookResult {
  /** The playbook data, or undefined if slug doesn't match */
  playbook: PlaybookLibraryItem | undefined;
  /** Whether the slug was found */
  found: boolean;
}

export function usePlaybook(slug: string | undefined): UsePlaybookResult {
  const playbook = useMemo(() => {
    if (!slug) return undefined;
    return allPlaybooks.find((p) => p.slug === slug);
  }, [slug]);

  return { playbook, found: playbook !== undefined };
}
