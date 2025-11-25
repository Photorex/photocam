import { NextResponse, NextRequest } from "next/server";
import { generateRandomCustomerAndAddress } from "@/app/lib/data/random";
import { getCountryNameByCode } from "@/app/lib/data/countries";
import crypto from "crypto";
import { serialize } from "php-serialize";

const PAYBLIS_MERCHANT_KEY = process.env.PAYBLIS_MERCHANT_KEY!;
const PAYBLIS_SECRET_KEY = process.env.PAYBLIS_SECRET_KEY!;
const PAYBLIS_API_URL = process.env.PAYBLIS_API_URL!;
const NEXTAUTH_URL = process.env.NEXTAUTH_URL!;
const NEXT_PUBLIC_PAYBLIS_URL = process.env.NEXT_PUBLIC_PAYBLIS_URL!;

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const {
            referenceId,
            amount,
            currency,
            annual,
            ftd,
            userEmail,
        } = body;

        // Get user IP and country code (cf-ipcountry returns ISO codes like "FR", "US", "DE")
        const userIP = req.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';
        console.log('User IP:', userIP);
        const userCountryCode = req.headers.get('cf-ipcountry') || 'US';
        console.log('User Country Code:', userCountryCode);

        // Convert country code to full name for Payblis API
        const countryName = getCountryNameByCode(userCountryCode);
        console.log('Country Name:', countryName);

        // Generate only random name and surname, not email
        const { customer } = generateRandomCustomerAndAddress();

        // Convert amount to EUR (Payblis uses EUR)
        const amountInEur = currency === 'USD' ? (amount * 0.90).toFixed(2) : amount.toFixed(2);

        // Create the payment parameters (BEFORE signature)
        const paymentParams = {
            MerchantKey: PAYBLIS_MERCHANT_KEY,
            amount: amountInEur,
            product_name: 'Simcam Credits',
            RefOrder: referenceId,
            Customer_Email: userEmail, // Use session email
            Customer_Name: customer.lastName, // Random surname
            Customer_FirstName: customer.firstName, // Random name
            country: countryName, // Full country name
            userIP: userIP,
            lang: 'en',
            store_name: 'Simcam',
            urlOK: `${NEXTAUTH_URL}/photoshoot`,
            urlKO: `${NEXTAUTH_URL}/photoshoot`,
            ipnURL: `${NEXT_PUBLIC_PAYBLIS_URL}/api/payment/payblis/webhook/${referenceId}`,
        };

        // Clone data for signature calculation
        const varsToSign = { ...paymentParams };

        // Create HMAC signature using JSON.stringify (as shown in PHP example)
        const signature = crypto.createHmac('sha256', PAYBLIS_SECRET_KEY).update(JSON.stringify(varsToSign)).digest('hex');

        // Add signature AFTER calculation
        const finalParams = {
            ...paymentParams,
            signature: signature,
        };

        console.log('Submitting PAYBLIS payment:', {
            referenceId,
            amount: amountInEur,
            currency: 'EUR',
            userCountryCode,
            countryName,
            userIP,
            userEmail
        });

        // Use proper PHP serialization
        const serializedData = serialize(finalParams);
        const encoded = Buffer.from(serializedData).toString('base64');

        // Create the payment URL
        const paymentUrl = `${PAYBLIS_API_URL}?token=${encoded}`;

        console.log('Payment URL:', paymentUrl);

        // Return the payment URL for redirect (similar to Paytech)
        return NextResponse.json({
            success: true,
            result: {
                redirectUrl: paymentUrl,
                referenceId: referenceId,
                amount: amountInEur,
                currency: 'EUR'
            }
        }, { status: 200 });

    } catch (error: unknown) {
        console.error('Error creating Payblis payment:', error);

        let errorMessage = 'An error occurred';
        if (error instanceof Error) {
            errorMessage = error.message;
        } else if (typeof error === 'object' && error !== null && 'message' in error) {
            errorMessage = (error as { message: string }).message;
        }

        return NextResponse.json({
            success: false,
            message: 'Error creating payment',
            error: errorMessage
        }, { status: 500 });
    }
}
