import { NextResponse, NextRequest } from "next/server";
import { connectMongoDB } from '@/app/lib/mongodb/mongodb';
import Payment, { PaymentDocument } from "@/app/lib/mongodb/models/payment";

export async function POST(req: NextRequest) {
    try {
        const ip = (req.headers.get('x-forwarded-for') ?? '127.0.0.1').split(',')[0]

        console.log('IP', ip)
        await connectMongoDB();

        const body = await req.json();
        const {
            userId,
            paymentMethod,
            state,
            amount,
            currency,
            annual,
            locale,
            subscriptionType,
            isGenerationPurchase,
            generationAmount,
        } = body;

        const existingPayments = await Payment.find({ userId }).exec();
        const basicCardPayments = existingPayments.filter(payment => payment.paymentMethod === "BASIC_CARD" && payment.state === "COMPLETED");
        const firstTimeDeposit = paymentMethod === "BASIC_CARD" ? basicCardPayments.length === 0 : existingPayments.length === 0 || existingPayments.some(payment => payment.state === "COMPLETED");
        
        const newPayment: Partial<PaymentDocument> = {
            userId,
            paymentMethod,
            state,
            amount: parseInt(amount),
            currency,
            annual,
            firstTimeDeposit,
            subscriptionType,
            isGenerationPurchase: isGenerationPurchase || false,
            generationAmount: isGenerationPurchase ? generationAmount : undefined,
        };

        const payment = new Payment(newPayment);
        await payment.save();

        return NextResponse.json({
            message: 'Payment document added successfully',
            paymentId: payment._id, // Here we return the MongoDB generated ID
            firstTimeDeposit
        }, { status: 200 });

    } catch (error: unknown) {
        console.error('Error adding payment document:', error);

        let errorMessage = 'An error occurred';
        if (error instanceof Error) {
            errorMessage = error.message;
        } else if (typeof error === 'object' && error !== null && 'message' in error) {
            errorMessage = (error as { message: string }).message;
        }

        return NextResponse.json({
            message: 'Error adding payment document',
            error: errorMessage
        }, { status: 500 });
    }
}