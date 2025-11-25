'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';

import styles from './styleCardTwo.module.css';
import LoginModal from '../LoginModal/LoginModal';

type Props = {
  name: string;
  images: string[];
  onGenerate?: () => void;
  onSelect?: () => void;
};

export default function StyleCardTwo({ name, images, onGenerate, onSelect }: Props) {
  const { data: session } = useSession();

  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState(true);
  const [isLoginModalOpen, setLoginModalOpen] = useState(false);

  const toggleLoginModal = () => setLoginModalOpen(!isLoginModalOpen);

  useEffect(() => {
    const interval = setInterval(() => {
        setIndex((prev) => (prev + 1) % 2); // only two states
    }, 5000);

    return () => clearInterval(interval);
    }, []);

  return (
    <>
      <div className={styles.card} onClick={() => onSelect?.()}>
        {/* Left image section */}
        <div className={styles.leftImage}>
        <div className={styles.slider}>
            {[images[0], images[1]].map((img, i) => (
            <Image
                key={`left-${i}`}
                src={img}
                alt="Left preview"
                fill
                sizes="(max-width: 768px) 50vw, 226px"
                className={`${styles.slideImage} ${i === index ? styles.active : ''}`}
                draggable={false}
                priority
            />
            ))}
        </div>
        </div>

        {/* Right image section */}
        <div className={styles.rightImage}>
        <div className={styles.slider}>
            {[images[2], images[3]].map((img, i) => (
            <Image
                key={`right-${i}`}
                src={img}
                alt="Right preview"
                fill
                sizes="(max-width: 768px) 50vw, 226px"
                className={`${styles.slideImage} ${i === index ? styles.active : ''}`}
                draggable={false}
                priority
            />
            ))}
        </div>
        </div>

        {/* Shimmer GIF */}
        <div className={styles.shimmerOverlay}>
          <Image
            src="/animation/shimmer.gif"
            alt="Shimmer"
            fill
            style={{ objectFit: 'cover' }}
            priority
            draggable={false}
          />
        </div>

        {/* Divider line */}
        <div className={styles.divider}></div>

        {/* Type name */}
        <h3 className={styles.name}>{name}</h3>

        {/* Try button */}
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