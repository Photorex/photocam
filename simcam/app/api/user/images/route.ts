import { NextRequest, NextResponse } from 'next/server';
import { connectMongoDB } from '@/app/lib/mongodb/mongodb';
import Image from '@/app/lib/mongodb/models/image';

interface RequestBody {
  userId: string;
  skip?: number;   // how many documents to skip
  limit?: number;  // how many documents to return
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

    const images = await Image.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('_id res_image size createdAt type_gen status model favorite');

    if (images.length === 0) {
      return NextResponse.json(
        {
          message: 'No images found for the provided user ID',
          userId,
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Images found successfully', images },
      { status: 200 }
    );
  } catch (error: unknown) {
    const msg =
      error instanceof Error
        ? error.message
        : typeof error === 'object' && error && 'message' in error
        ? (error as { message: string }).message
        : 'An error occurred';

    console.error('Error fetching images:', error);

    return NextResponse.json(
      { message: 'Error fetching images', error: msg },
      { status: 500 }
    );
  }
}