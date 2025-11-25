import { NextResponse, NextRequest } from "next/server";
import { connectMongoDB } from '@/app/lib/mongodb/mongodb';
import Payment, { PaymentDocument } from "@/app/lib/mongodb/models/payment";

const STRIPE_PRICE_ID_PRO_MONTHLY = process.env.STRIPE_PRICE_ID_PRO_MONTHLY!;
const STRIPE_PRICE_ID_PRO_ANNUAL = process.env.STRIPE_PRICE_ID_PRO_ANNUAL!;
const STRIPE_PRICE_ID_MAX_MONTHLY = process.env.STRIPE_PRICE_ID_MAX_MONTHLY!;
const STRIPE_PRICE_ID_MAX_ANNUAL = process.env.STRIPE_PRICE_ID_MAX_ANNUAL!;
const PRODUCT_ID_PRO = process.env.PRODUCT_ID_PRO!;
const PRODUCT_ID_MAX = process.env.PRODUCT_ID_MAX!;

export async function POST(req: NextRequest) {
    try {
        const ip = (req.headers.get('x-forwarded-for') ?? '127.0.0.1').split(',')[0];

        console.log('IP', ip);
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
        } = body;

        let priceId;
        let stripeProductId;
        if (subscriptionType === "Pro") {
            priceId = annual ? STRIPE_PRICE_ID_PRO_ANNUAL : STRIPE_PRICE_ID_PRO_MONTHLY;
            stripeProductId = PRODUCT_ID_PRO;
        } else if (subscriptionType === "Max") {
            priceId = annual ? STRIPE_PRICE_ID_MAX_ANNUAL : STRIPE_PRICE_ID_MAX_MONTHLY;
            stripeProductId = PRODUCT_ID_MAX;
        } else {
            return NextResponse.json({ error: "Invalid subscription type" }, { status: 400 });
        }

        const existingPayments = await Payment.find({ userId }).exec();
        const stripePayments = existingPayments.filter(payment => payment.paymentMethod === "STRIPE" && payment.state === "COMPLETED");
        const firstTimeDeposit = paymentMethod === "STRIPE" ? stripePayments.length === 0 : existingPayments.length === 0 || existingPayments.some(payment => payment.state === "COMPLETED");

        const newPayment: Partial<PaymentDocument> = {
            userId,
            paymentMethod,
            state,
            amount,
            currency,
            annual,
            firstTimeDeposit,
            subscriptionType,
            stripePriceId: priceId,
            stripeProductId: stripeProductId,
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