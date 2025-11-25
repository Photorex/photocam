import { NextResponse, NextRequest } from "next/server";
import { connectMongoDB } from '@/app/lib/mongodb/mongodb';
import Video from '@/app/lib/mongodb/models/video';
import User from '@/app/lib/mongodb/models/user';

export async function DELETE(req: NextRequest) {
  try {
    await connectMongoDB();
    const { videoId } = await req.json();

    if (!videoId) {
      return NextResponse.json({ message: 'Video ID is required' }, { status: 400 });
    }

    const videoToDelete = await Video.findById(videoId);
    if (!videoToDelete) {
      return NextResponse.json({ message: 'No video found with the provided ID' }, { status: 404 });
    }

    const userId = videoToDelete.userId;
    const resVideo = videoToDelete.res_video;
    if (userId && resVideo) {
      await User.findByIdAndUpdate(userId, {
        $pull: { favorites: resVideo }
      });
    }

    await Video.findByIdAndDelete(videoId);
    return NextResponse.json({ message: 'Video deleted successfully' }, { status: 200 });

  } catch (error: any) {
    console.error('Error deleting video:', error);
    return NextResponse.json({
      message: 'Error deleting video',
      error: error?.message || 'Unknown error',
    }, { status: 500 });
  }
}