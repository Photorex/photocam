'use client';
import React from 'react';
import styles from './ImageVideoSwitcher.module.css';
import { useControlMenuContext } from '@/app/context/ControlMenuContext';

import ImageIcon from '@/public/assets/icons/image-selector-icon.svg';
import VideoIcon from '@/public/assets/icons/video-selector-icon.svg';

export default function ImageVideoSwitcher() {
  const { generationMode, setGenerationMode, resetToDefault } = useControlMenuContext();

  return (
    <div className={styles.toggleWrapper}>
      <div
        className={`${styles.toggleOption} ${generationMode === 'image' ? styles.active : ''}`}
        onClick={() => {
            resetToDefault();
            setGenerationMode('image')
        }}
      >
        <ImageIcon className={styles.icon} />
        <span className={styles.label}>Image</span>
      </div>

      <div
        className={`${styles.toggleOption} ${generationMode === 'video' ? styles.active : ''}`}
        onClick={() => {
            resetToDefault();
            setGenerationMode('video')
        }}
      >
        <VideoIcon className={styles.icon} />
        <span className={styles.label}>Video</span>
      </div>
    </div>
  );
}