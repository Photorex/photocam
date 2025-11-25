'use client';

import React, { useState, useEffect } from 'react';

import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter, usePathname, useSearchParams } from 'next/navigation'

import LoginModal from '../LoginModal/LoginModal';

import styles from './mobileMenu.module.css';

// import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Select, SelectItem } from "@heroui/react";

// import LoginModal from "@/components/loginModal";

// Functions import
import { useWindowSize } from "@/app/lib/hooks/useWindowSize";

// Centralized image import
import HomeLogo from "@/public/images/icons/menu/home-icon.svg";
import HomeLogoGradient from "@/public/images/icons/menu/home-icon-gradient.svg";
import GenerationLogo from "@/public/images/icons/menu/generation-icon.svg";
import GenerationLogoGradient from "@/public/images/icons/menu/generation-icon-gradient.svg";
import CreditsLogo from "@/public/images/icons/menu/credits-icon.svg";
import CreditsLogoGradient from "@/public/images/icons/menu/credits-icon-gradient.svg";

export default function  MobileMenu () {
    const { data: session, status, update } = useSession();

    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
  
    // Get window size using custom hook
    const windowSize = useWindowSize();
    const isMobile = windowSize.width <= 1000;

    const handleMenuClick = (path: string) => {
        router.push(path);
    };

    // Track whether login component should be opened
    const [isLoginModalOpen, setLoginModalOpen] = useState(false);

    const toggleLoginModal = () => {
		setLoginModalOpen(!isLoginModalOpen);
	};

    //   const {
    //     isOpen: isLoginModalOpen,
    //     onOpen: openLoginModal,
    //     onClose: toggleLoginModal,
    //   } = useDisclosure();

    // State to track whether the initial calculation is complete
    const [isCalculated, setIsCalculated] = useState(false);

    useEffect(() => {
         // Mark the screen size calculation as complete
         setIsCalculated(true);
    }, [windowSize]);

    // Get current tab parameter
    const tabParam = searchParams.get('tab');
 
    // Don't render until the calculation is complete
    if (!isCalculated || !isMobile) return null;

    return (
        <>
            <div className={styles.mobile_navigation_wrapper}>
                {/* Control menu button */}
                <button
                    className={`${styles.mobile_navigation_button} ${((pathname === '/photoshoot' && tabParam !== 'my') || (pathname.includes('/photoshoot') && tabParam === 'ai')) ? styles.mobile_nav_active_button_nav : ''}`}
                    onClick={() => {

                        if (!session?.user?.id) {
                            toggleLoginModal();
                        return;
                        } else {
                            // Navigate to photoshoot with AI tab and scroll to top
                            handleMenuClick('/photoshoot?tab=ai');
                            setTimeout(() => {
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                            }, 100);
                        }
                    }}
                >
                    <div className={styles.mobile_navigation_button_inner_wrapper}>
                        {((pathname === '/photoshoot' && !tabParam) || (pathname.includes('/photoshoot') && tabParam === 'ai')) ? (
                            <HomeLogoGradient className={styles.mobile_navigation_button_icon} />
                            ) : (
                            <HomeLogo className={styles.mobile_navigation_button_icon} />
                        )}
                        <span className={`${styles.mobile_navigation_button_text} ${((pathname === '/photoshoot' && !tabParam) || (pathname.includes('/photoshoot') && tabParam === 'ai')) ? styles.mobile_navigation_button_text_active : ''}`}>
                            Main
                        </span>
                    </div>
                </button>

                {/* Generator Button */}
                <button
                    className={`${styles.mobile_navigation_button} ${(pathname.includes('/photoshoot') && tabParam === 'my') ? styles.mobile_nav_active_button_nav : ''}`} 
                    onClick={() => {

                        if (!session?.user?.id) {
                            toggleLoginModal();
                        return;
                        } else {
                            // Navigate to photoshoot with My Photoshoot tab
                            handleMenuClick('/photoshoot?tab=my')
                        }

                    }}
                >
                    <div className={styles.mobile_navigation_button_inner_wrapper}>
                        {(pathname.includes('/photoshoot') && tabParam === 'my') ? (
                            <GenerationLogoGradient className={styles.mobile_navigation_button_icon} />
                            ) : (
                            <GenerationLogo className={styles.mobile_navigation_button_icon} />
                        )}
                        <span className={`${styles.mobile_navigation_button_text} ${(pathname.includes('/photoshoot') && tabParam === 'my') ? styles.mobile_navigation_button_text_active : ''}`}>
                            My Generations
                        </span>
                    </div>     
                </button>

                {/* Credits Button */}
                <button
                    className={`${styles.mobile_navigation_button} ${pathname.includes('/pricing') ? styles.mobile_nav_active_button_nav : ''}`}
                    onClick={() => {

                        if (!session?.user?.id) {
                            toggleLoginModal();
                        return;
                        } else {
                            handleMenuClick('/pricing')
                        }
                    }}
                >
                    <div className={styles.mobile_navigation_button_inner_wrapper}>
                        {pathname.includes('/pricing') ? (
                            <CreditsLogoGradient className={styles.mobile_navigation_button_icon} />
                            ) : (
                            <CreditsLogo className={styles.mobile_navigation_button_icon} />
                        )}
                        <span className={`${styles.mobile_navigation_button_text} ${pathname.includes('/pricing') ? styles.mobile_navigation_button_text_active : ''}`}>
                            More credits
                        </span>
                    </div>
                </button>

            </div>
            <LoginModal isOpen={isLoginModalOpen} onClose={toggleLoginModal} order="reverse"/>
        </>
    );
};
