'use client';

import React from 'react';

//Next specific import
import Image from 'next/image';

// Import icons
import LikeIcon from "@/public/images/icons/controller/like-icon.svg";

// Import styles
import styles from './styles/ModelGridItem.module.css';

interface ModelGridItemProps {
  model: {
    name: string;
    image: string;
    category: string;
  };
  isSelected: boolean;
  onClick: () => void;
  onLikeToggle?: () => void;
  isFavorite?: boolean;
}

export default function ModelGridItem({
  model,
  isSelected,
  onClick,
  onLikeToggle,
  isFavorite = false,
}: ModelGridItemProps) {
  return (
    <div className={styles.select_model} onClick={onClick}>
      <div className={`${styles.select_model_item} ${
            isSelected ? styles.select_model_checked : ''
          }`}>
        <Image className={styles.select_model_image} src={model.image} alt={model.name} layout="fill" objectFit="cover" />
        <div className={styles.select_model_info}>
            <span className={styles.select_checked_icon}>XL</span>
          <div className={styles.select_model_name}>
            {model.name}
          </div>
          <div className={styles.select_like_model}>
            <div className={styles.select_like_button_wrapper}>
              <button
                className={`${styles.button_btn_like} ${styles.button_transparent_like}`}
                onClick={(e) => {
                  e.stopPropagation(); // Prevent the parent click handler
                  onLikeToggle?.();
                }}
              >
                 <LikeIcon 
                    className={styles.like_icon} 
                    fill={isFavorite ? 'red' : 'none'}
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}