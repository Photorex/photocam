import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(req: NextRequest) {
  try {
    const getCookies = await cookies(); // ✅ FIXED

    const nextAuthSession =
      getCookies.get('next-auth.session-token')?.value || null;

    if (!nextAuthSession) {
      console.warn('next-auth.session-token not found or is empty');
    }

    // console.log('nextAuthSession', nextAuthSession);
    return NextResponse.json({ session: nextAuthSession });
  } catch (err) {
    console.error('Error reading session token:', err);
    return NextResponse.json({ error: 'Failed to retrieve session token' }, { status: 500 });
  }
}