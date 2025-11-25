import styles from "./banner.module.css";
import Image from "next/image";
import Button from "../Button";

interface BannerProps {
    onCtaClick: () => void;
}
  
export default function Banner({ onCtaClick }: BannerProps) {
  return (
    <div className={styles.banner}>
      <div className={styles.info}>
        <div className={styles.logo}>
          <Image
            src="/logo.svg"
            width={144}
            height={16}
            className={styles.image}
            alt="Logo"
            priority
          />
        </div>
        <div className={styles.slogan}>
          Get professional <br />
          <span>AI Headshots</span> today
        </div>
        <Button className={styles.button} onClick={onCtaClick}>Get Your AI Photos</Button>
      </div>
      <Image
        src="/banner-image.png"
        width={378}
        height={378}
        className={styles.info_image}
        alt="AI Headshots Banner"
        priority
      />
    </div>
  );
}