'use client';
import React from 'react';
import styles from './ImageVideoSwitcher.module.css';
import { useControlMenuContext } from '@/app/context/ControlMenuContext';

import ImageIcon from '@/public/assets/icons/image-selector-icon.svg';
import VideoIcon from '@/public/assets/icons/photo-selector-icon.svg';

export default function VideoGenerateOptionSwitcher() {
  const { 
    videoGenerationMode, 
    setVideoGenerationMode, 
    prompt, 
    setPrompt,
    userImage,
    setUserImage, 
} = useControlMenuContext();

  return (
    <div className={styles.video_mode_tab_selector}>
      <div
        className={`${styles.toggle_tab} ${videoGenerationMode === 'image' ? styles.active_tab : ''}`}
        onClick={() => setVideoGenerationMode('image')}
      >
        <span className={styles.label}>By Image</span>
      </div>

      <div
        className={`${styles.toggle_tab} ${videoGenerationMode === 'model' ? styles.active_tab : ''}`}
        onClick={() => {
            setPrompt('');
            setUserImage({image: null, imageType: ''})
            setVideoGenerationMode('model');
        }}
      >
        <span className={styles.label}>By Model</span>
      </div>
    </div>
  );
}