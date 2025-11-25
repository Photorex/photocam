import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from '@/app/lib/mongodb/mongodb';
import User from '@/app/lib/mongodb/models/user';
import Video from '@/app/lib/mongodb/models/video';

export async function POST(req: NextRequest) {
  try {
    await connectMongoDB();
    const { videoId, userId, res_video } = await req.json();

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    if (!user.favorites) user.favorites = [];

    let isFavorite = false;
    if (user.favorites.includes(res_video)) {
      user.favorites = user.favorites.filter((v: string) => v !== res_video);
    } else {
      user.favorites.push(res_video);
      isFavorite = true;
    }

    await user.save();

    const video = await Video.findById(videoId);
    if (video) {
      video.favorite = isFavorite;
      await video.save();
    }

    return NextResponse.json({
      message: 'Favorites updated successfully',
      favorites: user.favorites,
    }, { status: 200 });

  } catch (error: any) {
    console.error('Error updating video favorites:', error);
    return NextResponse.json({
      message: 'Error updating video favorites',
      error: error?.message || 'Unknown error',
    }, { status: 500 });
  }
}