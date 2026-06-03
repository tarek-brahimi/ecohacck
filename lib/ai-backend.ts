// Server-only client for the Eco_Hack_AI FastAPI service.
// The Next.js /api/chat route handler calls this so the backend URL stays
// server-side and the browser only ever talks to same-origin /api/*.

const AI_BACKEND_URL = process.env.AI_BACKEND_URL || 'http://127.0.0.1:8000';

export type AskScope = {
  type: 'global' | 'activity' | 'establishment';
  id: string | null;
};

export type AskSource = {
  source_type: string;
  source_id: string;
  snippet: string;
};

export type AskResult = {
  answer: string;
  sources: AskSource[];
};

// Thrown when the AI backend is unreachable or returns an error status.
// `status` is the HTTP status we should surface to the client (502/503).
export class AiBackendError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'AiBackendError';
    this.status = status;
  }
}

/**
 * Forward a question to FastAPI `POST /ask` (public RAG endpoint) and return
 * the grounded answer + sources. Maps backend failures to AiBackendError so
 * the route handler can respond gracefully.
 */
export async function askBackend(
  question: string,
  scope: AskScope = { type: 'global', id: null },
  topK = 5,
): Promise<AskResult> {
  let response: Response;

  try {
    response = await fetch(`${AI_BACKEND_URL}/ask`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Skip ngrok's free-tier browser interstitial when AI_BACKEND_URL is a
        // *.ngrok-free.dev tunnel. Harmless when the backend is a plain host.
        'ngrok-skip-browser-warning': '1',
      },
      body: JSON.stringify({ question, scope, top_k: topK }),
    });
  } catch {
    throw new AiBackendError(503, "Couldn't reach the AI assistant. Is the backend running?");
  }

  if (!response.ok) {
    // 502 from /ask means the LLM call failed (e.g. missing/invalid LLM_API_KEY).
    if (response.status === 502) {
      throw new AiBackendError(502, 'The AI service is unavailable right now.');
    }

    const detail = await response
      .json()
      .then((body) => (body && typeof body === 'object' && 'detail' in body ? String(body.detail) : null))
      .catch(() => null);

    throw new AiBackendError(502, detail || 'The AI assistant returned an error.');
  }

  const data = (await response.json()) as Partial<AskResult>;

  return {
    answer: typeof data.answer === 'string' ? data.answer : '',
    sources: Array.isArray(data.sources) ? data.sources : [],
  };
}
