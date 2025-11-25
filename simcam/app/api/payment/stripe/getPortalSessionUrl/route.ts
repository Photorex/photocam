import { NextResponse, NextRequest } from "next/server";
import Stripe from "stripe";
import { connectMongoDB } from '@/app/lib/mongodb/mongodb';
import User from '@/app/lib/mongodb/models/user';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY!;
const STRIPE_PORTAL_RETURN_URL = process.env.BASE_URL!;

const stripe = new Stripe(STRIPE_SECRET_KEY);

export async function POST(req: NextRequest) {
    try {
        const { userId } = await req.json();

        if (!userId) {
            return NextResponse.json({ message: 'User ID is required' }, { status: 400 });
        }

        await connectMongoDB();
        const user = await User.findById(userId);

        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        const stripeCustomerId = user.stripeCustomerId;
        if (!stripeCustomerId) {
            return NextResponse.json({ message: 'User does not have a Stripe customer ID' }, { status: 400 });
        }

        const session = await stripe.billingPortal.sessions.create({
            customer: stripeCustomerId,
            return_url: STRIPE_PORTAL_RETURN_URL, // Ensure you have this environment variable set
        });

        console.log('Stripe billing portal session:', session);

        return NextResponse.json({ url: session.url }, { status: 200 });
    } catch (error) {
        console.error('Error creating Stripe billing portal session:', error);

        let errorMessage = 'An error occurred';
        if (error instanceof Error) {
            errorMessage = error.message;
        } else if (typeof error === 'object' && error !== null && 'message' in error) {
            errorMessage = (error as { message: string }).message;
        }

        return NextResponse.json({ message: 'Error creating Stripe billing portal session', error: errorMessage }, { status: 500 });
    }
}