'use client';

import React, { useState } from 'react';

// HeroUI
import { Tooltip } from '@heroui/react';

// Icons
import QuestionIcon from '@/public/images/icons/controller/question-icon.svg';

// Styles
import styles from './Slider.module.css';
import { label } from 'framer-motion/client';

interface CustomSliderProps {
    value: number;
    onValueChange: (value: number) => void;
    sliderHeight?: number; // Slider height in pixels
    thumbDiameter?: number; // Radius of the slider thumb in pixels
    min?: number; // Minimum slider value
    max?: number; // Maximum slider value
    step?: number; // Step value for the slider (default is 1)
    decimal?: boolean; // Enable decimal stepping (default false)
    showDescription?: boolean; // Whether to show the description tooltip for slider
    description?: string; // Description text for the tooltip
    showValue?: boolean; // Whether to show the current value
    label?: string;
    showLabel?: boolean;
    color?: string;
    fontSize?: string;
    descriptionOffset?: string;
    valueMap?: Record<number, string>;
    showValueMap?: boolean;
}

export default function CustomSlider({
    value,
    onValueChange,
    sliderHeight = 10,
    thumbDiameter = 15,
    min = 0,
    max = 100,
    step = 1,
    decimal = false,
    showDescription = false,
    description = '',
    showValue = false,
    label = '',
    showLabel = false,
    color,
    fontSize,
    descriptionOffset,
    valueMap,
    showValueMap,
}: CustomSliderProps) {
    const [isDescriptionOpen, setIsDescriptionOpen] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = decimal
            ? parseFloat(Number(e.target.value).toFixed(2)) // Round to 2 decimal places
            : Number(e.target.value);
        onValueChange(newValue); // ✅ Directly update the parent state
    };

    return (
        <div className={styles.slidecontainer_wrapper}>
            <div className={styles.slidecontainer_description}>
                {showLabel && (
                    <label 
                        htmlFor="slider" 
                        className={styles.slidecontainer_description_label}
                        style={{ color: color || "inherit", fontSize: fontSize || "var(--font-regular-small)" }}
                    >
                        
                        {label}

                        {showDescription && description && (
                            <Tooltip
                                placement="right-start"
                                content={
                                    <div className={styles.slidecontainer_description_info}>{description}</div>
                                }
                                isOpen={isDescriptionOpen}
                                className={styles.slidecontainer_description_label_tooltip}
                            >
                                <button
                                    className={styles.slidecontainer_description_label_tooltip_btn}
                                    onMouseEnter={() => setIsDescriptionOpen(true)}
                                    onMouseLeave={() => setIsDescriptionOpen(false)}
                                    onClick={() => setIsDescriptionOpen(!isDescriptionOpen)}
                                >
                                    <QuestionIcon 
                                        className={styles.slidecontainer_description_label_icon} 
                                        style={{
                                            ...(color ? { color: color } : {}), 
                                            ...(descriptionOffset ? { top: descriptionOffset } : {})
                                        }}
                                    />
                                </button>
                            </Tooltip>
                        )}
                    </label>
                )}

                {showValue && (
                <div className={styles.slidecontainer_description_value}>
                    {showValueMap && valueMap ? valueMap[value] : value}
                </div>
                )}

            </div>

            <div className={styles.slidecontainer}>
                <input
                    type="range"
                    id="slider"
                    min={min}
                    max={max}
                    value={value}
                    step={decimal ? step : Math.round(step)} // Use step for decimal or rounded step for integers
                    className={styles.slider}
                    style={{
                        '--slider-height': `${sliderHeight}px`,
                        '--thumb-width': `${thumbDiameter}px`,
                        '--thumb-height': `${thumbDiameter}px`,
                        '--thumb-radius': `${thumbDiameter / 2}px`,
                        '--slider-progress': `${((value  - min) / (max - min)) * 100}`,
                    } as React.CSSProperties}
                    onChange={handleChange}
                />
            </div>
        </div>
    );
}