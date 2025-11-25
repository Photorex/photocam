import { NextRequest, NextResponse } from 'next/server';
import { connectMongoDB } from '@/app/lib/mongodb/mongodb';
import Video from '@/app/lib/mongodb/models/video';

interface RequestBody {
  userId: string;
  skip?: number;           // how many docs to skip
  limit?: number;          // how many docs to return
}

export async function POST(req: NextRequest) {
  try {
    await connectMongoDB();

    const { userId, skip = 0, limit = 20 }: RequestBody = await req.json();

    if (!userId) {
      return NextResponse.json(
        { message: 'User ID is required', error: 'User ID not provided' },
        { status: 400 }
      );
    }

    const videos = await Video.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      // expose only the fields the client needs
      .select(
        '_id res_video createdAt resolution type_gen status prompt favorite'
      );

    if (videos.length === 0) {
      return NextResponse.json(
        { message: 'No videos found for the provided user ID', userId },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Videos found successfully', videos },
      { status: 200 }
    );
  } catch (error: unknown) {
    const msg =
      error instanceof Error
        ? error.message
        : typeof error === 'object' && error && 'message' in error
        ? (error as { message: string }).message
        : 'An unknown error occurred';

    console.error('Error fetching videos:', error);

    return NextResponse.json(
      { message: 'Error fetching videos', error: msg },
      { status: 500 }
    );
  }
}