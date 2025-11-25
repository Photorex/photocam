'use client';

import React from 'react';
import styles from './CanvasHelpBanner.module.css';

// Image paths
import ExamplePlain from '@/public/assets/images/mask-example-plain.png';
import ExampleDraw from '@/public/assets/images/mask-example-draw.png';
import ExampleResult from '@/public/assets/images/mask-example-result.png';

// Next Image
import Image from 'next/image';

export default function CanvasHelpBanner() {
  return (
    <div className={styles.banner_wrapper}>
      <p>
        <span className={styles.step_badge}>"STEP 1"</span> 
        <br/>
        <span className={styles.step_text}>
          &nbsp;Make sure the image is of acceptable original quality (avoid overly blurry or highly compressed files).
        </span>
      </p>

      <p>
        <span className={styles.step_badge}>"STEP 2"</span> 
        <br/>
        <span className={styles.step_text}>
          &nbsp;In <span className={styles.highlight}>PROMPT</span> field write what you wish to be generated on picture.
        </span>
      </p>

      <p>
        <span className={styles.step_badge}>"STEP 3"</span> 
        <br/>
        <span className={styles.step_text}>
          &nbsp;Provide an Image in <span className={styles.highlight}>MASK IMAGE</span> where you want something to be replaced. 
          Paint area for prompt object on <span className={styles.highlight}>CANVAS</span>, click <span className={styles.highlight}>SAVE</span> and generate image.
        </span>
      </p>

      <div className={styles.example_images}>
        <Image src={ExamplePlain} alt="Original" width={77} height={78} className={styles.example_image} />
        <Image src={ExampleDraw} alt="Mask" width={77} height={78} className={styles.example_image} />
        <Image src={ExampleResult} alt="Result" width={77} height={78} className={styles.example_image} />
      </div>
    </div>
  );
}