'use client';
import React, { useRef, useEffect } from 'react';

import styles from './VideoDetailsModal.module.css';

import CloseIcon from '@/public/images/icons/controller/close-icon.svg';
import SizeIcon from '@/public/assets/icons/image-details-size.svg';
import DateIcon from '@/public/assets/icons/image-details-date.svg';

import { VideoMetadata } from "@/app/lib/api/fetchUserVideos";

const USER_VIDEOS_URL = process.env.NEXT_PUBLIC_USER_VIDEOS_URL!;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  video: VideoMetadata | null;
}

export default function VideoDetailsModal({ isOpen, onClose, video }: Props) {
    const modalRef = useRef<HTMLDivElement>(null);

    const handleClose = () => {
        onClose(); // bubble up
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

    useEffect(() => {
        if (!isOpen) return;
        const { overflow } = document.body.style;
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = overflow; };
    }, [isOpen]);

    if (!isOpen || !video) return null;

    const { resolution, createdAt, res_video } = video;

    const formattedDate = createdAt
        ? new Date(createdAt).toLocaleString(undefined, {
            dateStyle: 'medium',
            timeStyle: 'short',
        })
        : 'Unknown';

    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = `${USER_VIDEOS_URL}${res_video}`;
        link.download = res_video.split('/').pop() || 'video.mp4';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className={styles.overlay}>
        <div className={styles.modal} ref={modalRef}>
            <div className={styles.content}>
            <div className={styles.imageWrapper}>
                <video
                src={`${USER_VIDEOS_URL}${res_video}`}
                //   controls
                autoPlay
                loop
                muted
                className={styles.image}
                />
            </div>

            <div className={styles.metaBox}>
                <div className={styles.header}>
                <div className={styles.metaRow}>
                    <div className={styles.metaColumn}>
                    <div className={styles.metaLabelWrapper}>
                        <SizeIcon />
                        <span className={styles.metaLabel}>Resolution</span>
                    </div>
                    <span className={styles.metaValue}>{resolution || 'Unknown'}</span>
                    </div>
                </div>

                <CloseIcon className={styles.closeIcon} onClick={handleClose} />
                </div>

                <div className={styles.metaRow}>
                <div className={styles.metaColumn}>
                    <div className={styles.metaLabelWrapper}>
                    <DateIcon />
                    <span className={styles.metaLabel}>Created date</span>
                    </div>
                    <span className={styles.metaValue}>{formattedDate}</span>
                </div>
                </div>

                <div className={styles.detailsButtonGroupWrapper}>
                <button className={styles.downloadBtn} onClick={handleDownload}>
                    Download
                </button>
                </div>

            </div>
            </div>
        </div>
        </div>
    );
}