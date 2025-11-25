import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from '@/app/lib/mongodb/mongodb';
import User from "@/app/lib/mongodb/models/user";

export const POST = async (req: NextRequest) => {
    try {
        // Connect to the MongoDB database
        await connectMongoDB();

        // Retrieve the feedback data from the request body
        const body = await req.json();
        const { 
            userId, 
            // feedback1, 
            // feedback2 
        } = body;

        // Validate the feedback data
        // if (!rating || !feedback1 || !feedback2) {
        if (!userId) {
            return new NextResponse(JSON.stringify({
                message: 'User id not provided',
            }), { status: 400 });
        }

        // Find the user and update the feedback fields
        const user = await User.findByIdAndUpdate(
            userId,
            {
                $set: {
                    paymentGtmSent: true,
                }
            },
            { new: true }
        );

        if (!user) {
            return new NextResponse(JSON.stringify({
                message: 'User not found',
            }), { status: 404 });
        }

        // Return a success response
        return new NextResponse(JSON.stringify({
            message: 'Payment gtm updated successfully',
        }), { status: 200 });
    } catch (error) {
        console.error('Database update error:', error);
        return new NextResponse(JSON.stringify({
            message: 'Internal Server Error',
            error: error,
        }), { status: 500 });
    }
};