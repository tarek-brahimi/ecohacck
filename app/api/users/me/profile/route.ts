import { NextRequest, NextResponse } from 'next/server';

import { getUserProfile } from '@/lib/data-access';
import { getSessionFromRequest } from '@/lib/request-auth';
import { parseUserProfile } from '@/lib/api-client';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401 });
  }

  const profile = await getUserProfile(session.userId);
  if (!profile) {
    return NextResponse.json({ success: false, error: 'User not found.' }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: parseUserProfile(profile) });
}
