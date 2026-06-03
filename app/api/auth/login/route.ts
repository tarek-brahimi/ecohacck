import { NextRequest, NextResponse } from 'next/server';

import { signSession, setAuthCookie, verifyPassword } from '@/lib/auth';
import { getUserByEmail } from '@/lib/data-access';
import { parseUser } from '@/lib/api-client';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ success: false, error: 'Email and password are required.' }, { status: 400 });
    }

    const userRow = await getUserByEmail(email);
    if (!userRow || !verifyPassword(password, userRow.password_hash)) {
      return NextResponse.json({ success: false, error: 'Invalid email or password.' }, { status: 401 });
    }

    const token = await signSession({
      userId: userRow.id,
      email: userRow.email,
      role: userRow.role,
      fullName: userRow.full_name,
    });

    const response = NextResponse.json({ success: true, data: parseUser({
      id: userRow.id,
      email: userRow.email,
      fullName: userRow.full_name,
      ageGroup: userRow.age_group,
      interests: Array.isArray(userRow.interests) ? userRow.interests : JSON.parse(userRow.interests || '[]'),
      points: userRow.points,
      role: userRow.role,
      createdAt: userRow.created_at || new Date().toISOString(),
    }) });

    setAuthCookie(response, token);
    return response;
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Login failed.' },
      { status: 500 }
    );
  }
}
