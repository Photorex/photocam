'use client';

import React, { useState } from 'react';

// Next
import Image from 'next/image';

// Functions
import { useWindowSize } from "@/app/lib/hooks/useWindowSize";

// Context
import { useControlMenuContext } from '@/app/context/ControlMenuContext';

// HeroUI
import { Popover, PopoverTrigger, PopoverContent } from '@heroui/react';

// Icons
import CloseIcon from "@/public/images/icons/controller/close-icon.svg";
import ArrowRight from "@/public/images/icons/controller/arrow-right.svg";
import ArrowLeft from "@/public/images/icons/controller/arrow-left.svg";
import UploadIcon from "@/public/images/icons/controller/upload-icon.svg";
import DeleteIcon from "@/public/images/icons/controller/delete-icon.svg";

// Images for poses
import StandingPoseImage from "@/public/images/poses/standing-pose.png";
import LegsCrossedImage from "@/public/images/poses/legs-crossed.png";
import OverShoulderImage from "@/public/images/poses/over-shoulder.png";
import SittingDownImage from "@/public/images/poses/sitting-down.png";

// Components
import CustomSlider from '../CustomSlider/CustomSlider'; 
import ImageCard from '../ImageCard/ImageCard';

// Styles
import styles from './styles/PoseOptions.module.css';

export default function PoseOptions() {

    // Context values
    const {
        pose_weight,
        setPoseWeight,
        poseImage, 
        setPoseImage,
    } = useControlMenuContext();

    // Context values
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Pose data
    const poseData = [
        { src: StandingPoseImage.src, alt: 'Standing poses', description: 'Standing poses' },
        { src: LegsCrossedImage.src, alt: 'Legs crossed', description: 'Legs crossed' },
        { src: OverShoulderImage.src, alt: 'Over shoulder', description: 'Over shoulder' },
        { src: SittingDownImage.src, alt: 'Sitting down', description: 'Sitting down' },
    ];

    // Get window size using custom hook
    const windowSize = useWindowSize();
    const isMobile = windowSize.width <= 1000;

    const handleImageUpload = (file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            setPoseImage({ 
                image: e.target?.result as string, 
                imageType: 'pose' 
              });
              console.log(poseImage)
        };
        reader.readAsDataURL(file);
        setIsMenuOpen(false);
    };

    const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file) handleImageUpload(file);
    };

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleImageUpload(e.target.files[0]);
        }
    };

    const resetImage = () => setPoseImage({ image: null, imageType: '' });

    const PoseOptionsContent = (
        <div 
            className={styles.image_options_popover_content}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleFileDrop}
        >
            <div className={styles.popover_content_header}>
                <span className={styles.popover_content_header_text}>Pose</span>
                <CloseIcon
                    className={styles.header_close}
                    onClick={() => setIsMenuOpen(false)}
                />
            </div>

            <div className={styles.content_spacer}></div>

            {/* Description */}
            <div className={styles.image_options_description}>
                <p className={styles.pose_description}>
                    Pose Strength allows you to adjust the emphasis the model places on the pose of the input image.
                </p>
            </div>

            {/* Images */}
            <div className={styles.image_options_images_wrapper}>
                <div className={styles.image_options_images}>
                    {poseData.map((image, index) => (
                        <ImageCard
                            key={index}
                            src={image.src}
                            alt={image.alt}
                            description={image.description}
                        />
                    ))}
                </div>
            </div>

            {/* Slider */}
            <div className={styles.slider_wrapper}>
                <CustomSlider
                    value={pose_weight}
                    onValueChange={setPoseWeight}
                    sliderHeight={3}
                    thumbDiameter={12}
                    min={0.5}
                    max={1.5}
                    step={0.1}
                    decimal={true}
                    showDescription={true}
                    description='Pose Strength allows you to adjust the emphasis the model places on the pose of the input image.'
                    showValue={true}
                    showLabel={true}
                    label='Pose Weight'
                />
            </div>

            <div className={styles.image_options_upload_button_wrapper}>
                <label
                    className={styles.image_options_upload_button}
                >
                    <span className={styles.upload_button_text}>
                        Upload photo
                    </span>
                    <UploadIcon className={styles.upload_button_icon} />
                    <input
                        type="file"
                        accept="image/*"
                        className={styles.file_input}
                        onChange={handleFileInput}
                    />
                </label>
            </div>
        </div>
    );

    return (
        <div className={styles.pose_options_wrapper}>

            <label className={styles.image_options_controls_label} htmlFor="imageOptions">
                <span>
                    Pose
                </span>
                {poseImage.image && (
                    <DeleteIcon 
                        className={styles.image_options_delete_button} 
                        onClick={() => resetImage()}
                    />
                )}
            </label>

            {!isMobile ? (
                <Popover
                    isOpen={isMenuOpen}
                    onOpenChange={(open) => setIsMenuOpen(open)}
                    placement="right-start"
                >
                    <PopoverTrigger>
                        <button
                            className={`${styles.pose_selector_button} ${
                                isMenuOpen ? styles.pose_selector_button_active : ''
                            }`}
                        >
                            {poseImage.image &&  (
                                <div className={styles.image_wrapper}>
                                    <Image src={poseImage.image} alt="Uploaded" fill className={styles.label_image} />
                                </div>
                            )}

                            {poseImage.image ? (
                                <div className={styles.image_options_uploaded_image_text_wrapper}>
                                    <span className={styles.image_options_uploaded_image_text}>Pose&nbsp;</span>
                                    <span className={styles.image_options_uploaded_image_text_active}>active</span>
                                </div>
                            ) : (
                                <span className={styles.pose_text}>Your pose</span>
                            )}
                            
                            {isMenuOpen ? (
                                <ArrowLeft className={`${styles.pose_arrow} ${styles.pose_arrow_active}`} />
                            ) : (
                                <ArrowRight className={styles.pose_arrow} />
                            )}

                        </button>
                        
                    </PopoverTrigger>
                    <PopoverContent className={styles.image_options_popover_content_wrapper}>
                        {PoseOptionsContent}
                    </PopoverContent>
                </Popover>
            ) : ( 
                <>

                    <button
                        className={`${styles.pose_selector_button} ${isMenuOpen ? styles.pose_selector_button_active : ''}`}
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        {poseImage.image &&  (
                            <div className={styles.image_wrapper}>
                                <Image src={poseImage.image} alt="Uploaded" fill className={styles.label_image} />
                            </div>
                        )}

                        {poseImage.image ? (
                            <div className={styles.image_options_uploaded_image_text_wrapper}>
                                <span className={styles.image_options_uploaded_image_text}>Pose&nbsp;</span>
                                <span className={styles.image_options_uploaded_image_text_active}>active</span>
                            </div>
                        ) : (
                            <span className={styles.pose_text}>Your pose</span>
                        )}
                                
                        {isMenuOpen ? (
                            <ArrowLeft className={`${styles.pose_arrow} ${styles.pose_arrow_active}`} />
                        ) : (
                            <ArrowRight className={styles.pose_arrow} />
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
                            <div className={styles.image_options_modal}>
                                {PoseOptionsContent}
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}