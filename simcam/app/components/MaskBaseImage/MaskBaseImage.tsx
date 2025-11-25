'use client';

import React from 'react';
import styles from './MaskBaseImage.module.css';

import { Tooltip } from "@heroui/react";
import QuestionIcon from "@/public/images/icons/controller/question-icon.svg";
import DeleteIcon from "@/public/images/icons/controller/delete-icon.svg";

import { useControlMenuContext } from "@/app/context/ControlMenuContext";


interface MaskBaseImageProps {
    showDescription?: boolean;
    description?: string;
    color?: string;
    fontSize?: string;
    descriptionOffset?: string;
}

export default function MaskBaseImage({
    showDescription = false,
    description = '',
    color,
    fontSize,
    descriptionOffset,
}: MaskBaseImageProps) {
  const { maskBaseImage, setMaskBaseImage } = useControlMenuContext();

  if (!maskBaseImage) return null; // ⛔️ Don’t show unless present

  const handleClear = (e: React.MouseEvent<SVGElement, MouseEvent>) => {
    e.preventDefault();
    setMaskBaseImage(null);
  };

  return (
    <div className={styles.prompt_input_wrapper}>
      <label
        className={styles.prompt_controls_label}
        style={{ color: color || "inherit", fontSize: fontSize || "var(--font-regular-small)" }}
      >
        <div className={styles.prompt_controls_label_left}>
          Mask
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

        <DeleteIcon
          className={styles.mask_image_delete_button}
          onClick={handleClear}
        />
      </label>

      <div className={styles.dropzone_wrapper}>
        <div className={styles.dropzone}>
          <img src={maskBaseImage} alt="Mask Base" className={styles.uploaded_image} />
        </div>
      </div>
    </div>
  );
}