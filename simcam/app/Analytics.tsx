"use client"

import { useEffect } from "react"

// Google GTM specific import
import { GTM_ID, pageview } from "@/utils/analytics/google/gtm/gtm";

// Next specific import
import { usePathname } from "next/navigation"
import Script from "next/script"

export default function Analytics() {
    const pathname = usePathname()
    const searchParams = new URLSearchParams(
      typeof window !== 'undefined' ? window.location.search : '',
    );
  
    useEffect(() => {
      if (pathname) {
        pageview(pathname)
      }
    }, [pathname, searchParams])
  
    // if (process.env.NEXT_PUBLIC_ENV !== "production") {
    //   return null
    // }
  
    return (
      <>
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>

        <Script
          id="gtm-script"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
                (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                })(window,document,'script','dataLayer', '${GTM_ID}');
            `,
          }}
        />
      </>
    )
  }