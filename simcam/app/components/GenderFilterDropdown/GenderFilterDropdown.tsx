'use client';

import React, { useState, useRef, useEffect } from 'react';
import styles from './GenderFilterDropdown.module.css';

import FilterIcon from '@/public/assets/icons/filter-icon.svg';
import ArrowIcon from '@/public/assets/icons/arrow-down-photoshoot.svg';

interface GenderFilterDropdownProps {
  selectedGender: 'Male' | 'Female';
  setSelectedGender: (gender: 'Male' | 'Female') => void;
}

export default function GenderFilterDropdown({
  selectedGender,
  setSelectedGender,
}: GenderFilterDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleSelect = (value: 'Male' | 'Female') => {
    setSelectedGender(value);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className={styles.filter_button_wrapper}>
      <FilterIcon className={styles.filter_icon} />
      <button onClick={toggleDropdown} className={styles.trigger}>
        <span className={styles.option_text}>{selectedGender}</span>
        <ArrowIcon className={`${styles.arrow} ${isOpen ? styles.arrowOpen : ''}`} />
      </button>

      {isOpen && (
        <div className={styles.dropdown}>
          {['Male', 'Female'].map((option) => (
            <div
              key={option}
              onClick={() => handleSelect(option as 'Male' | 'Female')}
              className={`${styles.option} ${option === selectedGender ? styles.optionSelected : ''}`}
            >
              {option}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}