'use client';

import React, { useState, useRef, useEffect } from "react";

import Image from "next/image";

import { useControlMenuContext } from "@/app/context/ControlMenuContext";

import CloseIcon from '@/public/images/icons/controller/close-icon.svg';

import styles from './ModelDetailsModal.module.css';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    type: string;
    gender: 'Male' | 'Female';
    mainImage: string;
    additionalImages: string[];
    showGenerateButton?: boolean;
    onGenerate?: () => void;
}

export default function ModelDetailsModal({ 
    isOpen, 
    onClose, 
    type, 
    gender, 
    mainImage, 
    additionalImages,
    showGenerateButton = true,
    onGenerate,
}: Props) {

    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleOutsideClick = (event: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        document.addEventListener("mousedown", handleOutsideClick);
        return () => document.removeEventListener("mousedown", handleOutsideClick);
    }, [onClose]);

    if (!isOpen) return null;

    return (
        <div className={styles.overlay}>
            <div className={styles.modal} ref={modalRef}>
                <div className={styles.popover_content_header}>
                    <CloseIcon 
                        className={styles.header_close} 
                        onClick={onClose}
                    />
                </div>
                
                <div className={styles.modelDetailsContent}>
                    <div className={styles.modelDetailsContentHeadWrapper}>
                        <div className={styles.previewImageWrapper}>
                            <Image
                                src={mainImage}
                                alt={type}
                                width={184}
                                height={230}
                                className={styles.previewImage}
                            />
                        </div>

                        <div className={styles.detailsColumn}>

                            <div className={styles.detailsHeaderWrapper}>
                                <div className={styles.detailsTitle}>{type}</div>
                                <div className={styles.detailsDescription}>
                                    Generate unique images in your chosen style! Get inspired by creative solutions — in just seconds, you'll receive <span className={styles.pinkHighlight}>6 custom-made options.</span> Click to get started!
                                </div>
                            </div>
                            
                            {showGenerateButton && (
                                <button 
                                    className={styles.generateButton}
                                    onClick={() => {
                                        onGenerate?.();
                                        onClose();
                                    }}
                                >
                                    Generate
                                </button>
                            )}

                        </div>
                    </div>

                    <div className={styles.content_spacer}></div>

                    <div className={styles.additionalImagesSection}>
                        <div className={styles.additionalImagesTitle}>Other photos from this collection</div>
                        <div className={styles.additionalImagesRow}>
                            {additionalImages.map((imgSrc, idx) => (
                                <div key={idx} className={styles.additionalImageWrapper}>
                                    <Image
                                        src={imgSrc}
                                        alt={`Additional ${idx}`}
                                        width={184}
                                        height={250}
                                        className={styles.additionalImage}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}
