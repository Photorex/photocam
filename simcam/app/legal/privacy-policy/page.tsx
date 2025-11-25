"use client";

import React, { useEffect, useState } from "react";

import styles from '../styles/Privacy.module.css';

export default function TermsOfService() {
    return (
		<div className={styles.pageWrapper}>
            <div className={styles.container}>
                <div className={styles.privacy_content}>
                    <div className={styles.privacy_content_inner}>
                        <h1 className={styles.terms_header_secondary}>
                            1. Overview
                        </h1>
                        <p className={styles.p3}>
                        At <strong>WVISION LIMITED</strong>, operating under <strong>simcam.net</strong> (&quot;Company&quot;, &quot;we&quot;, &quot;our&quot;, or &quot;us&quot;), we value your trust and are dedicated to protecting your personal data.
                        <br/>This Privacy Policy (&quot;Policy&quot;) explains what information we collect, how we use it, why we process it, and how we keep it secure.
                        <br/>It forms an integral part of our [Terms and Conditions] and applies to everyone who accesses or uses our Website or related services.
                        <br/>
                        <br/>We may update this Policy from time to time. The latest version will always be available on this page.
                        <br/>Your continued use of our Website after any updates constitutes your acceptance of the revised Policy, so please review it periodically.
                        </p>

                        <br/>

                        <h1 className={styles.terms_header_secondary}>
                            2. Information We Collect
                        </h1>
                        <p className={styles.p3}>
                        <strong>&quot;Personal Information&quot;</strong> means data that identifies you directly or indirectly, or can reasonably be linked to you as an individual.
                        <br/>
                        <br/>
                        We may collect and process the following categories of Personal Information:
                        <br/>
                        <br/>
                        • Your name, email address, username, or similar contact details;
                        <br/>
                        • Publicly available information or data you share voluntarily;
                        <br/>
                        • Technical information about your device, browser, operating system, and network;
                        <br/>
                        • Usage data, such as time spent on the Website or interaction with specific features.
                        <br/>
                        <br/>
                        We may also gather diagnostic or performance data to improve functionality, deliver software updates, and enhance your overall experience.
                        </p>

                        <br/>

                        <h1 className={styles.terms_header_secondary}>
                        3. Why We Collect Your Information
                        </h1>
                        <p className={styles.p3}>
                        We process your Personal Information for legitimate purposes, including but not limited to:
                        <br/>
                        <br/>
                        • Verifying your identity and maintaining your account;
                        <br/>
                        • Providing, improving, and personalizing our services;
                        <br/>
                        • Responding to your requests or support inquiries;
                        <br/>
                        • Communicating with you about updates, security notices, or policy changes;
                        <br/>
                        • Meeting our legal, contractual, or compliance obligations;
                        <br/>
                        • Enforcing our Terms and preventing misuse of the Website.
                        <br/>
                        <br/>
                        </p>

                        <br/>

                        <h1 className={styles.terms_header_secondary}>
                            4. Legal Basis and Consent
                        </h1>
                        <p className={styles.p3}>
                        In certain cases, we rely on your <strong>explicit consent</strong> to process your Personal Information.
                        <br/>When consent is required, we will ask for it clearly and specifically at the time of collection.
                        <br/>You may withdraw your consent at any time by contacting us at <strong>hi@simcam.net</strong>.
                        <br/>
                        <br/>We may also process <strong>anonymized or aggregated data</strong> that cannot identify you.
                        <br/>Such data helps us analyze Website performance, detect technical issues, and improve our services.
                        <br/>We may share anonymized insights with partners or third parties in a format that cannot reveal your identity.
                        </p>

                        <br/>

                        <h1 className={styles.terms_header_secondary}>
                        5. Data Retention
                        </h1>
                        <p className={styles.p3}>
                        We retain Personal Information only for as long as necessary to fulfill the purposes for which it was collected — or as required by law, accounting, or regulatory obligations.
                        <br/>Once the data is no longer needed, it will be securely deleted or anonymized.
                        <br/>
                        <br/>We apply both technical and administrative safeguards to prevent unauthorized access, disclosure, or misuse of your data during storage and retention.
                        </p>

                        <br/>

                        <h1 className={styles.terms_header_secondary}>
                        6. Data Storage
                        </h1>
                        <p className={styles.p3}>
                        Your Personal Information may be stored on our own secure servers or through reputable third-party cloud providers that support our operations.
                        <br/>These third-party providers are contractually bound to maintain security standards equivalent to or stronger than ours and may only access your data for hosting or retrieval purposes.                        </p>

                        <br/>

                        <h1 className={styles.terms_header_secondary}>
                        7. Data Deletion
                        </h1>
                        <p className={styles.p3}>
                        When Personal Information is no longer necessary for its original purpose, we will take reasonable measures to permanently erase or irreversibly anonymize it, in accordance with applicable privacy laws.                        </p>

                        <br/>

                        <h1 className={styles.terms_header_secondary}>
                        8. Children’s Privacy
                        </h1>
                        <p className={styles.p3}>
                        Our Website and services are intended for users aged 18 and above.
                        <br/>We do not knowingly collect Personal Information from minors.
                        <br/>If you are under 18, please use the Website only under the supervision of a parent or legal guardian.
                        <br/>If we discover that we have collected data from a minor without consent, we will delete it promptly.                        </p>

                        <br/>

                        <h1 className={styles.terms_header_secondary}>
                        9. Data Security
                        </h1>
                        <p className={styles.p3}>
                        We use a combination of physical, technical, and organizational measures to protect your information from unauthorized access, alteration, or destruction.
                        <br/>Our security practices include, but are not limited to:
                        <br/>
                        <br/>
                        • <strong>Physical safeguards</strong>: controlled access to offices and secure file storage;
                        <br/>

                        • <strong>Technical measures</strong>: encryption, firewalls, and password protection;
                        <br/>

                        • <strong>Administrative controls</strong>: confidentiality agreements, access limitation, and staff training.
                        <br/>

                        <br/>We also perform regular malware and vulnerability scans.
                        <br/>
                        Although we employ industry-standard measures, no online system is completely foolproof.
                        <br/>If you believe your account or data security has been compromised, contact us immediately at <strong>hi@simcam.net</strong>.
                        <br/>We are not responsible for losses, damages, or harm caused by unauthorized access, disclosure, or use of Personal Information by third parties beyond our reasonable control.
                        </p>

                        <br/>

                        <h1 className={styles.terms_header_secondary}>
                        10. Prohibited Content
                        </h1>
                        <p className={styles.p3}>
                        We strictly forbid the creation, upload, or distribution of <strong>child sexual abuse material</strong> or any other illegal or exploitative content.
                        <br/>Any violation of this policy will result in immediate and permanent account suspension, forfeiture of credits, and potential reporting to relevant authorities.
                        </p>

                        <br/>

                        <h1 className={styles.terms_header_secondary}>
                        11. Reporting and Legal Cooperation
                        </h1>
                        <p className={styles.p3}>
                        If any user activity or content on our platform violates laws or this Policy, we reserve the right to report such cases to law enforcement and cooperate fully with their investigations.
                        <br/>We appreciate your assistance in maintaining a safe and lawful environment for all users.
                        </p>

                        <br/>

                        <h1 className={styles.terms_header_secondary}>
                        12. Contact Information
                        </h1>
                        <p className={styles.p3}>
                        If you have any questions, concerns, or requests regarding this Privacy Policy or our handling of your Personal Information, please contact us at:
                        <br/>
                        <br/>
                        <strong>Email</strong>: hi@simcam.net
                        <br/>
                        <br/>
                        </p>

                        <br/>
                    </div>
                </div>
            </div>
        </div>
    )
}
