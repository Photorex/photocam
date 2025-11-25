'use client';

import { useEffect, useRef, useState } from 'react';

import { signIn, signOut, useSession } from 'next-auth/react';

import Image from 'next/image';

import { useRouter, usePathname } from 'next/navigation'

import styles from './page.module.css';
import pricingStyles from './pricing/Pricing.module.css';

import { useWindowSize } from '@/app/lib/hooks/useWindowSize';

import Footer from './components/Footer/Footer';
import Faq from './components/Faq';
import Banner from './components/Banner';

import PricingPlans from './components/PricingPlans/PricingPlans';
import LoginModal from './components/LoginModal/LoginModal';


import CheckedIcon from '@/public/assets/icons/pricing_checked.svg';
import UncheckedIcon from '@/public/assets/icons/pricing_unchecked.svg';

export default function Home() {
    const { data: session } = useSession();
    const router = useRouter();

    const windowSize = useWindowSize();
    const isMobile = windowSize.width > 0 && windowSize.width <= 1000;

    const followerRef = useRef<HTMLDivElement>(null);
    const mouseX = useRef(0);
    const mouseY = useRef(0);
    const posX = useRef(0);
    const posY = useRef(0);
    const [zone, setZone] = useState(1);
    const [isDesktop, setIsDesktop] = useState(true);

    useEffect(() => {
        if (windowSize.width === 0) return;
        setIsDesktop(!isMobile);
    }, [windowSize.width]);

    useEffect(() => {
        if (!isDesktop) return;

        const handleMouseMove = (e: MouseEvent) => {
        mouseX.current = e.clientX;
        mouseY.current = e.clientY;

        const quarter = window.innerWidth / 4;
        if (e.clientX < quarter) setZone(1);
        else if (e.clientX < quarter * 2) setZone(2);
        else if (e.clientX < quarter * 3) setZone(3);
        else setZone(4);
        };

        const animate = () => {
        posX.current += (mouseX.current - posX.current) * 0.1;
        posY.current += (mouseY.current - posY.current) * 0.1;

        if (followerRef.current) {
            followerRef.current.style.left = `${posX.current}px`;
            followerRef.current.style.top = `${posY.current}px`;
        }

        requestAnimationFrame(animate);
        };

        window.addEventListener('mousemove', handleMouseMove);
        animate();

        return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        };
    }, [isDesktop]);

    const handleMenuClick = (path: string) => {
        router.push(path);
    };

    const images = Array.from({ length: 9 }, (_, i) => `/assets/images/models/landing/${i + 1}.png`);
    const imagesToShow = isMobile ? images.slice(0, 6) : images;

    // Track whether login component should be opened
    const [isLoginModalOpen, setLoginModalOpen] = useState(false);
        
    const toggleLoginModal = () => {
        setLoginModalOpen(!isLoginModalOpen);
    };

    const goToPhotoshootOrLogin = () => {
        if (session?.user?.id) router.push("/photoshoot");
        // else router.push("/onboarding");
        else toggleLoginModal();
    };

    return (
        <>

            <div className={styles.page_wrapper}>
            {isDesktop && (
                <div ref={followerRef} className={`${styles.cursorFollower} ${styles[`zone${zone}`]}`} />
            )}

            <div className={styles.page_content_wrapper}>

                <div className={styles.landingHeader}>
                <div className={styles.textBlock}>
                    <div className={styles.topTag}>AI Photos That Look Real, Feel Effortless</div>
                    <h1 className={styles.title}>Your Best Shot — Instantly</h1>
                    <ul className={styles.bulletList}>
                        <li>Forget the studio, skip the shoot.</li>
                        <li>Look perfectly polished in seconds.</li>
                        <li>Ideal for work, social, and dating profiles.</li>
                    </ul>
                    
                    <button 
                        onClick={() => {
                            if (session?.user?.id) {
                                handleMenuClick('/photoshoot');
                            } else {
                                toggleLoginModal();
                                // handleMenuClick('/onboarding');
                            }
                            
                        }}
                        className={styles.ctaButton}
                    >
                        Get Your AI Photos Now
                    </button>
                </div>

                <div className={styles.imageGrid}>
                    {imagesToShow.map((src, i) => (
                    <Image
                        key={i}
                        src={src}
                        alt={`model-${i + 1}`}
                        width={0}
                        height={0}
                        sizes="100vw"
                        className={styles.gridImage}
                    />
                    ))}
                </div>
                </div>
                
                <div className={styles.landingSteps}>
                    {/* Step 1 */}
                    <div className={styles.step}>
                        <div className={styles.stepIndicator}>
                            <div className={styles.stepCircle}>1</div>
                            <div className={styles.stepLine} />
                        </div>

                        <div className={styles.stepText}>
                            <div className={styles.stepTitle}>Upload 10 photos</div>
                            <div className={styles.stepSubtitle}>Different angles, lighting, and expressions</div>
                        </div>

                        <div className={styles.stepImageGrid}>
                            <div className={styles.sideColumn}>
                                <Image
                                    src="/assets/images/models/landing/step_1_1.png"
                                    alt="step 1-1"
                                    className={styles.sideImage}
                                    width={88}
                                    height={120}
                                    unoptimized
                                />
                                <Image
                                    src="/assets/images/models/landing/step_1_2.png"
                                    alt="step 1-2"
                                    className={styles.sideImage}
                                    width={88}
                                    height={120}
                                    unoptimized
                                />
                            </div>

                            <div className={styles.centerColumn}>
                                <Image
                                    src="/assets/images/models/landing/step_1_3.png"
                                    alt="step 1-3"
                                    className={styles.centerImage}
                                    width={168}
                                    height={240}
                                    unoptimized
                                />
                            </div>

                            <div className={styles.sideColumn}>
                                <Image
                                    src="/assets/images/models/landing/step_1_4.png"
                                    alt="step 1-2"
                                    className={styles.sideImage}
                                    width={88}
                                    height={120}
                                    unoptimized
                                />
                                <Image
                                    src="/assets/images/models/landing/step_1_5.png"
                                    alt="step 1-2"
                                    className={styles.sideImage}
                                    width={88}
                                    height={120}
                                    unoptimized
                                />
                            </div>
                        </div>
                    </div>

                    {/* Step 2 */}
                    <div className={styles.step}>
                        <div className={styles.stepIndicator}>
                                <div className={styles.stepCircle}>2</div>
                                <div className={styles.stepLine} />
                            </div>

                            <div className={styles.stepText}>
                                <div className={styles.stepTitle}>Choose your style</div>
                                <div className={styles.stepSubtitle}>LinkedIn, Casual, Business, Wedding & more</div>
                            </div>

                            <div className={styles.modalImages}>
                                <Image
                                    src="/assets/images/models/landing/step_2_1.png"
                                    alt="left"
                                    className={styles.leftImageStyle}
                                    width={278}
                                    height={378}
                                />
                                <Image
                                    src='/assets/images/models/landing/step_2_2.png'
                                    alt="center"
                                    className={styles.centerImageStyle}
                                    width={278}
                                    height={378}
                                />
                                <Image
                                    src='/assets/images/models/landing/step_2_3.png'
                                    alt="right"
                                    className={styles.rightImageStyle}
                                    width={278}
                                    height={378}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Step 3 */}
                    <div className={styles.step}>
                        <div className={styles.stepIndicator}>
                                <div className={styles.stepCircle}>3</div>
                                <div className={styles.stepLine} />
                            </div>

                            <div className={styles.stepText}>
                                <div className={styles.stepTitle}>Get 50 AI-generated professional portraits in minutes</div>
                            </div>

                            <div className={styles.scrollWrapper}>
                                <div className={styles.scrollTrack}>
                                    {[1, 2, 3, 4, 5].map((num, idx) => (
                                    <div
                                        key={idx}
                                        className={`${styles.scrollCard} ${styles[`rotate${idx}`]}`}
                                    >
                                        <div className={styles.imageFrame}>
                                        <Image
                                            src={`/assets/images/models/landing/step_3_${num}.png`}
                                            alt={`Portrait ${num}`}
                                            width={240}
                                            height={256}
                                            className={styles.scrollImage}
                                        />
                                        <div className={styles.imageLabel}>AI generated</div>
                                        </div>
                                    </div>
                                    ))}
                                </div>
                            </div>

                        </div>
                        
                    {/* AI Video Section */}
                    <div className={styles.aiVideoSection}>
                        <h2 className={styles.aiVideoTitle}>Want more than just photos?</h2>

                        {isMobile ? (
                            <>
                            <p className={styles.aiVideoSubtitle}>
                                    Turn your portraits into stunning 5-second AI videos. Your AI-generated photos can now come to life with cinematic motion – perfect for Reels, TikTok, and personal branding.
                            </p>

                            <div className={styles.aiVideoMobileColumn}>
                                <div className={styles.aiFrame}>
                                <Image
                                    src="/assets/images/models/landing/video/photo.jpg"
                                    alt="Your Photo"
                                    width={474}
                                    height={574}
                                    className={styles.aiImage}
                                />
                                <div className={styles.aiLabel}>Your Photo</div>
                                </div>

                                <div className={styles.aiFrame}>
                                <Image
                                    src="/assets/images/models/landing/video/video.gif"
                                    alt="AI Video"
                                    width={474}
                                    height={574}
                                    className={styles.aiImage}
                                    unoptimized
                                />
                                <div className={styles.aiLabel}>AI Video</div>
                                </div>

                                <button 
                                    className={styles.aiCta}
                                    onClick={() => {
                                        if (session?.user?.id) {
                                            handleMenuClick('/photoshoot');
                                        } else {
                                            toggleLoginModal();
                                            // handleMenuClick('/onboarding');
                                        }
                                        
                                    }}
                                >
                                    Get Your AI Video
                                </button>
                            </div>
                            </>
                        ) : (
                            <div className={styles.aiVideoContent}>
                            <div className={styles.aiColumn}>
                                <div className={styles.aiFrame}>
                                <Image
                                    src="/assets/images/models/landing/video/photo.jpg"
                                    alt="Your Photo"
                                    width={474}
                                    height={574}
                                    className={styles.aiImage}
                                />
                                <div className={styles.aiLabel}>Your Photo</div>
                                </div>

                                <button 
                                    onClick={() => {
                                        if (session?.user?.id) {
                                            handleMenuClick('/photoshoot');
                                        } else {
                                            toggleLoginModal();
                                            // handleMenuClick('/onboarding');
                                        }
                                        
                                    }}
                                    className={styles.aiCta}
                                >
                                    Get Your AI Video
                                </button>
                            </div>

                            <div className={styles.aiColumn}>
                                <p className={styles.aiVideoSubtitle}>
                                Turn your portraits into stunning 5-second AI videos. Your AI-generated photos can now come to life with cinematic motion – perfect for Reels, TikTok, and personal branding.
                                </p>

                                <div className={styles.aiFrame}>
                                <Image
                                    src="/assets/images/models/landing/video/video.gif"
                                    alt="AI Video"
                                    width={474}
                                    height={574}
                                    className={styles.aiImage}
                                    unoptimized
                                />
                                <div className={styles.aiLabel}>AI Video</div>
                                </div>
                            </div>
                            </div>
                        )}

                        {isDesktop && (
                            <Image
                                src="/assets/images/models/landing/video/footer.png"
                                alt="Wave"
                                width={1500}
                                height={200}
                                className={styles.aiWave}
                                unoptimized
                            />
                        )}
                    </div>

                    {/* Testimonials Section */}
                    <div className={styles.testimonialsSection}>
                        <h2 className={styles.testimonialsTitle}>
                            Thousands have upgraded their photos<br />here’s what they’re saying
                        </h2>

                        <div className={styles.testimonialRow}>
                            {[1, 2, 3, 4].map((num) => (
                            <Image
                                key={num}
                                src={`/assets/images/models/landing/review_${num}.png`}
                                alt={`Testimonial Column ${num}`}
                                width={320}
                                height={663}
                                className={styles.testimonialImage}
                                unoptimized
                            />
                            ))}
                        </div>
                    </div>


                    <div className={styles.pricingWrapper}>
                        <PricingPlans onLoginNeeded={toggleLoginModal} isOnLanding={true}/>
                    </div>

                    <div className={styles.faqSection}>
                        <Faq />
                    </div>

                    <div className={styles.faqSection}>
                        <Banner onCtaClick={goToPhotoshootOrLogin}/>
                    </div>

                </div>
                
                <Footer />
            </div>

            <LoginModal isOpen={isLoginModalOpen} onClose={toggleLoginModal} order='default'/>
        
        </>
    );
}