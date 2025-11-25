"use client";

import React, { useState, useEffect, useRef, ChangeEvent, FormEvent, useCallback } from "react";

// Next specific import
import { signIn, signOut, useSession } from "next-auth/react";

// Centralized image import

// HeroUI components import
import {Link} from "@heroui/react";
import { useRouter } from "next/navigation";
import {Avatar, AvatarGroup, AvatarIcon} from "@heroui/react";
import {Progress} from "@heroui/react";
import {
    Dropdown,
    DropdownTrigger,
    DropdownMenu,
    DropdownSection,
    DropdownItem
} from "@heroui/react";

//Next specific import
import NextLink from "next/link";

// Import styles
import styles from "./userProfile.module.css";

// Icons import
import PricingIcon from "@/public/images/icons/menu/pricing-icon.svg";
import FaqIcon from "@/public/images/icons/menu/faq-icon.svg";
import CreationsIcon from "@/public/images/icons/menu/creations-icon.svg";
import SettingsIcon from "@/public/images/icons/menu/settings-icon.svg";
import PrivacyIcon from "@/public/images/icons/menu/privacy-icon.svg";
import TermsIcon from "@/public/images/icons/menu/terms-icon.svg";
import LogOutIcon from "@/public/images/icons/menu/logout-icon.svg";
import InviteIcon from "@/public/images/icons/menu/invite-icon.svg";
import XIcon from "@/public/images/icons/socials/x-icon.svg";
import YouTubeIcon from "@/public/images/icons/socials/youtube-icon.svg";
import TikTokIcon from "@/public/images/icons/socials/tiktok-icon.svg";

import { useControlMenuContext } from "@/app/context/ControlMenuContext";

// Env vars import
const NEXT_PUBLIC_FREE_PLAN_CREDITS = parseInt(process.env.NEXT_PUBLIC_FREE_PLAN_CREDITS!);
const NEXT_PUBLIC_MUSE_PLAN_CREDITS= parseInt(process.env.NEXT_PUBLIC_MUSE_PLAN_CREDITS!);
const NEXT_PUBLIC_GLOW_PLAN_CREDITS= parseInt(process.env.NEXT_PUBLIC_GLOW_PLAN_CREDITS!);
const NEXT_PUBLIC_STUDIO_PLAN_CREDITS= parseInt(process.env.NEXT_PUBLIC_STUDIO_PLAN_CREDITS!);
const NEXT_PUBLIC_ICON_PLAN_CREDITS= parseInt(process.env.NEXT_PUBLIC_ICON_PLAN_CREDITS!);

interface UserProfileProps {
    onMenuToggle: () => void;
    showStudioLinks?: boolean;
    showDesktopLinks?: boolean;
}

