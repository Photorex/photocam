"use client";

import React, { useEffect } from "react";
import { useControlMenuContext } from "@/app/context/ControlMenuContext";
import styles from "./ImageNumberOptions.module.css";

import { signIn, signOut, useSession } from 'next-auth/react';

export default function ImageNumberOptions() {

    const { data: session } = useSession();
    const { numberOfImages, setNumberOfImages } = useControlMenuContext();

    const plan = session?.user?.subscription || "Free";

    const getLimitForPlan = (plan: string): number => {
        switch (plan) {
        case "Muse":
            return 2;
        case "Glow":
            return 4;
        case "Studio":
            return 6;
        case "Icon":
            return 8;
        default:
            return 1;
        }
    };

    const limit = getLimitForPlan(plan);

    useEffect(() => {
        // If the current numberOfImages exceeds the limit (e.g. user downgraded)
        if (numberOfImages > limit) {
        setNumberOfImages(limit);
        }
    }, [limit]);

    const handleImageSelection = (num: number) => {
        if (num <= limit) {
        setNumberOfImages(num);
        }
    };

    return (
        <div className={styles.image_number_wrapper}>
        <label className={styles.image_number__options_label} htmlFor="numberOfImages">
            Number of images
        </label>

        <div className={styles.images_grid_container}>
            {Array.from({ length: 8 }, (_, index) => index + 1).map((num) => (
            <div
                key={num}
                className={`${styles.images_grid_item_wrapper} ${
                    numberOfImages === num ? styles.selected : ""
                }`}
            >
                <div
                    className={`${styles.images_grid_item} ${
                        numberOfImages === num ? styles.selected : ""
                    }`}
                    onClick={() => handleImageSelection(num)}
                >
                {num}
                </div>
            </div>
            ))}
        </div>
        </div>
    );
}