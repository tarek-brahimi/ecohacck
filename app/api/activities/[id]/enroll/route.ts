import { NextRequest, NextResponse } from 'next/server';

import { toggleEnrollment } from '@/lib/data-access';
import { getSessionFromRequest } from '@/lib/request-auth';

export const dynamic = 'force-dynamic';

async function handleEnrollment(request: NextRequest, activityId: string) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const result = await toggleEnrollment(session.userId, activityId);
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unable to update enrollment.' },
      { status: 400 }
    );
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return handleEnrollment(request, id);
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return handleEnrollment(request, id);
}
