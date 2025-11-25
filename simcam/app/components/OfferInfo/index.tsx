import Button from "../Button";
import styles from "./offerInfo.module.css";

export default function OfferInfo() {
  return (
    <div className={styles.offer_info}>
      <span className={styles.offer_description}>
        AI Photos That Look Real, Feel Effortless
      </span>
      <h1 className={styles.h1}>Your Best Shot — Instantly</h1>
      <ul className={styles.list}>
        <li>Forget the studio, skip the shoot.</li>
        <li>Look perfectly polished in seconds.</li>
        <li>Ideal for work, social, and dating profiles.</li>
      </ul>
      <Button>Get Your AI Photos Now</Button>
    </div>
  );
}