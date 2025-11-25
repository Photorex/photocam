import { NextResponse, NextRequest } from "next/server";
import { connectMongoDB } from '@/app/lib/mongodb/mongodb';
import Payment from "@/app/lib/mongodb/models/payment";

export async function POST(req: NextRequest) {
    try {
        await connectMongoDB();

        const body = await req.json();
        const { paymentId } = body;

        // Validate that paymentId is provided
        if (!paymentId) {
            return NextResponse.json({
                message: 'Payment ID is required',
            }, { status: 400 });
        }

        // Find the payment document by its ID
        const payment = await Payment.findById(paymentId).exec();

        // If payment not found, return a 404 response
        if (!payment) {
            return NextResponse.json({
                message: 'Payment not found',
            }, { status: 404 });
        }

        // Return the payment document
        return NextResponse.json({
            message: 'Payment document retrieved successfully',
            payment,
        }, { status: 200 });

    } catch (error: unknown) {
        console.error('Error retrieving payment document:', error);

        let errorMessage = 'An error occurred';
        if (error instanceof Error) {
            errorMessage = error.message;
        } else if (typeof error === 'object' && error !== null && 'message' in error) {
            errorMessage = (error as { message: string }).message;
        }

        return NextResponse.json({
            message: 'Error retrieving payment document',
            error: errorMessage
        }, { status: 500 });
    }
}