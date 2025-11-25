'use client';

import React from 'react';
import Image from 'next/image';

// Styles
import styles from './ImageCard.module.css';

interface ImageCardProps {
  src: string;
  alt: string;
  description: string;
}

const ImageCard: React.FC<ImageCardProps> = ({ src, alt, description }) => {
  return (
    <div className={styles.image_card_wrapper}>
      <div className={styles.image_card_image}>
        <Image src={src} alt={alt} fill className={styles.image_card_image_element} />
      </div>
      <div className={styles.image_card_description}>{description}</div>
    </div>
  );
};

export default ImageCard;