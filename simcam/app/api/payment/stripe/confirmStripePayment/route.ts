import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { connectMongoDB } from "@/app/lib/mongodb/mongodb";
import User from "@/app/lib/mongodb/models/user";
import Payment from "@/app/lib/mongodb/models/payment";

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY!;
const stripe = new Stripe(STRIPE_SECRET_KEY);

const NEXT_PUBLIC_PRO_PLAN_CREDITS = parseInt(process.env.NEXT_PUBLIC_PRO_PLAN_CREDITS!);
const NEXT_PUBLIC_MAX_PLAN_CREDITS = parseInt(process.env.NEXT_PUBLIC_MAX_PLAN_CREDITS!);

// Helper function to add months to a date
function addMonths(date: Date, months: number): Date {
    const d = new Date(date);
    d.setMonth(d.getMonth() + months);
    return d;
}

// Helper function to add years to a date
function addYears(date: Date, years: number): Date {
    const d = new Date(date);
    d.setFullYear(d.getFullYear() + years);
    return d;
}

export async function POST(req: NextRequest) {
    console.log("Received stripe subscription status check request.");

    await connectMongoDB();

    try {
        const { userId, stripeSubscriptionId } = await req.json();

        if (!userId || !stripeSubscriptionId) {
            return NextResponse.json({ message: 'User ID or Stripe subscription ID missing' }, { status: 400 });
        }

        // Check that the user exists
        const user = await User.findById(userId);
        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        // Find the payment by stripeSubscriptionId
        const payment = await Payment.findOne({ stripeSubscriptionId });
        if (!payment) {
            return NextResponse.json({ message: 'Payment not found' }, { status: 404 });
        }

        // Retrieve the subscription from Stripe
        const subscription = await stripe.subscriptions.retrieve(stripeSubscriptionId);
        // console.log('Stripe subscription data: ', subscription);

        if (subscription.status === 'active') {

            return NextResponse.json({
                message: 'Subscription is active and payment is completed',
                completed: true,
                id: payment._id,
                paymentId: payment.paymentId,
                amount: payment.amount,
            }, { status: 200 });
        } else {
            return NextResponse.json({
                message: 'Subscription is not active',
                completed: false,
            }, { status: 400 });
        }
    } catch (error) {
        console.error('Error handling subscription status check:', error);

        let errorMessage = 'An error occurred';
        if (error instanceof Error) {
            errorMessage = error.message;
        } else if (typeof error === 'object' && error !== null && 'message' in error) {
            errorMessage = (error as { message: string }).message;
        }

        return NextResponse.json({
            message: 'Error handling subscription status check',
            error: errorMessage,
            completed: false,
        }, { status: 500 });
    }
}