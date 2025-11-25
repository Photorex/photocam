'use client';

import React, { useState, useEffect } from 'react';

// Next specific import
import { signIn, signOut, useSession } from 'next-auth/react';

import { Accordion, AccordionItem } from "@heroui/react";

// Import styles
import styles from './page.module.css';

import FaqInfo from '../components/FaqInfo/FaqInfo';

import CheckedIcon from '@/public/assets/icons/pricing_checked.svg';
import UncheckedIcon from '@/public/assets/icons/pricing_unchecked.svg';

export default function FaqPage() {

    return (
        <div className={styles.pageWrapper}>

            <div className={styles.website_faq_email}>
				Contact us at <span className={styles.website_faq_span}>hi@simcam.net</span> for any additional queries and concerns
			</div>

            <FaqInfo />
        </div>
    );
}