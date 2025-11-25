// Components import
import React, { Suspense } from "react";
import PhotoshootControls from "../components/PhotoshootControls/PhotoshootControls";
import Footer from "../components/Footer/Footer";
import MobileMenu from "../components/MobileMenu/MobileMenu";

// Styles import
import styles from "./page.module.css";

export default function CreationLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<section className="layout_wrapper">
			<div className="main_content">
            <Suspense fallback={null}>{children}</Suspense>
			</div>
            {/* <Suspense fallback={null}>
                <MobileMenu />
            </Suspense> */}
		</section>
	);
}
