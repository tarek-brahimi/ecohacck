import { NextRequest } from 'next/server';

import { AUTH_COOKIE_NAME, verifySession } from '@/lib/session';

export async function getSessionFromRequest(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (!token) {
    return null;
  }

  try {
    return await verifySession(token);
  } catch {
    return null;
  }
}
