import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from '@/app/lib/mongodb/mongodb';
import User from "@/app/lib/mongodb/models/user";

export const POST = async (request: NextRequest) => {
    try {
        // Parse request body
        const body = await request.json();
        const { email } = body;

        if (!email) {
            return NextResponse.json(
                { exists: false, error: "Email is required" },
                { status: 400 }
            );
        }

        // Connect to MongoDB
        await connectMongoDB();

        const lowCaseEmail = email.toLowerCase();
        
        // Check if user exists
        const existingUser = await User.findOne({ email: lowCaseEmail });

        return NextResponse.json(
            { exists: !!existingUser },
            { status: 200 }
        );
    } catch (err: any) {
        console.error("Error checking user existence:", err.message);
        return NextResponse.json(
            { exists: false, error: err.message },
            { status: 500 }
        );
    }
}; 