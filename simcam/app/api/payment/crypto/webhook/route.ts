import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/app/lib/mongodb/mongodb";
import User from "@/app/lib/mongodb/models/user";
import Payment from "@/app/lib/mongodb/models/payment";

const NEXT_PUBLIC_MUSE_PLAN_CREDITS= parseInt(process.env.NEXT_PUBLIC_MUSE_PLAN_CREDITS!);
const NEXT_PUBLIC_GLOW_PLAN_CREDITS= parseInt(process.env.NEXT_PUBLIC_GLOW_PLAN_CREDITS!);
const NEXT_PUBLIC_STUDIO_PLAN_CREDITS= parseInt(process.env.NEXT_PUBLIC_STUDIO_PLAN_CREDITS!);
const NEXT_PUBLIC_ICON_PLAN_CREDITS= parseInt(process.env.NEXT_PUBLIC_ICON_PLAN_CREDITS!);

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

// Define the POST handler for the webhook
export async function POST(req: NextRequest) {
    console.log("Received crypto payment webhook request.");

    await connectMongoDB();

    try {
        const body = await req.json();
        console.log('Crypto payment webhook request json: ', body)

        const {
            txn_id,
            order_number,
            status
        } = body;

        if (!txn_id || !order_number) {
            return new NextResponse(JSON.stringify({ message: "Missing txn_id or order_number" }), { status: 400 });
        }

        console.log('txn_id', txn_id);
        console.log('order_number', order_number);
        console.log('status', status);

        const isCompleted = status === "completed";

        // Update the payment document
        const payment = await Payment.findOne({ _id: order_number });
        if (!payment) {
            throw new Error(`Payment with order_number ${order_number} not found.`);
        }

        payment.state = status;
        payment.paymentId = txn_id;
        payment.endDate = payment.annual ? addYears(payment.createdAt, 1) : addMonths(payment.createdAt, 1);
        await payment.save();

        // Update user credits and subscription if payment is completed
        if (isCompleted) {
            if (payment.isGenerationPurchase && payment.generationAmount) {
                // ✅ Add only generation credits
                await User.findOneAndUpdate(
                    { _id: payment.userId },
                    { 
                        $inc: { credits: payment.generationAmount },
                        $set: {
                            paymentId: payment._id,
                            paymentGtmSent: false,
                        }
                    },
                    { new: true }
                );
            } else {
                // ✅ Plan logic (same as before)
                let creditsToAdd = 0;
                if (payment.subscriptionType === "Muse") {
                    creditsToAdd = NEXT_PUBLIC_MUSE_PLAN_CREDITS;
                } else if (payment.subscriptionType === "Glow") {
                    creditsToAdd = NEXT_PUBLIC_GLOW_PLAN_CREDITS;
                } else if (payment.subscriptionType === "Studio") {
                    creditsToAdd = NEXT_PUBLIC_STUDIO_PLAN_CREDITS;
                } else if (payment.subscriptionType === "Icon") {
                    creditsToAdd = NEXT_PUBLIC_ICON_PLAN_CREDITS;
                }

                await User.findOneAndUpdate(
                    { _id: payment.userId },
                    {
                        $inc: { credits: creditsToAdd },
                        $set: {
                            subscriptionId: payment._id,
                            subscription: payment.subscriptionType,
                            subscriptionEndDate: payment.endDate,
                            subscriptionGtmSent: false,
                        }
                    },
                    { new: true }
                );
            }
        }

        return new NextResponse(JSON.stringify({ txn_id, order_number, status, isCompleted }), { status: 200 });

    } catch (error) {
        console.error('Error handling crypto payment confirmation:', error);

        let errorMessage = 'An error occurred';
        if (error instanceof Error) {
            errorMessage = error.message;
        } else if (typeof error === 'object' && error !== null && 'message' in error) {
            errorMessage = (error as { message: string }).message;
        }

        return new NextResponse(JSON.stringify({ message: 'Error handling payment confirmation', error: errorMessage }), { status: 500 });
    }
}