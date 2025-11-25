'use client';

import React, { useState } from 'react';

// Next specific import
import Link from "next/link";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

// Icons import
import Logo from "@/public/images/logo/Simcam.svg";
import XIcon from "@/public/images/icons/socials/x-icon.svg";
import YouTubeIcon from "@/public/images/icons/socials/youtube-icon.svg";
import TikTokIcon from "@/public/images/icons/socials/tiktok-icon.svg";

import LoginModal from "../LoginModal/LoginModal";

// Styles import
import styles from "./footer.module.css";

export default function Footer () {
  const { data: session } = useSession();
  const router = useRouter();

    // Track whether login component should be opened
    const [isLoginModalOpen, setLoginModalOpen] = useState(false);
      
    const toggleLoginModal = () => {
          setLoginModalOpen(!isLoginModalOpen);
    };

    const handlePhotoshootClick = (
        e: React.MouseEvent<HTMLAnchorElement>
    ) => {
        if (!session) {
        e.preventDefault();
        setLoginModalOpen(true);
        }
    };

    return (
        <>
            <footer className={styles.footer}>
                <div className={styles.footer_container}>
                    <div className={styles.footer_container_wrapper}>

                        <div className={styles.footer_logo_wrapper}>
                            <Link className={styles.logo_wrapper} href="/" passHref>
                                <Logo className={styles.logo_wrapper_svg} alt="Simcam.net Logo" />
                            </Link>
                        </div>

                        <div className={styles.footer_links_wrapper}>

                            <div className={styles.footer_links}>
                                {/* <Link href="/photoshoot" onClick={handlePhotoshootClick}>
                                    Photoshoot
                                </Link> */}
                                <Link href="/faq">
                                    FAQ
                                </Link>
                                <Link href="/pricing">
                                    Pricing
                                </Link>
                                <Link href="/legal/privacy-policy" >
                                    Privacy policy
                                </Link>
                                <Link color="foreground" href="/legal/terms-of-service" >
                                    Terms of service
                                </Link>
                            </div>

                            {/* <div className={styles.footerIconLinks}>
                                <Link
                                    href="https://x.com/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={styles.footerIcon}
                                >
                                    <XIcon />
                                </Link>
                                <Link
                                    href="https://www.youtube.com/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={styles.footerIcon}
                                >
                                    <YouTubeIcon />
                                </Link>
                                <Link
                                    href="https://www.tiktok.com/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={styles.footerIcon}
                                >
                                    <TikTokIcon />
                                </Link>
                            </div> */}
                        </div>
                    </div>

                    {/* <div className={styles.footer_container_info}>
                        <div className={styles.footerText}>
                            <p className={styles.footerText_text}>
                            COMPANY NAME 
                            <br />
                            COMPANY NUMBER
                            <br />
                            COMPANY ADDRESS
                            <br />
                            COMPANY CITY, COUNTRY
                            </p>
                        </div>
                    </div> */}
                </div>
            </footer>

            <LoginModal isOpen={isLoginModalOpen} onClose={toggleLoginModal} order='default'/>
        </>
    );
};