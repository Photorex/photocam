"use client";

import React, { useEffect, useState, ChangeEvent } from "react";

import { useRouter } from 'next/navigation'

import { signIn, signOut, useSession, getSession } from 'next-auth/react';

import styles from './page.module.css';

import { useDisclosure, Button, Input, Switch, Spinner } from "@heroui/react";

import { ToastContainer, toast } from 'react-toastify';

import 'react-toastify/dist/ReactToastify.css';

interface Resolution {
    [key: string]: string;
}

type SubscriptionType = 'Free' | 'Muse' | 'Glow' | 'Studio' | 'Icon';

const NEXT_PUBLIC_FREE_PLAN_CREDITS= parseInt(process.env.NEXT_PUBLIC_FREE_PLAN_CREDITS!);
const NEXT_PUBLIC_MUSE_PLAN_CREDITS= parseInt(process.env.NEXT_PUBLIC_MUSE_PLAN_CREDITS!);
const NEXT_PUBLIC_GLOW_PLAN_CREDITS= parseInt(process.env.NEXT_PUBLIC_GLOW_PLAN_CREDITS!);
const NEXT_PUBLIC_STUDIO_PLAN_CREDITS= parseInt(process.env.NEXT_PUBLIC_STUDIO_PLAN_CREDITS!);
const NEXT_PUBLIC_ICON_PLAN_CREDITS= parseInt(process.env.NEXT_PUBLIC_ICON_PLAN_CREDITS!);

