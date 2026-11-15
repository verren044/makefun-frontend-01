// make.fun's public API: read-only GET requests, open to any origin (CORS).
// The full API is described at https://make.fun/api/openapi.json.
//
// Every answer is cached in memory with its ETag: a repeat visit sends
// If-None-Match and the API answers 304 with no body, so the board costs
// almost nothing to revisit.

const API = 'https://make.fun/api';
const cache = new Map(); // path -> { etag, data }

async function get(path) {
  const hit = cache.get(path);
  const headers = {};
  if (hit?.etag) headers['If-None-Match'] = hit.etag;
  const res = await fetch(API + path, { headers });
  if (res.status === 304 && hit) return hit.data;
  if (!res.ok) throw new Error(`make.fun API ${res.status} for ${path}`);
  const data = await res.json();
  const etag = res.headers.get('etag');
  if (etag) cache.set(path, { etag, data });
  return data;
}

/** The open bounties: { items: [...] } (activity=times leaves out the activity a board does not show). */
export const getBounties = () => get('/competitions?status=open&activity=times');

/** One bounty, by its slug. */
export const getBounty = (slug) => get(`/competitions/${encodeURIComponent(slug)}`);

/** A bounty's leaderboard: { competition, phase, views, columns, entries }. */
export const getLeaderboard = (slug, view) =>
  get(`/competitions/${encodeURIComponent(slug)}/leaderboard${view ? `?view=${encodeURIComponent(view)}` : ''}`);

/** An account's public profile: { handle, record, solutions, ... }. */
export const getProfile = (handle) => get(`/profiles/${encodeURIComponent(handle)}`);
