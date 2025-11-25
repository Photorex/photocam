'use client';

import React, { useState, useRef, useEffect } from 'react';
import styles from './styles/NegativePromptInput.module.css';

interface NegativePromptInputProps {
  value: string;
  onChange: (value: string) => void;
}

export default function NegativePromptInput({
  value,
  onChange,
}: NegativePromptInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Function to adjust the height of the textarea dynamically
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
      <label className={styles.neg_prompt_controls_label} htmlFor="neg_prompt">
        Negative Prompt
      </label>

      <div
        className={`${styles.prompt_textarea_wrapper} ${
          isFocused ? styles.focused : ''
        }`}
      >
        <textarea
          id="neg_prompt"
          name="neg_prompt"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            adjustHeight();
          }}
          placeholder="Describe something you'd like to avoid in the generated output..."
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