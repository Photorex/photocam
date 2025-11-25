// Next specific import
import NextAuth from "next-auth";
import { NextAuthOptions } from "next-auth";
import GoogleProvider from   "next-auth/providers/google";
import bcrypt from "bcrypt";
import User from "@/app/lib/mongodb/models/user";
import { connectMongoDB } from "@/app/lib/mongodb/mongodb";
import CredentialsProvider from "next-auth/providers/credentials";
import { cookies } from "next/headers";

import { TEST_MODEL } from "@/app/lib/mongodb/testModel";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
const FREE_PLAN_CREDITS = parseInt(process.env.FREE_PLAN_CREDITS!);

const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET!;

const handler = NextAuth({
  secret: NEXTAUTH_SECRET,
  providers: [
    GoogleProvider({
        clientId: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        httpOptions: {
          timeout: 10000,
        },
    }),
    CredentialsProvider({
        name: "Credentials",
        credentials: {
            email: { label: 'Email', type: 'email' },
            password: { label: 'Password', type: 'password' },
        },
        async authorize(credentials) {
            if (!credentials) return null;
            const { email, password } = credentials;
        
            try {
            await connectMongoDB();
            } catch (err) {
                console.error("MongoDB connection failed:", err);
                throw new Error("Failed to connect to the database.");
            }
        
            let user;
            try {
                user = await User.findOne({ email: credentials.email }).select("+password");
            } catch (err) {
                console.error("Error fetching user from the database:", err);
                throw new Error("Error retrieving user.");
            }

            if (!user) throw new Error("This email is not registered");

            try {
                const passwordMatch = await bcrypt.compare(credentials.password, user.password);
                if (!passwordMatch) throw new Error("Incorrect password");
            } catch (err) {
                console.error("Error comparing passwords:", err);
                throw new Error("Incorrect password");
            }
            
            // console.log('Authorized user:', { id: user.id, name: user.name, email: user.email, emailVerified: user.emailVerified, authMethod: user.authMethod, subscription: user.subscription, credits: user.credits });
            return { 
                id: user.id, 
                name: user.name, 
                email: user.email, 
                emailVerified: user.emailVerified, 
                authMethod: user.authMethod, 
                subscription: user.subscription, 
                credits: user.credits,
                favorites: user.favorites,
                favoriteModels: user.favoriteModels,
                createdAt: user.createdAt, 
                updatedAt: user.updatedAt,
                referralCode: user.referralCode,
                referredBy: user.referredBy,
                referrals: user.referrals,
                visitedSocials: user.visitedSocials,
                feedbackSubmitted: user.feedbackSubmitted,
                serviceModalShown: user.serviceModalShown,
                registrationGtmSent: user.registrationGtmSent,
                stripe_payment_validation_in_process: user.stripe_payment_validation_in_process,
                isNewUser: user.isNewUser,
            };
        }
    }),
  ],
  callbacks: {
    async jwt({ token, user, session, trigger }) {
      try {

        if (user) {
          // console.log('jwt',token, user)
          token.id = user.id;
          token.email = user.email;
          token.emailVerified = user.emailVerified;
          token.name = user.name;
          token.authMethod = user.authMethod;
          token.subscription = user.subscription;
          token.credits = user.credits;
          token.favorites = user.favorites;
          token.favoriteModels = user.favoriteModels;
          token.createdAt = user.createdAt;
          token.updatedAt = user.updatedAt;
          token.referralCode = user.referralCode;
          token.referredBy = user.referredBy;
          token.referrals = user.referrals;
          token.visitedSocials = user.visitedSocials;
          token.feedbackSubmitted = user.feedbackSubmitted;
          token.serviceModalShown = user.serviceModalShown;
          token.registrationGtmSent = user.registrationGtmSent;
          token.stripe_payment_validation_in_process = user.stripe_payment_validation_in_process;
          token.isNewUser = user.isNewUser;
        }
    
        if (trigger === "update" && session?.user) {
          // If anywhere in the code await update({ user: { ...session?.user, credits: deductionData.newTokenCount } }); add params below
          // console.log('token.name', token.name);
          // console.log('session.name', session.user.name);
          token.name = session.user.name;
          token.emailVerified = session.user.emailVerified;
          token.credits = session.user.credits;
          token.favorites = session.user.favorites;
          token.favoriteModels = session.user.favoriteModels;
          token.subscription = session.user.subscription;
          token.visitedSocials = session.user.visitedSocials;
          token.feedbackSubmitted = session.user.feedbackSubmitted;
          token.serviceModalShown = session.user.serviceModalShown;
          token.registrationGtmSent = session.user.registrationGtmSent;
          token.stripe_payment_validation_in_process = session.user.stripe_payment_validation_in_process;
          token.isNewUser = session.user.isNewUser;
        }

      // if (trigger === "update" && session?.user?.credits) {
      //   token.credits = session.user.credits;
      // }
    
        return token;
      
    } catch (err) {
      console.error("JWT callback error:", err);
      return token;
  }
    },
    async session({ session, token }) {
      try {
        return {
          ...session,
          user: {
            ...session.user,
            id: token.id,
            name: token.name,
            email: token.email,
            authMethod: token.authMethod,
            subscription: token.subscription,
            emailVerified: token.emailVerified,
            credits: token.credits,
            favorites: token.favorites,
            favoriteModels: token.favoriteModels,
            createdAt: token.createdAt,
            updatedAt: token.updatedAt,
            referralCode: token.referralCode,
            referredBy: token.referredBy,
            referrals: token.referrals,
            visitedSocials: token.visitedSocials,
            feedbackSubmitted: token.feedbackSubmitted,
            serviceModalShown: token.serviceModalShown,
            registrationGtmSent: token.registrationGtmSent,
            stripe_payment_validation_in_process: token.stripe_payment_validation_in_process,
            isNewUser: token.isNewUser,
          }
        };
      } catch (err) {
          console.error("Session callback error:", err);
          return session; // Return the original session object
      }

    },
    async signIn({ user, account, profile }) {
      if (account && account.provider === "google") {
        try {
          await connectMongoDB();
          
          // Get the user email from the profile
          const email = user.email;
          
          // Check if this user already existed before this login
          const existingUser = await User.findOne({ email });
          
          // Only track auth events for existing users
          if (existingUser && existingUser.createdAt) {
            // This is a returning user, not a new registration
            // Set a server-side cookie to indicate we should track auth on the client
            const allCookies = await cookies();
            allCookies.set('track_auth_google', 'true', { 
              maxAge: 60, // Short expiry
              path: '/'
            });
          }
          
          let referralCode = null;
          let refId = null;
          let initialCredits = FREE_PLAN_CREDITS;
          let refCreditsCount = 0;
          let referringUser = null;
          let referredByTime = null;
          let fingerprintId = null;

          const allCookies = await cookies();
          console.log("Cookies:", allCookies.getAll());

          const simcamRefcode = allCookies.get("simcam_refcode");
          const fingerprintIdCookie = allCookies.get("fingerprintId");

          // Log the cookie value for debugging
          // console.log("simcam_refcode Cookie:", simcamRefcode?.value);

          if (simcamRefcode?.value) {
              referralCode = simcamRefcode.value;
              referringUser = await User.findOne({ referralCode });
              if (referringUser) {
                refId = referringUser._id;
                referredByTime = new Date();
                initialCredits += refCreditsCount;
              }
          }

          if (fingerprintIdCookie?.value) {
              try {
                fingerprintId = JSON.parse(fingerprintIdCookie.value).fingerprintId;
              } catch (error) {
                console.error("Error parsing fingerprintId:", error);
              }
          }

          if (existingUser && !existingUser.fingerprintId && fingerprintId) {
              await User.findByIdAndUpdate(existingUser._id, {
                $set: { fingerprintId: fingerprintId }
              });
          }

          if (!existingUser) {
              // Create a new user
              const newUser = await User.create({
                  name: user.name,
                  email: user.email,
                  emailToken: null,
                  emailVerified: true,
                  authMethod: 'google',
                  subscription: 'Free',
                  credits: initialCredits,
                  favorites: [],
                  favoriteModels: [],
                  referredBy: refId,
                  referredByTime: referredByTime,
                  visitedSocials: [],
                  feedbackSubmitted: false,
                  serviceModalShown: false,
                  registrationGtmSent: false,
                  fingerprintId: fingerprintId,
                  stripe_payment_validation_in_process: false,
                  isNewUser: true,
              });
              
            //   newUser.modelMap.push(TEST_MODEL);

              const createdAt = newUser.createdAt;
              newUser.subscriptionEndDate = new Date(createdAt);
              newUser.subscriptionEndDate.setMonth(newUser.subscriptionEndDate.getMonth() + 1);
              await newUser.save();

              user.id = newUser._id;
              user.emailVerified = newUser.emailVerified;
              user.authMethod = newUser.authMethod;
              user.subscription = newUser.subscription;
              user.credits = newUser.credits;
              user.favorites = newUser.favorites;
              user.favoriteModels = newUser.favoriteModels;
              user.createdAt = newUser.createdAt;
              user.updatedAt = newUser.updatedAt;
              user.referralCode = newUser.referralCode;
              user.referredBy = newUser.referredBy;
              user.referrals = newUser.referrals;
              user.visitedSocials = newUser.visitedSocials;
              user.feedbackSubmitted = newUser.feedbackSubmitted;
              user.serviceModalShown = newUser.serviceModalShown;
              user.registrationGtmSent = newUser.registrationGtmSent;
              user.stripe_payment_validation_in_process = newUser.registrationGtmSent;
              user.isNewUser = newUser.isNewUser;

            if (referringUser && newUser._id) {
              await User.findByIdAndUpdate(referringUser._id, {
                $inc: { credits: refCreditsCount },
                $push: {
                  referrals: newUser._id.toString(),
                  referralsTime: referredByTime,
                },
              });
            }

          } else {

              if (!existingUser.fingerprintId && fingerprintId) {
                await User.findByIdAndUpdate(existingUser._id, { fingerprintId });
              }

              if (existingUser.isNewUser) {
                  await User.findByIdAndUpdate(existingUser._id, {
                    $set: { isNewUser: false },
                  });
              }

              user.id = existingUser._id;
              user.isNewUser = false;
          }
        } catch (err) {
          console.error("Error during Google auth:", err);
        }
      }
      return true;
    },
      // async session({ session }) {
      //     console.log('session', session);
      //   return session;
      // },
    },
  session: {
    strategy: "jwt",
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token-v2`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
    callbackUrl: {
      name: `next-auth.callback-url-v2`,
      options: {
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
    csrfToken: {
      name: `next-auth.csrf-token-v2`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    }
  },
});

export { handler as GET, handler as POST };