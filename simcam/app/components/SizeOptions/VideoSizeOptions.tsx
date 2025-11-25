'use client';

import React, { useState } from 'react';
import { useWindowSize } from "@/app/lib/hooks/useWindowSize";
import { Popover, PopoverTrigger, PopoverContent } from '@heroui/react';

import styles from './SizeOptions.module.css';
import { useControlMenuContext } from '@/app/context/ControlMenuContext';

import ArrowRight from '@/public/images/icons/controller/arrow-right.svg';
import ArrowLeft from '@/public/images/icons/controller/arrow-left.svg';
import CloseIcon from '@/public/images/icons/controller/close-icon.svg';

type VideoSizeKey = '1:1' | '9:16' | '16:9';
type VideoSizeValue = '1024x1024' | '576x1024' | '1024x576';

const videoSizes: Record<VideoSizeKey, VideoSizeValue> = {
  '1:1': '1024x1024',
  '9:16': '576x1024',
  '16:9': '1024x576',
};

export default function VideoSizeOptions() {
  const { videoSize, setVideoSize } = useControlMenuContext();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const windowSize = useWindowSize();
  const isMobile = windowSize.width <= 1000;

  const handleSelect = (key: VideoSizeKey) => {
    setVideoSize(key);
    setIsMenuOpen(false);
  };

  const SizeContent = (
    <div className={styles.size_popover_content}>
      <div className={styles.popover_content_header}>
        <span className={styles.popover_content_header_text}>Video Size</span>
        <CloseIcon className={styles.header_close} onClick={() => setIsMenuOpen(false)} />
      </div>
      <div className={styles.content_spacer}></div>

      <div className={styles.video_grid_container}>
        {Object.entries(videoSizes).map(([key, resolution]) => {
          const isSelected = videoSize === key;
          const [w, h] = resolution.split('x').map(Number);
          const ratio = w / h;

          return (
            <div
              key={key}
              className={styles.video_grid_item}
              onClick={() => handleSelect(key as VideoSizeKey)}
            >
              <div className={`${styles.video_rectangle_wrapper} ${isSelected ? styles.selected : ''}`}>
                <div
                  className={`${styles.video_rectangle} ${isSelected ? styles.selected : ''}`}
                  style={{
                    aspectRatio: `${w} / ${h}`,
                    width: ratio >= 1 ? '80%' : `${ratio * 80}%`,
                    height: ratio < 1 ? '80%' : `${(1 / ratio) * 80}%`,
                  }}
                />
              </div>
              <span className={styles.size_key}>{key}</span>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className={styles.size_options_wrapper}>
      <label className={styles.size_options_controls_label} htmlFor="videoSize">Video Size</label>

      {!isMobile ? (
        <Popover
          isOpen={isMenuOpen}
          onOpenChange={(open) => setIsMenuOpen(open)}
          placement="right-start"
        >
          <PopoverTrigger>
            <button className={`${styles.size_selector_button} ${isMenuOpen ? styles.size_selector_button_active : ''}`}>
              <span className={styles.size_text}>{videoSize}</span>
              {isMenuOpen
                ? <ArrowLeft className={`${styles.size_arrow} ${styles.size_arrow_active}`} />
                : <ArrowRight className={styles.size_arrow} />}
            </button>
          </PopoverTrigger>
          <PopoverContent className={styles.model_popover_content_wrapper}>
            {SizeContent}
          </PopoverContent>
        </Popover>
      ) : (
        <>
          <button
            className={`${styles.size_selector_button} ${isMenuOpen ? styles.size_selector_button_active : ''}`}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <span className={styles.size_text}>{videoSize}</span>
            {isMenuOpen
              ? <ArrowLeft className={`${styles.size_arrow} ${styles.size_arrow_active}`} />
              : <ArrowRight className={styles.size_arrow} />}
          </button>
          {isMenuOpen && (
            <div
              className={styles.modal_backdrop}
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  setIsMenuOpen(false);
                }
              }}
            >
              <div className={styles.size_modal}>
                {SizeContent}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}