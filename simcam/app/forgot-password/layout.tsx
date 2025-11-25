import Footer from "../components/Footer/Footer";
import styles from "./page.module.css";

export default function AboutLayout({
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
		</section>
	);
}
