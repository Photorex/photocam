import { NextResponse, NextRequest } from "next/server";
import { generateRandomCustomerAndAddress } from "@/app/lib/data/random";

const PAYMENT_API_URL = process.env.PAYMENT_API_URL!;
const AUTH_TOKEN = process.env.AUTH_TOKEN!;
const NEXTAUTH_URL = process.env.NEXTAUTH_URL!;
const WEBHOOK_PAYMENT_URL = process.env.WEBHOOK_PAYMENT_URL!;

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const {
            referenceId,
            paymentMethod,
            amount,
            currency,
            annual,
            ftd,
        } = body;

        const { customer, billingAddress } = generateRandomCustomerAndAddress();

        // const subscription = {
        //     retryStrategy: {
        //         frequency: 1,
        //         frequencyUnit: 'MONTH',
        //         numberOfCycles: 12
        //         // amountAdjustments: [0]
        //     },
        //     description: 'Subscription to service',
        //     amount: amount,
        //     frequency: annual ? 12 : 1,
        //     frequencyUnit: 'MONTH'
        // };

        const routingGroup = ftd ? 'trusted' : 'ftd';

        const apiPayload = {
            paymentType: "DEPOSIT",
            customer: {
                referenceId: customer.referenceId,
                citizenshipCountryCode: customer.citizenshipCountryCode,
                firstName: customer.firstName,
                lastName: customer.lastName,
                dateOfBirth: customer.dateOfBirth,
                locale: customer.locale,
                email: customer.email,
                routingGroup,
            },
            billingAddress: {
                addressLine1: billingAddress.addressLine1,
                addressLine2: billingAddress.addressLine2,
                city: billingAddress.city,
                countryCode: billingAddress.countryCode,
                postalCode: billingAddress.postalCode,
            },
            // subscription,
            referenceId,
            paymentMethodCode: paymentMethod,
            paymentMethod,
            amount,
            currency,
            // returnUrl: `${NEXTAUTH_URL}/payment/{referenceId}/{id}/{state}`,
            returnUrl: `${NEXTAUTH_URL}/photoshoot`,
            webhookUrl: `${WEBHOOK_PAYMENT_URL}/{referenceId}/{id}`,
        };

        // const headers = req.headers;
        // console.log('headers', headers)
        const userCountry = req.headers.get('cf-ipcountry');
        console.log('User Country:', userCountry);

        console.log('Submitting PAYTECH body: ', apiPayload);

        const options = {
            method: 'POST',
            headers: {
                accept: 'application/json',
                'content-type': 'application/json',
                authorization: AUTH_TOKEN
            },
            body: JSON.stringify(apiPayload)
        };

        const response = await fetch(PAYMENT_API_URL, options);

        if (!response.ok) {
            const responseBody = await response.text(); // Attempt to parse the response body for more details
            console.error('Server error response body:', responseBody);
            throw new Error(`Server responded with status: ${response.status} - ${responseBody}`);
        }

        const jsonResponse = await response.json();
        console.log('PAYTECH response: ', jsonResponse)

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