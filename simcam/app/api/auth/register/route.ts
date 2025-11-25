import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { connectMongoDB } from '@/app/lib/mongodb/mongodb';
import User from "@/app/lib/mongodb/models/user";
import { sendVerificationEmail } from "@/app/lib/nodemailer/mail";
import { v4 as uuidv4 } from 'uuid';

import { TEST_MODEL } from "@/app/lib/mongodb/testModel";

const FREE_PLAN_CREDITS = parseInt(process.env.FREE_PLAN_CREDITS!);

export const POST = async (request: NextRequest) => {
    try {
        console.log("Received registration request");

        // Parse request body
        const body = await request.json();
        console.log("Parsed register request body:", body);
        const { name, password, email, refCode, fingerprintId, returnTo } = body;

        let initialCredits = FREE_PLAN_CREDITS;
        let refCreditsCount = 0;

        // Connect to MongoDB
        console.log("Connecting to MongoDB...");
        await connectMongoDB();
        console.log("Connected to MongoDB");

        const lowCaseEmail = email.toLowerCase();
        console.log("Normalized email to lowercase:", lowCaseEmail);

        // Parallelize email uniqueness and referrer checks
        const [existingUser, referrer] = await Promise.all([
            User.findOne({ email: lowCaseEmail }),
            refCode ? User.findOne({ referralCode: refCode }) : null
        ]);

        if (existingUser) {
            console.log("User already exists with email:", lowCaseEmail);
            return new Response(JSON.stringify({ message: 'Email already in use' }), {
                status: 409,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Handle fingerprint ID check
        if (fingerprintId) {
            const existingFingerprintUser = await User.findOne({ fingerprintId });
            if (existingFingerprintUser) {
                console.log("Multiple accounts detected with fingerprintId:", fingerprintId);
                return new Response(JSON.stringify({ message: 'Multi-accounting is not welcome' }), {
                    status: 409,
                    headers: { 'Content-Type': 'application/json' }
                });
            }
        }

        // Hash the password
        console.log("Hashing password...");
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log("Password hashed");

        // Generate email token
        const emailToken = uuidv4();

        const referrerId = referrer ? referrer._id : null;
        const referredByTime = referrer ? new Date() : null;

        // Create a new user
        const newUser = new User({
            name,
            email: lowCaseEmail,
            emailVerified: false,
            emailToken,
            password: hashedPassword,
            authMethod: "email",
            subscription: "Free",
            credits: refCode ? initialCredits + refCreditsCount : initialCredits,
            referredBy: referrerId,
            referredByTime,
            registrationGtmSent: false,
            fingerprintId,
            isNewUser: false,
        });

        // newUser.modelMap.push(TEST_MODEL);

        // Set subscription end date
        const createdAt = newUser.createdAt || new Date();
        const subscriptionEndDate = new Date(createdAt);
        subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 1);
        newUser.subscriptionEndDate = subscriptionEndDate;

        console.log("Saving new user to database...");
        await newUser.save();
        console.log("New user saved:", newUser);

        // Send verification email
        console.log("Sending verification email...");
        try {
            await sendVerificationEmail(email, emailToken, returnTo);
            console.log("Verification email sent to:", email);
        } catch (err) {
            if (err instanceof Error) {
                console.error("Error sending verification email:", err.message);
            } else {
                console.error("Unexpected error sending verification email:", JSON.stringify(err));
            }
        }

        return new Response(JSON.stringify({ message: 'User has been created and verification email sent.' }), {
            status: 201,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (err: any) {
        console.error("Error during user registration:", err.message);
        return new Response(JSON.stringify({ message: err.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
};