import { NextResponse, NextRequest } from "next/server";
import Stripe from "stripe";
import { connectMongoDB } from "@/app/lib/mongodb/mongodb";
import Payment from "@/app/lib/mongodb/models/payment";
import User from "@/app/lib/mongodb/models/user";

const STRIPE_REDIRECT_URL = process.env.STRIPE_REDIRECT_URL!;
const STRIPE_COUPON_ID = process.env.STRIPE_COUPON_ID!;


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

const generationPriceMap: Record<number, string> = {
    50: STRIPE_PRICE_ID_GENERATIONS_50,
    100: STRIPE_PRICE_ID_GENERATIONS_100,
    200: STRIPE_PRICE_ID_GENERATIONS_200,
    500: STRIPE_PRICE_ID_GENERATIONS_500,
    1000: STRIPE_PRICE_ID_GENERATIONS_1000,
  };

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY!;
const stripe = new Stripe(STRIPE_SECRET_KEY);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, paymentId, subscriptionType, annual, couponCode, isGenerationPurchase, generationAmount } = body;

    if (!userId || typeof annual === "undefined") {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await connectMongoDB();

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    let priceId;
    let productId;

    if (isGenerationPurchase && generationAmount) {
        priceId = generationPriceMap[generationAmount];
        productId = PRODUCT_ID_GENERATIONS;
        if (!priceId) {
          return NextResponse.json({ error: "Invalid generation amount" }, { status: 400 });
        }
    } else {
        if (!subscriptionType) {
          return NextResponse.json({ error: "Missing subscription type" }, { status: 400 });
        }
  
        if (subscriptionType === "Basic") {
          priceId = annual ? STRIPE_PRICE_ID_BASIC_ANNUAL : STRIPE_PRICE_ID_BASIC_MONTHLY;
          productId = PRODUCT_ID_BASIC;
        } else if (subscriptionType === "Standart") {
          priceId = annual ? STRIPE_PRICE_ID_STANDART_ANNUAL : STRIPE_PRICE_ID_STANDART_MONTHLY;
          productId = PRODUCT_ID_STANDART;
        } else if (subscriptionType === "Premium") {
          priceId = annual ? STRIPE_PRICE_ID_PREMIUM_ANNUAL : STRIPE_PRICE_ID_PREMIUM_MONTHLY;
          productId = PRODUCT_ID_PREMIUM;
        } else {
          return NextResponse.json({ error: "Invalid subscription type" }, { status: 400 });
        }
    }

    // Create the payment link
    const paymentLink = await stripe.paymentLinks.create({
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      after_completion: {
        type: "redirect",
        redirect: {
          url: STRIPE_REDIRECT_URL,
        },
      },
      allow_promotion_codes: true,
      metadata: {
        simcam_user_id: userId,
        simcam_payment_id: paymentId,
      },
    });

    // Add the coupon code to the payment link URL as a query parameter
    let paymentLinkUrl = paymentLink.url;
    // if (couponCode) {
    //   paymentLinkUrl += `?prefilled_promo_code=${encodeURIComponent(STRIPE_COUPON_ID)}`;
    // }

    // Save payment information
    payment.state = "PENDING";
    payment.stripeProductId = productId;
    payment.stripePriceId = priceId;
    payment.stripePaymentLink = paymentLinkUrl;
    await payment.save();

    return NextResponse.json({ url: paymentLinkUrl }, { status: 200 });
  } catch (error) {
    console.error("Error creating payment link:", error);
    let errorMessage = "An error occurred";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json(
      {
        message: "Error creating payment link",
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}