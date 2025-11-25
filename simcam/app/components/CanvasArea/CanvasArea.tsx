import React, { useRef, useCallback, useState } from "react";
import { ReactSketchCanvas } from "react-sketch-canvas";
import { Button, Slider } from "@heroui/react";
import styles from './CanvasArea.module.css';

interface Prediction {
  output?: string[];
  lastImage?: string | null;
}

interface CanvasProps {
  userUploadedImage?: string | null;
  predictions: Prediction[];
  onDraw: (data: string) => void;
  onSave: (data: string) => void;
  onImageUpload: (image: string) => void;
}

const CanvasArea: React.FC<CanvasProps> = ({ userUploadedImage, predictions, onDraw, onSave, onImageUpload }) => {
  const canvasRef = useRef<any>(null);
  const [strokeWidth, setStrokeWidth] = useState<number>(40);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleDropzoneClick = () => {
    fileInputRef.current?.click();
  };

  // Handle drawing change
  const handleChange = useCallback(async () => {
    if (canvasRef.current) {
      const paths = await canvasRef.current.exportPaths();
      if (paths.length) {
        const data = await canvasRef.current.exportImage("svg");
        onDraw(data);
      }
    }
  }, [onDraw]);

  // Handle canvas actions (undo, clear, save)
  const handleUndo = useCallback(() => {
    if (canvasRef.current) {
      canvasRef.current.undo();
    }
  }, []);

  const handleClear = useCallback(() => {
    if (canvasRef.current) {
      canvasRef.current.clearCanvas();
    }
  }, []);

  const handleSave = useCallback(async () => {
    if (canvasRef.current) {
      const dataUrl = await canvasRef.current.exportImage("png");
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const img = document.createElement("img");
      img.src = dataUrl;

      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
          if (data[i + 3] === 0) {
            data[i] = 0;
            data[i + 1] = 0;
            data[i + 2] = 0;
            data[i + 3] = 255;
          }
        }

        ctx.putImageData(imageData, 0, 0);
        const finalDataUrl = canvas.toDataURL("image/png");
        onSave(finalDataUrl);
      };
    }
  }, [onSave]);

  // Handle brush size change
  const handleSliderBrushChange = (value: number | number[]) => {
    if (Array.isArray(value)) {
      setStrokeWidth(value[0]);
    } else {
      setStrokeWidth(value);
    }
  };
  
  // Handle image drop
  const handleImageDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];

    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const uploadedImage = e.target?.result as string;
        onImageUpload(uploadedImage);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle image upload via input
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files && event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const uploadedImage = e.target?.result as string;
        onImageUpload(uploadedImage);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className={styles.canvas_wrapper}>
      {/* Drop Zone */}
      {!userUploadedImage && (
        <div 
          className={styles.dropzone}
          onClick={handleDropzoneClick}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleImageDrop}
        >
          <input
            id="fileUploadMask"
            ref={fileInputRef}
            accept="image/png,.png,image/jpeg,.jpeg,.jpg"
            type="file"
            onChange={handleImageUpload}
            className={styles.input_values_img}
          />
          <label className={styles.input_img_label} htmlFor="fileUploadMask">
            Drag an image here, or click to select one.
          </label>
        </div>
      )}

      {/* Image & Canvas */}
      {userUploadedImage && (
        <>
          <div className={styles.canvas_image_painter}>
            <img src={userUploadedImage} alt="Uploaded" className={styles.canvas_image}/>
            <div className={styles.canvas_image_canvas}>
              <ReactSketchCanvas
                className={styles.canvas_image_inner}
                ref={canvasRef}
                strokeWidth={strokeWidth}
                strokeColor="white"
                canvasColor="transparent"
                onChange={handleChange}
              />
            </div>
          </div>

          <div className={styles.canvas_controls}>
            <div className={styles.canvas_controls_brush_size}>
              <label htmlFor="brushSize" className="block text-white mb-2">
                Brush Size: {strokeWidth}
              </label>
              <Slider
                color="foreground"
                size="sm"
                step={5}
                minValue={10}
                maxValue={80}
                value={strokeWidth}
                onChange={handleSliderBrushChange}
                className={styles.slider_values_input}
              />
            </div>

            <div className={styles.canvas_controls_buttons}>
            <Button 
              isIconOnly 
              className={styles.image_nav_btn_undo}
              onClick={(e) => {
                e.preventDefault();
                handleUndo();
              }}
            >
              <svg viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg">
                <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                  <g fill="white" fillRule="nonzero">
                    <path d="M4.75,1.99981721 C5.12969577,1.99981721 5.44349096,2.28197109 5.49315338,2.64804665 L5.5,2.74981721 L5.5,8.43981721 L10.0743393,3.87995431 C12.516285,1.43800869 16.4384555,1.37844904 18.9526072,3.70127537 L19.1384834,3.87995431 C21.6414777,6.38294858 21.6414777,10.4411041 19.1384834,12.9440984 L10.2933472,21.7832698 L10.2933472,21.7832698 C10.0003251,22.0760341 9.52558023,22.0756964 9.23268704,21.7828032 C8.93979385,21.48991 8.9401317,21.0149074 9.23315376,20.7221431 L18.0778232,11.8834382 L18.0778232,11.8834382 C19.9950311,9.96623037 19.9950311,6.85782231 18.0778232,4.94061449 C16.2187126,3.08150387 13.2395019,3.02516718 11.3118079,4.77230194 L11.1342335,4.94137945 L6.562,9.49981721 L12.25,9.5 C12.6296958,9.5 12.943491,9.78215388 12.9931534,10.1482294 L13,10.25 C13,10.6296958 12.7178461,10.943491 12.3517706,10.9931534 L12.25,11 L4.75,11 C4.37030423,11 4.05650904,10.7178461 4.00684662,10.3517706 L4,10.25 L4,2.74981721 C4,2.33560365 4.33578644,1.99981721 4.75,1.99981721 Z">
                    </path>
                  </g>
                </g>
              </svg>
            </Button>
              <Button onClick={handleClear}>Reset</Button>
              {/* <Button onClick={clearImage}>Clear Image</Button> */}
              <Button onClick={handleSave}>Save Mask</Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CanvasArea;