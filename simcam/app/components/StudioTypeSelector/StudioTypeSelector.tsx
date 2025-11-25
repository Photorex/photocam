"use client";

import { useControlMenuContext } from "@/app/context/ControlMenuContext";
import { useState, useRef, useEffect } from "react";
import styles from "./StudioTypeSelector.module.css";
import ArrowIcon from "@/public/assets/icons/arrow-down.svg";
import { useRouter, usePathname } from "next/navigation";

export default function StudioTypeSelector() {

    const router = useRouter();
    const pathname = usePathname();

    const { studioType, setStudioType } = useControlMenuContext();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const toggleDropdown = () => setIsOpen(!isOpen);

    const handleSelect = (value: "Creative Studio" | "AI Photoshoot") => {
        setStudioType(value);
        setIsOpen(false);
      
        // Navigate to proper route
        const path = value === "Creative Studio" ? "/studio" : "/photoshoot";
        router.push(path);
      };

    // Sync studioType to current path
    useEffect(() => {
        if (pathname.includes("/studio")) {
            setStudioType("Creative Studio");
        } else {
            setStudioType("AI Photoshoot");
        }
    }, [pathname, setStudioType]);  

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
            setIsOpen(false);
        }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div ref={dropdownRef} className={styles.container}>
        <button onClick={toggleDropdown} className={styles.trigger}>
            <span className={styles.option_text}>{studioType}</span>
            <ArrowIcon className={`${styles.arrow} ${isOpen ? styles.arrowOpen : ""}`} />
        </button>

        {isOpen && (
            <div className={styles.dropdown}>
            {["AI Photoshoot"].map((option) => (
                <div
                key={option}
                onClick={() => handleSelect(option as "AI Photoshoot")}
                className={`${styles.option} ${
                    option === studioType ? styles.optionSelected : ""
                }`}
                >
                {option}
                </div>
            ))}
            </div>
        )}
        </div>
    );
}