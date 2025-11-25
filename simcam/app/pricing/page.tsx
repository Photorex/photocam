'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useSearchParams, useRouter } from "next/navigation";
import { signIn, signOut, useSession } from 'next-auth/react';
import FaqInfo from '../components/FaqInfo/FaqInfo';
import PricingPlans from '../components/PricingPlans/PricingPlans';
import styles from './Pricing.module.css';
import { useWindowSize } from '../lib/hooks/useWindowSize';

const rowOne   = ['/assets/images/onboarding/step_3_1.png',
                  '/assets/images/onboarding/step_3_2.png',
                  '/assets/images/onboarding/step_3_3.png',
                  '/assets/images/onboarding/step_3_4.png'];

const rowTwo   = ['/assets/images/onboarding/step_3_3.png',
                  '/assets/images/onboarding/step_3_4.png',
                  '/assets/images/onboarding/step_3_1.png',
                  '/assets/images/onboarding/step_3_2.png'];

const topImagesFinal = [
    "assets/images/models/female/yoga_mindfulness_1.png",
    "assets/images/models/female/linkedin_headshot.png",
    "assets/images/models/female/anime_style_2.png",
];

const bottomImagesFinal = [
    "assets/images/models/female/tattoo_lover_1.png",
    "assets/images/models/female/streamer.png",
    "assets/images/models/female/wedding_style.png",
];

type Props = {
        images: string[];
        direction: "left" | "right";
    };

    type RowProps = { images: string[]; angle?: number };

    function SeamlessGlider({ images, direction }: Props) {
        const wrapperRef = useRef<HTMLDivElement>(null);
        const [repeatSet, setRepeatSet] = useState<string[]>([]);
        const [isReady, setIsReady] = useState(false);

        useEffect(() => {
            if (!wrapperRef.current) return;

            const observer = new ResizeObserver(() => {
                const containerWidth = wrapperRef.current?.offsetWidth || window.innerWidth;
                const imageWidth = 148 + 8; // image width + margin
                const setsNeeded = Math.ceil(containerWidth / (images.length * imageWidth)) + 1;

                const sequence: string[] = [];
                for (let i = 0; i < setsNeeded; i++) sequence.push(...images);

                setRepeatSet([...sequence, ...sequence]); // for seamless loop
                setIsReady(true);
            });

            observer.observe(wrapperRef.current);

            return () => observer.disconnect();
        }, [images]);

        return (
            <div className={styles.gliderRow} ref={wrapperRef}>
                {isReady && (
                    <div
                        className={`${styles.gliderTrack} ${
                            direction === "left" ? styles.animateLeft : styles.animateRight
                        }`}
                    >
                        {repeatSet.map((src, i) => (
                            <div className={styles.gliderImageWrapper} key={i}>
                                <img src={src} alt="glider" className={styles.gliderImage} />
                                <div className={styles.aiPhotoBadge}>AI Photo</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    function StaticRow({ images, angle = -2.6 }: RowProps) {
    const ref = React.useRef<HTMLDivElement>(null);
    const [rowSet, setRowSet] = React.useState<string[]>([]);

    
    /* repeat images to cover full width (runs on mount & whenever resized) */
    useEffect(() => {
        const computeSet = () => {
            if (!ref.current) return;

            const containerW = ref.current.offsetWidth;
            const imgW = 200 + 12; // card + horizontal gap
            const needed = Math.ceil(containerW / (images.length * imgW)) + 1;

            const repeated: string[] = [];
            for (let i = 0; i < needed; i++) repeated.push(...images);
            setRowSet(repeated);
        };

        computeSet(); // initial

        if (!ref.current) return; // <== ADD this guard

        const ro = new ResizeObserver(computeSet);
        ro.observe(ref.current);
        return () => ro.disconnect();
    }, [images]);

    return (
        <div
        ref={ref}
        className={styles.staticRow}
        style={{ transform: `rotate(${angle}deg)` }}
        >
        {rowSet.map((src, i) => (
            <div className={styles.staticCard} key={i}>
            <img src={src} alt="" />
            </div>
        ))}
        </div>
    );
}


export default function PricingPage() {
    const searchParams = useSearchParams();
    const [hideContact, setHideContact] = useState(searchParams.get("onb") === "1");

    // Get window size using custom hook
    const windowSize = useWindowSize();
    const isMobile = windowSize.width <= 768;

    return (
        <div className={styles.pageWrapper}> 

            {!isMobile && (
                <>
                    <div className={styles.stepThreeGliders}>
                        <StaticRow images={rowOne} />
                        <StaticRow images={rowTwo} />
                        <div className={styles.bottomOverlayTop} />
                        <div className={styles.pricingWrapperTop}>
                            <PricingPlans />
                        </div>
                    </div>
                </>
            )}

            {isMobile && 
                <div className={styles.glidersWrapper}>
                    <SeamlessGlider images={topImagesFinal} direction="right" />
                    <SeamlessGlider images={bottomImagesFinal} direction="left" />
                    <div className={styles.bottomOverlay} />
                    
                    <div className={styles.pricingWrapper}>
                        <PricingPlans />
                    </div>
                </div>
            }    
            {/* 
            <div className={styles.pricingWrapper}>
                <PricingPlans />
            </div> */}

            <div className={styles.website_info_wrapper}>
                {!hideContact && (
                    <div className={styles.website_faq_email}>
                    Contact us at <span className={styles.website_faq_span}>hi@simcam.net</span> for any additional queries and concerns
                    </div>
                )}
                
                <FaqInfo />
            </div>
        </div>
    );
}