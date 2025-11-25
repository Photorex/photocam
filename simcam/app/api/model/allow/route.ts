import { NextResponse } from 'next/server';
import { connectMongoDB } from '@/app/lib/mongodb/mongodb';
import User from '@/app/lib/mongodb/models/user';

export async function GET(req: Request) {
  const userId = new URL(req.url).searchParams.get('userId');
  if (!userId) return NextResponse.json({ error: 'userId missing' }, { status: 400 });

  await connectMongoDB();
  const user = await User.findById(userId, 'modelMap');
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  // 1 model  === only the seeded test model → next one is free
  const freeAvailable = (user.modelMap?.length ?? 0) <= 1;

  return NextResponse.json({ freeAvailable });
}