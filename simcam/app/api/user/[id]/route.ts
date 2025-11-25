import { NextResponse, NextRequest } from "next/server";
import { connectMongoDB } from '@/app/lib/mongodb/mongodb';
import User from '@/app/lib/mongodb/models/user';
import Payment from "@/app/lib/mongodb/models/payment";
import Stripe from 'stripe';

import mongoose from 'mongoose';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY!;
const stripe = new Stripe(STRIPE_SECRET_KEY);

const NEXT_PUBLIC_FREE_PLAN_CREDITS = parseInt(process.env.NEXT_PUBLIC_FREE_PLAN_CREDITS!);
const NEXT_PUBLIC_MUSE_PLAN_CREDITS= parseInt(process.env.NEXT_PUBLIC_MUSE_PLAN_CREDITS!);
const NEXT_PUBLIC_GLOW_PLAN_CREDITS= parseInt(process.env.NEXT_PUBLIC_GLOW_PLAN_CREDITS!);
const NEXT_PUBLIC_STUDIO_PLAN_CREDITS= parseInt(process.env.NEXT_PUBLIC_STUDIO_PLAN_CREDITS!);
const NEXT_PUBLIC_ICON_PLAN_CREDITS= parseInt(process.env.NEXT_PUBLIC_ICON_PLAN_CREDITS!);

const PROMOTION_TOKENS = parseInt(process.env.PROMOTION_TOKENS!);

interface Params {
    id: string;
}

async function createNewPayment(user: any, payment: any) {
    try {
        const existingPayment = await Payment.findOne({
            userId: user._id,
            stripeSubscriptionId: user.stripeSubscriptionId,
            createdAt: { 
                $gte: new Date(user.subscriptionEndDate).setMonth(new Date(user.subscriptionEndDate).getMonth() - 1),
                $lte: user.subscriptionEndDate
            },
        });        
        if (existingPayment) {
            console.log("Payment already exists for this subscription cycle.");
            return;
        }
        
        const newPayment = new Payment({
            ...payment.toObject(),
            _id: undefined,  // New payment, no need to keep the old ID
            createdAt: undefined,  // New createdAt
            updatedAt: undefined,  // New updatedAt
            endDate: user.subscriptionEndDate  // New subscription end date
        });
        await newPayment.save();
    } catch (error) {
        console.error('Error creating new payment:', error);
    }
}

