import crypto from 'node:crypto';
import { jwtVerify, SignJWT } from 'jose';
import { NextResponse } from 'next/server';

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

export async function hashPassword(password: string) {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${derivedKey}`;
}

export function verifyPassword(password: string, storedHash: string) {
  const [salt, hash] = storedHash.split(':');
  if (!salt || !hash) {
    return false;
  }

  const derivedKey = crypto.scryptSync(password, salt, 64).toString('hex');
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(derivedKey, 'hex'));
}

export async function signSession(session: SessionPayload) {
  return new SignJWT({ email: session.email, role: session.role, fullName: session.fullName })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(session.userId)
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(getAuthSecret());
}

export async function verifySession(token: string) {
  const result = await jwtVerify(token, getAuthSecret());
  const role = result.payload.role;

  if (role !== 'user' && role !== 'admin') {
    throw new Error('Invalid session token');
  }

  return {
    userId: result.payload.sub ?? '',
    email: String(result.payload.email ?? ''),
    role,
    fullName: String(result.payload.fullName ?? ''),
  } satisfies SessionPayload;
}

export function setAuthCookie(response: NextResponse, token: string) {
  response.cookies.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });
}

export function clearAuthCookie(response: NextResponse) {
  response.cookies.set(AUTH_COOKIE_NAME, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  });
}