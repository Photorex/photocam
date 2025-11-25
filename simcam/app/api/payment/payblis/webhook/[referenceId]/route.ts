import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/app/lib/mongodb/mongodb";
import User from "@/app/lib/mongodb/models/user";
import Payment from "@/app/lib/mongodb/models/payment";
import crypto from "crypto";

const PAYBLIS_SECRET_KEY = process.env.PAYBLIS_SECRET_KEY!;

const NEXT_PUBLIC_MUSE_PLAN_CREDITS = parseInt(process.env.NEXT_PUBLIC_MUSE_PLAN_CREDITS!);
const NEXT_PUBLIC_GLOW_PLAN_CREDITS = parseInt(process.env.NEXT_PUBLIC_GLOW_PLAN_CREDITS!);
const NEXT_PUBLIC_STUDIO_PLAN_CREDITS = parseInt(process.env.NEXT_PUBLIC_STUDIO_PLAN_CREDITS!);
const NEXT_PUBLIC_ICON_PLAN_CREDITS = parseInt(process.env.NEXT_PUBLIC_ICON_PLAN_CREDITS!);

// Helper function to verify HMAC signature
function verifyPayblisSignature(data: any, receivedSignature: string): boolean {
    // Create a copy without the signature field
    const { signature, ...dataToVerify } = data;
    
    // Create HMAC signature
    const expectedSignature = crypto.createHmac('sha256', PAYBLIS_SECRET_KEY)
        .update(JSON.stringify(dataToVerify))
        .digest('hex');
    
    return expectedSignature === receivedSignature;
}

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
    const { pathname } = new URL(req.url);
    const segments = pathname.split('/');
    const referenceId = segments[segments.length - 1];

    if (!referenceId) {
        return new NextResponse(JSON.stringify({ message: "Missing referenceId" }), { status: 400 });
    }

    console.log('Payblis webhook received for referenceId:', referenceId);

    try {
        // Get the webhook data
        const webhookData = await req.json();
        console.log('Payblis webhook data:', webhookData);

        // Verify the signature for security
        if (webhookData.signature) {
            const isValidSignature = verifyPayblisSignature(webhookData, webhookData.signature);
            if (!isValidSignature) {
                console.error('Invalid Payblis webhook signature');
                return new NextResponse(JSON.stringify({ message: "Invalid signature" }), { status: 401 });
            }
        }

        // Verify that the merchant_reference matches our referenceId
        if (webhookData.merchant_reference !== referenceId) {
            console.error(`Merchant reference mismatch: expected ${referenceId}, got ${webhookData.merchant_reference}`);
            return new NextResponse(JSON.stringify({ message: "Reference ID mismatch" }), { status: 400 });
        }

        await connectMongoDB();

        // Find the payment document using existing fields
        const payment = await Payment.findOne({ _id: referenceId });
        if (!payment) {
            console.error(`Payment with referenceId ${referenceId} not found`);
            return new NextResponse(JSON.stringify({ message: "Payment not found" }), { status: 404 });
        }

        // Determine if payment is successful based on Payblis webhook format
        const isSuccessful = webhookData.event === 'payment.success' && webhookData.status === 'SUCCESS';
        const newState = isSuccessful ? 'COMPLETED' : 'FAILED';

        // Update payment status using existing fields
        payment.state = newState;
        payment.paymentId = webhookData.transaction_id; // Store Payblis transaction ID
        if (isSuccessful) {
            payment.endDate = payment.annual ? addYears(payment.createdAt, 1) : addMonths(payment.createdAt, 1);
        }
        await payment.save();

        console.log(`Payment ${referenceId} updated to state: ${newState}, transaction_id: ${webhookData.transaction_id}`);

        // Update user credits and subscription if payment is successful
        if (isSuccessful) {
            if (payment.isGenerationPurchase && payment.generationAmount) {
                // Generation-based credit top-up using existing fields
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
                console.log(`Added ${payment.generationAmount} credits to user ${payment.userId}`);
            } else {
                // Subscription-based plan logic
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
                console.log(`Updated user ${payment.userId} subscription to ${payment.subscriptionType} with ${creditsToAdd} credits`);
            }
        }

        // Return success response for Payblis
        return new NextResponse(JSON.stringify({ 
            message: "Webhook processed successfully",
            status: newState,
            referenceId: referenceId,
            transaction_id: webhookData.transaction_id
        }), { status: 200 });

    } catch (error) {
        console.error('Error processing Payblis webhook:', error);

        let errorMessage = 'An error occurred';
        if (error instanceof Error) {
            errorMessage = error.message;
        } else if (typeof error === 'object' && error !== null && 'message' in error) {
            errorMessage = (error as { message: string }).message;
        }

        return new NextResponse(JSON.stringify({ 
            message: 'Error processing webhook', 
            error: errorMessage 
        }), { status: 500 });
    }
}
