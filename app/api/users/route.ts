import { NextRequest, NextResponse } from 'next/server';

import { listUsers } from '@/lib/data-access';
import { getSessionFromRequest } from '@/lib/request-auth';
import type { UserRole } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ success: false, error: 'Forbidden.' }, { status: 403 });
  }

  const searchParams = request.nextUrl.searchParams;
  const roleParam = searchParams.get('role');
  const role = roleParam === 'admin' || roleParam === 'user' || roleParam === 'house-owner'
    ? roleParam as UserRole
    : undefined;
  const users = await listUsers({
    role,
    search: searchParams.get('search') || undefined,
  });

  const includeStats = searchParams.get('includeStats') === '1';

  return NextResponse.json({
    success: true,
    data: includeStats
      ? users.map((user) => ({ ...user, activityCount: (user as { activityCount?: number }).activityCount ?? 0 }))
      : users.map(({ activityCount: _activityCount, ...user }) => user),
  });
}
