"use client";

import Link from "next/link";

import styles from "./not-found.module.css";
import ArrowIcon from "@/public/images/icons/arrow-icon.svg";

// import Footer from "@/components/Footer";

export default function NotFoundPage() {
    return (
        <div className={styles.not_found_page}>
            <div className={styles.not_found_content}>
                <h6 className={styles.not_found_code}>Error Code: 404</h6>
                <h1 className={styles.not_found_title}>Page not found!</h1>
                <h2 className={styles.not_found_subtitle}>
                    Sorry, we could not find the page you are looking for. <br />
                    Go to the homepage to view all our AI tools.
                </h2>
                <div className={styles.not_found_cta}>
                    <div className={`${styles.form_btn} ${styles.form_center}`}>
                        <div className={styles.button}>
                            <Link
                                className={styles.button_btn}
                                href="/"
                            >
                                Go to home page
                                <ArrowIcon className={styles.arrow_icon} />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
            {/* <Footer /> */}
        </div>
    );
}