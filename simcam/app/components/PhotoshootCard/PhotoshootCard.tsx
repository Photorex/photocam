'use client';

import React, { useState } from 'react';
import styles from './PhotoshootCard.module.css';
import Image from 'next/image';
import CheckmarkIcon from '@/public//assets/icons/checked-icon.svg';

import LoginModal from '../LoginModal/LoginModal';

import { useSession } from 'next-auth/react';

import { trackGtmEvent } from '@/app/lib/analytics/google/trackGtmEvent';

interface PhotoshootCardProps {
    type: string;
    imageSrc: string;
    isSelected: boolean;
    onClick: () => void;
    onDetailsClick: () => void;
    onGenerate?: () => void;
    showGenerateButton?: boolean;
    onChooseClick?: () => void;
    showChooseButton?: boolean;
    showControls?: boolean;

}

export default function PhotoshootCard({
    type,
    imageSrc,
    isSelected,
    onClick,
    onDetailsClick,
    onGenerate,
    showGenerateButton = true,
    onChooseClick,
    showChooseButton = false,
    showControls  = true,
}: PhotoshootCardProps) {

    const { data: session } = useSession();

    // Track whether login component should be opened
    const [isLoginModalOpen, setLoginModalOpen] = useState(false);
    
    const toggleLoginModal = () => {
        setLoginModalOpen(!isLoginModalOpen);
    };
    
    return (
        <>
        <div
            className={`${styles.cardWrapper} ${isSelected ? styles.cardWrapperSelected : ''}`}
            onClick={onClick}
        >
            <div className={styles.cardInner}>
                <div className={styles.imageWrapper}>
                    <Image
                        src={imageSrc}
                        alt={type}
                        fill
                        draggable={false}
                        className={styles.image}
                        sizes="(max-width: 1000px) 100vw, 33vw"
                    />

                    {isSelected && (
                        <div className={styles.checkmark}>
                        <CheckmarkIcon />
                        </div>
                    )}

                    <div className={styles.overlay}>
                        <div className={styles.overlayContent}>
                            <div 
                                className={`${styles.typeLabel} ${isSelected ? styles.typeLabelSelected : ''}`}
                            >
                                {type}
                            </div>

                            {/* Only show on hover for desktop, always show for mobile */}
                            {showControls && (
                                <div className={styles.actionsWrapper}>
                                    <div className={styles.actions}>
                                        {showGenerateButton && (
                                            <button
                                                className={styles.generate}
                                                onClick={e => {
                                                    e.stopPropagation();
                                                    if (session?.user?.id) {
                                                        trackGtmEvent("Generate_style", {
                                                            ecommerce: { usid: session.user.id }
                                                        });
                                                        // console.log('Generate_style gtm sent');
                                                        onGenerate?.();
                                                    } else {
                                                        toggleLoginModal();
                                                    }
                                                }}
                                            >
                                                Generate
                                            </button>
                                        )}

                                        {!showChooseButton && (
                                            <button
                                                className={`${styles.details} ${!showGenerateButton ? styles.detailsFull : ''}`}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onDetailsClick();
                                                }}
                                            >
                                                Details
                                            </button>
                                        )}

                                        {showChooseButton && (
                                            <button
                                                className={`${styles.details} ${!showChooseButton ? styles.detailsFull : ''}`}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onChooseClick?.();
                                                }}
                                            >
                                                Choose
                                            </button>
                                        )}
                            
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>            
        </div>
        
        <LoginModal isOpen={isLoginModalOpen} onClose={toggleLoginModal} order='default'/>
        
        </>
    );
}