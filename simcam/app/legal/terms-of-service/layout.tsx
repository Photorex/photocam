import styles from "../styles/Privacy.module.css";
import Footer from "@/app/components/Footer/Footer";

export default function TermsLayout({
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
