'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import styles from './styleCardSix.module.css';
import LoginModal from '../LoginModal/LoginModal';

type Props = {
  name: string;
  images: string[];
  onGenerate?: () => void;
  onSelect?: () => void;
};

export default function StyleCardSix({ name, images, onGenerate, onSelect }: Props) {
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
        {/* LEFT SLIDER SECTION */}
        <div className={styles.leftSlider}>
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

        {/* DIVIDER LINE */}
        <div className={styles.divider} />

        {/* RIGHT STATIC BACKGROUND */}
        <div className={styles.rightImage}>
          <Image
            src="/assets/images/anime.png"
            alt="Anime Background"
            fill
            className={styles.animeImage}
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