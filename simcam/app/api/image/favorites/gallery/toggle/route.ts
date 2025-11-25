import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from '@/app/lib/mongodb/mongodb';
import User from '@/app/lib/mongodb/models/user';
import Image from '@/app/lib/mongodb/models/image';

export async function POST(req: NextRequest) {
    try {
        await connectMongoDB();
        const body = await req.json();
        const { imageId, userId, res_image } = body;

        // Find the user by their ID
        const user = await User.findById(userId);
        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        // Initialize user's favorites if not present
        if (!user.favorites) {
            user.favorites = [];
        }

        // Find the image by its ID
        const image = await Image.findById(imageId);
        if (!image) {
            return NextResponse.json({ message: 'Image not found' }, { status: 404 });
        }

        let liked = false;

        // Check if the image is already liked by the user
        if (user.favorites.includes(res_image)) {
            // If liked, remove from favorites and decrement the like count
            user.favorites = user.favorites.filter((img: string) => img !== res_image);
            image.gallery_image_likes = Math.max(0, image.gallery_image_likes - 1); // Ensure likes don't go below 0
            liked = false; // Indicating the image is unliked
        } else {
            // If not liked, add to favorites and increment the like count
            user.favorites.push(res_image);
            image.gallery_image_likes += 1;
            liked = true; // Indicating the image is liked
        }

        // Save both user and image changes
        await user.save();
        await image.save();

        // Respond with success and return the new like count
        return NextResponse.json({
            message: 'Image like status updated successfully',
            liked,
            favorites: user.favorites,
            imageLikes: image.gallery_image_likes
        }, { status: 200 });

    } catch (error) {
        console.error('Error updating image likes:', error);

        let errorMessage = 'An error occurred';
        if (error instanceof Error) {
            errorMessage = error.message;
        }

        return NextResponse.json({
            message: 'Error updating image likes',
            error: errorMessage
        }, { status: 500 });
    }
}