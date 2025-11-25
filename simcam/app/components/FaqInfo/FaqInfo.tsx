"use client";

import { useState } from "react";
import styles from "./FaqInfo.module.css";
import React from "react";

interface AccordionItemProps {
    title: string;
    content: React.ReactNode;
    isOpen: boolean;
    toggle: () => void;
  }

const AccordionItem = ({ title, content, isOpen, toggle }: AccordionItemProps) => (
  <div className={styles.accordionItem}>
    <button className={styles.accordionButton} onClick={toggle}>
      <span>{title}</span>
      <span className={`${styles.arrow} ${isOpen ? styles.open : ""}`}>
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M5.24419 7.74335C5.16694 7.82045 5.10565 7.91202 5.06383 8.01283C5.02201 8.11364 5.00049 8.22171 5.00049 8.33085C5.00049 8.43999 5.02201 8.54806 5.06383 8.64887C5.10565 8.74968 5.16694 8.84126 5.24419 8.91835L9.06919 12.7434C9.39419 13.0684 9.91919 13.0684 10.2442 12.7434L14.0692 8.91835C14.1463 8.8412 14.2075 8.74961 14.2493 8.6488C14.2911 8.548 14.3125 8.43996 14.3125 8.33085C14.3125 8.22174 14.2911 8.1137 14.2493 8.0129C14.2075 7.91209 14.1463 7.8205 14.0692 7.74335C13.992 7.6662 13.9004 7.605 13.7996 7.56324C13.6988 7.52149 13.5908 7.5 13.4817 7.5C13.3726 7.5 13.2645 7.52149 13.1637 7.56324C13.0629 7.605 12.9713 7.6662 12.8942 7.74335L9.65252 10.9767L6.41919 7.74335C6.09419 7.42668 5.56086 7.42668 5.24419 7.74335Z"
            fill="white"
          />
        </svg>
      </span>{" "}
      {/* Стрелочка */}
    </button>
    <div className={`${styles.accordionContent} ${isOpen ? styles.open : ""}`}>
      {content}
    </div>
  </div>
);

export default function FaqInfo() {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const toggleItem = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

  return (
    <div className={styles.faq}>
      <h2 className={styles.h2}>
        Frequently Asked Questions
      </h2>
      <div className={styles.accordion_wrapper}>
        <AccordionItem
          title="How do image credits work?"
          content={
            <>
                <p>
                    When you create an image, one credit will be used up. Thus, when you generate two images at once, two credits will be spent. 
                </p>
                <p>
                    You can also improve the quality of the image at the expense of credits. Improving the quality costs one credit.
                </p>
            </>
            
          }
          isOpen={openIndex === 0}
          toggle={() => toggleItem(0)}
        />
        <AccordionItem
          title="Can I use created images for commercial projects?"
          content={
            <p>
				Yes, but only with our paid plans. Images generated under these
				plans can be used commercially, adhering to the{" "}
				<a
                    target="_blank"
                    rel="noreferrer noopener"
                    href="https://huggingface.co/spaces/CompVis/stable-diffusion-license"
				>
				CreativeML Open RAIL-M
				</a>{" "}
				license.
			</p>

          }
          isOpen={openIndex === 1}
          toggle={() => toggleItem(1)}
        />
        <AccordionItem
          title="Can I create NSFW content?"
          content={
            <p>
				You can create anything you want! But keep in mind that we do
				monitor generated content. Usage that violates any applicable
				national, federal, state, local, or international law or regulation
				will <b>be banned and reported!</b>
			</p>
          }
          isOpen={openIndex === 2}
          toggle={() => toggleItem(2)}
        />
        <AccordionItem
          title="Can I change my plan later?"
          content={
            <p>
			    Yes, you can change your plan at any time, either upgrading or
			    downgrading. Upgrades will be prorated for the remaining month.
		    </p>
          }
          isOpen={openIndex === 3}
          toggle={() => toggleItem(3)}
        />
        <AccordionItem
          title="What if I decide to cancel?"
          content={
            <p>
				If you no longer wish to use simcam.net, you can cancel your
				subscription anytime. When canceled, you will still be able to use
				your credits for the remaining of the current billing cycle.
			</p>
          }
          isOpen={openIndex === 4}
          toggle={() => toggleItem(4)}
        />
        <AccordionItem
          title="What payment options are accepted?"
          content={
            <p>We accept major credit and debit cards, PayPal, Apple Pay, and Google Pay.</p>
          }
          isOpen={openIndex === 5}
          toggle={() => toggleItem(5)}
        />
        <AccordionItem
          title="Will my unused credits roll over to the next month?"
          content={
            <p>Plan&apos;s credits <b>do not</b> roll over to the next month.</p>
          }
          isOpen={openIndex === 6}
          toggle={() => toggleItem(6)}
        />
        <AccordionItem
          title="Can I get more credits?"
          content={
            <p>
				Yes, we offer an option to top up with more credits. You can
				purchase credits if you have a plan <a href="/api/billing/checkout">here</a>. These credits do not expire.
			</p>
          }
          isOpen={openIndex === 7}
          toggle={() => toggleItem(7)}
        />
        <AccordionItem
          title="Will I be able to use the plan to access the API?"
          content={
            <p>
			    No, the API is a separate product and is not included in the
			    subscription plans. To access the API, please create another account{" "}
			    <a href="https://simcam.net/">here</a>.
		    </p>
          }
          isOpen={openIndex === 8}
          toggle={() => toggleItem(8)}
        />
        <AccordionItem
          title="Do prices include tax?"
          content={
            <>
            <p>
				All prices listed in our table are exclusive of tax. Taxes, if
				applicable, will be added and calculated at the checkout stage.
			</p>
			<p>
				Please note that we apply VAT/GST in certain regions according to
				local tax regulations. For recurring payments, please be aware that
				we may begin to add tax if required by regulations, once we meet a
				local sales threshold. It&apos;s important to review your final invoice
				to see the detailed tax breakdown and any changes to your recurring
				charges.
			</p>
            </>
          }
          isOpen={openIndex === 9}
          toggle={() => toggleItem(9)}
        />
      </div>
    </div>
  );
}
