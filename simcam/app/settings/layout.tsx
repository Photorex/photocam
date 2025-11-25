import Footer from "../components/Footer/Footer";
import MobileMenu from "../components/MobileMenu/MobileMenu";

import styles from "./page.module.css";

export default function PricingLayout({
	children,
}: {
	children: React.ReactNode;
}) {
    return (
		<section className="layout_wrapper">
			<div className="main_content">
                <div className={styles.page_wrapper}>
                    {children}
                </div>
                <Footer />
			</div>
            <MobileMenu />
		</section>
	);
}
