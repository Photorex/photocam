"use client";

import { useState } from "react";
import styles from "./faq.module.css";
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

export default function Faq() {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const toggleItem = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

  return (
    <div className={styles.faq}>
      <h2 className={styles.h2}>
        Still have questions? <br />
        We’ve got you covered.
      </h2>
      <div className={styles.accordion_wrapper}>
        <AccordionItem
          title="How realistic are the AI-generated photos?"
          content={
            <p>
              Our AI portraits look just like professional studio shots –{" "}
              <b>no weird AI effects</b>. We use advanced AI models to create{" "}
              <b>natural, high-quality images that truly look like you.</b>
            </p>
          }
          isOpen={openIndex === 0}
          toggle={() => toggleItem(0)}
        />
        <AccordionItem
          title="Can my AI photos be turned into videos?"
          content={
            <p>
              Yes! You can <b>bring your portraits to life</b> with{" "}
              <b>5-second AI-generated videos</b> that look smooth and natural.
              Perfect for <b>Reels, TikTok, and personal branding.</b>
            </p>
          }
          isOpen={openIndex === 1}
          toggle={() => toggleItem(1)}
        />
        <AccordionItem
          title="How long does it take to generate photos?"
          content={
            <ul>
              <li>
                <b>Avatar creation</b>(AI learning your facial features) takes{" "}
                <b>about 15 minutes</b>
              </li>
              <li>
                <b>Photo generation</b>after that takes takes{" "}
                <b>around 10 seconds per image</b>
              </li>
            </ul>
          }
          isOpen={openIndex === 2}
          toggle={() => toggleItem(2)}
        />
        <AccordionItem
          title="What kind of photos should I upload?"
          content={
            <p>
              For the best results, upload <b>10 high-quality photos</b> with
              different angles, lighting, and expressions.{" "}
              <b>Avoid blurry images, heavy filters, or sunglasses</b> – the
              more natural, the better!
            </p>
          }
          isOpen={openIndex === 3}
          toggle={() => toggleItem(3)}
        />
        <AccordionItem
          title="Will all photos look 100% like me?"
          content={
            <p>
              Yes, as long as your uploaded photos are high quality. The AI
              learns from your images and produces{" "}
              <b>realistic portraits without distortions</b>. Based on our
              stats,{" "}
              <b>
                70% of images turn out great, and 5-10% are exceptionally good.
              </b>
            </p>
          }
          isOpen={openIndex === 4}
          toggle={() => toggleItem(4)}
        />
        <AccordionItem
          title="Is my data safe?"
          content={
            <p>
              Absolutely. We <b>never share your photos</b> and use{" "}
              <b>encrypted storage</b>
              {" "}to keep your data secure. You can{" "}
              <b>delete your original images anytime</b> after generation.
            </p>
          }
          isOpen={openIndex === 5}
          toggle={() => toggleItem(5)}
        />
        <AccordionItem
          title="Can I get a refund if I don’t like the results?"
          content={
            <p>
              Due to the nature of AI-generated content,{" "}
              <b>we don’t offer refunds</b>, but we’re confident you’ll love
              your portraits. If something looks off, our team will{" "}
              <b>adjust your results for free</b>!
            </p>
          }
          isOpen={openIndex === 6}
          toggle={() => toggleItem(6)}
        />
        <AccordionItem
          title="Can I use this on my phone?"
          content={
            <p>
              Yes! Our AI headshot generator works perfectly on{" "}
              <b>both desktop and mobile devices</b> – no app download required.
            </p>
          }
          isOpen={openIndex === 7}
          toggle={() => toggleItem(7)}
        />
        <AccordionItem
          title="Can I use these AI photos for business or printing?"
          content={
            <p>
              Of course! Your <b>high-resolution AI portraits</b> are perfect
              for {" "}
              <b>
                LinkedIn, websites, resumes, and even printed materials like
                business cards
              </b>
              .
            </p>
          }
          isOpen={openIndex === 8}
          toggle={() => toggleItem(8)}
        />
      </div>
    </div>
  );
}
