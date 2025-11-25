import Image from "next/image";
import styles from "./choose.module.css";

export default function Choose() {
  return (
    <div className={styles.choose}>
      <div className={styles.step}>2</div>
      <h2 className={styles.h2}>Choose your style</h2>
      <span className={styles.description}>
        LinkedIn, Casual, Business, Wedding & more
      </span>
      <div className={styles.images}>
        <Image
          src="/choose-1.png"
          width={278}
          height={378}
          className={styles.image}
          alt="Style 1"
          priority
        />
        <Image
          src="/choose-2.png"
          width={278}
          height={378}
          className={styles.image}
          alt="Style 2"
          priority
        />
        <Image
          src="/choose-3.png"
          width={278}
          height={378}
          className={styles.image}
          alt="Style 3"
          priority
        />
      </div>
    </div>
  );
}