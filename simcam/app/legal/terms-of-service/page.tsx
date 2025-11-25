"use client";

import React, { useEffect, useState } from "react";

import styles from '../styles/Privacy.module.css';

export default function TermsOfService() {
    return (
		<div className={styles.pageWrapper}>
            <div className={styles.container}>
                <div className={styles.privacy_content}>
                    <div className={styles.privacy_content_inner}>
                        {/* <h1 className={styles.terms_header}>
                            simcam.net - Terms and Conditions

                        </h1> */}
                        <p className={styles.p3}>
                        Welcome to simcam.net (the &quot;Website&quot;). Please read these Terms of Service (&quot;Terms&quot;, &quot;Agreement&quot;) carefully before using any services provided by WVISION LTD, a company registered in UK (&quot;Company&quot;, &quot;we&quot;, &quot;our&quot;, or &quot;us&quot;).
                        <br/>By visiting or using this Website, including its mobile or app versions, you agree to comply with and be bound by these Terms. If you do not accept these Terms, you must immediately stop using the Website.
                        <br/>
                        <br/>
                        1. Eligibility
                        <br/>
                        <br/>
                        Only individuals who can legally enter binding contracts under the laws of the United States may use this Website or its services.
                        <br/>If you are underage or legally restricted, you may use the Website only under the supervision and consent of a parent or guardian.
                        <br/>If you act on behalf of a business entity, you represent that you are duly authorized to bind that entity to these Terms.
                        <br/>
                        <br/>
                        2. Updates to the Terms
                        <br/>
                        <br/>
                        The Company may revise these Terms at any time without prior notice. The latest version will always be available on the Website and becomes effective immediately upon publication.
                        <br/>Continued use of the Website after any changes means you accept the updated Terms. We recommend reviewing them regularly.
                        <br/>
                        <br/>
                        3. Use of the Website
                        <br/>
                        <br/>
                        You are granted a limited, personal, non-exclusive, non-transferable license to access and use the Website for lawful purposes only.
                        <br/>You are solely responsible for ensuring compliance with all local, national, and international laws related to your use of the Website.
                        <br/>
                        <br/>
                        4. Description of Service
                        <br/>
                        <br/>
                        <strong>simcam.net</strong> provides AI-powered image generation and editing features based on open-source technologies such as Stable Diffusion.
                        <br/>The exact functionality of the service may evolve or change over time at the Company’s discretion.                    
                        <br/>
                        <br/>
                        5. Intellectual Property
                        <br/>
                        <br/>
                        All visual elements, source code, software, layout, logos, graphics, data, and other materials on the Website (&quot;Content&quot;) are the property of the Company or its licensors and are protected by applicable intellectual property laws.
                        <br/>You may not copy, distribute, modify, publish, sell, or create derivative works from any portion of the Website or its Content unless expressly authorized in writing by the Company.
                        <br/>
                        <br/>
                        Third-Party Rights
                        <br/>
                        <br/>
                        All product names, logos, and trademarks displayed on the Website that do not belong to the Company are the property of their respective owners and may not be used without their consent.
                        <br/>
                        <br/>
                        6. Service Interruptions
                        <br/>
                        <br/>
                        The Company and its affiliates, employees, contractors, or representatives are not responsible for delays or interruptions caused by factors beyond reasonable control — including but not limited to hardware or communication failures, weather conditions, natural disasters, labor disputes, wars, or technical malfunctions.
                        <br/>
                        <br/>
                        7. External Links and Third-Party Content
                        <br/>
                        <br/>
                        The Website may include links or references to third-party websites or materials.
                        <br/>The Company does not review, monitor, or endorse such websites or content and is not responsible for their accuracy, legality, or security.
                        <br/>You access third-party websites at your own risk, and any transactions you make with those parties are solely between you and them.
                        <br/>
                        <br/>
                        8. Credit System and Payments
                        <br/>
                        <br/>
                        Image generation on <strong>simcam.net</strong> requires credits. Credits can be purchased directly through the Website.
                        <br/>Pricing and credit consumption rates may change at any time without prior notice.
                        <br/>All payments are final and non-refundable unless otherwise stated by applicable law.
                        <br/>
                        <br/>
                        9. Content Restrictions
                        <br/>
                        <br/>
                        The Website does not promote or encourage the creation of pornographic or explicit material.
                        <br/>While artistic freedom is respected, attempts to generate content involving minors or depicting harm will result in immediate and permanent account termination, forfeiture of credits, and potential reporting to authorities.                        
                        <br/>
                        <br/>
                        10. FaceLock Fair Use
                        <br/>
                        <br/>
                        <strong>FaceLock</strong> allows users to generate content using human likenesses.
                        <br/>We do not store biometric or facial data and do not use uploaded faces for any purpose beyond the user session.
                        <br/>
                        You are responsible for obtaining permission from individuals whose likeness you upload. By using FaceLock, you agree not to:
                        <br/>
                        <br/>
                        • Break any law;
                        <br/>
                        • Violate someone’s privacy;
                        <br/>
                        • Cause harm or harassment;
                        <br/>
                        • Spread false or misleading information.
                        <br/>
                        <br/>
                        Misuse of this feature will result in account suspension and potential legal consequences.
                        <br/>
                        <br/>
                        11. Ownership of Generated Content
                        <br/>
                        <br/>
                        You retain ownership of AI-generated images created under your account, provided such content does not violate these Terms or applicable laws.
                        <br/>However, copyright protection for AI-generated works may not apply in all jurisdictions. You are fully responsible for how you use, publish, or distribute generated content and agree to indemnify the Company against any related claims.
                        <br/>
                        <br/>
                        12. Website Security
                        <br/>
                        <br/>
                        You must not interfere with or attempt to compromise the Website’s security. This includes but is not limited to unauthorized data access, probing systems for vulnerabilities, introducing malware, DDoS attacks, or any behavior that disrupts the Website’s operation.
                        <br/>Any breach of security may result in civil or criminal liability.                        
                        <br/>
                        <br/>
                        13. Disclaimer of Warranties
                        <br/>
                        <br/>
                        The Website and its services are provided “as is” and “as available.”
                        <br/>The Company disclaims all express or implied warranties, including but not limited to merchantability, fitness for a particular purpose, and non-infringement.
                        <br/>We do not guarantee that the Website will always be available, error-free, secure, or free of viruses.                        
                        <br/>
                        <br/>
                        14. Limitation of Liability
                        <br/>
                        <br/>
                        To the fullest extent permitted by law, the Company shall not be liable for any direct, indirect, incidental, consequential, or special damages arising out of or related to your use or inability to use the Website or its services.
                        <br/>This includes but is not limited to damages for loss of data, business interruption, system errors, or unauthorized access to your information.
                        <br/>
                        <br/>
                        15. Indemnification
                        <br/>
                        <br/>
                        You agree to defend, indemnify, and hold harmless the Company, its affiliates, officers, employees, and agents from any claims, damages, losses, or expenses (including attorney’s fees) resulting from:
                        <br/>
                        <br/>
                        • Your violation of these Terms;
                        <br/>
                        • Your use of the Website or its content;
                        <br/>
                        • Your infringement of third-party rights.
                        <br/>
                        <br/>
                        This obligation continues even after termination of your account or use of the Website.
                        <br/>
                        <br/>
                        16. Termination
                        <br/>
                        <br/>
                        We reserve the right to suspend or permanently terminate your access to the Website at any time and for any reason, including violations of these Terms or applicable law, without prior notice.
                        <br/>Upon termination, your right to use the Website ceases immediately, and any remaining credits may be forfeited.
                        <br/>
                        <br/>
                        17. User Accounts and Data
                        <br/>
                        <br/>
                        You may need to create an account to use certain features.
                        <br/>You are responsible for maintaining accurate information, keeping your password confidential, and for all activities under your account.
                        <br/>We are not liable for loss or corruption of any data associated with your account.
                        <br/>
                        <br/>
                        18. Privacy Policy
                        <br/>
                        <br/>
                        Your privacy is important to us.
                        <br/>Please review our Privacy Policy available on the Website, which forms part of these Terms.
                        <br/>By using the Website, you consent to the collection and use of your information as described in that policy.
                        <br/>
                        <br/>
                        19. Discontinuation of Service
                        <br/>
                        <br/>
                        The Company may modify, suspend, or discontinue the Website or any of its features at any time without prior notice or liability.
                        <br/>
                        <br/>
                        20. Governing Law and Jurisdiction
                        <br/>
                        <br/>
                        These Terms are governed by the laws of the <strong>State of California, United States</strong>, without regard to conflict of law principles.
                        <br/>Any disputes shall be resolved exclusively in the courts located in California, and you consent to such jurisdiction.
                        <br/>
                        <br/>
                        21. Dispute Resolution and Class Action Waiver
                        <br/>
                        <br/>
                        All disputes must be resolved on an <strong>individual basis</strong>.
                        <br/>You waive any right to participate in class actions or collective proceedings against the Company.
                        <br/>
                        <br/>
                        22. Assignment
                        <br/>
                        <br/>
                        You may not transfer or assign your rights or obligations under these Terms.
                        <br/>The Company may assign its rights and obligations without notice or consent.
                        <br/>
                        <br/>
                        23. Severability
                        <br/>
                        <br/>
                        If any part of these Terms is found invalid or unenforceable, the remaining provisions will remain in full effect.
                        <br/>
                        <br/>
                        24. Entire Agreement
                        <br/>
                        <br/>
                        These Terms constitute the complete agreement between you and the Company and supersede all prior understandings related to the Website and services.
                        <br/>Failure by the Company to enforce any right shall not constitute a waiver of that right.
                        <br/>
                        <br/>
                        25. Relationship of the Parties
                        <br/>
                        <br/>
                        Nothing in these Terms shall be interpreted as creating a partnership, joint venture, employment, or agency relationship between you and the Company.
                        <br/>
                        <br/>
                        26. Contact Information
                        <br/>
                        <br/>
                        For questions or concerns regarding the Website or these Terms, please contact us at:
                        <br/>
                        <strong>Email</strong>: hi@simcam.net
                        <br/>
                        <br/>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
