'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import styles from './styleCardFour.module.css';
import LoginModal from '../LoginModal/LoginModal';

type Props = {
  name: string;
  images: string[];
  onGenerate?: () => void;
  onSelect?: () => void;
};

export default function StyleCardFour({ name, images, onGenerate, onSelect }: Props) {
  const [index, setIndex] = useState(0);
  const [isLoginModalOpen, setLoginModalOpen] = useState(false);
  const toggleLoginModal = () => setLoginModalOpen(!isLoginModalOpen);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <>
      <div className={styles.card} onClick={() => onSelect?.()}>
        {/* LEFT SIDE BACKGROUND + KPOP PNG */}
        <div className={styles.leftSection}>
            <div className={styles.kpopWrapper}>
                <Image
                src="/assets/images/kpop.png"
                alt="Kpop Logo"
                width={200}
                height={120}
                className={styles.kpopImage}
                draggable={false}
                priority
                />
                <div className={styles.kpopGradient} />
            </div>
        </div>

        {/* DIVIDER */}
        <div className={styles.divider} />

        {/* RIGHT SLIDING IMAGE SECTION */}
        <div className={styles.styleImage}>
          <div className={styles.slider}>
            {images.map((img, i) => (
              <Image
                key={i}
                src={img}
                alt={`Slide ${i}`}
                fill
                sizes="(max-width:768px) 216px, 288px"
                className={`${styles.slideImage} ${i === index ? styles.active : ''}`}
                draggable={false}
                priority
              />
            ))}
          </div>
        </div>

        {/* OVERLAY GIF */}
        <div className={styles.gifOverlay}>
          <Image
            src="/animation/kpop.gif"
            alt="Kpop Shimmer"
            fill
            style={{ objectFit: 'cover' }}
            draggable={false}
            priority
          />
        </div>

        {/* HEADER + BUTTON */}
        <h3 className={styles.name}>{name}</h3>
        <button
          className={styles.tryBtn}
          onClick={(e) => {
            e.stopPropagation();
            onSelect?.();
          }}
        >
          Try
        </button>
      </div>

      <LoginModal isOpen={isLoginModalOpen} onClose={toggleLoginModal} order="default" />
    </>
  );
}