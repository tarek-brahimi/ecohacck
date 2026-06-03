import { NextRequest, NextResponse } from 'next/server';

import { getUserById, updateUserProfile } from '@/lib/data-access';
import { parseUser } from '@/lib/api-client';

export const dynamic = 'force-dynamic';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const userRow = await getUserById(id);

  if (!userRow) {
    return NextResponse.json({ success: false, error: 'User not found.' }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    data: parseUser({
      id: userRow.id,
      email: userRow.email,
      fullName: userRow.full_name,
      ageGroup: userRow.age_group,
      interests: Array.isArray(userRow.interests) ? userRow.interests : JSON.parse(userRow.interests || '[]'),
      points: userRow.points,
      role: userRow.role,
      createdAt: userRow.created_at || new Date().toISOString(),
    }),
  });
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();

  const user = await updateUserProfile(id, body);
  if (!user) {
    return NextResponse.json({ success: false, error: 'User not found.' }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: parseUser(user) });
}
