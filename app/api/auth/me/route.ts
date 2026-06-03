import { NextRequest, NextResponse } from 'next/server';

import { getUserById } from '@/lib/data-access';
import { getSessionFromRequest } from '@/lib/request-auth';
import { parseUser } from '@/lib/api-client';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401 });
  }

  const userRow = await getUserById(session.userId);
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
