import { NextRequest, NextResponse } from 'next/server';

import { listUsers } from '@/lib/data-access';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const users = await listUsers({
    role: searchParams.get('role') === 'admin' || searchParams.get('role') === 'user' ? searchParams.get('role') as 'user' | 'admin' : undefined,
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
