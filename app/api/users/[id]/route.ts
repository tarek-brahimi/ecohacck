import { NextRequest, NextResponse } from 'next/server';

import { getUserById, updateUserProfile, updateUserRole } from '@/lib/data-access';
import { getSessionFromRequest } from '@/lib/request-auth';
import type { UserRole } from '@/lib/types';
import { parseUser } from '@/lib/api-client';

export const dynamic = 'force-dynamic';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getUserById(id);

  if (!user) {
    return NextResponse.json({ success: false, error: 'User not found.' }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    data: parseUser(user),
  });
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionFromRequest(request);
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ success: false, error: 'Forbidden.' }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();

  if (body.role) {
    const role = body.role as UserRole;
    if (role !== 'user' && role !== 'admin' && role !== 'house-owner') {
      return NextResponse.json({ success: false, error: 'Invalid role.' }, { status: 400 });
    }

    const updatedUser = await updateUserRole(id, role);
    if (!updatedUser) {
      return NextResponse.json({ success: false, error: 'User not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: parseUser(updatedUser) });
  }

  const user = await updateUserProfile(id, body);
  if (!user) {
    return NextResponse.json({ success: false, error: 'User not found.' }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: parseUser(user) });
}
