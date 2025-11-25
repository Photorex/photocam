"use client";

import { useState, useEffect, useRef } from "react";
import OfferGallery from "../OfferGallery";
import OfferInfo from "../OfferInfo";
import styles from "./offer.module.css";

export default function Offer() {
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [followerPos, setFollowerPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isActive, setIsActive] = useState<boolean>(false);
  const [zone, setZone] = useState<number>(1);
  const offerRef = useRef<HTMLDivElement | null>(null);
  const requestRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isActive) return;

    const handleMouseMove = (e: MouseEvent) => {
      setCursorPos({ x: e.clientX, y: e.clientY });

      if (offerRef.current) {
        const { left, width } = offerRef.current.getBoundingClientRect();
        const relativeX = e.clientX - left;
        const quarter = width / 4;

        if (relativeX < quarter) setZone(1);
        else if (relativeX < quarter * 2) setZone(2);
        else if (relativeX < quarter * 3) setZone(3);
        else setZone(4);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [isActive]);

  useEffect(() => {
    const lerp = (start: number, end: number, factor: number): number => start + (end - start) * factor;

    const updateFollower = () => {
      setFollowerPos((prev) => ({
        x: lerp(prev.x, cursorPos.x, 0.1), // Smaller factor increases lag
        y: lerp(prev.y, cursorPos.y, 0.1),
      }));
      requestRef.current = requestAnimationFrame(updateFollower);
    };

    if (isActive) {
      requestRef.current = requestAnimationFrame(updateFollower);
    } else {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    }

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [cursorPos, isActive]);

  return (
    <div
      ref={offerRef}
      className={styles.offer}
      onMouseEnter={() => setIsActive(true)}
      onMouseLeave={() => setIsActive(false)}
    >
      <div className={styles.offer_wrapper}>
        <OfferInfo />
        <OfferGallery />
      </div>
      <div
        className={`${styles.cursorFollower} ${styles[`zone${zone}`]} ${
          isActive ? styles.active : ""
        }`}
        style={{
          left: `${followerPos.x}px`,
          top: `${followerPos.y}px`,
        }}
      />
    </div>
  );
}