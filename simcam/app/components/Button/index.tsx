import styles from "./button.module.css";
import Link from "next/link";
import { ReactNode } from "react";

interface ButtonProps {
  className?: string;
  children: ReactNode;
  onClick?: () => void; 
}

export default function Button({ className, children, onClick }: ButtonProps) {
  return (
    <button onClick={onClick} className={`${styles.button} ${className ?? ""}`}>
      <span>Get Your AI Photos Now</span>
    </button>
  );
}