export default function UserProfile({ onMenuToggle, showStudioLinks, showDesktopLinks }: UserProfileProps) {

    const handleItemClick = () => {
        onMenuToggle();
    };

    const { setStudioType } = useControlMenuContext();
    const router = useRouter();

    const { data: session, update, status  } = useSession();

    // User session related data
    const [plan, setPlan] = useState<string | null>(null);
    const [credits, setCredits] = useState<number>(0);
    const [maxPlanCredits, setMaxPlanCredits] = useState<number>(0);

    // Track wheter user profile dropdown is open
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

    // Convert fetchAndUpdateUserData to useCallback
    const fetchAndUpdateUserData = useCallback(async () => {
        if (!session?.user?.id) return;
    
        console.log('User session: ', session?.user)
        try {
            const response = await fetch(`/api/user/${session.user.id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
    
            const data = await response.json();
    
            if (response.ok) {
                await update({
                    user: {
                        ...session.user,
                        name: data.user.name,
                        email: data.user.email,
                        emailVerified: data.user.emailVerified,
                        credits: data.user.credits,
                        subscription: data.user.subscription,
                        feedbackSubmitted: data.user.feedbackSubmitted,
                        serviceModalShown: data.user.serviceModalShown,
                    },
                });
            } else {
                console.error('Failed to fetch updated user data:', data.message);
            }
        } catch (error) {
            console.error('Error fetching updated user data:', error);
        }
    }, [session?.user]);

    useEffect(() => {
        if (session?.user) {
            const userPlan = session.user.subscription ?? "No plan";
            setPlan(userPlan);
            setCredits(session.user.credits ?? 0);
    
            let maxCredits = 0;
            switch (userPlan) {
                case "Free":
                    maxCredits = NEXT_PUBLIC_FREE_PLAN_CREDITS;
                    break;
                case "Muse":
                    maxCredits = NEXT_PUBLIC_MUSE_PLAN_CREDITS;
                    break;
                case "Glow":
                    maxCredits = NEXT_PUBLIC_GLOW_PLAN_CREDITS;
                    break;
                case "Studio":
                    maxCredits = NEXT_PUBLIC_STUDIO_PLAN_CREDITS;
                    break;
                case "Icon":
                    maxCredits = NEXT_PUBLIC_ICON_PLAN_CREDITS;
                    break;
            }
            setMaxPlanCredits(maxCredits);
        }
    }, [session]);

    const creditPercentage = maxPlanCredits > 0 ? (credits / maxPlanCredits) * 100 : 0;

     // Color vars based on user credit amount for progress bar
     let percentageColor = "#ff4b4b"; // Less than 25%
     if (creditPercentage > 50) {
         percentageColor = "#14a561"; // More than 50%
    } else if (creditPercentage > 25) {
         percentageColor = "#ffa500"; // Between 25% and 50%
    }

    // Var to change first name letter to uppercase if not
    const firstNameLetter = session?.user?.name ? session.user.name[0] : 'U';

    // Directly using the handler function without conditionally calling useRouter
    const handleNavigation = (path: string) => {
        router.push(path);
    };

    // Open link in new window
    const handleLinkNavigation = (path: string) => {
		// Check if 'window' is defined (for SSR frameworks like Next.js)
		if (typeof window !== "undefined") {
			window.open(path, '_blank'); // '_blank' opens the link in a new tab
		}
	};

    useEffect(() => {
        if (session?.user?.id) {
            console.log('Session updated:', session.user);
            fetchAndUpdateUserData();
        }
    }, [session?.user?.id]);

    return (
        <>
        <div className={styles.header_user_layout}>
            <Dropdown shouldBlockScroll={false}>
                    <DropdownTrigger>
                        <div className={styles.layout_header_user} >
                            <div className={styles.layout_credits} >
                                {/* <div className={styles.layout_plan_name} >
                                    {plan ?? "Loading..."}
                                </div> */}
                                {/* <div className={styles.layout_plan_progress} >
                                    <Progress size="sm" aria-label="Loading..." value={creditPercentage} />
                                </div> */}
                                <div className={styles.layout_credits_number} >
                                {/* <span className={`text-[${percentageColor}]`}>{credits}</span>&nbsp;/&nbsp;{maxPlanCredits} */}
                                <span className={`text-[${percentageColor}]`}>{credits} credits</span>
                                </div>
                            </div>

                            <Avatar
                                className={styles.profile_avatar}
                                size="md"
                                // isBordered
                                radius="sm"
                                src={session?.user?.image || undefined}
                                name={firstNameLetter.toUpperCase()}
                                color="default"
                            />
                        </div>
                    </DropdownTrigger>

                <DropdownMenu
                    aria-label="Profile options"
                    // className="w-[90vw]"
                    itemClasses={{
                        base: "gap-4",
                    }}
                >

                {showStudioLinks ? (
                    <>
                        <DropdownItem
                            key="photoshoot_link"
                            // startContent={<PricingIcon className={styles.profile_menu_svg} />}
                            onPress={() => {
                                onMenuToggle();
                                setStudioType("AI Photoshoot");
                                router.push("/photoshoot");
                            }}
                        >
                            <Link className={styles.profile_menu_item} color="foreground" href="/photoshoot">
                            AI Photoshoot
                            </Link>
                        </DropdownItem>
                        
                        <DropdownItem
                            key="studio_link"
                            // startContent={<PricingIcon className={styles.profile_menu_svg} />}
                            onPress={() => {
                                onMenuToggle();
                                setStudioType("Creative Studio");
                                router.push("/studio");
                            }}
                        >
                            <Link className={styles.profile_menu_item} color="foreground" href="/studio">
                            Creative Studio
                            </Link>
                        </DropdownItem>
                    </>
                ) : null}

                    <DropdownItem
                        key="profile_pricing"
                        startContent={
                            <PricingIcon className={styles.profile_menu_svg}/>
                        }
                        onPress={() => {
                            handleItemClick();
                            handleNavigation('/pricing');
                            setIsProfileMenuOpen(!isProfileMenuOpen);
                        }}
                    >
                        <Link className={styles.profile_menu_item} color="foreground" href="/pricing" >
                            Pricing
                        </Link>
                    </DropdownItem>
                    <DropdownItem
                        key="profile_faq"
                        startContent={
                            <FaqIcon className={styles.profile_menu_svg}/>
                        }
                        onPress={() => {
                            handleItemClick();
                            handleNavigation('/faq');
                            setIsProfileMenuOpen(!isProfileMenuOpen);
                        }}
                    >
                        <Link className={styles.profile_menu_item} color="foreground" href="/faq" >
                            FAQ
                        </Link>
                    </DropdownItem>
                    <DropdownItem
                        key="profile_gallery"
                        startContent={
                            <CreationsIcon className={styles.profile_menu_svg}/>
                        }
                        onPress={() => {
                            handleItemClick();
                            handleNavigation('/photoshoot');
                            setIsProfileMenuOpen(!isProfileMenuOpen);
                        }}
                    >
                        <Link className={styles.profile_menu_item} color="foreground" href="/photoshoot" >
                            My Creations
                        </Link>
                    </DropdownItem>
                    
                    {showDesktopLinks ? (
                        <DropdownItem
                            key="profile_settings"
                            startContent={
                                <SettingsIcon className={styles.profile_menu_svg}/>
                            }
                            onPress={() => {
                                handleItemClick();
                                handleNavigation('/settings');
                                setIsProfileMenuOpen(!isProfileMenuOpen);
                            }}
                        >
                            <Link className={styles.profile_menu_item} color="foreground" href="/settings" >
                                Settings
                            </Link>
                        </DropdownItem>
                    ) : null}

                    {showDesktopLinks ? (
                        <DropdownItem
                            key="profile_privacy_policy"
                            startContent={
                                <PrivacyIcon className={styles.profile_menu_svg}/>
                            }
                            onPress={() => {
                                handleItemClick();
                                handleNavigation('/legal/privacy-policy');
                                setIsProfileMenuOpen(!isProfileMenuOpen);
                            }}
                        >
                            <Link className={styles.profile_menu_item} color="foreground" href="/legal/privacy-policy" >
                                Privacy policy
                            </Link>
                        </DropdownItem>
                    ) : null}

                    {showDesktopLinks ? (
                        <DropdownItem
                            key="profile_terms_of_service"
                            startContent={
                                <TermsIcon className={styles.profile_menu_svg}/>
                            }
                            onPress={() => {
                                handleItemClick();
                                handleNavigation('/legal/terms-of-service');
                                setIsProfileMenuOpen(!isProfileMenuOpen);
                            }}
                        >
                            <Link className={styles.profile_menu_item} color="foreground" href="/legal/terms-of-service" >
                                Terms of service
                            </Link>
                        </DropdownItem>
                    ) : null}

                    {showDesktopLinks ? (
                        <DropdownItem
                            key="profile_log_out"
                            startContent={
                                <LogOutIcon className={styles.profile_menu_svg}/>
                            }
                            onPress={async (e) => {
                                handleItemClick();
                                await signOut({ redirect: false });
                                handleNavigation('/');
                            }}
                        >
                            <span className={styles.profile_menu_item} >Log out</span>
                        </DropdownItem>
                    ) : null}
                    {/* <DropdownItem
                        key="profile_referrals"
                        className={styles.profile_menu_invite}
                        color="secondary"
                        startContent={
                            <InviteIcon className={styles.profile_menu_svg}/>
                        }
                        onPress={() => {
                            handleItemClick();
                            handleNavigation('/referrals');
                            setIsProfileMenuOpen(!isProfileMenuOpen);
                        }}
                    >
                        <Link className={styles.profile_menu_item} color="foreground" href="/referrals" >
                            Invite friends & Earn credits
                        </Link>
                    </DropdownItem> */}

                    {/* <DropdownItem
                        key="profile_socials"
                        className={styles.socials_icon_dropdown}
                        >
                        <div className={styles.socials_icons_wrapper} >

                            <div
                                className={styles.social_icon}
                                onClick={() => handleLinkNavigation('https://x.com/')}
                            >
                                <Link
                                    color="foreground"
                                    href="https://x.com/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <XIcon />
                                </Link>
                            </div>

                            <div
                                className={styles.social_icon}
                                onClick={() => handleLinkNavigation('https://www.youtube.com/')}
                            >
                                <Link
                                    color="foreground"
                                    href="https://www.youtube.com/i"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <YouTubeIcon />
                                </Link>
                            </div>

                            <div
                                className={styles.social_icon}
                                onClick={() => handleLinkNavigation('https://www.tiktok.com/')}
                            >
                                <Link
                                    color="foreground"
                                    href="https://www.tiktok.com/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <TikTokIcon />
                                </Link>
                            </div>

                        </div>
                    </DropdownItem> */}

                </DropdownMenu>
            </ Dropdown>
        </div>
        </>
    );
}