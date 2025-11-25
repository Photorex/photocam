import { NextResponse, NextRequest } from "next/server";
import { connectMongoDB } from '@/app/lib/mongodb/mongodb';
import Image, { ImageDocument } from '@/app/lib/mongodb/models/image';

export async function POST(req: NextRequest) {
    try {
        await connectMongoDB();

        const body = await req.json();
        const {
            userId,
            type_gen,
            model,
            steps,
            cfg,
            denoise,
            weights_interpretator,
            upscale,
            facelock_weight,
            facelock_type,
            pose_weight,
            inpaint_what,
            prompt,
            size,
            style,
            tool,
            pipeline,
            neg_prompt,
            loras,
            cost,
            user_shared_settings,
        } = body;

        const newImage: Partial<ImageDocument> = {
            userId,
            type_gen,
            model,
            steps,
            cfg,
            denoise,
            weights_interpretator,
            upscale,
            facelock_weight,
            facelock_type,
            pose_weight,
            inpaint_what,
            prompt,
            size,
            style,
            tool,
            pipeline,
            loras,
            cost,
            user_shared_settings,
            status: 'generating',
        };

        // Optional fields
        if (neg_prompt) {
            newImage.neg_prompt = neg_prompt;
        }

        const image = new Image(newImage);
        await image.save();

        return NextResponse.json({
            message: 'Image document added successfully',
            imageId: image._id // Here we return the MongoDB generated ID
        }, { status: 200 });

    } catch (error: unknown) {
        console.error('Error adding image document:', error);

        let errorMessage = 'An error occurred';
        if (error instanceof Error) {
            errorMessage = error.message;
        } else if (typeof error === 'object' && error !== null && 'message' in error) {
            errorMessage = (error as { message: string }).message;
        }

        return NextResponse.json({
            message: 'Error adding image document',
            error: errorMessage
        }, { status: 500 });
    }
}