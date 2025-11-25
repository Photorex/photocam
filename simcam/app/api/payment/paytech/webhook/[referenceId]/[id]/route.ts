import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/app/lib/mongodb/mongodb";
import User from "@/app/lib/mongodb/models/user";
import Payment from "@/app/lib/mongodb/models/payment";

const PAYMENT_API_URL = process.env.PAYMENT_API_URL!;
const AUTH_TOKEN = process.env.AUTH_TOKEN!;

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

// Define the POST handler for the file upload
export async function POST(req: NextRequest) {

    const { pathname } = new URL(req.url);
    const segments = pathname.split('/');
    const referenceId = segments[segments.length - 2];
    const id = segments[segments.length - 1];

    if (!referenceId || !id) {
        return new NextResponse(JSON.stringify({ message: "Missing referenceId or id" }), { status: 400 });
    }

    console.log('referenceId', referenceId);
    console.log('id', id);

    console.log("Received payment request.");

    await connectMongoDB();

    try {
        const url = `${PAYMENT_API_URL}/${id}`;
        const options = {
            method: 'GET',
            headers: {
                accept: 'application/json',
                authorization: AUTH_TOKEN
            }
        };

        const response = await fetch(url, options);
        const jsonResponse = await response.json();

        if (!response.ok) {
            console.error('Server error response:', jsonResponse);
            throw new Error(`Server responded with status: ${response.status} - ${jsonResponse.message}`);
        }

        const { id: paymentId, referenceId: refId, state } = jsonResponse.result;
        const status = state === "COMPLETED";

        // Update the payment document
        const payment = await Payment.findOne({ _id: referenceId });
        if (!payment) {
            throw new Error(`Payment with referenceId ${referenceId} not found.`);
        }

        payment.state = state;
        payment.paymentId = paymentId;
        payment.endDate = payment.annual ? addYears(payment.createdAt, 1) : addMonths(payment.createdAt, 1);
        await payment.save();

        // Update user credits and subscription if payment is completed
        if (status) {
            if (payment.isGenerationPurchase && payment.generationAmount) {
                // ✅ Generation-based credit top-up
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
                // ✅ Subscription-based plan logic
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

        return new NextResponse(JSON.stringify({ id: paymentId, referenceId: refId, state, status }), { status: 200 });

    } catch (error) {
        console.error('Error handling payment confirmation:', error);

        let errorMessage = 'An error occurred';
        if (error instanceof Error) {
            errorMessage = error.message;
        } else if (typeof error === 'object' && error !== null && 'message' in error) {
            errorMessage = (error as { message: string }).message;
        }

        return new NextResponse(JSON.stringify({ message: 'Error handling payment confirmation', error: errorMessage }), { status: 500 });
    }
}