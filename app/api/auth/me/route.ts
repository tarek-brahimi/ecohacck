import { NextRequest, NextResponse } from 'next/server';

import { setAuthCookie, signSession } from '@/lib/auth';
import { getUserById } from '@/lib/data-access';
import { getSessionFromRequest } from '@/lib/request-auth';
import { parseUser } from '@/lib/api-client';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401 });
  }

  const user = await getUserById(session.userId);
  if (!user) {
    return NextResponse.json({ success: false, error: 'User not found.' }, { status: 404 });
  }

  const response = NextResponse.json({
    success: true,
    data: parseUser(user),
  });

  if (user.role !== session.role) {
    const token = await signSession({
      userId: user.id,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
    });
    setAuthCookie(response, token);
  }

  return response;
}
