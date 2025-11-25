'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

import Image from 'next/image';
import styles from './styleCardOne.module.css';

import LoginModal from '../LoginModal/LoginModal';

import Arrow from '@/public/assets/icons/styles-arrow-icon.svg';

import { trackGtmEvent } from '@/app/lib/analytics/google/trackGtmEvent';


type Props = {
  name: string;
  avatarSrc: string;
  images: string[];
  onGenerate?: () => void;
  onSelect?: () => void;
};

export default function StyleCardOne({ name, avatarSrc, images, onGenerate, onSelect }: Props) {
    const { data: session } = useSession();

    const [index, setIndex] = useState(0);
    const [fade, setFade] = useState(true); // true = visible

    useEffect(() => {
        const interval = setInterval(() => {
            setIndex((prev) => (prev + 1) % images.length);
        }, 5000);

        return () => clearInterval(interval);
    }, [images.length]);

    // Track whether login component should be opened
    const [isLoginModalOpen, setLoginModalOpen] = useState(false);
        
    const toggleLoginModal = () => {
        setLoginModalOpen(!isLoginModalOpen);
    };
    
    return (
        <>
            <div className={styles.card} onClick={() => {onSelect?.();}}>

                <div className={styles.bg} />
                <div className={styles.divider} />
                {/* style result (right-hand side) */}
                <div className={styles.styleImage}>
                    <div className={styles.slider}>
                        {images.map((img, i) => (
                        <Image
                            key={i}
                            src={img}
                            alt={`Slide ${i}`}
                            fill
                            sizes="(max-width:768px) 216px, 288px"
                            className={`${styles.slideImage} ${
                            i === index ? styles.active : ''
                            }`}
                            draggable={false}
                            priority
                        />
                        ))}
                    </div>
                    <div className={styles.fadeMask} />
                </div>


                {/* avatar + badge */}
                <div className={styles.avatarWrapper}>
                    <Image
                        src={avatarSrc}
                        alt="Selfie"
                        fill
                        draggable={false}
                        sizes="(max-width:768px) 120px, 160px"
                    />
                    <div className={styles.badge}>Selfie</div>
                </div>

                {/* arrow – now forced on top with z-index */}
                <Arrow className={styles.arrow} />

                {/* style name */}
                <h3 className={styles.name}>{name}</h3>

                {/* “Try” CTA */}
                <button 
                    className={styles.tryBtn}
                    onClick={e => {
                        e.stopPropagation();
                        onSelect?.();
                        // if (session?.user?.id) {
                        //     trackGtmEvent("Generate_style", {
                        //         ecommerce: { usid: session.user.id }
                        //     });
                        //     onGenerate?.();
                        // } else {
                        //     toggleLoginModal();
                        // }
                    }}
                >
                    Try
                </button>
            </div>

            <LoginModal isOpen={isLoginModalOpen} onClose={toggleLoginModal} order='default'/>
        
        </>
    );
}