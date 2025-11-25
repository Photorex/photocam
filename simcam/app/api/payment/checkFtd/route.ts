import { NextResponse, NextRequest } from "next/server";
import { connectMongoDB } from '@/app/lib/mongodb/mongodb';
import Payment from "@/app/lib/mongodb/models/payment";

export async function POST(req: NextRequest) {
    try {
        await connectMongoDB();

        const body = await req.json();
        const { userId } = body;

        const basicCardPayments = await Payment.find({ userId, paymentMethod: "BASIC_CARD", state: "COMPLETED" }).exec();
        const isFirstBasicCardPayment = basicCardPayments.length === 0;

        return NextResponse.json({
            message: 'Payment check completed successfully',
            isFirstBasicCardPayment,
        }, { status: 200 });

    } catch (error: unknown) {
        console.error('Error checking payment status:', error);

        let errorMessage = 'An error occurred';
        if (error instanceof Error) {
            errorMessage = error.message;
        } else if (typeof error === 'object' && error !== null && 'message' in error) {
            errorMessage = (error as { message: string }).message;
        }

        return NextResponse.json({
            message: 'Error checking payment status',
            error: errorMessage
        }, { status: 500 });
    }
}