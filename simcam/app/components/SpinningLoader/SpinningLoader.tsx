'use client';

import React from 'react';
import Image from 'next/image';
import styles from './SpinningLoader.module.css';

import Logo from '@/public/images/logo/simcam-shadow.svg';
import Loader from '@/public/assets/icons/loader.svg';

interface Props {
  message: string;
}

const SpinningLoader = ({ message }: Props) => {
  return (
    <div className={styles.loaderWrapper}>
      <Logo className={styles.logo} />
      <p className={styles.text}>{message}</p>
      <Loader className={styles.loader} />
    </div>
  );
};

export default SpinningLoader;