export default function Settings() {

    const { data: session, update, status  } = useSession();

	const router = useRouter();

    useEffect(() => {
		if (status === "unauthenticated") {
		//   console.log("No user session");
		  router.push('/');
		}
	}, [status, router]);

    const creditsMapping = {
        Free: NEXT_PUBLIC_FREE_PLAN_CREDITS,
        Muse: NEXT_PUBLIC_MUSE_PLAN_CREDITS,
        Glow: NEXT_PUBLIC_GLOW_PLAN_CREDITS,
        Studio: NEXT_PUBLIC_STUDIO_PLAN_CREDITS,
        Icon: NEXT_PUBLIC_ICON_PLAN_CREDITS,
    };

    const [isOnboardingSelected, setIsOnboardingSelected] = useState(true);
    const [isCreditUsageSelected, setIsCreditUsageSelected] = useState(true);
    const [isModelTrainingSelected, setIsModelTrainingSelected] = useState(true);
    const [userName, setUserName] = useState(session?.user?.name || '');
    const [renewalDate, setRenewalDate] = useState<string | null>(null);

    useEffect(() => {
        const fetchRenewalDate = async () => {
          try {
            const date = await getRenewalDate();
            setRenewalDate(date);
          } catch (error) {
            console.error("Failed to fetch renewal date", error);
          }
        };
    
        fetchRenewalDate();
      }, [session]);

    const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
        // console.log(e.target.value)
        setUserName(e.target.value);
    };

    const handleCancel = () => {
        setUserName(session?.user?.name || '');
    };

    const handleUpdateProfile = async () => {
        // console.log("session", session);
        try {
            const response = await fetch('/api/user/update', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name: userName, email: session?.user?.email }),
            });
    
            const data = await response.json();
            if (response.ok) {
                toast.success(data.message);
                await update({ user: { ...session?.user, name: userName } });
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            if (error instanceof Error) {
                toast.error(`Update failed: ${error.message}`);
            } else {
                toast.error('Update failed due to an unknown error');
            }
        }
    };

    const handleDeleteAccount = async () => {
        try {
            // console.log('session?.user?.email', session?.user?.email)
            const response = await fetch('/api/user/delete', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: session?.user?.email }),
            });
    
            const data = await response.json();
            // console.log('response', data);
            if (response.ok) {
                toast.success(data.message);
                // Sign out the user after successful deletion
                signOut({ callbackUrl: '/' });
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            if (error instanceof Error) {
                toast.error(`Deletion failed: ${error.message}`);
            } else {
                toast.error('Deletion failed due to an unknown error');
            }
        }
    };

    useEffect(() => {
        if (session?.user?.name) {
            setUserName(session.user.name);
        }
    }, [session?.user?.name]);

    const userSubscription: SubscriptionType = session?.user?.subscription as SubscriptionType || 'Free';

    // console.log('createdAt', session?.user?.createdAt);
    // Calculate the next renewal date
    const getRenewalDate = async () => {
        if (!session?.user?.id) return "Information Unavailable";
      
        try {
          // Fetch user details
          const userResponse = await fetch(`/api/user/${session.user.id}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });
      
          const userData = await userResponse.json();
          if (!userResponse.ok) {
            throw new Error("Failed to fetch user data");
          }
      
          const { subscriptionId, subscriptionEndDate, createdAt } = userData.user;
          const today = new Date();
      
          if (!subscriptionId) {
            // Original logic when subscriptionId is null
            const createdDate = new Date(createdAt);
            let renewalDate = new Date(createdDate);
      
            renewalDate.setMonth(
              createdDate.getMonth() + (today.getMonth() - createdDate.getMonth() + (today.getDate() >= createdDate.getDate() ? 1 : 0))
            );
      
            return renewalDate.toLocaleString('en-US', {
              month: 'long',
              day: 'numeric',
              hour: 'numeric',
              minute: 'numeric',
              hour12: true,
            });
          }
      
          // Fetch payment details
          const paymentResponse = await fetch(`/api/payment/get`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ paymentId: subscriptionId }),
          });
      
          const paymentData = await paymentResponse.json();
          if (!paymentResponse.ok) {
            throw new Error("Failed to fetch payment data");
          }
      
          const { annual: annualPayment, updatedAt: updatedAtPayment } = paymentData.payment;
          let renewalDate;
      
          if (annualPayment) {
            // Annual payment logic
            const startingDate = new Date(updatedAtPayment);
            renewalDate = new Date(startingDate);
      
            // Calculate the monthly end date
            renewalDate.setMonth(startingDate.getMonth() + (today.getMonth() - startingDate.getMonth()));
      
            // Adjust to next month if the renewal date is in the past
            if (today > renewalDate) {
              renewalDate.setMonth(renewalDate.getMonth() + 1);
            }
      
            // Check if today is greater than subscriptionEndDate and adjust accordingly
            if (today > new Date(subscriptionEndDate)) {
              while (renewalDate <= today) {
                renewalDate.setMonth(renewalDate.getMonth() + 1);
              }
            }
          } else {
            // Non-annual payment logic
            renewalDate = new Date(subscriptionEndDate);
            while (renewalDate <= today) {
              renewalDate.setMonth(renewalDate.getMonth() + 1);
            }
          }
      
          // Format the date as "26 April 3:03 pm"
          return renewalDate.toLocaleString('en-US', {
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            hour12: true,
          });
        } catch (error) {
          console.error(error);
          return "N/A";
        }
      };

    const handleNavigation = (path: string) => {
        router.push(path);
    };


	const [selectionMode, setSelectionMode] = useState(false);

	const filters = [
		{label: "Newest first", value: "Newest first", description: ""},
		{label: "Oldest first", value: "Oldest first", description: ""},
	]

	const toggleSelectionMode = () => {
        setSelectionMode(!selectionMode);
    };
    
    const now = new Date();
    const formattedDate = now.toLocaleString('en-US', {
		month: 'short',
		day: 'numeric',
		year: 'numeric',
		hour: 'numeric',
		minute: 'numeric',
		hour12: true,
	});


    const fetchUpdatedUserData = async () => {
        try {
            const response = await fetch(`/api/user/${session?.user?.id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
    
            const data = await response.json();
            if (response.ok) {
                const { stripeSubscription, stripeSubscriptionId, stripeCustomerId } = data.user;
                return { stripeSubscription, stripeSubscriptionId, stripeCustomerId };
            } else {
                console.error('Failed to fetch updated user data:', data.message);
                return null;
            }
        } catch (error) {
            console.error('Error fetching updated user data:', error);
            return null;
        }
    };

const fetchSubscriptionSessionIfStripe = async () => {
    const userData = await fetchUpdatedUserData();
    if (!userData) {
        toast.error('Failed to fetch user data');
        return;
    }

    const { stripeSubscription, stripeSubscriptionId, stripeCustomerId } = userData;

    if (!stripeSubscription) {
        toast.info('You will not be automatically charged next month.');
        return;
    }

    try {
        let safariWindow = window.open();
        safariWindow!.document?.write('<html><head><title>Loading...</title></head><body><p></p></body></html>');

        const response = await fetch(`/api/payment/stripe/getPortalSessionUrl`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ userId: session?.user?.id }) // Adjust the user ID as needed
        });

        const data = await response.json();

        if (!response.ok) {
            toast.error('Failed to get Stripe billing portal session URL');
            console.error('Failed to get Stripe billing portal session URL 1:', data.message);
        }

        let paymentUrl = data.url;

        safariWindow!.location.href = paymentUrl;
    } catch (error) {
        console.error('Error getting Stripe billing portal session URL 2:', error);
        toast.error('Failed to get Stripe billing portal session URL');
    }
};


    useEffect(() => {
        // Check if the user is not logged in and if the session is fully loaded
        if (status === "unauthenticated") {
            router.replace('/');
        }
    }, [status, router]);

    if (status === "loading") {
        return (
            <div className={`${styles['settings_loading']}`}>
                <Spinner />
            </div>
        )
    }

	return (
		<>
        <ToastContainer
			position="top-right"
			autoClose={3000}
			hideProgressBar={false}
			newestOnTop={false}
			closeOnClick
			rtl={false}
			pauseOnFocusLoss
			draggable
			pauseOnHover
			theme="light"
		/>
		<div className={styles.pageWrapper}>
            <div className={styles.container}>
                <div className={styles.hero_outer}>
                    <div className={styles.hero}>
                        <h1 className={styles.h3}>
                            Settings
                        </h1>
                        <div className={styles.p3}>
                                Here you can manage your account information.
                        </div>
                    </div>
                    <div className={styles.settings_divider}>
                        <div className={styles.settings_divider_line}>
                        </div>
                    </div>
                    <div>
                        <h2 className={styles.h3}>
                            Billing
                        </h2>
                        <p className={styles.p3}>
                            You are currently on a <b>{session?.user?.subscription || 'Free'} plan</b>. That means that you get free {creditsMapping[userSubscription]} image credits every month. Your monthly credits amount resets on <b>{renewalDate || 'calculating...'}</b>.
                        </p>
                        <p className={styles.p3}>
                            Right now, you have <b>{session?.user?.credits || 0} credits</b> to use.
                        </p>
                        <br/>
                        <div className={styles.settings_buttons_wrapper}>
                            {/* <Button
                                size="sm"
                                onClick={() => handleNavigation('/pricing')}
                            >
                                Upgrade your plan
                            </Button> */}

                            <Button
                                size="sm"
                                onClick={() => {
                                    // fetchSubscriptionSessionIfStripe();
                                    console.log('Cancel subscription');
                                }}
                            >
                                Cancel subscription
                            </Button>

                            {/* <Button
                                size="sm"
                                disabled={true}
                                onClick={() => handleNavigation('/pricing')}
                            >
                                Manage your billing info
                            </Button> */}

                            <Button
                                size="sm"
                                onClick={() => handleNavigation('/pricing')}
                            >
                                Purchase more credits
                            </Button>
                        </div>
                    </div>
                    <div className={styles.settings_divider}>
                        <div className={styles.settings_divider_line}>
                        </div>
                    </div>
                    <div className={styles.hero_buttons}>
                        <h1 className={styles.h3}>
                            Notifications
                        </h1>
                        <div className={styles.p3}>
                            Choose your email preferences
                        </div>
                        <div className={styles.gallery_button_group_outer}>
                            <div className={styles.gallery_button_group}>
                                <h1 className={styles.h4}>
                                    Onboarding
                                </h1>
                                <div className={styles.p3}>
                                    Tips, tutorials, and other onboarding material.
                                </div>
                            </div>
                            <div className={styles.gallery_button_switch}>
                                <Switch
                                    color="secondary"
                                    isSelected={isOnboardingSelected}
                                    onValueChange={setIsOnboardingSelected}
                                />
                            </div>
                        </div>
                        <div className={styles.gallery_button_group_outer}>
                            <div className={styles.gallery_button_group}>
                                <h1 className={styles.h4}>
                                    Credits usage
                                </h1>
                                <div className={styles.p3}>
                                    Alerts on credits usage and low image credits reminders.
                                </div>
                            </div>
                            <div className={styles.gallery_button_switch}>
                                <Switch
                                    color="secondary"
                                    isSelected={isCreditUsageSelected}
                                    onValueChange={setIsCreditUsageSelected}
                                />
                            </div>
                        </div>
                        <div className={styles.gallery_button_group_outer}>
                            <div className={styles.gallery_button_group}>
                                <h1 className={styles.h4}>
                                    Model training
                                </h1>
                                <div className={styles.p3}>
                                    Notifications about DreamBooth models status.
                                </div>
                            </div>
                            <div className={styles.gallery_button_switch}>
                                <Switch
                                    color="secondary"
                                    isSelected={isModelTrainingSelected}
                                    onValueChange={setIsModelTrainingSelected}
                                />
                            </div>
                        </div>
                    </div>
                    <div className={styles.settings_divider}>
                        <div className={styles.settings_divider_line}>
                        </div>
                    </div>
                    <div className={styles.input_hero}>
                        <h1 className={styles.h3}>
                            Account
                        </h1>
                        <Input
                            className={styles.acount_name_input}
                            size="md"
                            type="text"
                            placeholder="Enter your name..."
                            label="Name"
                            labelPlacement="outside"
                            onChange={handleNameChange}
                            maxLength={50}
                            value={userName}
                        />
                    </div>
                    <div className={styles.settings_input_button_group}>
                        <Button
                                size="sm"
                                color="default"
                                onClick={(e) => {
                                    e.preventDefault();
                                    handleCancel();
                                }}
                            >
                                Cancel
                        </Button>
                        <Button
                                size="sm"
                                color="secondary"
                                onClick={(e) => {
                                    e.preventDefault();
                                    handleUpdateProfile();
                                }}
                            >
                                Update Profile
                        </Button>
                    </div>
                    <div className={styles.settings_divider}>
                        <div className={styles.settings_divider_line}>
                        </div>
                    </div>
                    <div className={styles.hero}>
                        <h1 className={styles.h3}>
                            Change your password
                        </h1>
                        <div className={styles.p3}>
                            Reset your password by following <a href="/forgot-password">this link</a>.
                        </div>
                    </div>
                    {/* <div className={`${styles['settings_divider']}`}>
                        <div className={`${styles['settings_divider_line']}`}>
                        </div>
                    </div> */}
                    {/*<div className={`${styles['hero']}`}>
                        <h1 className={styles.h3}>
                            Delete your account
                        </h1>
                        <div className={styles.p3}>
                            By deleting your account, you will not be able to create new images, your subscriptions will be canceled, and all data associated with your account will be permanently lost. This action is irreversible!
                        </div>
                    </div>
                    <div className={`${styles['settings_input_button_group']}`}>
                        <Button
                                size="sm"
                                color="danger"
                                onClick={(e) => {
                                    e.preventDefault();
                                    handleDeleteAccount();
                                }}
                            >
                                Delete account
                        </Button>
                    </div>*/}
                </div>
            </div>
		</div>
		</>
	);
}