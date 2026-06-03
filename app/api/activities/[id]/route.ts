import { NextRequest, NextResponse } from 'next/server';

import { deleteActivity, getActivity, updateActivityStatus } from '@/lib/data-access';
import { getSessionFromRequest } from '@/lib/request-auth';
import { parseActivity } from '@/lib/api-client';

export const dynamic = 'force-dynamic';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const activity = await getActivity(id);

  if (!activity) {
    return NextResponse.json({ success: false, error: 'Activity not found.' }, { status: 404 });
  }

  if (activity.status !== 'public') {
    const session = await getSessionFromRequest(_request);
    if (!session || (session.role !== 'admin' && session.userId !== activity.houseOwnerId)) {
      return NextResponse.json({ success: false, error: 'Activity not found.' }, { status: 404 });
    }
  }

  return NextResponse.json({ success: true, data: parseActivity(activity) });
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionFromRequest(request);
  if (!session || (session.role !== 'admin' && session.role !== 'house-owner')) {
    return NextResponse.json({ success: false, error: 'Forbidden.' }, { status: 403 });
  }

  const { id } = await params;
  const activity = await getActivity(id);
  if (!activity) {
    return NextResponse.json({ success: false, error: 'Activity not found.' }, { status: 404 });
  }

  if (session.role === 'house-owner' && activity.houseOwnerId !== session.userId) {
    return NextResponse.json({ success: false, error: 'Forbidden.' }, { status: 403 });
  }

  const body = await request.json();
  if (body.status !== 'public' && body.status !== 'rejected') {
    return NextResponse.json({ success: false, error: 'Invalid activity status.' }, { status: 400 });
  }

  if (activity.status !== 'pending' && session.role !== 'admin') {
    return NextResponse.json({ success: false, error: 'Activity already reviewed.' }, { status: 409 });
  }

  const updatedActivity = await updateActivityStatus(id, body.status);
  return NextResponse.json({ success: true, data: updatedActivity ? parseActivity(updatedActivity) : null });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionFromRequest(request);
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ success: false, error: 'Forbidden.' }, { status: 403 });
  }

  const { id } = await params;
  await deleteActivity(id);
  return NextResponse.json({ success: true, message: 'Activity deleted.' });
}
