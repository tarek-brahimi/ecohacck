import { NextRequest, NextResponse } from 'next/server';

import { AiBackendError } from '@/lib/ai-backend';
import { recommendNearby } from '@/lib/recommender-backend';
import { getSessionFromRequest } from '@/lib/request-auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401 });
  }

  const params = request.nextUrl.searchParams;
  const lat = Number(params.get('lat'));
  const lng = Number(params.get('lng'));

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return NextResponse.json(
      { success: false, error: 'lat and lng query parameters are required.' },
      { status: 400 },
    );
  }

  const radiusParam = Number(params.get('radius_km'));
  const limitParam = Number(params.get('limit'));
  const radiusKm = Number.isFinite(radiusParam) && radiusParam > 0 ? radiusParam : undefined;
  const limit = Number.isFinite(limitParam) && limitParam > 0 ? limitParam : undefined;

  try {
    const recommendations = await recommendNearby({
      userId: session.userId,
      lat,
      lng,
      radiusKm,
      limit,
    });
    return NextResponse.json({ success: true, data: { recommendations } });
  } catch (error) {
    if (error instanceof AiBackendError) {
      return NextResponse.json({ success: false, error: error.message }, { status: error.status });
    }

    return NextResponse.json(
      { success: false, error: 'Unexpected error contacting the recommendation service.' },
      { status: 502 },
    );
  }
}
