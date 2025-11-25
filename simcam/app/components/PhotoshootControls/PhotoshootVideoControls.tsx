"use client";

import React from "react";
import { useState, useEffect } from "react";
import { useSession } from 'next-auth/react';

import UpgradeBanner from "../UpgradeBanner/UpgradeBanner";
import PhotoshootPromptInput from "../Prompt/PhotoshootPromptInput";
import VideoSizeOptions from "../SizeOptions/VideoSizeOptions";
import PhotoshootModelSelector from "../PhotoshootModelSelector/PhotoshootModelSelector";
import PhotoshootTypeData from "@/app/lib/data/PhotoshootTypeData";
import ResetIcon from "@/public/images/icons/controller/reset-icon.svg";
import Loader from "@/public/assets/icons/loader.svg";
import DeleteIcon from "@/public/assets/icons/delete-icon.svg";
import RightArrow from "@/public/assets/icons/right-arrow.svg";
import Image from "next/image";
import styles from "./PhotoshootControls.module.css";
import { useControlMenuContext } from "@/app/context/ControlMenuContext";
import VideoGenerateOptionSwitcher from "./VideoGenerateOptionSwitcher";
import VideoImage from "../VideoImage/VideoImage";
import ImageVideoSwitcher from "./ImageVideoSwitcher";

import { useWindowSize } from "@/app/lib/hooks/useWindowSize";

