'use client';

import React, { useEffect, useState, useRef } from "react";
import styles from './page.module.css';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';

import { useWindowSize } from "../lib/hooks/useWindowSize";

import { useSession } from "next-auth/react";

import { trackGtmEvent } from "../lib/analytics/google/trackGtmEvent";
import LoginModal from "../components/LoginModal/LoginModal";

import MaleIcon from '@/public/assets/icons/male_gender.svg';
import FemaleIcon from '@/public/assets/icons/female_gender.svg';
import OtherIcon from '@/public/assets/icons/other_gender.svg';

import Image from 'next/image';

const topImages = [
    "/assets/images/compressed/glider_1.png",
    "/assets/images/compressed/glider_2.png",
    "/assets/images/compressed/glider_3.png",
];

const bottomImages = [
    "/assets/images/compressed/glider_4.png",
    "/assets/images/compressed/glider_5.png",
    "/assets/images/compressed/glider_6.png",
];

const topImagesFinal = [
    "/assets/images/compressed/yoga_mindfulness_1.png",
    "/assets/images/compressed/linkedin_headshot.png",
    "/assets/images/compressed/anime_style_2.png",
];

const bottomImagesFinal = [
    "/assets/images/compressed/tattoo_lover_1.png",
    "/assets/images/compressed/streamer.png",
    "/assets/images/compressed/wedding_style.png",
];

const rowStep   = ['/assets/images/compressed/step_row_1.png',
                  '/assets/images/compressed/step_row_2.png',
                  '/assets/images/compressed/step_row_3.png',
                  '/assets/images/compressed/step_row_4.png'];

const rowOne   = ['/assets/images/compressed/step_3_1.png',
                  '/assets/images/compressed/step_3_2.png',
                  '/assets/images/compressed/step_3_3.png',
                  '/assets/images/compressed/step_3_4.png'];

const rowTwo   = ['/assets/images/compressed/step_3_3.png',
                  '/assets/images/compressed/step_3_4.png',
                  '/assets/images/compressed/step_3_1.png',
                  '/assets/images/compressed/step_3_2.png'];

const rowThree = ['/assets/images/compressed/step_3_2.png',
                  '/assets/images/compressed/step_3_3.png',
                  '/assets/images/compressed/step_3_4.png',
                  '/assets/images/compressed/step_3_1.png'];

const mobileRoundImgSrcOne = '/assets/images/compressed/selfie_2.png';
const mobileRoundImgSrcTwo = '/assets/images/compressed/selfie_3.png'        

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
                            <Image
                                key={i}
                                src={src}
                                alt="glider"
                                className={styles.gliderImage}
                                width={148}
                                height={224}
                                priority={i < 2}
                            />
                            {/* <img src={src} alt="glider" className={styles.gliderImage} /> */}
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
                <Image
                    key={i}
                    src={src}
                    alt=""
                    width={200}
                    height={278}
                    className={styles.staticCardImage} // e.g. you may need a new CSS selector
                />
            </div>
        ))}
        </div>
    );
}

function MobileHero() {
    const images = rowStep;            // reuse your existing array
    const [idx, setIdx] = React.useState(0);

    /* advance to next photo every 3 s */
    React.useEffect(() => {
        const t = setInterval(() => setIdx(i => (i + 1) % images.length), 3000);
        return () => clearInterval(t);
    }, []);

    return (
        <div className={styles.mobileStage}>
            {/* sliding photo */}
            <div className={styles.mobilePhotoFrame}>
                {images.map((src, i) => (
                    <Image
                        key={i}
                        src={src}
                        alt=""
                        fill
                        style={{ objectFit: 'cover' }}
                        className={i === idx ? styles.slideIn : styles.slideOut}
                    />
                // <img
                //     key={i}
                //     src={src}
                //     className={
                //     i === idx
                //         ? styles.slideIn                  // active photo
                //         : styles.slideOut                 // parked below
                //     }
                //     alt=""
                // />
                ))}
            </div>

            {/* circular avatar with gradient border */}
            <div className={styles.avatarRingOne}>
                    <Image
                        src={mobileRoundImgSrcOne}
                        alt=""
                        width={142}
                        height={142}
                        className={styles.avatarImage}
                    />
                {/* <img src={mobileRoundImgSrcOne} alt="" /> */}
            </div>
        </div>
    );
}

function MobileVideoHero() {
    const videos = [
        '/assets/images/onboarding/video_1.mp4',
        '/assets/images/onboarding/video_2.mp4',
        '/assets/images/onboarding/video_3.mp4',
        '/assets/images/onboarding/video_4.mp4',
    ];
    const [idx, setIdx] = useState(0);
    const videoRefs = useRef<HTMLVideoElement[]>([]);

    const nextVideo = () => {
        const nextIdx = (idx + 1) % videos.length;
        setIdx(nextIdx);
    };

    useEffect(() => {
    const currentVideo = videoRefs.current[idx];
    if (currentVideo) {
      currentVideo.currentTime = 0; // Reset to start
      currentVideo.play().catch(() => {}); // Attempt to play
    }
  }, [idx]);

    return (
        <div className={styles.mobileStage}>
        <div className={styles.mobilePhotoFrame}>
            {videos.map((src, i) => (
                <video
                    key={i}
                    src={src}
                    muted
                    playsInline
                    className={`${styles.mobileVideo} ${i === idx ? styles.slideIn : styles.slideOut}`}
                    onEnded={nextVideo}
                    ref={(el) => {
                        if (el) videoRefs.current[i] = el;
                    }}
                />
                ))}
        </div>

        <div className={styles.avatarRingTwo}>
            <Image
                src={mobileRoundImgSrcTwo}
                alt="avatar2"
                width={142}
                height={142}
                className={styles.avatarImage}
            />
            {/* <img src={mobileRoundImgSrcTwo} alt="avatar" /> */}
        </div>
        </div>
    );
}


