import { NextResponse, NextRequest } from "next/server";
import { connectMongoDB } from '@/app/lib/mongodb/mongodb';
import Video, { VideoDocument } from '@/app/lib/mongodb/models/video';

export async function POST(req: NextRequest) {
  try {
    await connectMongoDB();

    const body = await req.json();
    const {
      userId,
      type_gen,
      prompt,
      resolution,
      image_prompt,
      scene,
      version,
      gender,
      loras,
      user_shared_settings,
    } = body;

    const newVideo: Partial<VideoDocument> = {
      userId,
      type_gen,
      prompt,
      resolution,
      image_prompt,
      scene,
      version,
      gender,
      loras,
      user_shared_settings,
      status: 'generating'
    };

    const video = new Video(newVideo);
    await video.save();

    return NextResponse.json({
      message: 'Video document added successfully',
      videoId: video._id,
    }, { status: 200 });

  } catch (error: any) {
    console.error('Error adding video document:', error);
    return NextResponse.json({
      message: 'Error adding video document',
      error: error?.message || 'Unknown error',
    }, { status: 500 });
  }
}