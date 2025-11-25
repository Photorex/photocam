import { NextResponse, NextRequest } from "next/server";
import { connectMongoDB } from '@/app/lib/mongodb/mongodb';
import Image from '@/app/lib/mongodb/models/image';
import User from "@/app/lib/mongodb/models/user";

export async function DELETE(req: NextRequest) {
    try {
        await connectMongoDB();

        const body = await req.json();
        const { imageId } = body;

        if (!imageId) {
            return NextResponse.json({
                message: 'Image ID is required',
            }, { status: 400 });
        }

        // Attempt to delete the image document
        const imageToDelete = await Image.findById(imageId);
        // const result = await Image.findByIdAndDelete(imageId);

        if (!imageToDelete) {
            return NextResponse.json({
                message: 'No image found with the provided ID',
            }, { status: 404 });
        }

        const userId = imageToDelete.userId;
        const resImage = imageToDelete.res_image;
        if (userId && resImage) {
            await User.findByIdAndUpdate(userId, {
                $pull: { favorites: resImage } // Remove the image from the favorites array
            });
        }

        const result = await Image.findByIdAndDelete(imageId);

        if (!result) {
            return NextResponse.json({
                message: 'No image found with the provided ID',
            }, { status: 404 });
        }

        return NextResponse.json({
            message: 'Image deleted successfully',
        }, { status: 200 });

    } catch (error: unknown) {
        console.error('Error deleting image:', error);

        let errorMessage = 'An error occurred';
        if (error instanceof Error) {
            errorMessage = error.message;
        } else if (typeof error === 'object' && error !== null && 'message' in error) {
            errorMessage = (error as { message: string }).message;
        }

        return NextResponse.json({
            message: 'Error deleting image',
            error: errorMessage
        }, { status: 500 });
    }
}