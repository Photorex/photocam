'use client';
import React, { useRef, useEffect, useState } from 'react';

import styles from './ImageDetailsModal.module.css';

import CloseIcon from '@/public/images/icons/controller/close-icon.svg';
import CopyIcon from '@/public/images/icons/controller/copy-icon.svg'; 
import SizeIcon from '@/public/assets/icons/image-details-size.svg';
import ModelIcon from '@/public/assets/icons/image-details-model.svg';
import DateIcon from '@/public/assets/icons/image-details-date.svg';

import { eventBus } from '@/app/lib/event/eventBus';

import { useControlMenuContext } from '@/app/context/ControlMenuContext';

import { ImageMetadata } from "@/app/lib/api/fetchUserImages";

const USER_IMAGES_URL = process.env.NEXT_PUBLIC_USER_IMAGES_URL!;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  image: ImageMetadata | null;
}

export default function ImageDetailsModal({ isOpen, onClose, image }: Props) {
    const modalRef = useRef<HTMLDivElement>(null);

    const { 
        userImage,
        setUserImage,
        generationMode,
        setGenerationMode,
        videoGenerationMode,
        setVideoGenerationMode,
        prompt,
        setPrompt
     } = useControlMenuContext();

    const [videoPrompt, setVideoPrompt] = useState('');
    const handleClose = () => {
        setVideoPrompt('');          // reset
        onClose();                   // bubble up
    };

    useEffect(() => {
        const handleOutsideClick = (event: MouseEvent) => {
        if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
            handleClose();
        }
        };
        document.addEventListener("mousedown", handleOutsideClick);
        return () => document.removeEventListener("mousedown", handleOutsideClick);
    }, []);

    /* 🔒 LOCK / UNLOCK PAGE SCROLLING */
    useEffect(() => {
        if (!isOpen) return;                 // do nothing if modal closed
        const { overflow } = document.body.style;
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = overflow; };
    }, [isOpen]);

    if (!isOpen || !image) return null;

    const { size, model, createdAt, res_image } = image;

    const formattedDate = createdAt
        ? new Date(createdAt).toLocaleString(undefined, {
            dateStyle: 'medium',
            timeStyle: 'short',
        })
        : 'Unknown';

    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = `${USER_IMAGES_URL}${res_image}`;
        link.download = res_image.split('/').pop() || 'image.jpg';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleGenerateVideo = async () => {
        if (!image) return;

        const imageUrl = `${USER_IMAGES_URL}${image.res_image}`;
        try {
            const blob   = await (await fetch(imageUrl)).blob();
            const reader = new FileReader();

            reader.onloadend = () => {
            /* tell Controls EVERYTHING we need */
            eventBus.dispatchEvent(
                new CustomEvent('photoshoot-video-from-image', {
                detail: {
                    imageB64 : reader.result as string,      
                    prompt   : 'Animate image, add movement',
                }
                })
            );
            onClose();
            };

            reader.readAsDataURL(blob);
        } catch (err) {
            console.error('Image load failed:', err);
        }
    };

    return (
        <div className={styles.overlay}>
        <div className={styles.modal} ref={modalRef}>
            <div className={styles.content}>
            <div className={styles.imageWrapper}>
                <img
                src={`${USER_IMAGES_URL}${res_image}`}
                alt="Generated"
                className={styles.image}
                />
            </div>

            <div className={styles.metaBox}>
                <div className={styles.header}>

                    <div className={styles.metaRow}>
                        <div className={styles.metaColumn}>
                            <div className={styles.metaLabelWrapper}>
                            <SizeIcon />
                            <span className={styles.metaLabel}>Size</span>
                            </div>
                            <span className={styles.metaValue}>{size || 'Unknown'}</span>
                        </div>
                    </div>

                    <CloseIcon className={styles.closeIcon} onClick={handleClose} />
                </div>

                {/* ё */}

                {/* <div className={styles.metaRow}>
                <div className={styles.metaColumn}>
                    <div className={styles.metaLabelWrapper}>
                    <ModelIcon />
                    <span className={styles.metaLabel}>Model</span>
                    </div>
                    <span className={styles.metaValue}>{model || 'Unknown'}</span>
                </div>
                </div> */}

                {/* <div className={styles.metaRow}>
                <div className={styles.metaColumn}>
                    <div className={styles.metaLabelWrapper}>
                    <DateIcon />
                    <span className={styles.metaLabel}>Created date</span>
                    </div>
                    <span className={styles.metaValue}>{formattedDate}</span>
                </div>
                </div> */}

                <div className={styles.detailsButtonGroupWrapper}>
                    <button className={styles.videoGenBtn} onClick={handleGenerateVideo}>
                        Generate video
                    </button>
                    <button className={styles.downloadBtn} onClick={handleDownload}>
                        Download
                    </button>
                </div>

                {/* <div className={styles.dualButtonRow}>
                <div className={styles.gradientWrapper}>
                    <button className={styles.innerButton}>Reuse Image</button>
                </div>
                <div className={styles.gradientWrapper}>
                    <button className={styles.innerButton}>Generate Similar</button>
                </div>
                </div> */}
            </div>
            </div>
        </div>
        </div>
    );
}