import Image from "next/image";
import styles from "./video.module.css";
import Button from "../Button";

export default function Video() {
  return (
    <div className={styles.video}>
      <h2 className={styles.h2}>Want more than just photos?</h2>
      <div className={styles.wrapper}>
        <div className={styles.col}>
          <Image
            src="/photo.png"
            width={474}
            height={574}
            className={styles.image}
            alt="Collage"
            priority
          />
          <Button className={styles.button}>Get Your AI Video</Button>
        </div>
        <div className={styles.col}>
          <span className={styles.descr}>
            Turn your portraits into stunning 5-second AI videos. Your
            AI-generated photos can now come to life with cinematic motion – 
            perfect for Reels, TikTok, and personal branding.
          </span>
          <Image
            src="/video.png"
            width={474}
            height={574}
            className={styles.image}
            alt="Collage"
            priority
          />
        </div>
      </div>
    </div>
  );
}