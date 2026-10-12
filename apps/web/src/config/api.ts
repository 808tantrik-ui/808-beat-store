/**
 * Centralized API configuration for the Beat Store frontend.
 * Reads VITE_API_URL from environment variables (e.g. for Render, Railway, or Netlify deploys).
 * Falls back to empty string for relative proxying in local development.
 */
export const API_BASE_URL: string = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');

/**
 * Builds a full API URL given an endpoint path.
 * @param endpoint e.g. '/api/beats' or 'api/beats'
 * @returns full URL, e.g. 'https://api.yourbackend.com/api/beats' or '/api/beats'
 */
export function apiUrl(endpoint: string): string {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  if (!API_BASE_URL) {
    return cleanEndpoint;
  }
  return `${API_BASE_URL}${cleanEndpoint}`;
}
