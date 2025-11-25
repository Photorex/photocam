'use client';

import React, { useState } from 'react';

// Context
import { useControlMenuContext } from '@/app/context/ControlMenuContext';

// NextUi
import { Popover, PopoverTrigger, PopoverContent } from '@heroui/react';

// Icons
import ArrowRight from "@/public/images/icons/controller/arrow-right.svg";
import ArrowLeft from "@/public/images/icons/controller/arrow-left.svg";
import CloseIcon from "@/public/images/icons/controller/close-icon.svg";

// Import styles
import styles from './ResolutionOptions.module.css';

// Functions import
import { useWindowSize } from "@/app/lib/hooks/useWindowSize";

type UpscaleKey = 'None' | '2x' | '4x';
type UpscaleType = 'HD' | '2K' | '4K';

const upscaleLabels: Record<UpscaleKey, UpscaleType> = {
    "None": "HD",
    "2x": "2K",
    "4x": "4K",
};

export default function ResolutionOptions() {

    // Upscale variable from context
    const { upscale, setUpscale } = useControlMenuContext();
    // State to track whether sizes are open
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Get window size using custom hook
    const windowSize = useWindowSize();
    const isMobile = windowSize.width <= 1000;

    const handleUpscaleSelect = (key: UpscaleKey) => {
        setUpscale(key);
        setIsMenuOpen(false);
    };

    const ResolutionContent = (
        <div className={styles.resolution_popover_content}>

            <div className={styles.popover_content_header}>
                <span className={styles.popover_content_header_text}>Resolution</span>
                <CloseIcon
                    className={styles.header_close}
                    onClick={() => setIsMenuOpen(false)}
                />
            </div>

            <div className={styles.content_spacer}></div>


            <div className={styles.resolution_grid_container}>
                {Object.entries(upscaleLabels).map(([key, label]) => {
                const isSelected = upscale === key;
                    return (
                        <div
                            key={key}
                            className={`${styles.resolution_grid_item} ${isSelected ? styles.selected : ''}`}
                            onClick={() => handleUpscaleSelect(key as UpscaleKey)}
                        >
                            <span className={`${styles.resolution_text} ${isSelected ? styles.selected : ''}`}>{label}</span>
                        </div>
                    );
                })}
            </div>

        </div>
    );

    return (
        <div className={styles.resolution_options_wrapper}>

            <label className={styles.resolution_options_label} htmlFor="resolution">
                Resolution
            </label>

            {!isMobile ? (
                <Popover
                    isOpen={isMenuOpen}
                    onOpenChange={(open) => setIsMenuOpen(open)}
                    placement="right-start"
                >
                    <PopoverTrigger>
                        <button
                            className={`${styles.resolution_options_button} ${
                            isMenuOpen ? styles.resolution_options_button_active : ''
                            }`}
                        >
                            <span className={styles.resolution_button_text}>{upscaleLabels[upscale]}</span>
                            {isMenuOpen ? (
                            <ArrowLeft
                                className={`${styles.resolution_button_arrow} ${
                                isMenuOpen ? styles.resolution_button_arrow_active : ''
                                }`}
                            />
                            ) : (
                            <ArrowRight className={styles.resolution_button_arrow} />
                            )}
                        </button>
                    </PopoverTrigger>
                    <PopoverContent className={styles.resolution_popover_content_wrapper}>
                        {ResolutionContent}
                    </PopoverContent>
                </Popover>
            ) : ( 
                <>
                    <button
                        className={`${styles.resolution_options_button} ${isMenuOpen ? styles.resolution_options_button_active : ''}`}
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >

                        <span className={styles.resolution_button_text}>{upscaleLabels[upscale]}</span>
                        {isMenuOpen ? (
                            <ArrowLeft
                                className={`${styles.resolution_button_arrow} ${
                                isMenuOpen ? styles.resolution_button_arrow_active : ''
                                }`}
                            />
                        ) : (
                            <ArrowRight className={styles.resolution_button_arrow} />
                        )}
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
                            <div className={styles.resolution_modal}>
                                {ResolutionContent}
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}