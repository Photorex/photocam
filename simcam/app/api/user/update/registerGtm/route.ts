import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from '@/app/lib/mongodb/mongodb';
import User from "@/app/lib/mongodb/models/user";

export const POST = async (req: NextRequest) => {
    try {
        // Connect to the MongoDB database
        await connectMongoDB();

        const body = await req.json();
        const { 
            userId, 

        } = body;


        if (!userId) {
            return new NextResponse(JSON.stringify({
                message: 'User id not provided',
            }), { status: 400 });
        }

         // Check if feedback has already been submitted by this user
         const existingUser = await User.findById(userId);
         if (existingUser && existingUser.registrationGtmSent) {
             return new NextResponse(JSON.stringify({
                 message: 'Register event already sent',
             }), { status: 409 }); // 409 Conflict
         }

        // Find the user and update the feedback fields
        const user = await User.findByIdAndUpdate(
            userId,
            {
                $set: {
                    registrationGtmSent: true,
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
            message: 'Register gtm updated successfully',
        }), { status: 200 });
    } catch (error) {
        console.error('Database update error:', error);
        return new NextResponse(JSON.stringify({
            message: 'Internal Server Error',
            error: error,
        }), { status: 500 });
    }
};