'use client';

import React, { useState, useRef, useEffect, forwardRef } from 'react';
import { Tooltip, Spinner } from '@heroui/react';
import styles from './GeneratedImage.module.css';

import HeartIcon from '@/public/assets/icons/heart-icon.svg';
import DownloadIcon from '@/public/assets/icons/download-icon.svg';
import MoreIcon from '@/public/assets/icons/more-icon.svg';
import GenerateSimilarIcon from '@/public/assets/icons/generate-similar-icon.svg';
import UseInitIcon from '@/public/assets/icons/use-init-icon.svg';
import DeleteIcon from '@/public/assets/icons/delete-icon.svg';
import ReusePromptIcon from '@/public/assets/icons/reuse-icon.svg';
import DetailsIcon from '@/public/assets/icons/details-icon.svg';

import Loader from '@/public/assets/icons/loader.svg';

interface GeneratedImageProps {
    src: string;
    status: 'ready' | 'generating' | 'failed';
    isFavorite: boolean;
    onToggleFavorite: () => void;
    onDelete: () => void;
    onGenerateSimilar: () => void;
    onReuse: () => void;
    onReusePrompt: () => void;
    onClickDetails: () => void;
    downloadName?: string;
}
const GeneratedImage = forwardRef<HTMLDivElement, GeneratedImageProps>(({
    src,
    isFavorite,
    onToggleFavorite,
    onDelete,
    onGenerateSimilar,
    onReuse,
    onReusePrompt,
    onClickDetails,
    downloadName,
    status
}, ref) => {

    GeneratedImage.displayName = 'GeneratedImage';

    const [isLoaded, setIsLoaded] = useState(false);
    const [showActions, setShowActions] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    const [isGenerateOpen, setIsGenerateOpen] = useState(false);
    const [isReuseOpen, setIsReuseOpen] = useState(false);
    const [isActionOpen, setIsActionOpen] = useState(false);
    const [isHoveringOverActions, setIsHoveringOverActions] = useState(false);

    const handleActionButtonClicked = () => {
        setIsActionOpen(false);
    };

    const imgRef = useRef<HTMLImageElement>(null);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation();
        // Additional logic here
    };

    const handleToggleActions = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation();
        setIsActionOpen(!isActionOpen);
        setIsGenerateOpen(false);
        setIsReuseOpen(false);
    };

    const handleMouseLeave = () => {
        if (isActionOpen) {
            setIsActionOpen(false);
        }
    };

    const showImage = status === 'ready' && isLoaded;

    return (
        <div
            onClick={onClickDetails} 
            onMouseEnter={() => setIsHoveringOverActions(true)}
            onMouseLeave={() => {
                setIsHoveringOverActions(false)
                handleMouseLeave();
            }}
            className={styles.image_container}
            ref={ref}
        >
            {!showImage && (
                <div className={styles.image_spinner}>
                <Loader className={styles.loader} />
                </div>
            )}

            <img
                src={src}
                alt="Generated"
                className={styles.image}
                style={{ display: showImage ? 'block' : 'none' }}
                onLoad={() => setIsLoaded(true)}
                onError={() => setIsLoaded(false)}
            />

            {showImage && (
                 <div 
                    className={styles.image_img_hover}
                    style={{ display: (isMobile || isHoveringOverActions || isActionOpen) ? 'block' : 'none' }}
                >
                    <div className={styles.img_button_group_wrapper}>
                        <div className={styles.image_img_hover_row}>
                            <div className={styles.image_btn_group}>
                                <Tooltip 
                                    key={'like-btn'}
                                    placement={'bottom-start'}
                                    className={`${styles.tooltip_content} ${styles.empty_tooltip_content}`}
                                >
                                    <button 
                                        className={styles.image_btn} 
                                        onClick={async (e) => {
                                            e.stopPropagation();
                                            // console.log('Like button clicked');
                                            await onToggleFavorite();
                                            // await updateImages();
                                        }}
                                    >
                                    <HeartIcon
                                        width={20}
                                        height={20}
                                        style={{
                                        fill: isFavorite ? 'red' : 'none',
                                        stroke: isFavorite ? 'red' : 'white',
                                        }}
                                    />
                                    </button>
                                </Tooltip>

                                {/* <Tooltip 
                                    key={'generate-btn'}
                                    placement={'bottom-start'}
                                    content={'Generate similar'}
                                    isOpen={isGenerateOpen}
                                    className={styles.tooltip_content}
                                >
                                    <button 
                                        className={styles.image_btn}
                                        onMouseEnter={() => setIsGenerateOpen(true)}
                                        onMouseLeave={() => setIsGenerateOpen(false)}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setIsGenerateOpen(!isGenerateOpen)
                                            // console.log('Generate button clicked');
                                            onGenerateSimilar();
                                        }}
                                    >
                                    <GenerateSimilarIcon />
                                    </button>
                                </Tooltip> */}

                                {/* <Tooltip 
                                    key={'reuse-btn'}
                                    placement={'bottom-start'}
                                    content={'Use as init image'}
                                    className={styles.tooltip_content}
                                    isOpen={isReuseOpen}
                                >
                                    <button 
                                    className={styles.image_btn}
                                    onMouseEnter={() => setIsReuseOpen(true)}
                                    onMouseLeave={() => setIsReuseOpen(false)}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setIsReuseOpen(!isReuseOpen)
                                        // console.log('Reuse button clicked');
                                        onReuse();
                                        // openFaceLock();
                                    }}
                                    >
                                    <UseInitIcon />
                                    </button>
                                </Tooltip> */}

                                <Tooltip 
                                    key={'delete-btn'}
                                    placement={'bottom-start'}
                                    className={`${styles.tooltip_content} ${styles.empty_tooltip_content}`}
                                >
                                    <button 
                                        className={styles.image_btn}
                                        onClick={async (e) => {
                                            e.stopPropagation();
                                            await onDelete();
                                            // await updateImages();
                                        }}
                                    >
                                    <DeleteIcon />
                                    </button>
                                </Tooltip>
                            </div>

                            <Tooltip
                                key={'actions-btn'}
                                placement={'bottom-end'}
                                className={styles.actions_tooltip_content}
                                isOpen={isActionOpen}
                                color="default"
                                content={
                                    <div 
                                        className={styles.image_actions} 
                                        onClick={(e) => {e.stopPropagation()}}
                                    >
                                        <a
                                            href={src}
                                            download={downloadName}
                                            className={styles.image_actions_btn}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleActionButtonClicked();
                                            }}
                                        >
                                            <DownloadIcon width={20} height={20} />
                                            Download
                                        </a>
                                        {/* <button 
                                            className={styles.image_actions_btn} 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                // console.log('Generate button clicked');
                                                handleActionButtonClicked();
                                                onGenerateSimilar();
                                            }}
                                        >
                                            <GenerateSimilarIcon width={20} height={20} />
                                            Generate Similar
                                        </button> */}

                                        {/* <button 
                                            className={styles.image_actions_btn} 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                // console.log('Init button clicked');
                                                handleActionButtonClicked();
                                                onReuse();
                                                // openFaceLock();
                                            }}
                                        >
                                            <UseInitIcon width={20} height={20} />
                                            Use as init Image
                                        </button> */}
                                        {/* <button 
                                            className={styles.image_actions_btn} 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                // console.log('Reuse prompt button clicked');
                                                handleActionButtonClicked()
                                                onReusePrompt();
                                            }}
                                        >
                                            <ReusePromptIcon width={20} height={20} />
                                            Reuse Prompt
                                        </button> */}
                                        <button 
                                            className={styles.image_actions_btn} 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                // console.log('Details button clicked');
                                                handleActionButtonClicked();
                                                onClickDetails();
                                            }}
                                        >
                                            <DetailsIcon width={20} height={20} />
                                            View Details
                                        </button>
                                        <button 
                                            className={styles.image_actions_btn} 
                                            onClick={async (e) => {
                                                handleButtonClick(e);
                                                // console.log("image", image._id)
                                                await onDelete();
                                                // await updateImages();
                                            }}
                                        >
                                            <DeleteIcon width={20} height={20} />
                                            Delete
                                        </button>
                                    </div>
                                }
                            >
                                <button 
                                    className={styles.image_btn}
                                    onClick={handleToggleActions}
                                >
                                    <MoreIcon width={20} height={20} />
                                </button>
                            </Tooltip>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
});

export default GeneratedImage;