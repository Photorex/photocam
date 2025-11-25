"use client";

import { useRouter } from 'next/navigation';

import styles from "./UpgradeBanner.module.css";

export default function UpgradeBanner() {
    const router = useRouter();

    const goToPricing = () => router.push('/pricing');

    return (
        <div className={styles.banner_wrapper} onClick={goToPricing}>
        <div className={styles.content}>
            <h2 className={styles.title}>Get more credits</h2>
            <p className={styles.description}>
            <span className={styles.highlight}>Purchase additional credits</span> <br />
            and let your creativity flow.
            </p>
            <button className={styles.button}>More</button>
        </div>
        </div>
    );
}
