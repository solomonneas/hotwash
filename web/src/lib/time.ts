/**
 * Time formatting helpers shared across pages.
 */

/**
 * Render an ISO timestamp as a short relative label (e.g. "5m ago").
 * Returns "just now" for anything younger than a minute.
 */
export function relativeTime(iso: string): string {
  const now = Date.now();
  const then = new Date(iso).getTime();
  const diff = now - then;
  if (diff < 60000) return 'just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
}
