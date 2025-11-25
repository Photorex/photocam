import React, { Suspense } from "react";
import { Metadata } from "next";

import Footer from "../components/Footer/Footer";
import MobileMenu from "../components/MobileMenu/MobileMenu";

// Styles import
import styles from "./Pricing.module.css";

export const metadata: Metadata = {
	title: "AI Image Generator Free: Create and Edit images with AI",
	description: "With our free AI image generator, creating and editing images has never been easier. Harness the potential of AI to effortlessly generate and customize visuals according to your vision. Start creating today!",
	robots: {
		index: true,
		follow: true,
	},
};

export default function PricingLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<section className="layout_wrapper">
			<div className="main_content">
                <div className={styles.page_wrapper}>
                    <Suspense fallback={null}>{children}</Suspense>
                </div>
                <Footer />
			</div>
            <MobileMenu />
		</section>
	);
}