export default function OnboardingPage() {

    const { data: session } = useSession();
    
    const searchParams = useSearchParams();
    const router       = useRouter();
    const pathname     = usePathname(); 

    const [step, setStep] = useState(1);

    // Get window size using custom hook
    const windowSize = useWindowSize();
    const isMobile = windowSize.width <= 768;

    // Track whether login component should be opened
    const [isLoginModalOpen, setLoginModalOpen] = useState(false);
    
    const toggleLoginModal = () => {
        setLoginModalOpen(!isLoginModalOpen);
    };

    const [nextClicked, setNextClicked] = useState(false);
    const [clickedGender, setClickedGender] = useState<string | null>(null);
    const hasTrackedStep = useRef<{ [step: number]: boolean }>({});
    

    const handleGenderClick = (gender: string) => {
        setClickedGender(gender);

        const evt = genderEventMap[gender];
        if (evt) {
            trackGtmEvent(evt, {
                ecommerce: { usid: session?.user?.id }
            });
        }

        setTimeout(() => {
            setClickedGender(null);

            setTimeout(() => {
                setStep(3);
            }, 100);

        }, 200);
    };

    useEffect(() => {
        const params = new URLSearchParams(searchParams);
        params.set('step', String(step));
          
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }, [step, pathname, router, searchParams]);
    
    const genderEventMap: Record<string, string> = {
        male   : 'gender_male',
        female : 'gender_female',
        other  : 'gender_other',
    };

    useEffect(() => {
        if (session?.user && !hasTrackedStep.current[1]) {
          trackGtmEvent("welcome_p1", {
            ecommerce: { usid: session.user.id }
          });
          hasTrackedStep.current[1] = true;
        //   console.log('welcome_p1 gtm sent');
        }
    }, [session]);
    
    useEffect(() => {
        if (!session?.user) return;
          
        const eventMap: Record<number, string> = {
          2: "welcome_p2",
          3: "welcome_p3",
          4: "welcome_p4",
        };
          
        const eventName = eventMap[step];
        if (eventName && !hasTrackedStep.current[step]) {
          trackGtmEvent(eventName, {
            ecommerce: { usid: session.user.id }
          });
          hasTrackedStep.current[step] = true;
        //   console.log(`welcome_p${step} gtm sent`);
        }
    }, [step, session]);

    return (
        <div className={styles.onboarding_container}>
            {step === 1 && (
                <div className={styles.stepOneFullScreen}>
                    <div className={styles.glidersWrapper}>
                        <SeamlessGlider images={topImages} direction="right" />
                        <SeamlessGlider images={bottomImages} direction="left" />
                        <div className={styles.bottomOverlay} />
                    </div>
                    

                    <div className={styles.stepOneContent}>
                        <div className={styles.heroTextBlock}>
                            <h1 className={styles.heroHeadline}>
                                <span>Perfect Photos of You </span>
                                <br className={styles.mobileOnly} />
                                <span className={styles.gradientText}>Created by AI</span>
                            </h1>
                            <p className={styles.heroSubtext}>
                                Get <span className={styles.gradientText}>10 FREE credits</span> to try your first photoshoot. Choose a look and see yourself in studio-quality AI images
                            </p>
                        </div>

                        <button
                            className={`${styles.next_button} ${nextClicked ? styles.next_buttonClicked : ''}`}
                            onClick={() => {
                                setNextClicked(true);

                                // First remove the highlight after 500ms
                                setTimeout(() => {
                                    setNextClicked(false);

                                    // Then move to next step 100ms after that
                                    setTimeout(() => {
                                        setStep(2);
                                    }, 100);

                                }, 200);
                            }}
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}

            {step === 2 && (
                <div className={styles.stepTwoWrapper}>
                    <div className={styles.stepTwoBackground}>
                        <div className={styles.stepTwoLeftBg}></div>
                        <div className={styles.stepTwoDivider}></div>
                        <div className={styles.stepTwoRightBg}></div>
                    </div>

                    <div className={styles.stepTwoGradient} />

                    <div className={styles.stepTwoContent}>
                        <div className={styles.genderHeader}>
                            <div className={styles.genderTitle}>Select your gender</div>
                            <div className={styles.genderSubtext}>To get the most accurate results</div>
                        </div>

                        <div className={styles.genderOptions}>

                            <button 
                                className={`${styles.genderButton} ${
                                    clickedGender === 'male' ? styles.genderButtonClicked : ''
                                }`}
                                onClick={() => handleGenderClick('male')}
                            >
                                <MaleIcon />
                                <span>Male</span>
                            </button>

                            <button 
                                className={`${styles.genderButton} ${
                                    clickedGender === 'female' ? styles.genderButtonClicked : ''
                                }`}
                                onClick={() => handleGenderClick('female')}
                            >
                                <FemaleIcon />
                                <span>Female</span>
                            </button>

                            <button 
                                className={`${styles.genderButton} ${
                                    clickedGender === 'other' ? styles.genderButtonClicked : ''
                                }`}
                                onClick={() => handleGenderClick('other')}
                            >
                                <OtherIcon />
                                <span>Other</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {step === 3 && (
                <div className={styles.stepThreeWrapper}>
                    {!isMobile && (
                        <>
                            <div className={styles.stepThreeGliders}>
                            <StaticRow images={rowOne} />
                            <StaticRow images={rowTwo} />
                            <StaticRow images={rowThree} />
                            </div>
                        </>
                    )}

                    {isMobile && <MobileHero />}

                    <div className={styles.stepThreeGradient} />

                    <div className={styles.stepThreeContent}>
                        <h1 className={styles.heroHeadline}>
                            Turn a simple selfie into an epic&nbsp;–{' '}
                            <span className={styles.gradientText}>AI photoshoot!</span>
                        </h1>
                        <p className={styles.heroSubtext}>
                            Upload your photo — get stunning pro pics in any style
                        </p>

                        {/* keep the “Next” button behaviour you already had */}
                        <button
                            className={`${styles.next_button} ${nextClicked ? styles.next_buttonClicked : ''}`}
                            onClick={() => {
                                setNextClicked(true);

                                // First remove the highlight after 500ms
                                setTimeout(() => {
                                    setNextClicked(false);

                                    // Then move to next step 100ms after that
                                    setTimeout(() => {
                                        setStep(4);
                                    }, 100);

                                }, 200);
                            }}
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}

            {step === 4 && (
                <div className={styles.stepThreeWrapper}>
                    {!isMobile && (
                        <>
                            <div className={styles.stepThreeGliders}>
                            <StaticRow images={rowOne} />
                            <StaticRow images={rowTwo} />
                            <StaticRow images={rowThree} />
                            </div>
                        </>
                    )}

                    {isMobile && <MobileVideoHero />}

                    <div className={styles.stepThreeGradient} />

                    <div className={styles.stepThreeContent}>
                        <h1 className={styles.heroHeadline}>
                            Transform Any Image into an <span className={styles.gradientText}>AI Video!</span>
                        </h1>
                        <p className={styles.heroSubtext}>
                            Bring your photos to life turn a static picture into a moving masterpiece with just one tap
                        </p>

                        {/* keep the “Next” button behaviour you already had */}
                        <button
                            className={`${styles.next_button} ${nextClicked ? styles.next_buttonClicked : ''}`}
                            onClick={() => {
                                setNextClicked(true);

                                // First remove the highlight after 500ms
                                setTimeout(() => {
                                    setNextClicked(false);

                                    // Then move to next step 100ms after that
                                    setTimeout(() => {
                                        setStep(5);
                                    }, 100);

                                }, 200);
                            }}
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}

            {step === 5 && (
                <div className={styles.stepThreeWrapper}>
                    {!isMobile && (
                        <>
                            <div className={styles.stepThreeGliders}>
                            <StaticRow images={rowOne} />
                            <StaticRow images={rowTwo} />
                            <StaticRow images={rowThree} />
                            </div>
                        </>
                    )}

                    {isMobile && 
                        <div className={styles.glidersWrapper}>
                            <SeamlessGlider images={topImagesFinal} direction="right" />
                            <SeamlessGlider images={bottomImagesFinal} direction="left" />
                            <div className={styles.bottomOverlay} />
                        </div>
                        }

                    <div className={styles.stepFiveGradient} />

                    <div className={styles.stepThreeContent}>
                        <h1 className={styles.heroHeadline}>
                            Surprise! You&rsquo;ve got <span className={styles.gradientText}>FREE credits </span> to spend!
                        </h1>
                        <p className={styles.heroSubtext}>
                            Bring your photos to life turn a static picture into a moving masterpiece with just one tap
                        </p>

                        {/* keep the “Next” button behaviour you already had */}
                        <button
                            className={`${styles.next_button} ${nextClicked ? styles.next_buttonClicked : ''}`}
                            onClick={() => {
                                setNextClicked(true);

                                // First remove the highlight after 500ms
                                setTimeout(() => {
                                    setNextClicked(false);

                                    // Then move to next step 100ms after that
                                    setTimeout(() => {
                                        router.push('/photoshoot');
                                    }, 100);

                                }, 200);
                            }}
                        >
                            Take FREE credits
                        </button>
                    </div>
                </div>
            )}
            <LoginModal 
                isOpen={isLoginModalOpen} 
                onClose={toggleLoginModal} 
                order='default'
                returnTo="/pricing?onb=1" 
            />
        </div>
    );
}