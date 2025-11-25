'use client';

import React, { useState } from 'react';

// Next 
import Image from 'next/image';

// Context
import { useControlMenuContext } from '@/app/context/ControlMenuContext';

// HeroUI
import { Popover, PopoverTrigger, PopoverContent } from '@heroui/react';

// Functions
import { useWindowSize } from "@/app/lib/hooks/useWindowSize";

// Icons
import ImageIcon from "@/public/images/icons/menu/generation-icon.svg";
import CloseIcon from "@/public/images/icons/controller/close-icon.svg";
import ArrowRight from "@/public/images/icons/controller/arrow-right.svg";
import ArrowLeft from "@/public/images/icons/controller/arrow-left.svg";
import UploadIcon from "@/public/images/icons/controller/upload-icon.svg";
import DeleteIcon from "@/public/images/icons/controller/delete-icon.svg";

// Images
import HDPhotoImage from "@/public/images/character/hd-photo.png";
import SimpleBGImage from "@/public/images/character/simple-bg.png";
import NoAccessoriesImage from "@/public/images/character/no-accessories.png";
import NeutralFaceImage from "@/public/images/character/neutral-face.png";

// Components
import ImageCard from '../ImageCard/ImageCard';
import CustomSlider from '../CustomSlider/CustomSlider';

// Styles
import styles from './ImageOptions.module.css';

