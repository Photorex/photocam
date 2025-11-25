'use client';

import React, { useState } from 'react';

// Context
import { useControlMenuContext } from '@/app/context/ControlMenuContext';

// HeroUI
import { Popover, PopoverTrigger, PopoverContent } from '@heroui/react';
import { Tooltip } from '@heroui/react';

// Icons
import ArrowRight from "@/public/images/icons/controller/arrow-right.svg";
import ArrowLeft from "@/public/images/icons/controller/arrow-left.svg";
import CloseIcon from "@/public/images/icons/controller/close-icon.svg";
import QuestionIcon from '@/public/images/icons/controller/question-icon.svg';
import WeightsLiteIcon from "@/public/images/icons/controller/weights-lite-icon.svg";
import WeightsProIcon from "@/public/images/icons/controller/weights-pro-icon.svg";

// Import styles
import styles from './WeightInterpretatorOptions.module.css';

// Functions import
import { useWindowSize } from "@/app/lib/hooks/useWindowSize";

type WeightsInterpretatorType = 'Lite' | 'Pro';

export default function WeightsInterpretatorOptions() {

    // Upscale variable from context
    const { weights_interpretator, setWeightsInterpretator } = useControlMenuContext();
    // State to track whether sizes are open
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Get window size using custom hook
    const windowSize = useWindowSize();
    const isMobile = windowSize.width <= 1000;

    // Track if description should be shown
    const [isDescriptionOpen, setIsDescriptionOpen] = useState(false);
    // Tooltip description text
    const weightsDescription = "Lite for faster processing with moderate detail, ideal for quick previews or less complex images, and Pro for high-quality image processing, offering greater detail and accuracy at the cost of longer processing times.";

    // Handler to update selected weights interpretator
    const handleWeightsInterpretatorSelect = (type: WeightsInterpretatorType) => {
        setWeightsInterpretator(type);
        setIsMenuOpen(false);
    };

    const WeightsInterpretatorContent = (
        <div className={styles.resolution_popover_content}>

            <div className={styles.popover_content_header}>
                <span className={styles.popover_content_header_text}>Weights Interpretator</span>
                <CloseIcon
                    className={styles.header_close}
                    onClick={() => setIsMenuOpen(false)}
                />
            </div>

            <div className={styles.content_spacer}></div>


            <div className={styles.weights_selector_wrapper}>
                <div className={styles.weights_selector}>
                    {/* Lite Option */}
                    <button
                        className={`${styles.weights_selector_inner_button} ${
                            weights_interpretator === 'Lite' ? styles.selected : ''
                        }`}
                        onClick={() => handleWeightsInterpretatorSelect('Lite')}
                    >
                        <WeightsLiteIcon className={styles.weights_selector_icon} />
                        <span className={styles.weights_selector_text}>Lite</span>
                    </button>

                    <div className={styles.content_spacer}></div>

                    {/* Pro Option */}
                    <button
                        className={`${styles.weights_selector_inner_button} ${
                            weights_interpretator === 'Pro' ? styles.selected : ''
                        }`}
                        onClick={() => handleWeightsInterpretatorSelect('Pro')}
                    >
                        <WeightsProIcon className={styles.weights_selector_icon} />
                        <span className={styles.weights_selector_text}>Pro</span>
                    </button>
                </div>
            </div>

        </div>
    );

    return (
        <div className={styles.controls_selector_wrapper}>

            <label className={styles.weights_label} htmlFor="resolution">
                Weights Interpretator

                <Tooltip
                    placement="right-start"
                    content={
                        <div className={styles.weights_description_info}>{weightsDescription}</div>
                    }
                    isOpen={isDescriptionOpen}
                    className={styles.weights_description_label_tooltip}
                >
                    <button
                        className={styles.weights_description_label_tooltip_btn}
                        onMouseEnter={() => setIsDescriptionOpen(true)}
                        onMouseLeave={() => setIsDescriptionOpen(false)}
                        onClick={() => setIsDescriptionOpen(!isDescriptionOpen)}
                    >
                        <QuestionIcon 
                            className={styles.slidecontainer_description_label_icon} 
                        />
                    </button>
                </Tooltip>
            </label>

            {!isMobile ? (
                <Popover
                    isOpen={isMenuOpen}
                    onOpenChange={(open) => setIsMenuOpen(open)}
                    placement="right-start"
                >
                    <PopoverTrigger>
                        <button
                            className={`${styles.weights_selector_button} ${
                            isMenuOpen ? styles.weights_selector_button_active : ''
                            }`}
                        >
                            <span className={styles.weights_text}>{weights_interpretator}</span>
                            {isMenuOpen ? (
                            <ArrowLeft
                                className={`${styles.weights_arrow} ${
                                isMenuOpen ? styles.weights_arrow_active : ''
                                }`}
                            />
                            ) : (
                            <ArrowRight className={styles.weights_arrow} />
                            )}
                        </button>
                    </PopoverTrigger>
                    <PopoverContent className={styles.model_popover_content_wrapper}>
                        {WeightsInterpretatorContent}
                    </PopoverContent>
                </Popover>
            ) : ( 
                <>
                    <button
                        className={`${styles.weights_selector_button} ${isMenuOpen ? styles.weights_selector_button_active : ''}`}
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >

                        <span className={styles.weights_text}>{weights_interpretator}</span>
                        {isMenuOpen ? (
                            <ArrowLeft
                                className={`${styles.weights_arrow} ${
                                isMenuOpen ? styles.weights_arrow_active : ''
                                }`}
                            />
                        ) : (
                            <ArrowRight className={styles.weights_arrow} />
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
                            <div className={styles.weights_modal}>
                                {WeightsInterpretatorContent}
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}