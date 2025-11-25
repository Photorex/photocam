import { NextResponse, NextRequest } from "next/server";
import { connectMongoDB } from "@/app/lib/mongodb/mongodb";
import Payment from "@/app/lib/mongodb/models/payment";

const PAYMENT_API_URL_CRYPTO = process.env.PAYMENT_API_URL_CRYPTO!;
const AUTH_TOKEN_CRYPTO = process.env.AUTH_TOKEN_CRYPTO!;
const NEXTAUTH_URL = process.env.NEXTAUTH_URL!;
const WEBHOOK_PAYMENT_URL_CRYPTO = process.env.WEBHOOK_PAYMENT_URL_CRYPTO!;

interface PlisioResponse {
    status: string;
    data: {
        txn_id: string;
        invoice_url: string;
    };
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const {
            referenceId,
            paymentMethod,
            amount,
            currency,
            annual,
            email,
            ftd,
        } = body;

        const queryParams = new URLSearchParams({
            source_currency: "USD", // Assuming the source currency is USD, update if needed
            source_amount: amount,
            currency: currency,
            allowed_psys_cids: currency,
            order_number: referenceId,
            email: email,
            order_name: `${currency} Payment`,
            callback_url: `${WEBHOOK_PAYMENT_URL_CRYPTO}/?json=true`,
            // success_callback_url: `${NEXTAUTH_URL}/payment/crypto`,
            // fail_callback_url: `${NEXTAUTH_URL}/payment/crypto`,
            success_callback_url: `${NEXTAUTH_URL}/photoshoot`,
            fail_callback_url: `${NEXTAUTH_URL}/photoshoot`,
            api_key: AUTH_TOKEN_CRYPTO,
            // success_invoice_url: `${NEXTAUTH_URL}/payment/crypto`,
            success_invoice_url: `${NEXTAUTH_URL}/photoshoot`,
        });

        console.log('Submitting PLISIO URL: ', `${PAYMENT_API_URL_CRYPTO}?${queryParams.toString()}`);

        const submitPaymentResponse = await fetch(`${PAYMENT_API_URL_CRYPTO}?${queryParams.toString()}`, {
            method: 'GET',
        });

        if (!submitPaymentResponse.ok) {
            const responseBody = await submitPaymentResponse.text();
            console.error('Server error response body:', responseBody);
            throw new Error(`Server responded with status: ${submitPaymentResponse.status} - ${responseBody}`);
        }

        const jsonResponse: any = await submitPaymentResponse.json();
        console.log('PLISIO response: ', jsonResponse);

        // Extract txn_id from the response
        const txnId = jsonResponse.data.txn_id;
        console.log('txnId', txnId)

        // Connect to MongoDB and update the payment record
        await connectMongoDB();
        const payment = await Payment.findOne({ _id: referenceId });

        if (!payment) {
            throw new Error(`Payment with referenceId ${referenceId} not found.`);
        }

        payment.paymentId = txnId;
        await payment.save();

        return NextResponse.json(jsonResponse, { status: 200 });

    } catch (error: unknown) {
        console.error('Error submitting payment:', error);

        let errorMessage = 'An error occurred';
        if (error instanceof Error) {
            errorMessage = error.message;
        } else if (typeof error === 'object' && error !== null && 'message' in error) {
            errorMessage = (error as { message: string }).message;
        }

        return NextResponse.json({
            message: 'Error submitting payment',
            error: errorMessage
        }, { status: 500 });
    }
}