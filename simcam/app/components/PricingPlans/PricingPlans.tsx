'use client';

import React, { useState, useEffect, useRef } from 'react';

// Next specific import
import { signIn, signOut, useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';

import { PlanChosenPayload } from '../SubscriptionPopup/SubscriptionPopup';

import { Accordion, AccordionItem } from "@heroui/react";

import LoginModal from '../LoginModal/LoginModal';

import { useWindowSize } from "@/app/lib/hooks/useWindowSize";

import { trackGtmEvent } from '@/app/lib/analytics/google/trackGtmEvent';

// Import styles
import styles from './PricingPlans.module.css';
import SubscriptionModal from '../SubscriptionModal/SubscriptionModal';

import CheckedIcon from '@/public/assets/icons/pricing_checked.svg';
import UncheckedIcon from '@/public/assets/icons/pricing_unchecked.svg';
import AiIcon from '@/public/assets/icons/ai-icon.svg';

import ProfileIcon from '@/public/assets/icons/plans/profile-icon.svg';
import CreditsIcon from '@/public/assets/icons/plans/credits-icon.svg';
import ImageIcon from '@/public/assets/icons/plans/image-icon.svg';
import ModeIcon from '@/public/assets/icons/plans/mode-icon.svg';
import VideoIcon from '@/public/assets/icons/plans/video-icon.svg';
import ResolutionIcon from '@/public/assets/icons/plans/resolution-icon.svg';
import LimitedIcon from '@/public/assets/icons/plans/limited-icon.svg';
import CreditsSmallIcon from "@/public/assets/icons/credits_small_icon.svg"


type Props = {
    onLoginNeeded?: () => void;
    onPlanChosen?: (payload: PlanChosenPayload) => void;
    isOnLanding?: boolean;
    openedFromPhotoshoot?: boolean;
    generationCost?: number;
    onCloseGen?: () => void;
};

// Env vars import
const NEXT_PUBLIC_FREE_PLAN_CREDITS = parseInt(process.env.NEXT_PUBLIC_FREE_PLAN_CREDITS!);
const NEXT_PUBLIC_MUSE_PLAN_CREDITS= parseInt(process.env.NEXT_PUBLIC_MUSE_PLAN_CREDITS!);
const NEXT_PUBLIC_GLOW_PLAN_CREDITS= parseInt(process.env.NEXT_PUBLIC_GLOW_PLAN_CREDITS!);
const NEXT_PUBLIC_STUDIO_PLAN_CREDITS= parseInt(process.env.NEXT_PUBLIC_STUDIO_PLAN_CREDITS!);
const NEXT_PUBLIC_ICON_PLAN_CREDITS= parseInt(process.env.NEXT_PUBLIC_ICON_PLAN_CREDITS!);

const planCreditsMap = {
    "Free": NEXT_PUBLIC_FREE_PLAN_CREDITS,
    "Muse": NEXT_PUBLIC_MUSE_PLAN_CREDITS,
    "Glow": NEXT_PUBLIC_GLOW_PLAN_CREDITS,
    "Studio": NEXT_PUBLIC_STUDIO_PLAN_CREDITS,
    "Icon": NEXT_PUBLIC_ICON_PLAN_CREDITS
};

export interface Plan {
    name: string;
    monthlyPrice: number;
    yearlyPrice: number;
    description: string;
    features: { label: string; available: boolean }[];
    limited?:  boolean;
    popular?:  boolean;
}

export const BASE_PLANS: Plan[] = [
    {
      name: 'Muse',
      monthlyPrice: 3,
      yearlyPrice: 2.1,
      description: 'Turn your selfies into beautiful AI photos.',
      features: [
        { label: '1 AI Profile', available: true },
        { label: '50 credits', available: true },
        { label: '2 photos at once', available: true },
        { label: 'PRO Mode included', available: true },
        { label: 'AI Video', available: false },
        { label: '2K', available: false },
        { label: 'Up to 4K', available: false },
      ],
      limited: true,
    },
    {
      name: 'Glow',
      monthlyPrice: 9,
      yearlyPrice: 6.3,
      description: 'From dreamy portraits to AI videos — Glow lets you try it all.',
      features: [
        { label: '2 AI Profile', available: true },
        { label: '150 credits', available: true },
        { label: '4 photos at once', available: true },
        { label: 'PRO Mode included', available: true },
        { label: 'AI Video', available: true },
        { label: '2K', available: true },
      ],
    },
    {
      name: 'Studio',
      monthlyPrice: 15,
      yearlyPrice: 10.5,
      description: 'Your most beautiful photos Ever In 4K.',
      features: [
        { label: '2 AI Profile', available: true },
        { label: '200 credits', available: true },
        { label: '4 photos at once', available: true },
        { label: 'FULL PRO Mode', available: true },
        { label: 'AI Video', available: true },
        { label: 'Up to 4K', available: true },
      ],
      popular: true,
    },
    {
      name: 'Icon',
      monthlyPrice: 25,
      yearlyPrice: 17.5,
      description: 'Create dozens of looks, styles, and videos — with zero limits.',
      features: [
        { label: '4 AI Profile', available: true },
        { label: '400 credits', available: true },
        { label: '4 photos at once', available: true },
        { label: 'FULL PRO Mode', available: true },
        { label: 'AI Video', available: true },
        { label: 'Up to 4K', available: true },
      ],
    }
];

const countriesPremiumRegions = [
    "AU", "AT", "BE", "CA", "DK", "FI", "FR", "DE", "IE", "IT", "LU", "NZ",
    "NO", "SE", "CH", "BG", "HR", "CY", "EE", "GR", "HU", "IS", "JP", "LT",
    "MT", "PL", "PT", "RO", "SK", "SI", "CL", "HK"
];

export default function PricingPlans({ 
    onLoginNeeded, 
    onPlanChosen, 
    isOnLanding = false, 
    openedFromPhotoshoot = false,
    generationCost,
    onCloseGen,
 }: Props) {
    const { data: session } = useSession();
    const router = useRouter();
    const searchParams = useSearchParams();

    // Get window size using custom hook
    const windowSize = useWindowSize();
    const isMobile = windowSize.width <= 768;

    const [plans, setPlans] = useState<Plan[]>([...BASE_PLANS]);
    
    // Use ref to track if we've processed the onboarding parameter
    const processedOnboardingRef = useRef(false);
    const hasSentWelcomeP5 = useRef(false);
    
    // Capture onboarding state in ref and state
    const isFromOnboardingRef = useRef(searchParams.get("onb") === "1");
    const [isFromOnboarding, setIsFromOnboarding] = useState(isFromOnboardingRef.current);
    
    // Process URL parameter once
    useEffect(() => {
        if (isFromOnboardingRef.current && !processedOnboardingRef.current) {
            // Mark as processed
            processedOnboardingRef.current = true;
            
            // Schedule URL cleanup for the next tick to ensure header is rendered first
            setTimeout(() => {
                const params = new URLSearchParams(window.location.search);
                params.delete("onb");
                router.replace(`/pricing${params.toString() ? "?" + params : ""}`, {
                    scroll: false,
                });
            }, 0);
        }
    }, [router]);

    useEffect(() => {
        if (!isFromOnboardingRef.current) return;          // not from wizard
        if (!session?.user)           return;              // not signed-in yet
        if (hasSentWelcomeP5.current) return;              // already sent this run
      
        // guard against duplicates across reloads
        const key = `welcome_p5_sent_${session?.user?.id}`;
        if (typeof window !== "undefined" && localStorage.getItem(key) === "1") {
          hasSentWelcomeP5.current = true;
          return;
        }
      
        trackGtmEvent("welcome_p5", { ecommerce: { usid: session?.user?.id } });
        console.log("welcome_p5 sent")
        hasSentWelcomeP5.current = true;
        if (typeof window !== "undefined") localStorage.setItem(key, "1");
    }, [session]);

    useEffect(() => {
        (async () => {
          try {
            const res      = await fetch('/api/ip-info');
            const { country = 'unknown' } = await res.json();
      
            if (!countriesPremiumRegions.includes(country)) {
              setPlans(prev =>
                prev.map(p =>
                  p.name === 'Muse'
                    ? { ...p, monthlyPrice: 5, yearlyPrice: 3.5 }
                    : p
                )
              );
            }
          } catch (err) {
            console.error('[PricingPlans] country check failed', err);
          }
        })();
      }, []);
      
      /* keep selectedPlan in sync -----------------------------------------*/
      useEffect(() => {
        if (!session?.user?.subscription) return;
        const found = plans.find(p => p.name === session.user.subscription);
        if (found) setSelectedPlan(found);
      }, [session, plans]);
    
    const [isGenerationPurchase, setIsGenerationPurchase] = useState(false);
    const [modalPlanPrice, setModalPlanPrice] = useState<number | undefined>(undefined);

    const [isYearly, setIsYearly] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<(typeof plans)[0] | null>(null);
    const [selectedGeneration, setSelectedGeneration] = useState<number | null>(null);

    const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
    const togglePricingModal = () => setIsPricingModalOpen(prev => !prev);

    const yearDiscount = 30;

    // Track whether login component should be opened
    const [isLoginModalOpen, setLoginModalOpen] = useState(false);

    const toggleLoginModal = () => {
		setLoginModalOpen(!isLoginModalOpen);
	};

    useEffect(() => {
        if (session?.user?.subscription) {
            const foundPlan = plans.find((p) => p.name === session.user.subscription);
            if (foundPlan) setSelectedPlan(foundPlan);
        }
    }, [session]);

    const getHeaderTexts = () => {
        if (isFromOnboarding) {
            return {
                header: "Your dream photoshoots are waiting 🚀",
                description: 'Choose the best plan for your needs.'
            };
        }
        
        if (!session?.user || session.user.subscription === 'Free') {
            return {
                header: 'To create your own model, choose a plan! 🚀',
                description: 'Choose the best plan for your needs.'
            };
        } else if (session.user.subscription === 'Muse') {
            return {
                header: '🚀 You have purchased the Muse Plan',
                description: 'You can upgrade it or buy additional generations.'
            };
        } else if (session.user.subscription === 'Glow') {
            return {
                header: '🚀 You have purchased the Glow Plan',
                description: 'You can upgrade it or buy additional generations.'
            };
        } else if (session.user.subscription === 'Studio') {
            return {
                header: '🚀 You have purchased the Studio Plan',
                description: 'You can buy additional generations.'
            };
        } else if (session.user.subscription === 'Icon') {
            return {
                header: '🚀 You have purchased the Icon Plan',
                description: 'You can buy additional generations.'
            };
        }
        return { header: '', description: '' };
    };

    const { header, description } = getHeaderTexts();

    const generationPrices: Record<number, number> = {
        50: 5,
        100: 9,
        200: 17,
        500: 40,
        1000: 75,
    };

    const generationOriginalPrices: Record<number, number> = {
        50: 5,
        100: 10,
        200: 20,
        500: 50,
        1000: 100,
    };

    // Preselect generation if it's the user's plan
    useEffect(() => {
        if (session?.user?.subscription) {
            const foundPlan = plans.find((p) => p.name === session.user.subscription);
            if (foundPlan) {
                setSelectedPlan(foundPlan);
                setSelectedGeneration(200); // default selection
            }
        }
    }, [session]);

    const CountdownTimer = () => {
        const [timeLeft, setTimeLeft] = useState(3600); // 1 hour in seconds
      
        useEffect(() => {
          const intervalId = setInterval(() => {
            setTimeLeft(prevTime => {
              if (prevTime <= 0) {
                return 3600; // Reset to 1 hour when countdown reaches zero
              }
              return prevTime - 1;
            });
          }, 1000);
      
          return () => clearInterval(intervalId);
        }, []);
      
        // Format time as HH:MM:SS
        const formatTime = (seconds: number) => {
          const hours = Math.floor(seconds / 3600);
          const minutes = Math.floor((seconds % 3600) / 60);
          const secs = seconds % 60;
          return [hours, minutes, secs]
            .map(val => val < 10 ? `0${val}` : val)
            .join(':');
        };
      
        return (
          <span className={styles.timerText}>{formatTime(timeLeft)}</span>
        );
      };

    return (
        <>
        <div className={styles.pageWrapper}>

            {/* {(session?.user?.subscription !== 'Free' && !isFromOnboarding && !isOnLanding) && ( */}
                <div className={styles.generations_wrapper}>
                    <div className={styles.generations_header}>
                        {/* <span className={styles.generations_header_text_upper}>{session?.user?.subscription} Plan</span> */}
                        {/* <span className={styles.generations_header_text_lower}>{session?.user?.credits} out of {planCreditsMap[session?.user?.subscription as keyof typeof planCreditsMap]}</span> */}
                        <span className={styles.generations_header_text_lower}>Buy more credits!</span>

                        {generationCost !== undefined && (
                            <div className={styles.gemerations_header_additional}>
                                <span className={styles.generations_header_text_lower_additional}>To generate you need</span>
                                <div className={styles.gemerations_header_additional_cost_wrapper}>
                                    <div className={styles.gemerations_header_additional_cost}>
                                        <CreditsSmallIcon/>{generationCost}
                                    </div>
                                </div>
                            </div>
                        )}
                        
                    </div>

                    <div className={styles.generations_plans_wrapper}>
                        {session?.user?.id && (
                            <div className={styles.generations_plans_balance_wrapper}>
                                <span className={styles.generations_plans_balance_text_upper}>Your balance</span>
                                <span className={styles.generations_plans_balance_text_lower}>{session?.user?.credits}</span>
                            </div>
                        )}
        
                        {[50, 100, 200, 500, 1000].map((amount) => (
                            <div
                                key={amount}
                                className={`
                                    ${styles.generationItem}
                                    ${selectedGeneration === amount ? styles.generationItemSelected : ''}
                                `}
                                onClick={() => {
                                    if (!session?.user) {              // still handle “login first”
                                        onLoginNeeded?.();
                                        return;
                                    }

                                    const dataForCheckout: PlanChosenPayload = {
                                        subscriptionType    : session.user.subscription ?? "Free",
                                        planPrice           : generationPrices[amount],
                                        isGenerationPurchase: true,
                                        generationAmount    : amount,
                                        isPayYearlySelected : false,     // n/a for packs
                                    };

                                    /* When <PricingPlans> is rendered *inside* SubscriptionPopup
                                        `onPlanChosen` is defined – push the data up */
                                    if (onPlanChosen) {
                                        onPlanChosen(dataForCheckout);
                                        if (onCloseGen) {
                                            onCloseGen();
                                        }
                                        return;
                                    }
                                    
                                    setIsPricingModalOpen(true);
                                    setIsGenerationPurchase(true);
                                    setModalPlanPrice(generationPrices[amount]);
                                    setSelectedGeneration(amount)
                                }}
                            >
                                <div className={styles.generations_amount_wrapper}>
                                    <AiIcon />
                                    <div className={styles.generations_amount}>{amount.toLocaleString('fr-FR').replace(/\u00A0/g, ' ')}</div>
                                </div>

                                <div className={styles.priceRow}>
                                    <div className={styles.crossedPriceGen}>
                                        ${generationOriginalPrices[amount]}
                                    </div>
                                    <div className={styles.generationLabel}>
                                        ${generationPrices[amount]}
                                    </div>
                                </div>

                            </div>
                            ))}
                    </div>
                </div>
            {/* )} */}

            {/* <div className={styles.headerWrapper}>
                <h1 className={styles.pricingHeader}>All Plans</h1>

                <div className={styles.actionsWrapper}>

                        <div className={styles.toggleWrapper}>
                            <span className={styles.toggleLabel}>Pay Monthly</span>
                            <label className={styles.switch}>
                                <input
                                    type="checkbox"
                                    checked={isYearly}
                                    onChange={(e) => setIsYearly(e.target.checked)}
                                />
                                <span className={styles.slider}></span>
                            </label>
                            <span className={styles.toggleLabel}>Pay Yearly</span>
                            <span className={styles.discountBadge}>30% off</span>
                        </div>
                    
                </div>
            </div> */}

            {/* {false && (
                <div className={styles.plans_wrapper}>
                <div className={styles.plans_row}>
                    {plans.map((plan) => {
                        const isCurrent = session?.user?.subscription === plan.name;
                        let backgroundGradient = '';
                        if (plan.name === 'Muse') {
                            backgroundGradient = 'linear-gradient(175.78deg, #141414 3.43%, #9F68D3 96.57%)';
                        } else if (plan.name === 'Glow') {
                            backgroundGradient = 'linear-gradient(175.78deg, #000000 -2.15%, #FFA7DA 96.57%)';
                        } else if (plan.name === 'Studio') {
                            backgroundGradient = 'linear-gradient(175.78deg, #151515 -6.28%, #820DFF 96.57%)';
                        } else if (plan.name === 'Icon') {
                            backgroundGradient = 'linear-gradient(147.03deg, #151515 0%, #AA1686 50.42%, #BB0909 104.42%)';
                        }

                        const price = isYearly ? plan.yearlyPrice : plan.monthlyPrice;
                        const original = isYearly ? plan.monthlyPrice : null;
                        
                        return (
                            <div 
                                key={plan.name} 
                                className={styles.plan_box}
                                style={{ background: backgroundGradient }}
                            >
                                <div className={styles.plan_box_inner_wrapper}>

                                    <div className={styles.plan_box_content_wrapper}>
                                        <div className={styles.plan_box_header}>

                                            
                                            <div className={styles.plan_box_plan_name_top_wrapper}>
                                                <div className={styles.plan_box_plan_name}>{plan.name}</div>

                                                {(plan.limited && !isCurrent) && (
                                                    <div className={styles.limitedBadge}>
                                                        <LimitedIcon />
                                                        Limited <CountdownTimer />
                                                    </div>
                                                )}
                                                {isCurrent && (
                                                    <div className={styles.currentPlanBadge}>Your Plan</div>
                                                )}
                                            </div>
                                            

                                            <div className={styles.plan_box_pricing_wrapper}>

                                                {isYearly && (
                                                    <div className={styles.crossedPrice}>
                                                        <span className={styles.crossedPriceLeft}>${original}</span>
                                                        <span className={styles.crossedPriceRight}>/month</span>
                                                    </div>
                                                )}
                                                <div className={styles.currentPrice}>
                                                    <span className={styles.currentPriceLeft}>${price}</span>
                                                    <span className={styles.currentPriceRight}>/month</span>
                                                </div>
                                            </div>

                                            {!isMobile && (
                                                <>
                                                    {(plan.limited && !isCurrent) && (
                                                        <div className={styles.limitedBadge}>
                                                            <LimitedIcon />
                                                            Limited <CountdownTimer />
                                                        </div>
                                                    )}
                                                    {isCurrent && (
                                                        <div className={styles.currentPlanBadge}>Your Plan</div>
                                                    )}
                                                </>
                                            )}

                                        </div>

                                        <div className={styles.plan_box_plan_name_wrapper}>
                                            {!isMobile && (
                                                <div className={styles.plan_box_plan_name}>{plan.name}</div>
                                            )}
                                            <div className={styles.plan_box_plan_description}>{plan.description}</div>
                                        </div>

                                        <div className={styles.plan_box_features_wrapper}>
                                            {plan.features.map((f, i) => {
                                                let FeatureIcon;
                                                if (i === 0) FeatureIcon = ProfileIcon;
                                                else if (i === 1) FeatureIcon = CreditsIcon;
                                                else if (i === 2) FeatureIcon = ImageIcon;
                                                else if (i === 3) FeatureIcon = ModeIcon;
                                                else if (i === 4) FeatureIcon = VideoIcon;
                                                else if (i === 5 || i === 6) FeatureIcon = ResolutionIcon;
                                                
                                                return (
                                                <div className={styles.featureRow} key={i}>
                                                    {f.available && (
                                                        <div className={styles.featureRow}>
                                                            <FeatureIcon className={styles.featureIcon} />
                                                            <span className={f.available ? styles.featureAvailable : styles.featureUnavailable}>{f.label}</span>
                                                        </div>
                                                    )}
                                                </div>
                                                );
                                            })}
                                        </div>
                                        
                                    </div>
                                    
                                    {
                                        !isCurrent && (
                                            <button 
                                                className={styles.planButton}
                                        onClick={() => {

                                            if (!session?.user) {
                                                onLoginNeeded?.();
                                                return;
                                            }

                                            const dataForCheckout = {
                                                subscriptionType      : plan.name,
                                                planPrice             : isYearly ? plan.yearlyPrice : plan.monthlyPrice,
                                                isGenerationPurchase  : false,
                                                generationAmount      : undefined,
                                                isPayYearlySelected   : isYearly,
                                                yearDiscount
                                            } as const;
                                            
                                            if (onPlanChosen) {
                                                onPlanChosen(dataForCheckout);
                                                return;
                                            }
                                        
                                            setSelectedPlan(plan);
                                            setIsPricingModalOpen(true);
                                            setIsGenerationPurchase(dataForCheckout.isGenerationPurchase);
                                            setModalPlanPrice(dataForCheckout.planPrice);
                                        }}
                                    >
                                            {session?.user?.subscription === "Free" ? 
                                                `Start for $${isYearly ? plan.yearlyPrice : plan.monthlyPrice}` : 
                                                'Change plan'}
                                        </button>
                                    )}

                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
            )} */}
            
        </div>

        <LoginModal isOpen={isLoginModalOpen} onClose={toggleLoginModal} order='default'/>

        <SubscriptionModal 
            subscriptionType={selectedPlan?.name}
            planPrice={modalPlanPrice}
            isGenerationPurchase={isGenerationPurchase}
            generationAmount={isGenerationPurchase ? selectedGeneration ?? undefined : undefined}
            isPayYearlySelected={isYearly}
            yearDiscount={yearDiscount}
            isOpen={isPricingModalOpen} 
            onClose={() => {
                togglePricingModal();
                setIsGenerationPurchase(false);
                setSelectedGeneration(null);
            }}
        />
    </>
    );
}