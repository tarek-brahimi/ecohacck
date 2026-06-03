import { NextRequest, NextResponse } from 'next/server';

import { deleteActivity, getActivity } from '@/lib/data-access';
import { getSessionFromRequest } from '@/lib/request-auth';
import { parseActivity } from '@/lib/api-client';

export const dynamic = 'force-dynamic';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const activity = await getActivity(id);

  if (!activity) {
    return NextResponse.json({ success: false, error: 'Activity not found.' }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: parseActivity(activity) });
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