export async function GET(req: NextRequest, context: { params: Promise<Params> }) {
    const { id: userId } = await context.params;
    
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        return NextResponse.json({ message: 'Invalid user ID' }, { status: 400 });
    }

    const getCreditsBySubscription = (subscription: string): number => {
        switch (subscription) {
          case "Muse":
            return NEXT_PUBLIC_MUSE_PLAN_CREDITS;
          case "Glow":
            return NEXT_PUBLIC_GLOW_PLAN_CREDITS;
          case "Studio":
            return NEXT_PUBLIC_STUDIO_PLAN_CREDITS;
        case "Icon":
            return NEXT_PUBLIC_ICON_PLAN_CREDITS;
          default:
            return 0;
        }
    };

    try {

        if (!userId) {
            return NextResponse.json({ message: 'User ID is required' }, { status: 400 });
        }

        await connectMongoDB();
        const user = await User.findById(userId);

        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        const currentDate = new Date();

        // Process promotion_tokens cookie
        const promotionTokensCookie = req.cookies.get('promotion_tokens');

        // console.log('promotionTokensCookie', promotionTokensCookie)

        if (promotionTokensCookie) {
            const promotionTokensValue = PROMOTION_TOKENS;

            if (!user.promotionTokensReceived) {
                // Add credits and update flag
                user.promotionTokensReceived = true;
                await user.save();
                user.credits += promotionTokensValue;
                await user.save();
            }

            // Clear the promotion_tokens cookie
            const response = NextResponse.json({ user }, { status: 200 });
            response.cookies.set('promotion_tokens', '', { maxAge: 0, path: '/' });
            return response;
        }


        // user.stripe_payment_validation_in_process = true;
        // await user.save();

        // if (user.stripeSubscription) {
        //     const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId!);

        //     // Find the payment document by its ID
        //     const payment = await Payment.findById(user.subscriptionId).exec();

        //     if (!payment) {
        //         await user.save();
        //         return NextResponse.json({ message: 'Payment not found' }, { status: 404 });
        //     }

        //     const annualPayment = payment.annual;
        //     const updatedAtPayment = new Date(payment.updatedAt);

        //     if (subscription.status === 'active') {
        //         if (annualPayment) {
        //             if (!user.subscriptionEndDate || currentDate > user.subscriptionEndDate) {
        //                 let newEndDate = new Date(updatedAtPayment);
        //                 newEndDate.setFullYear(newEndDate.getFullYear() + 1);
        //                 user.subscriptionEndDate = newEndDate;
        //                 user.subscriptionGtmSent = false;
        //                 await user.save();

        //                 try {
        //                     await createNewPayment(user, payment);
        //                 } catch (error) {
        //                     console.error('Error in createNewPayment but continuing execution logic:', error);
        //                 }
        //             }
                    
        //             // Check if a full month (30 days) has passed since the last update
        //             if (currentDate < user.subscriptionEndDate && (currentDate.getTime() - updatedAtPayment.getTime()) >= (30 * 24 * 60 * 60 * 1000)) {
        //                 user.credits = getCreditsBySubscription(user.subscription);
        //                 await user.save();
        //             }
        //         } else {
        //             if (!user.subscriptionEndDate || currentDate > user.subscriptionEndDate) {
        //                 let newEndDate = new Date(updatedAtPayment);
        //                 newEndDate.setMonth(newEndDate.getMonth() + 1);
        //                 user.subscriptionEndDate = newEndDate;
        //                 user.subscriptionGtmSent = false;
        //                 await user.save();

        //                 try {
        //                     await createNewPayment(user, payment);
        //                 } catch (error) {
        //                     console.error('Error in createNewPayment but continuing execution logic:', error);
        //                 }
        //             }

        //             if (currentDate > user.subscriptionEndDate) {
        //                 user.credits = getCreditsBySubscription(user.subscription);
        //                 await user.save();
        //             }
        //         }
        //     } else {
        //         // Might be paid later due to card inavailability
        //         // user.subscriptionId = null;
                
        //         user.subscription = "Free"
        //         user.subscriptionGtmSent = false;
        //         await user.save();
        //     }
        // } else {
        //     // No active Stripe subscription
        //     const userCreatedAt = new Date(user.createdAt);
        //     const userSubscriptionEndDate = user.subscriptionEndDate ? new Date(user.subscriptionEndDate) : null;

        //     if (user.subscription === "Free") {
        //         if (!user.subscriptionEndDate) {
        //             let subscriptionEndDate = new Date(user.createdAt);
                    
        //             // Increment subscriptionEndDate by one month until it is greater than the current date
        //             while (user.subscriptionEndDate <= currentDate) {
        //                 subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 1);
        //             }
                    
        //             user.subscriptionEndDate = subscriptionEndDate;
        //             await user.save();
        //         }

        //         if (currentDate > user.subscriptionEndDate) {
        //             user.credits += NEXT_PUBLIC_FREE_PLAN_CREDITS;
        //             let newEndDate = new Date(user.subscriptionEndDate);
        //             newEndDate.setMonth(newEndDate.getMonth() + 1);
        //             user.subscriptionEndDate = newEndDate;
        //             await user.save();
        //         }
        //     } else if (user.subscription !== "Free" && userSubscriptionEndDate && currentDate > userSubscriptionEndDate) {
        //         if ((currentDate.getTime() - userSubscriptionEndDate.getTime()) >= (30 * 24 * 60 * 60 * 1000)) {
        //             user.credits += 10;
        //             user.subscription = "Free";
        //             user.subscriptionId = null;
        //             user.subscriptionEndDate = new Date(currentDate);
        //             user.subscriptionEndDate.setMonth(user.subscriptionEndDate.getMonth() + 1);
        //             await user.save();
        //         }
        //     } else if (user.subscription === "Basic" || user.subscription === "Standart" || user.subscription === "Premium") {
        //         // Non-stripe annual subscription logic
        //         const payment = await Payment.findById(user.subscriptionId).exec();
        //         if (payment && payment.annual) {
        //             let lastUpdated = new Date(payment.updatedAt);

        //             while (lastUpdated < currentDate && lastUpdated < user.subscriptionEndDate) {
        //                 lastUpdated.setMonth(lastUpdated.getMonth() + 1);
        //                 // console.log("lastUpdated", lastUpdated)

        //                 if (lastUpdated < currentDate && lastUpdated < user.subscriptionEndDate) {
        //                     // console.log("lastUpdated | user.subscriptionEndDate", lastUpdated, user.subscriptionEndDate)
        //                     user.credits += getCreditsBySubscription(user.subscription);
        //                     payment.updatedAt = lastUpdated;
        //                     await payment.save();
        //                 }
        //             }
        //             await user.save();
        //         }
        //     }
        // }

        // After the operation, set stripe_payment_validation_in_process to false
        // user.stripe_payment_validation_in_process = false;
        // await user.save();

        const userCreatedAt = new Date(user.createdAt);
        const userSubscriptionEndDate = user.subscriptionEndDate ? new Date(user.subscriptionEndDate) : null;

        if (user.subscription === "Free") {
            if (!user.subscriptionEndDate) {
                let subscriptionEndDate = new Date(user.createdAt);
                    
                // Increment subscriptionEndDate by one month until it is greater than the current date
                while (user.subscriptionEndDate <= currentDate) {
                    subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 1);
                }
                    
                user.subscriptionEndDate = subscriptionEndDate;
                await user.save();
            }

            if (currentDate > user.subscriptionEndDate) {
                user.credits += NEXT_PUBLIC_FREE_PLAN_CREDITS;
                let newEndDate = new Date(user.subscriptionEndDate);
                newEndDate.setMonth(newEndDate.getMonth() + 1);
                user.subscriptionEndDate = newEndDate;
                await user.save();
            }
        } else if (user.subscription !== "Free" && userSubscriptionEndDate && currentDate > userSubscriptionEndDate) {
            if ((currentDate.getTime() - userSubscriptionEndDate.getTime()) >= (30 * 24 * 60 * 60 * 1000)) {
                user.credits += 10;
                user.subscription = "Free";
                user.subscriptionId = null;
                user.subscriptionEndDate = new Date(currentDate);
                user.subscriptionEndDate.setMonth(user.subscriptionEndDate.getMonth() + 1);
                await user.save();
            }
        } else if (user.subscription === "Muse" || user.subscription === "Glow" || user.subscription === "Studio" || user.subscription === "Icon") {
            // Non-stripe annual subscription logic
            const payment = await Payment.findById(user.subscriptionId).exec();
            if (payment && payment.annual) {
                let lastUpdated = new Date(payment.updatedAt);

                while (lastUpdated < currentDate && lastUpdated < user.subscriptionEndDate) {
                    lastUpdated.setMonth(lastUpdated.getMonth() + 1);
                    // console.log("lastUpdated", lastUpdated)

                    if (lastUpdated < currentDate && lastUpdated < user.subscriptionEndDate) {
                        // console.log("lastUpdated | user.subscriptionEndDate", lastUpdated, user.subscriptionEndDate)
                        user.credits += getCreditsBySubscription(user.subscription);
                        payment.updatedAt = lastUpdated;
                        await payment.save();
                    }
                }
                await user.save();
            }
        }

        return NextResponse.json({ user }, { status: 200 });
    } catch (error) {
        console.error('Error fetching user:', error);

        let errorMessage = 'An error occurred';
        if (error instanceof Error) {
            errorMessage = error.message;
        } else if (typeof error === 'object' && error !== null && 'message' in error) {
            errorMessage = (error as { message: string }).message;
        }

        return NextResponse.json({ message: 'Error fetching user', error: errorMessage }, { status: 500 });
    }
}