import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "@/app/lib/mongodb/mongodb";
import User from "@/app/lib/mongodb/models/user";
import Payment from "@/app/lib/mongodb/models/payment";
import Stripe from "stripe";

const NEXT_PUBLIC_BASIC_PLAN_CREDITS= parseInt(process.env.NEXT_PUBLIC_BASIC_PLAN_CREDITS!);
const NEXT_PUBLIC_STANDART_PLAN_CREDITS= parseInt(process.env.NEXT_PUBLIC_STANDART_PLAN_CREDITS!);
const NEXT_PUBLIC_PREMIUM_PLAN_CREDITS= parseInt(process.env.NEXT_PUBLIC_PREMIUM_PLAN_CREDITS!);

const PRODUCT_ID_BASIC=process.env.PRODUCT_ID_BASIC!;
const STRIPE_PRICE_ID_BASIC_MONTHLY=process.env.STRIPE_PRICE_ID_BASIC_MONTHLY!;
const STRIPE_PRICE_ID_BASIC_ANNUAL=process.env.STRIPE_PRICE_ID_BASIC_ANNUAL!;

const PRODUCT_ID_STANDART=process.env.PRODUCT_ID_STANDART!;
const STRIPE_PRICE_ID_STANDART_MONTHLY=process.env.STRIPE_PRICE_ID_STANDART_MONTHLY!;
const STRIPE_PRICE_ID_STANDART_ANNUAL=process.env.STRIPE_PRICE_ID_STANDART_ANNUAL!;

const PRODUCT_ID_PREMIUM=process.env.PRODUCT_ID_PREMIUM!;
const STRIPE_PRICE_ID_PREMIUM_MONTHLY=process.env.STRIPE_PRICE_ID_PREMIUM_MONTHLY!;
const STRIPE_PRICE_ID_PREMIUM_ANNUAL=process.env.STRIPE_PRICE_ID_PREMIUM_ANNUAL!;

const PRODUCT_ID_GENERATIONS=process.env.PRODUCT_ID_GENERATIONS!;
const STRIPE_PRICE_ID_GENERATIONS_50=process.env.STRIPE_PRICE_ID_GENERATIONS_50!;
const STRIPE_PRICE_ID_GENERATIONS_100=process.env.STRIPE_PRICE_ID_GENERATIONS_100!;
const STRIPE_PRICE_ID_GENERATIONS_200=process.env.STRIPE_PRICE_ID_GENERATIONS_200!;
const STRIPE_PRICE_ID_GENERATIONS_500=process.env.STRIPE_PRICE_ID_GENERATIONS_500!;
const STRIPE_PRICE_ID_GENERATIONS_1000=process.env.STRIPE_PRICE_ID_GENERATIONS_1000!;
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY!;
const stripe = new Stripe(STRIPE_SECRET_KEY);


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
    console.log("Received stripe payment webhook request.");

    // await connectMongoDB();

    try {
        const body = await req.json();
        // console.log('Stripe payment webhook request json: ', body)

        // Handle the event
        switch (body.type) {
            case 'checkout.session.completed':
                const session = body.data.object;
                console.log('Checkout session completed:', session);

                // Add logic here to update the payment status in your database
                // For example, find the payment by session ID and update its status
                const paymentId = session.metadata.simcam_payment_id;
                const payment = await Payment.findById(paymentId);
                
                if (payment) {
                    payment.state = 'COMPLETED';
                    payment.paymentId = session.id;
                    payment.stripePaymentId = session.id;
                    payment.stripePaymentLinkId = session.payment_link;
                    payment.stripeCustomerId = session.customer;
                    payment.stripeInvoiceId = session.invoice;
                    payment.stripeSubscriptionId = session.subscription;
                    await payment.save();
                    console.log(`Payment ${paymentId} updated successfully.`);
                    

                    const subscription = await stripe.subscriptions.retrieve(session.subscription);
                    const priceId = subscription.items.data[0].price.id;
                    const productId = subscription.items.data[0].price.product as string;
                    const amount = subscription.items.data[0].price.unit_amount ? subscription.items.data[0].price.unit_amount / 100 : payment.amount;


                    let creditsToAdd = 0;
                    let newSubscriptionEndDate;

                    if (productId === PRODUCT_ID_BASIC) {
                        payment.subscriptionType = "Basic";
                        if (priceId === STRIPE_PRICE_ID_BASIC_ANNUAL) {
                            payment.annual = true;
                            creditsToAdd = NEXT_PUBLIC_BASIC_PLAN_CREDITS;
                            newSubscriptionEndDate = addYears(new Date(), 1);
                        } else if (priceId === STRIPE_PRICE_ID_BASIC_MONTHLY) {
                            payment.annual = false;
                            creditsToAdd = NEXT_PUBLIC_BASIC_PLAN_CREDITS;
                            newSubscriptionEndDate = addMonths(new Date(), 1);
                        }
                    } else if (productId === PRODUCT_ID_STANDART) {
                        payment.subscriptionType = "Standart";
                        if (priceId === STRIPE_PRICE_ID_STANDART_ANNUAL) {
                            payment.annual = true;
                            creditsToAdd = NEXT_PUBLIC_STANDART_PLAN_CREDITS;
                            newSubscriptionEndDate = addYears(new Date(), 1);
                        } else if (priceId === STRIPE_PRICE_ID_STANDART_MONTHLY) {
                            payment.annual = false;
                            creditsToAdd = NEXT_PUBLIC_STANDART_PLAN_CREDITS;
                            newSubscriptionEndDate = addMonths(new Date(), 1);
                        }
                    } else if (productId === PRODUCT_ID_PREMIUM) {
                        payment.subscriptionType = "Standart";
                        if (priceId === STRIPE_PRICE_ID_PREMIUM_ANNUAL) {
                            payment.annual = true;
                            creditsToAdd = NEXT_PUBLIC_PREMIUM_PLAN_CREDITS;
                            newSubscriptionEndDate = addYears(new Date(), 1);
                        } else if (priceId === STRIPE_PRICE_ID_PREMIUM_MONTHLY) {
                            payment.annual = false;
                            creditsToAdd = NEXT_PUBLIC_PREMIUM_PLAN_CREDITS;
                            newSubscriptionEndDate = addMonths(new Date(), 1);
                        }
                    } else {
                        console.log(`Invalid product ID: ${productId}`);
                    }

                    payment.amount = amount; // Update payment amount
                    await payment.save();
                    console.log(`Payment ${paymentId} amount and annual status updated successfully.`);

                    // Update the user details
                    // Update the user details
                    const userId = payment.userId;
                    const user = await User.findById(userId);
                    if (user) {
                        user.subscriptionId = payment._id;
                        user.credits += creditsToAdd;
                        user.subscription = payment.subscriptionType;
                        user.subscriptionEndDate = newSubscriptionEndDate;
                        user.stripeSubscription = true;
                        user.stripeSubscriptionId = session.subscription;
                        user.stripeCustomerId = session.customer;
                        user.subscriptionGtmSent = false;

                        await user.save();
                        console.log(`User ${userId} updated successfully.`);
                    } else {
                        console.log(`User ${userId} not found.`);
                    }

                } else {
                    console.log(`Payment ${paymentId} not found.`);
                }
                break;

            // Handle other event types as needed
            default:
                // Do nothing
                // console.log(`Unhandled event type ${body.type}`);
                console.log(`Unhandled event type, ignoring`);            }

        return new NextResponse(JSON.stringify({ received: true }), { status: 200 });

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