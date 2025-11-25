// Style import
import "@/app/globals.css";

import { Suspense } from "react";

// Next specific import
import { Providers } from "./providers";
import { Metadata } from "next";

import Analytics from "./Analytics";

import ogImage from './opengraph-image.jpg';

// Import components
import Navbar from "./components/Navbar/Navbar";
import MobileMenu from "./components/MobileMenu/MobileMenu";

export const metadata: Metadata = {
    title: "AI Image Generator Free: Create and Edit images with AI",
    description:
        "With our free AI image generator, creating and editing images has never been easier. Harness the potential of AI to effortlessly generate and customize visuals according to your vision. Start creating today!",
    robots: {
        index: true,
        follow: true,
    },
    alternates: {
        canonical: "https://simcam.net",
    },
    metadataBase: new URL('https://simcam.net'),
	openGraph: {
		images: [
			{
				url: ogImage.src,
			}
		],
		locale: 'en_US',
		type: 'website',
	},
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body>
                
                <div className="background-glows">
                    <div className="glow glow-1"></div>
                    <div className="glow glow-2"></div>
                </div>

                <Suspense>
					<Analytics />
				</Suspense>

                <Providers >
                    <div className="layout_wrapper">
                        <Navbar />
                        <main className="main_content">
                            <Suspense fallback={null}>{children}</Suspense>
                        </main>
                        {/* <MobileMenu /> */}
                    </div>
                </Providers>
                
            </body>
        </html>
    );
}