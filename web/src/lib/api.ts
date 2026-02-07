/**
 * API Configuration
 *
 * Provides a configurable base URL for API requests.
 * Uses REACT_APP_API_URL environment variable with a sensible default fallback.
 */

const API_BASE_URL: string =
  process.env.REACT_APP_API_URL || 'http://localhost:8000';

/**
 * Get the full URL for an API endpoint.
 *
 * @param path - API path (e.g., '/api/parse')
 * @returns Full URL string
 */
export function apiUrl(path: string): string {
  // Ensure no double slashes when joining base and path
  const base = API_BASE_URL.replace(/\/+$/, '');
  const endpoint = path.startsWith('/') ? path : `/${path}`;
  return `${base}${endpoint}`;
}

export default API_BASE_URL;
