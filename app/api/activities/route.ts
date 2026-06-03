import { NextRequest, NextResponse } from 'next/server';

import { createActivity, listActivities } from '@/lib/data-access';
import { getSessionFromRequest } from '@/lib/request-auth';
import { parseActivities } from '@/lib/api-client';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const activities = await listActivities({
    category: searchParams.get('category') as any || undefined,
    search: searchParams.get('search') || undefined,
  });

  return NextResponse.json({ success: true, data: parseActivities(activities) });
}

export async function POST(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ success: false, error: 'Forbidden.' }, { status: 403 });
  }

  const body = await request.json();
  const activity = await createActivity({
    title: body.title,
    description: body.description,
    category: body.category,
    location: body.location,
    latitude: Number(body.latitude),
    longitude: Number(body.longitude),
    date: new Date(body.date),
    imageUrl: body.imageUrl,
    difficultyLevel: body.difficultyLevel,
    organizerId: session.userId,
  });

  return NextResponse.json({ success: true, data: activity });
}
