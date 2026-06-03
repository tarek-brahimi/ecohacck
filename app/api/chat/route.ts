import { NextRequest, NextResponse } from 'next/server';

import { getUserProfile, listActivities } from '@/lib/data-access';
import { getSessionFromRequest } from '@/lib/request-auth';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401 });
  }

  const body = await request.json();
  const prompt = String(body.message || body.query || '').trim();

  if (!prompt) {
    return NextResponse.json({ success: false, error: 'Message is required.' }, { status: 400 });
  }

  const [profile, activities] = await Promise.all([
    getUserProfile(session.userId),
    listActivities(),
  ]);

  const interests = profile?.interests || [];
  const keywords = prompt.toLowerCase().split(/\s+/).filter(Boolean);

  const recommendations = activities
    .filter((activity) => {
      const text = `${activity.title} ${activity.description} ${activity.category} ${activity.location}`.toLowerCase();
      const interestBoost = interests.includes(activity.category) ? 2 : 0;
      const keywordScore = keywords.filter((keyword) => text.includes(keyword)).length;
      return interestBoost + keywordScore > 0;
    })
    .slice(0, 3);

  const fallback = recommendations.length ? recommendations : activities.filter((activity) => activity.difficultyLevel === 'easy').slice(0, 3);

  return NextResponse.json({
    success: true,
    data: {
      message: `Based on "${prompt}", I found ${fallback.length} activities that match your interests.`,
      recommendations: fallback,
    },
  });
}