export default function PhotoshootVideoControls({
    resetHighlight,
    onReset,
    openedFromController,
    isLoraTraining,
    hasTrainingModel,
    onStyleSelect,
    onToggleCost,
}: {
    resetHighlight: boolean;
    onReset: () => void;
    openedFromController: boolean;
    isLoraTraining: boolean;
    hasTrainingModel: boolean;
    onStyleSelect?: () => void;
    onToggleCost?: (generationCost: number) => void; 
}) {

    const { data: session } = useSession();

    // Get window size using custom hook
    const windowSize = useWindowSize();
    const isMobile = windowSize.width <= 1000;
    
    const {
        videoGenerationMode,
        setVideoGenerationMode,
        prompt,
        setPrompt,
        selectedGenderFilter,
        selectedTypeIndex,
        setSelectedTypeIndex,
    } = useControlMenuContext();

        const typeData = PhotoshootTypeData[selectedGenderFilter]?.[selectedTypeIndex];
        const images = typeData ? [typeData.mainImage, ...(typeData.additionalImages || [])] : [];

        const [currentIndex, setCurrentIndex] = useState(0);
        const [fade, setFade] = useState(false);


        useEffect(() => {
        const interval = setInterval(() => {
            setFade(true); // trigger fade out
            setTimeout(() => {
                setCurrentIndex((prev) => (prev + 1) % images.length);
                setFade(false); // fade back in after src change
            }, 1000); // duration should match half the CSS transition time
        }, 3500);

        return () => clearInterval(interval);
    }, [images.length]);

    return (
        <div className={styles.generator_controls_inner_wrapper}>
            
            {!openedFromController && (
                <ImageVideoSwitcher />
            )}

            {!openedFromController && (
                <VideoGenerateOptionSwitcher />
            )}

            {/* {(session?.user?.credits ?? 0) <= 10 && (
                <UpgradeBanner />
            )} */}

            {videoGenerationMode === 'model' ? (
                <>

                    {openedFromController && selectedTypeIndex >= 0 && images.length > 0 && (
                        <div className={styles.style_preview_scroll_wrapper_video}>
                            <div className={styles.style_preview_carousel}>
                                <div className={styles.style_image_slide}>
                                    <div className={styles.style_image_frame}>
                                        <div className={`${styles.fade_overlay} ${fade ? styles.fade_active : ""}`} />
                                        <Image
                                            src={images[currentIndex]}
                                            alt="Preview"
                                            className={styles.style_image}
                                            width={300}
                                            height={450}
                                            priority
                                        />

                                        
                                        {/* Moved badges inside */}
                                        <div className={styles.credit_badge_wrapper}>
                                            <div className={styles.credit_badge}>
                                                <Image src="/assets/icons/credits-controlls-icon.svg" alt="credits" width={20} height={20} />
                                                <span>25</span>
                                            </div>
                                        </div>

                                        <div className={styles.style_title_overlay}>
                                        {PhotoshootTypeData[selectedGenderFilter][selectedTypeIndex].type}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {isMobile && (
                        <VideoSizeOptions />
                    )}

                    <PhotoshootModelSelector 
                        onToggleCostPrice={(generationCost) => onToggleCost?.(generationCost)} 
                    />
                    
                    {/* {openedFromController && (
                    <div className={styles.selected_style_mobile}>
                        <label className={styles.style_controls_label} htmlFor="style">
                            Your selection style
                        </label>
                        <div className={styles.selected_style_container}>
                            {selectedTypeIndex >= 0 ? (
                            <>
                                <div className={styles.selected_style_content}>
                                <div className={styles.selected_style_image_container}>
                                    <Image
                                    src={
                                        PhotoshootTypeData[selectedGenderFilter][selectedTypeIndex]
                                        .mainImage
                                    }
                                    alt={
                                        PhotoshootTypeData[selectedGenderFilter][selectedTypeIndex]
                                        .type
                                    }
                                    className={styles.selected_style_image}
                                    width={69}
                                    height={90}
                                    style={{ objectFit: "cover" }}
                                    />
                                </div>
                                <div className={styles.selected_style_name}>
                                    {
                                    PhotoshootTypeData[selectedGenderFilter][selectedTypeIndex]
                                        .type
                                    }
                                </div>
                                </div>
                                <div
                                className={styles.delete_icon_container}
                                onClick={() => setSelectedTypeIndex(-1)}
                                >
                                <DeleteIcon className={styles.delete_icon} />
                                </div>
                            </>
                            ) : (
                            <>
                                <div
                                className={styles.selected_style_content}
                                onClick={onStyleSelect}
                                >
                                <div className={styles.selected_style_placeholder}>
                                    <Image
                                    src="/assets/images/pixelated-model.png"
                                    alt="Select style"
                                    className={styles.placeholder_image}
                                    width={69}
                                    height={90}
                                    style={{ objectFit: "cover" }}
                                    />
                                    <div className={styles.placeholder_overlay}></div>
                                </div>
                                <div className={styles.select_style_text}>Select your style</div>
                                </div>
                                <div
                                className={styles.right_arrow_container}
                                onClick={onStyleSelect}
                                >
                                <RightArrow className={styles.right_arrow} />
                                </div>
                            </>
                            )}
                        </div>
                    </div>
                    )} */}

                    {(isLoraTraining || hasTrainingModel) && (
                        <div className={styles.lora_loader_wrapper}>
                            <span className={styles.lora_loader_text}>
                                Training will be ready within 5 minutes and then added to your model
                            </span>
                            <div className={styles.spinner_loader_wrapper}>
                                <Loader className={styles.lora_loader} />
                            </div>
                        </div>
                    )}
                </>   
            ) : (
                <>
                    <PhotoshootPromptInput
                        value={prompt}
                        onChange={setPrompt}
                        color="var(--text-color-gray)"
                    />
                    <VideoImage />
                </>
            )}

            {!isMobile && (
                <VideoSizeOptions />
            )}

            {!isMobile && (
                <>
                <div className={styles.content_spacer}></div>

                <div className={styles.controls_generation_button_group}>
                    <div className={styles.reset_group_wrapper}>
                    <div
                        className={`${styles.reset_group} ${resetHighlight ? styles.reset_highlight : ""}`}
                        onClick={onReset}
                    >
                        <ResetIcon className={styles.reset_group_icon} />
                        <span className={styles.reset_group_text}>Reset to default</span>
                    </div>
                    </div>
                </div>
                </>
            )}
        </div>
    );
}