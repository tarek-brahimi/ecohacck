import { NextRequest, NextResponse } from 'next/server';

import { AiBackendError, askBackend } from '@/lib/ai-backend';
import { getSessionFromRequest } from '@/lib/request-auth';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401 });
  }

  const body = await request.json();
  const question = String(body.message || body.query || '').trim();

  if (!question) {
    return NextResponse.json({ success: false, error: 'Message is required.' }, { status: 400 });
  }

  try {
    const { answer, sources } = await askBackend(question);
    return NextResponse.json({ success: true, data: { answer, sources } });
  } catch (error) {
    if (error instanceof AiBackendError) {
      return NextResponse.json({ success: false, error: error.message }, { status: error.status });
    }

    return NextResponse.json(
      { success: false, error: 'Unexpected error contacting the AI assistant.' },
      { status: 502 },
    );
  }
}
