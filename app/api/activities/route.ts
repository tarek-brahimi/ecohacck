import { NextRequest, NextResponse } from 'next/server';

import { createActivity, getUserById, listActivities } from '@/lib/data-access';
import { getSessionFromRequest } from '@/lib/request-auth';
import { parseActivities, parseActivity } from '@/lib/api-client';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const status = searchParams.get('status');
  const houseOwnerId = searchParams.get('houseOwnerId') || undefined;

  if (status === 'pending' || status === 'all') {
    const session = await getSessionFromRequest(request);
    if (!session || (session.role !== 'admin' && session.role !== 'house-owner')) {
      return NextResponse.json({ success: false, error: 'Forbidden.' }, { status: 403 });
    }

    const activities = await listActivities({
      category: searchParams.get('category') as any || undefined,
      search: searchParams.get('search') || undefined,
      status: status as 'pending' | 'all',
      houseOwnerId: session.role === 'house-owner' ? session.userId : houseOwnerId,
    });

    return NextResponse.json({ success: true, data: parseActivities(activities) });
  }

  const activities = await listActivities({
    category: searchParams.get('category') as any || undefined,
    search: searchParams.get('search') || undefined,
    status: 'public',
  });

  return NextResponse.json({ success: true, data: parseActivities(activities) });
}

export async function POST(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ success: false, error: 'Forbidden.' }, { status: 403 });
  }

  const body = await request.json();
  const title = String(body.title || '').trim();
  const description = String(body.description || '').trim();
  const location = String(body.location || '').trim();
  const imageUrl = String(body.imageUrl || '').trim();
  const houseOwnerId = String(body.houseOwnerId || '').trim();
  const latitude = Number(body.latitude);
  const longitude = Number(body.longitude);
  const date = new Date(body.date);

  if (!title || !description || !location || !imageUrl || !houseOwnerId) {
    return NextResponse.json(
      { success: false, error: 'Title, description, location, image URL, and house owner are required.' },
      { status: 400 }
    );
  }

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return NextResponse.json({ success: false, error: 'Latitude and longitude must be valid numbers.' }, { status: 400 });
  }

  if (Number.isNaN(date.getTime())) {
    return NextResponse.json({ success: false, error: 'Invalid activity date.' }, { status: 400 });
  }

  const houseOwner = await getUserById(houseOwnerId);
  if (!houseOwner || houseOwner.role !== 'house-owner') {
    return NextResponse.json({ success: false, error: 'Selected house owner is invalid.' }, { status: 400 });
  }

  const activity = await createActivity({
    title,
    description,
    category: body.category,
    location,
    latitude,
    longitude,
    date,
    imageUrl,
    difficultyLevel: body.difficultyLevel,
    organizerId: session.userId,
    houseOwnerId,
    status: 'pending',
  });
  return NextResponse.json({ success: true, data: activity ? parseActivity(activity) : null });
}
