import Image from "next/image";
import styles from "./upload.module.css";

export default function Upload() {
  return (
    <div className={styles.upload}>
      <div className={styles.step}>1</div>
      <h2 className={styles.h2}>Upload 10 photos</h2>
      <span className={styles.description}>
        Different angles, lighting, and expressions
      </span>
      <Image
        src="/upload-collage.png"
        width={576}
        height={466}
        className={styles.image}
        alt="Collage"
        priority
      />
    </div>
  );
}