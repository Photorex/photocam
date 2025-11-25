'use client';

import React, { useRef, useState } from 'react';
import styles from './UpscaleHelpBanner.module.css';

import UpscaleExample from '@/public/assets/images/upscale-example.png';
import Image from 'next/image';

export default function UpscaleHelpBanner() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [sliderX, setSliderX] = useState(50); // in %

  const updateSlider = (clientX: number) => {
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    let x = ((clientX - rect.left) / rect.width) * 100;
    x = Math.max(0, Math.min(100, x));
    setSliderX(x);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    updateSlider(e.clientX);

    const onMove = (e: MouseEvent) => updateSlider(e.clientX);
    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    updateSlider(e.touches[0].clientX);

    const onMove = (e: TouchEvent) => updateSlider(e.touches[0].clientX);
    const onEnd = () => {
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onEnd);
    };

    window.addEventListener('touchmove', onMove);
    window.addEventListener('touchend', onEnd);
  };

  return (
    <div className={styles.banner_wrapper}>
      <p>
        <span className={styles.step_badge}>"STEP 1"</span> <br />
        <span className={styles.step_text}>
          &nbsp;Make sure the image is of acceptable original quality (avoid overly blurry or highly compressed files).
        </span>
      </p>

      <p>
        <span className={styles.step_badge}>"STEP 2"</span> <br />
        <span className={styles.step_text}>
          &nbsp;In <span className={styles.highlight}>UPLOAD A PHOTO</span> field write what you wish to be generated on picture.
        </span>
      </p>

      <div
        ref={containerRef}
        className={styles.example_wrapper}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        <Image
          src={UpscaleExample}
          alt="Upscale Preview"
          className={styles.example_image}
          priority
        />
        <div
          className={styles.blur_overlay}
          style={{ width: `${sliderX}%` }}
        />
        <div className={styles.slider_line} style={{ left: `${sliderX}%` }}>
          <div className={styles.slider_dot} />
        </div>
      </div>
    </div>
  );
}