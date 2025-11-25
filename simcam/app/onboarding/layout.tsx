import React, { Suspense } from "react";
import styles from './page.module.css';

export default function OnboardingLayoutTest({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={styles.safe_area_wrapper}>
      <Suspense fallback={null}>{children}</Suspense>
    </div>
  );
}