// Server-only client for the Eco_Hack_AI FastAPI recommendation endpoint.
// Mirrors lib/ai-backend.ts: the Next.js /api/recommendations route handler
// calls this so the backend URL stays server-side and the browser only ever
// talks to same-origin /api/*.

import { createHash } from 'node:crypto';

import { AiBackendError } from '@/lib/ai-backend';

const AI_BACKEND_URL = process.env.AI_BACKEND_URL || 'http://127.0.0.1:8000';

// Shape of NearbyActivityOut from the backend (app/schemas.py). `similarity` is
// null in cold-start (the user has no profile embedding on the backend side).
export type NearbyActivity = {
  id: string;
  title: string;
  category: string | null;
  distance_km: number;
  similarity: number | null;
  proximity: number;
  freshness: number;
  score: number;
  cold_start: boolean;
};

export type RecommendParams = {
  userId: string;
  lat: number;
  lng: number;
  radiusKm?: number;
  limit?: number;
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * The backend's GET /activities/nearby only needs `X-User-Id` to be a parseable
 * UUID; an unknown user falls back to cold-start ranking. The frontend session
 * id lives in a different identity space (MySQL), so when it isn't already a
 * UUID we derive a deterministic one from it. Stable per user, always parseable.
 */
export function toBackendUserId(sessionUserId: string): string {
  if (UUID_RE.test(sessionUserId)) {
    return sessionUserId;
  }

  const hex = createHash('sha1').update(sessionUserId).digest('hex').slice(0, 32);
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}

function coerceNumber(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

function coerceActivity(raw: Partial<NearbyActivity>): NearbyActivity {
  return {
    id: String(raw.id ?? ''),
    title: typeof raw.title === 'string' ? raw.title : '',
    category: typeof raw.category === 'string' ? raw.category : null,
    distance_km: coerceNumber(raw.distance_km),
    similarity: typeof raw.similarity === 'number' ? raw.similarity : null,
    proximity: coerceNumber(raw.proximity),
    freshness: coerceNumber(raw.freshness),
    score: coerceNumber(raw.score),
    cold_start: Boolean(raw.cold_start),
  };
}

/**
 * Call FastAPI `GET /activities/nearby` and return ranked nearby activities.
 * Maps backend failures to AiBackendError so the route handler can respond
 * gracefully (same pattern as askBackend).
 */
export async function recommendNearby({
  userId,
  lat,
  lng,
  radiusKm = 25,
  limit = 20,
}: RecommendParams): Promise<NearbyActivity[]> {
  const query = new URLSearchParams({
    lat: String(lat),
    lng: String(lng),
    radius_km: String(radiusKm),
    limit: String(limit),
  });

  let response: Response;

  try {
    response = await fetch(`${AI_BACKEND_URL}/activities/nearby?${query}`, {
      method: 'GET',
      headers: { 'X-User-Id': toBackendUserId(userId) },
    });
  } catch {
    throw new AiBackendError(503, "Couldn't reach the recommendation service. Is the backend running?");
  }

  if (!response.ok) {
    const detail = await response
      .json()
      .then((body) => (body && typeof body === 'object' && 'detail' in body ? String(body.detail) : null))
      .catch(() => null);

    throw new AiBackendError(502, detail || 'The recommendation service returned an error.');
  }

  const data = (await response.json().catch(() => null)) as Partial<NearbyActivity>[] | null;

  return Array.isArray(data) ? data.map(coerceActivity) : [];
}
