import { NextRequest, NextResponse } from 'next/server';

import { setAuthCookie, signSession } from '@/lib/auth';
import { createUser, getUserByEmail } from '@/lib/data-access';
import { parseUser } from '@/lib/api-client';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { email, password, fullName, ageGroup, interests } = await request.json();

    if (!email || !password || !fullName || !ageGroup) {
      return NextResponse.json({ success: false, error: 'Email, password, full name, and age group are required.' }, { status: 400 });
    }

    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return NextResponse.json({ success: false, error: 'Email already registered.' }, { status: 409 });
    }

    const createdUser = await createUser({
      email,
      password,
      fullName,
      ageGroup,
      interests: Array.isArray(interests) ? interests : [],
    });

    if (!createdUser) {
      return NextResponse.json({ success: false, error: 'Unable to create account.' }, { status: 500 });
    }

    const token = await signSession({
      userId: createdUser.id,
      email: createdUser.email,
      role: createdUser.role,
      fullName: createdUser.fullName,
    });

    const response = NextResponse.json({ success: true, data: parseUser(createdUser) });
    setAuthCookie(response, token);
    return response;
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Signup failed.' },
      { status: 500 }
    );
  }
}
