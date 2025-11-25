'use client';

import React from 'react';
import styles from './ModelCategorySelector.module.css';

interface ModelCategorySelectorProps {
  categories: string[];
  selectedCategory: string;
  onSelect: (category: string) => void;
}

export default function ModelCategorySelector({
  categories,
  selectedCategory,
  onSelect,
}: ModelCategorySelectorProps) {
  return (
    <div className={styles.model_category_wrapper}>
      {categories.map((category, index) => (
        <button
          key={index}
          className={`${styles.model_category_button} ${
            selectedCategory === category ? styles.model_category_button_active : ''
          }`}
          onClick={() => onSelect(category)}
        >
          {category}
        </button>
      ))}
    </div>
  );
}