import styles from "./offerGallery.module.css";
import Image from "next/image";

interface GalleryImage {
  src: string;
  alt: string;
}

const images: GalleryImage[] = [
  { src: "/gallery-1.png", alt: "Gallery Image 1" },
  { src: "/gallery-2.png", alt: "Gallery Image 2" },
  { src: "/gallery-3.png", alt: "Gallery Image 3" },
  { src: "/gallery-4.png", alt: "Gallery Image 4" },
  { src: "/gallery-5.png", alt: "Gallery Image 5" },
  { src: "/gallery-6.png", alt: "Gallery Image 6" },
  { src: "/gallery-7.png", alt: "Gallery Image 7" },
  { src: "/gallery-8.png", alt: "Gallery Image 8" },
  { src: "/gallery-9.png", alt: "Gallery Image 9" },
];

export default function OfferGallery() {
  return (
    <div className={styles.gallery}>
      {images.map((image, index) => (
        <Image
          key={index}
          src={image.src}
          width={182}
          height={272}
          alt={image.alt}
          className={styles.image}
          priority
        />
      ))}
    </div>
  );
}