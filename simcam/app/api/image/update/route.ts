import { NextResponse, NextRequest } from "next/server";
import { connectMongoDB } from '@/app/lib/mongodb/mongodb';
import Image, { ImageDocument } from '@/app/lib/mongodb/models/image';

export async function POST(req: NextRequest) {
    try {
        await connectMongoDB();

        const body = await req.json();

        const {
            id_gen,
            host_gen,
            time_gen,
            age,
            gender,
            ethnicity,
            res_image,
        } = body;

        const updatedAt = new Date();

        // Extract data from webhook FormData
        // const idGen = body.get('id_gen');
        // const hostGen = body.get('host_gen');
        // const timeGen = body.get('time_gen');
        // const age = body.get('age');
        // const gender = body.get('gender');
        // const ethnicity = body.get('ethnicity');
        // const imagePath = body.get('res_image');
        // const updatedAt = new Date();

        // Check if all required fields are present
        if (!id_gen || !res_image) {
            return NextResponse.json({
                message: 'Missing required fields',
                error: 'One or more required fields are missing'
            }, { status: 400 });
        }

        // Find the image document by id_gen
        const image = await Image.findOneAndUpdate(
            { _id: id_gen },
            { 
                host_gen, 
                time_gen, 
                age, 
                gender, 
                ethnicity, 
                res_image, 
                updatedAt,
            },
            { new: true }
        );

        if (!image) {
            return NextResponse.json({
                message: 'Image not found',
                error: 'No image found with the provided id_gen'
            }, { status: 404 });
        }

        return NextResponse.json({
            message: 'Image updated successfully',
            imageId: image._id
        }, { status: 200 });

    } catch (error: unknown) {
        console.error('Error updating image document:', error);

        let errorMessage = 'An error occurred';
        if (error instanceof Error) {
            errorMessage = error.message;
        } else if (typeof error === 'object' && error !== null && 'message' in error) {
            errorMessage = (error as { message: string }).message;
        }

        return NextResponse.json({
            message: 'Error updating image document',
            error: errorMessage
        }, { status: 500 });
    }
}