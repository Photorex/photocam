'use client';

import React, { useState } from 'react';

// Functions import
import { useWindowSize } from "@/app/lib/hooks/useWindowSize";

//Next specific import
import Image from 'next/image';
import { Popover, PopoverTrigger, PopoverContent } from '@heroui/react';

// Import styles
import styles from './SizeOptions.module.css';

// Context
import { useControlMenuContext } from '@/app/context/ControlMenuContext';

// Icons
import ArrowRight from "@/public/images/icons/controller/arrow-right.svg";
import ArrowLeft from "@/public/images/icons/controller/arrow-left.svg";
import CloseIcon from "@/public/images/icons/controller/close-icon.svg";

// Define the exact keys of the size object
type SizeKey = "1:1" | "4:5" | "2:3" | "4:7" | "5:4" | "3:2" | "7:4";
type SizeValue = '1280x1280' | '1024x1280' | '856x1280' | '736x1280' | '1280x1024' | '1280x856' | '1280x736';

const sizes: Record<SizeKey, SizeValue> = {
  "1:1": "1280x1280",
  "4:5": "1024x1280",
  "2:3": "856x1280",
  "4:7": "736x1280",
  "5:4": "1280x1024",
  "3:2": "1280x856",
  "7:4": "1280x736",
};

export default function SizeOptions() {

    // Size variable from context
    const { size, setSize } = useControlMenuContext();
    // State to track whether sizes are open
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Get window size using custom hook
    const windowSize = useWindowSize();
    const isMobile = windowSize.width <= 1000;

    const handleSizeSelect = (key: SizeKey) => {
        setSize(sizes[key]);
        setIsMenuOpen(false);
    };

    // Image size modal content
    const SizeContent = (
        <>
            <div className={styles.size_popover_content}>

                <div className={styles.popover_content_header}>
                    <span className={styles.popover_content_header_text}>Size</span>
                    <CloseIcon 
                        className={styles.header_close} 
                        onClick={() => setIsMenuOpen(false)}
                    />
                </div>

                <div className={styles.content_spacer}></div>

                {/* Size options */}
                <div className={styles.grid_container}>
                    {Object.entries(sizes).map(([key, value]) => {
                        const [ratioW, ratioH] = key.split(':').map(Number);
                        const isSelected = size === value;

                        return (
                            <div 
                                key={key} 
                                className={styles.grid_item}
                                onClick={() => handleSizeSelect(key as SizeKey)}
                            >
                                {/* Rectangle Wrapper */}
                                <div className={`${styles.rectangle_wrapper} ${isSelected ? styles.selected : ''}`}>
                                    {/* Rectangle */}
                                    <div
                                        className={`${styles.rectangle} ${isSelected ? styles.selected : ''}`}
                                        style={{
                                            width: ratioW > ratioH ? '60%' : `${(ratioW / ratioH) * 60}%`,
                                            height: ratioH > ratioW ? '60%' : `${(ratioH / ratioW) * 60}%`,
                                        }}
                                    ></div>
                                </div>
                                <span className={styles.size_key}>{key}</span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </>
    );

    return (
        <div className={styles.size_options_wrapper}>

            <label className={styles.size_options_controls_label} htmlFor="prompt">
                Size
            </label>

            {!isMobile ? (
                <Popover
                    isOpen={isMenuOpen}
                    onOpenChange={(open) => setIsMenuOpen(open)}
                    placement="right-start"
                >
                    <PopoverTrigger>
                        <button className={`${styles.size_selector_button} ${isMenuOpen ? styles.size_selector_button_active : ''}`}>

                            <span className={styles.size_text}>{size}</span>
                            {isMenuOpen ? (
                                <ArrowLeft className={`${styles.size_arrow} ${isMenuOpen ? styles.size_arrow_active : ''}`} />
                            ) : (
                                <ArrowRight className={styles.size_arrow} />
                            )}
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

                        <span className={styles.size_text}>{size}</span>
                        {isMenuOpen ? (
                            <ArrowLeft className={`${styles.size_arrow} ${isMenuOpen ? styles.size_arrow_active : ''}`} />
                        ) : (
                            <ArrowRight className={styles.size_arrow} />
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