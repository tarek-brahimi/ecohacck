import { jwtVerify } from 'jose';

import type { UserRole } from '@/lib/types';

export const AUTH_COOKIE_NAME = 'wakti_session';

export interface SessionPayload {
  userId: string;
  email: string;
  role: UserRole;
  fullName: string;
}

function getAuthSecret() {
  const secret = process.env.AUTH_SECRET || 'wakti-development-secret';
  return new TextEncoder().encode(secret);
}

export async function verifySession(token: string) {
  const result = await jwtVerify(token, getAuthSecret());
  const role = result.payload.role;

  if (role !== 'user' && role !== 'admin' && role !== 'house-owner') {
    throw new Error('Invalid session token');
  }

  return {
    userId: result.payload.sub ?? '',
    email: String(result.payload.email ?? ''),
    role,
    fullName: String(result.payload.fullName ?? ''),
  } satisfies SessionPayload;
}
