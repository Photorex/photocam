'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import styles from './SubscriptionPopup.module.css';
import PricingPlans from '../PricingPlans/PricingPlans';
import SubscriptionModal from '../SubscriptionModal/SubscriptionModal';
import CloseIcon from '@/public/images/icons/controller/close-icon.svg';

/** data we need to open the checkout */
export interface PlanChosenPayload {
  subscriptionType: string;
  planPrice: number;
  isGenerationPurchase: boolean;
  generationAmount?: number;
  isPayYearlySelected: boolean;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  openedFromPhotoshoot?: boolean;
  generationCost?: number;
  onCloseGen?: () => void;
}

export default function SubscriptionPopup({ 
    isOpen, 
    onClose, 
    openedFromPhotoshoot = false, 
    generationCost, 
    onCloseGen,
}: Props) {
  /* ─────────────── hooks ─────────────── */
  const [chosen, setChosen] = useState<PlanChosenPayload | null>(null);

  /* lock / unlock background scroll while overlay is open */
  useEffect(() => {
    if (!isOpen) return;
    const { body } = document;
    const previous = body.style.overflow;
    body.style.overflow = 'hidden';
    return () => {
      body.style.overflow = previous;
    };
  }, [isOpen]);

  /* ---------- helper callbacks ---------- */
  /** called by PricingPlans when the user clicks “Choose plan” */
  const handlePlanChosen = (payload: PlanChosenPayload) => {
    setChosen(payload);          // open payment modal
  };

  /** close payment modal (or whole popup) */
  const handleModalClose = () => {
    setChosen(null);             // drop checkout → go back to price-list
    onClose();                   // close the outer overlay
  };

  /* ─────────────── renders ─────────────── */
  /* nothing at all to show */
  if (!isOpen && !chosen) return null;

  /* we already have a plan → show the payment modal */
  if (chosen) {
    return (
      <SubscriptionModal
        subscriptionType={chosen.subscriptionType}
        planPrice={chosen.planPrice}
        isGenerationPurchase={chosen.isGenerationPurchase}
        generationAmount={chosen.generationAmount}
        isPayYearlySelected={chosen.isPayYearlySelected}
        yearDiscount={30}
        isOpen={true}
        onClose={handleModalClose}
      />
    );
  }

  /* default view → pricing list */
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalImages}>
            <div className={styles.gridWrapper}>
                <div className={styles.gridLeftColumn}>
                    {["selfie_2.png", "step_row_3.png"].map((img, index) => (
                        <div key={index} className={styles.gridBoxSmall}>
                            <Image
                                src={`/assets/images/onboarding/${img}`}
                                alt="Selfie"
                                fill
                                className={styles.gridImage}
                            />
                            <div className={styles.gridLabelSmall}>Selfie</div>
                        </div>
                    ))}
                </div>
                <div className={styles.gridBoxLarge}>
                    <Image
                        src="/assets/images/onboarding/step_row_2.png"
                        alt="AI Result"
                        fill
                        className={styles.gridImage}
                    />
                    <div className={styles.gridLabelLarge}>AI Result</div>
                </div>
            </div>
        </div>
        <CloseIcon className={styles.close} onClick={onClose} />
        <PricingPlans 
            openedFromPhotoshoot={openedFromPhotoshoot} 
            onPlanChosen={handlePlanChosen}
            onCloseGen={onCloseGen}
            generationCost={generationCost}
        />
      </div>
    </div>
  );
}