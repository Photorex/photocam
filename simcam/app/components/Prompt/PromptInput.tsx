'use client';

import React, { useState, useRef, useEffect } from 'react';
import styles from './styles/PromptInput.module.css';

import { Tooltip } from "@heroui/react";
import QuestionIcon from "@/public/images/icons/controller/question-icon.svg";

interface PromptInputProps {
    value: string;
    onChange: (value: string) => void;
    showDescription?: boolean;
    description?: string;
    color?: string;
    fontSize?: string;
    descriptionOffset?: string;
}

export default function PromptInput({ 
    value,
    onChange,
    showDescription = false,
    description = '',
    color,
    fontSize,
    descriptionOffset,
 }: PromptInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Function to adjust height of propmt dynamically
  const adjustHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  useEffect(() => {
    adjustHeight();
  }, [value]);

  return (
    <div className={styles.prompt_input_wrapper}>
        <label 
            className={styles.prompt_controls_label} 
            htmlFor="prompt"
            style={{ color: color || "inherit", fontSize: fontSize || "var(--font-regular-small)" }}
        >
            Prompt
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
            </label>

        <div
            className={`${styles.prompt_textarea_wrapper} ${
            isFocused ? styles.focused : ''
            }`}
        >
            <textarea
            id="prompt"
            name="prompt"
            value={value}
            onChange={(e) => {
                onChange(e.target.value);
                adjustHeight();
            }}
            placeholder="Describe something you'd like to see generated. Experiment with different words and styles..."
            className={`${styles.prompt_textarea} ${isFocused ? styles.focused : ''}`}
            maxLength={1000}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            ref={textareaRef}
            />
        </div>
    </div>
  );
}