export default function ImageOptions() {
    // Context values
    const {
        facelock_weight,
        setFacelockWeight,
        denoise,
        setDenoise,
        userImage, 
        setUserImage,
    } = useControlMenuContext();

    // State for selected image options
    const [activeTab, setActiveTab] = useState<'facelock' | 'image'>('facelock');
    // State to track whether image options are open
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Image data
    const imageData = [
        { src: HDPhotoImage.src, alt: 'HD Photo', description: 'HD Photo' },
        { src: SimpleBGImage.src, alt: 'Simple BG', description: 'Simple BG' },
        { src: NoAccessoriesImage.src, alt: 'No accessories', description: 'No accessories' },
        { src: NeutralFaceImage.src, alt: 'Neutral Face', description: 'Neutral Face' },
    ];

    // Get window size using custom hook
    const windowSize = useWindowSize();
    const isMobile = windowSize.width <= 1000;

    const handleImageUpload = (file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            setUserImage({ 
                image: e.target?.result as string, 
                imageType: activeTab === 'facelock' ? 'facelock' : 'image' 
              });
              console.log(userImage)
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

    const resetImage = () => setUserImage({ image: null, imageType: '' });

    const handleSliderChange = (value: number) => {
        if (activeTab === 'facelock') {
          setFacelockWeight(value);
        } else if (activeTab === 'image') {
          setDenoise(value);
        }
      };

    const ImageOptionsContent = (
        <>
            {/* Header */}
            <div 
                className={styles.image_options_popover_content}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleFileDrop}
            >

                <div className={styles.popover_content_header}>
                    <span className={styles.popover_content_header_text}>Image options</span>
                    <CloseIcon 
                        className={styles.header_close} 
                        onClick={() => setIsMenuOpen(false)}
                    />
                </div>

                <div className={styles.content_spacer}></div>

                {/* Tabs */}
                <div className={styles.image_options_tabs}>
                    <button
                        className={`${styles.image_options_tab} ${activeTab === 'facelock' ? styles.image_options_active_tab : ''}`}
                        onClick={() => setActiveTab('facelock')}
                    >
                        Character / FaceLock
                    </button>
                    <button
                        className={`${styles.image_options_tab} ${activeTab === 'image' ? styles.image_options_active_tab : ''}`}
                        onClick={() => setActiveTab('image')}
                    >
                        Image to image
                    </button>
                </div>

                {/* Description */}
                <div className={styles.image_options_description}>
                    {activeTab === 'facelock' ? (
                        <p>
                            FaceLock is a feature that preserves the facial characteristics of your character, ensuring they look consistent across different styles and scenes.
                        </p>
                    ) : (
                        <p>
                            Image to Image transforms your uploaded photo into a canvas for creativity. It adds new elements and enhancements while preserving the original base.
                        </p>
                    )}
                </div>

                 {/* Images */}
                 <div className={styles.image_options_images_wrapper}>
                    <div className={styles.image_options_images}>
                        {imageData.map((image, index) => (
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
                    {activeTab === 'facelock' ? (
                        <CustomSlider
                            value={facelock_weight}
                            onValueChange={(val) => setFacelockWeight(val)}
                            sliderHeight={3}
                            thumbDiameter={12}
                            min={0}
                            max={10}
                            showDescription={true}
                            description='Adjust the Face Lock Strength to control the level of emphasis the model places on maintaining the facial features of the input image.'
                            descriptionOffset='-1px'
                            showValue={true}
                            showLabel={true}
                            label='Facelock Weight'
                            fontSize='var(--font-regular-small)'
                        />
                    ) : (
                        <CustomSlider
                            value={denoise}
                            onValueChange={(val) => setDenoise(val)}
                            sliderHeight={3}
                            thumbDiameter={12}
                            min={0}
                            max={1}
                            step={0.1}
                            decimal={true}
                            showDescription={true}
                            description='Adjust the denoise strength to control the level of randomness applied when generating variations of your image.'
                            descriptionOffset='-1px'
                            showValue={true}
                            showLabel={true}
                            label='Denoise'
                            fontSize='var(--font-regular-small)'
                        />
                    )}
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
        </>
    );

    return (
        <div className={styles.image_controls_wrapper}>
            
            <label className={styles.image_options_controls_label} htmlFor="imageOptions">
                <span>
                    Image options
                </span>
                {userImage.image && (
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
                        <button className={`${styles.image_selector_button} ${isMenuOpen ? styles.image_selector_button_active : ''}`}>
                            <div className={styles.image_wrapper}>
                                {userImage.image ? (
                                    <Image src={userImage.image} alt="Uploaded" fill className={styles.label_image} />
                                ) : (
                                    <ImageIcon className={styles.label_image_icon} />
                                )}
                            </div>

                            {userImage.image ? (
                                <div className={styles.image_options_uploaded_image_text_wrapper}>
                                    {userImage.imageType === 'facelock' && (
                                        <>
                                            <span className={styles.image_options_uploaded_image_text}>FaceLock&nbsp;</span>
                                            <span className={styles.image_options_uploaded_image_text_active}>active</span>
                                        </>
                                    )}
                                    {userImage.imageType === 'image' && (
                                        <>
                                            <span className={styles.image_options_uploaded_image_text}>Image to image&nbsp;</span>
                                            <span className={styles.image_options_uploaded_image_text_active}>active</span>
                                        </>
                                    )}
                                </div>
                            ) : (
                                <span className={styles.iamge_name}>Image</span>
                            )}

                            {isMenuOpen ? (
                                <ArrowLeft className={`${styles.image_arrow} ${isMenuOpen ? styles.image_arrow_active : ''}`} />
                            ) : (
                                <ArrowRight className={styles.image_arrow} />
                            )}
                        </button>
                    </PopoverTrigger>
                    <PopoverContent className={styles.image_options_popover_content_wrapper}>
                        {ImageOptionsContent}
                    </PopoverContent>
                </Popover>
            ) : ( 
                <>
                    <button 
                        className={`${styles.image_selector_button} ${isMenuOpen ? styles.image_selector_button_active : ''}`}
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        <div className={styles.image_wrapper}>
                            {userImage.image ? (
                                <Image src={userImage.image} alt="Uploaded" fill className={styles.label_image} />
                            ) : (
                                <ImageIcon className={styles.label_image_icon} />
                            )}
                        </div>

                        {userImage.image ? (
                            <div className={styles.image_options_uploaded_image_text_wrapper}>
                                {userImage.imageType === 'facelock' && (
                                    <>
                                        <span className={styles.image_options_uploaded_image_text}>FaceLock&nbsp;</span>
                                        <span className={styles.image_options_uploaded_image_text_active}>active</span>
                                    </>
                                )}
                                {userImage.imageType === 'image' && (
                                    <>
                                        <span className={styles.image_options_uploaded_image_text}>Image to image&nbsp;</span>
                                        <span className={styles.image_options_uploaded_image_text_active}>active</span>
                                    </>
                                )}
                            </div>
                        ) : (
                            <span className={styles.iamge_name}>Image</span>
                        )}

                        {isMenuOpen ? (
                            <ArrowLeft className={`${styles.image_arrow} ${isMenuOpen ? styles.image_arrow_active : ''}`} />
                        ) : (
                            <ArrowRight className={styles.image_arrow} />
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
                                {ImageOptionsContent}
                            </div>
                        </div>
                    )}
                </>
            )}

        </div>
    );
}