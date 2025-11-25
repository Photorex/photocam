"use client";

import { useState, useEffect } from "react";
import styles from "./slider.module.css";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/free-mode";
import Image from "next/image";

interface ImageData {
  src: string;
  alt: string;
}

const images: ImageData[] = [
  { src: "/slider-1.png", alt: "Slider Image 1" },
  { src: "/slider-2.png", alt: "Slider Image 2" },
  { src: "/slider-3.png", alt: "Slider Image 3" },
  { src: "/slider-4.png", alt: "Slider Image 4" },
  { src: "/slider-5.png", alt: "Slider Image 5" },
];

export default function Slider() {
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  return (
    <div className={styles.slider}>
      <div className={styles.step}>3</div>
      <h2 className={styles.h2}>
        Get 50 AI-generated professional portraits in minutes
      </h2>

      {isMobile ? (
        <Swiper
          slidesPerView={1.4}
          centeredSlides={true}
          spaceBetween={38}
          loop={true}
          className={styles.swiper}
        >
          {images.map((image, index) => (
            <SwiperSlide key={index} className={styles.slider_item}>
              <Image
                src={image.src}
                width={256}
                height={272}
                alt={image.alt}
                className={styles.image}
                priority
              />
            </SwiperSlide>
          ))}
        </Swiper>
      ) : (
        <div className={styles.gallery}>
          {images.map((image, index) => (
            <Image
              key={index}
              src={image.src}
              width={256}
              height={272}
              alt={image.alt}
              className={styles.image}
              priority
            />
          ))}
        </div>
      )}
    </div>
  );
}