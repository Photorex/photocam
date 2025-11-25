import styles from "./grid.module.css";
import Image from "next/image";

export default function Grid() {
  return (
    <div className={styles.grid}>
      <h2 className={styles.h2}>
        Thousands have upgraded their photos, here’s what they’re saying
      </h2>
      <div className={styles.container_scroller}>
        <div className={styles.container}>
          {[
            { src: "/card-1.svg", width: 316, height: 165 },
            { src: "/card-2.svg", width: 316, height: 482 },
            { src: "/card-3.svg", width: 316, height: 482 },
            { src: "/card-4.svg", width: 316, height: 165 },
            { src: "/card-5.svg", width: 316, height: 165 },
            { src: "/card-6.svg", width: 316, height: 482 },
            { src: "/card-7.svg", width: 316, height: 482 },
            { src: "/card-8.svg", width: 316, height: 165 },
          ].map((image, index) => (
            <div key={index} className={styles.col}>
              <div className={styles.card}>
                <Image
                  src={image.src}
                  width={image.width}
                  height={image.height}
                  className={styles.image}
                  alt={`Collage ${index + 1}`}
                  priority
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}