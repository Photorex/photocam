import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from '@/app/lib/mongodb/mongodb';
import User from '@/app/lib/mongodb/models/user';
import Image from '@/app/lib/mongodb/models/image';

export async function POST(req: NextRequest) {
    try {
        await connectMongoDB();
        const body = await req.json();
        const { imageId, userId, res_image } = body;
        console.log("Image body", body)

        const user = await User.findById(userId);

        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        // Initialize favorites if it doesn't exist
        if (!user.favorites) {
            user.favorites = [];
        }

        let favoriteUpdated = false;
        // Toggle image in favorites
        if (user.favorites.includes(res_image)) {
            console.log("Image in favorites")
            user.favorites = user.favorites.filter((img: string) => img !== res_image);
            favoriteUpdated = false; // Set to false since it is being removed
        } else {
            // If image is not in favorites, add it
            console.log("Image not in favorites")
            user.favorites.push(res_image);
            favoriteUpdated = true; // Set to true since it is being added
        }

        await user.save();

        // Update the favorite field in the Image document
        const image = await Image.findById(imageId);
        if (image) {
            image.favorite = favoriteUpdated;
            await image.save();
        }

        return NextResponse.json({
            message: 'Favorites updated successfully',
            favorites: user.favorites
        }, { status: 200 });

    } catch (error) {
        console.error('Error updating user favorites:', error);

        let errorMessage = 'An error occurred';
        if (error instanceof Error) {
            errorMessage = error.message;
        } else if (typeof error === 'object' && error !== null && 'message' in error) {
            errorMessage = (error as { message: string }).message;
        }

        return NextResponse.json({
            message: 'Error updating user favorites',
            error: errorMessage
        }, { status: 500 });
    }
}