'use client';

import React, { useState, useRef, useEffect, forwardRef } from 'react';
import { Tooltip, Spinner } from '@heroui/react';
import styles from './GeneratedVideo.module.css'; // Reuse the same styles

import HeartIcon from '@/public/assets/icons/heart-icon.svg';
import DownloadIcon from '@/public/assets/icons/download-icon.svg';
import MoreIcon from '@/public/assets/icons/more-icon.svg';
import DeleteIcon from '@/public/assets/icons/delete-icon.svg';
import DetailsIcon from '@/public/assets/icons/details-icon.svg';

import Loader from '@/public/assets/icons/loader.svg';
interface GeneratedVideoProps {
  src: string;
  status: 'ready' | 'generating' | 'failed';
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onDelete: () => void;
  onClickDetails: () => void;
  downloadName?: string;
}

const GeneratedVideo = forwardRef<HTMLDivElement, GeneratedVideoProps>(({
  src,
  status,
  isFavorite,
  onToggleFavorite,
  onDelete,
  onClickDetails,
  downloadName,
}, ref) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isActionOpen, setIsActionOpen] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleToggleActions = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setIsActionOpen(!isActionOpen);
  };

  const handleActionButtonClicked = () => {
    setIsActionOpen(false);
  };

  const handleMouseLeave = () => {
    if (isActionOpen) setIsActionOpen(false);
  };

  const showVideo = status === 'ready' && isLoaded;

  return (
    <div
      onClick={onClickDetails}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        handleMouseLeave();
      }}
      className={styles.image_container}
      ref={ref}
    >
      {!showVideo && (
        <div className={styles.image_spinner}>
          <Loader className={styles.loader} />
        </div>
      )}

      <video
        ref={videoRef}
        src={src}
        // controls
        autoPlay
        loop
        muted
        playsInline
        onLoadedData={() => setIsLoaded(true)}
        onError={() => setIsLoaded(false)}
        className={styles.image}
        style={{ display: showVideo ? 'block' : 'none' }}
      />

      {showVideo && (
        <div
          className={styles.image_img_hover}
          style={{ display: (isMobile || isHovered || isActionOpen) ? 'block' : 'none' }}
        >
          <div className={styles.img_button_group_wrapper}>
            <div className={styles.image_img_hover_row}>
              <div className={styles.image_btn_group}>
                <Tooltip placement="bottom-start" className={`${styles.tooltip_content} ${styles.empty_tooltip_content}`}>
                  <button
                    className={styles.image_btn}
                    onClick={async (e) => {
                      e.stopPropagation();
                      await onToggleFavorite();
                    }}
                  >
                    <HeartIcon
                      width={20}
                      height={20}
                      style={{
                        fill: isFavorite ? 'red' : 'none',
                        stroke: isFavorite ? 'red' : 'white',
                      }}
                    />
                  </button>
                </Tooltip>

                <Tooltip placement="bottom-start" className={`${styles.tooltip_content} ${styles.empty_tooltip_content}`}>
                  <button
                    className={styles.image_btn}
                    onClick={async (e) => {
                      e.stopPropagation();
                      await onDelete();
                    }}
                  >
                    <DeleteIcon />
                  </button>
                </Tooltip>
              </div>

              <Tooltip
                placement="bottom-end"
                className={styles.actions_tooltip_content}
                isOpen={isActionOpen}
                content={
                  <div className={styles.image_actions} onClick={(e) => e.stopPropagation()}>
                    <a
                      href={src}
                      download={downloadName}
                      className={styles.image_actions_btn}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleActionButtonClicked();
                      }}
                    >
                      <DownloadIcon width={20} height={20} />
                      Download
                    </a>
                    <button
                      className={styles.image_actions_btn}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleActionButtonClicked();
                        onClickDetails();
                      }}
                    >
                      <DetailsIcon width={20} height={20} />
                      View Details
                    </button>
                    <button
                      className={styles.image_actions_btn}
                      onClick={async (e) => {
                        e.stopPropagation();
                        handleActionButtonClicked();
                        await onDelete();
                      }}
                    >
                      <DeleteIcon width={20} height={20} />
                      Delete
                    </button>
                  </div>
                }
              >
                <button className={styles.image_btn} onClick={handleToggleActions}>
                  <MoreIcon width={20} height={20} />
                </button>
              </Tooltip>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

GeneratedVideo.displayName = 'GeneratedVideo';
export default GeneratedVideo;