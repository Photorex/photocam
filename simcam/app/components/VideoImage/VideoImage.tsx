'use client';

import React, { useState } from 'react';
import styles from './VideoImage.module.css';

import { Tooltip } from "@heroui/react";
import QuestionIcon from "@/public/images/icons/controller/question-icon.svg";
import UploadIcon from "@/public/images/icons/controller/canvas_upload_image.svg";
import DeleteIcon from "@/public/images/icons/controller/delete-icon.svg";

import { useControlMenuContext } from "@/app/context/ControlMenuContext";

interface UpscaleImageProps {
  showDescription?: boolean;
  description?: string;
  color?: string;
  fontSize?: string;
  descriptionOffset?: string;
}

export default function VideoImage({
  showDescription = false,
  description = '',
  color,
  fontSize,
  descriptionOffset,
}: UpscaleImageProps) {
  const { userImage, setUserImage } = useControlMenuContext();

    const handleImageUpload = (file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => {
        if (reader.result) {
            setUserImage({ image: reader.result.toString(), imageType: 'video' });
        }
        };
        reader.readAsDataURL(file);
    };

    const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file) handleImageUpload(file);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleImageUpload(file);
    };

    const clearUserImage = () => setUserImage({ image: null, imageType: '' });

    return (
        <div className={styles.prompt_input_wrapper}>
        <label
            className={styles.prompt_controls_label}
            htmlFor="videoUpload"
            style={{ color: color || "inherit", fontSize: fontSize || "var(--font-regular-small)" }}
        >
            <div className={styles.prompt_controls_label_left}>
                Image
                {showDescription && description && (
                <Tooltip
                    placement="right-start"
                    content={<span className={styles.prompt_tooltip}>{description}</span>}
                >
                    <QuestionIcon
                    className={styles.prompt_tooltip_icon}
                    style={{
                        ...(color ? { color: color } : {}),
                        ...(descriptionOffset ? { top: descriptionOffset } : {})
                    }}
                    />
                </Tooltip>
                )}
            </div>

            {(userImage.image && userImage.imageType === 'video') && (
                <DeleteIcon 
                    className={styles.mask_image_delete_button} 
                    onClick={(e: React.MouseEvent<SVGElement, MouseEvent>) => {
                        e.preventDefault();
                        clearUserImage();
                    }}
                />
            )}

        </label>

        <div className={styles.dropzone_wrapper}>
            <div
            className={styles.dropzone}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleFileDrop}
            >
            {(userImage.image && userImage.imageType === 'video') ? (
                <>
                    <img src={userImage.image} alt="Image Preview" className={styles.uploaded_image} />
                </>
            ) : (
                <>
                    <input
                        id="videoUpload"
                        accept="image/png,image/jpeg"
                        type="file"
                        className={styles.hidden_input}
                        onChange={handleFileChange}
                    />
                    <label htmlFor="videoUpload" className={styles.upload_label}>
                        <UploadIcon className={styles.upload_icon} />
                        <span className={styles.upload_text}>
                            Upload a photo to generate
                            a video or Select your Model
                        </span>
                    </label>
                </>
            )}
            </div>
        </div>
        </div>
    );
}