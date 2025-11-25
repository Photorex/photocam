'use client';

import React, { useState } from 'react';

// Context
import { useControlMenuContext } from '@/app/context/ControlMenuContext';

import Image from 'next/image';

// NextUi
import { Popover, PopoverTrigger, PopoverContent } from '@heroui/react';

// Icons
import ArrowRight from "@/public/images/icons/controller/arrow-right.svg";
import AllModelsIcon from "@/public/assets/logos/all-photo-models.svg";
import ArrowLeft from "@/public/images/icons/controller/arrow-left.svg";
import CloseIcon from "@/public/images/icons/controller/close-icon.svg";

import Loader from '@/public/assets/icons/loader.svg';

import { signIn, signOut, useSession } from "next-auth/react";

// Import styles
import styles from './PhotoshootModelSelector.module.css';

// Functions import
import { useWindowSize } from "@/app/lib/hooks/useWindowSize";

import { trackGtmEvent } from '@/app/lib/analytics/google/trackGtmEvent';

import NewModelModal from '../NewModelModal/NewModelModal';

// Add UserContext import
import { useUserContext } from '@/app/context/UserContext';

const NEXT_PUBLIC_USER_IMAGES_URL = process.env.NEXT_PUBLIC_USER_IMAGES_URL!;

export default function PhotoshootModelSelector({ 
    onToggleCostPrice,
}: { 
    onToggleCostPrice?: (generationCost: number) => void; 
}) {

    const { data: session } = useSession();
    const { modelMap } = useUserContext();

    const {
        selectedPhotoshootModelIndex,
        setSelectedPhotoshootModelIndex,
        selectedGenderFilter, 
        setSelectedGenderFilter,
    } = useControlMenuContext();

    const showNewButton = modelMap.length < 3;

    const showAllButton = modelMap.length >= 3;
    const modelsToShow = showAllButton ? modelMap.slice(0, 3) : modelMap;

    // State to track whether sizes are open
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Get window size using custom hook
    const windowSize = useWindowSize();
    const isMobile = windowSize.width <= 1000;

    const ResolutionContent = (
        <div className={styles.resolution_popover_content}>

            <div className={styles.popover_content_header}>
                <span className={styles.popover_content_header_text}>Your model</span>
                <CloseIcon
                    className={styles.header_close}
                    onClick={() => setIsMenuOpen(false)}
                />
            </div>

            <div className={styles.content_spacer}></div>


            <div className={styles.model_row_content}>
                {modelMap.map((model, index) => (
                    <div key={index} className={styles.model_card_wrapper}>
                        
                        <button
                            className={`${styles.model_card_closed} ${selectedPhotoshootModelIndex === index ? styles.model_card_selected : ''}`}
                            onClick={() => {
                                if (model.status !== 'generating') {
                                setSelectedPhotoshootModelIndex(index);
                                setIsMenuOpen(!isMenuOpen)
                                }
                            }}
                            disabled={model.status === 'generating'}
                            >
                            {(model.status === 'generating' || !model.model_image) ? (
                                <Loader className={styles.model_image_loader} />
                            ) : (
                                <img
                                    src={model.model_image ? `${NEXT_PUBLIC_USER_IMAGES_URL}${model.model_image}` : "/assets/images/lola-model.png"}
                                    alt={model.name}
                                    width={62}
                                    height={62}
                                    className={styles.model_image}
                                />
                            )}
                        </button>

                        {/* <button
                            className={`${styles.model_card} ${selectedPhotoshootModelIndex === index ? styles.model_card_selected : ''}`}
                            onClick={() => {
                                setSelectedPhotoshootModelIndex(index);
                                setIsMenuOpen(!isMenuOpen)
                            }}
                        >
                            <img
                                src={model.model_image ? `${NEXT_PUBLIC_USER_IMAGES_URL}${model.model_image}` : "/assets/images/lola-model.png"}
                                alt={model.name}
                                width={62}
                                height={62}
                                className={styles.model_image}
                            />
                        </button> */}

                        <span className={styles.model_name}>{model.name}</span>
                    </div>
                ))}

                {showAllButton && (
                <button 
                    className={styles.model_card_all_new} 
                    onClick={() => {
                        setSelectedPhotoshootModelIndex(-1);
                        if (session?.user) {
                            trackGtmEvent("make_model", {
                              ecommerce: { usid: session.user.id }
                            });
                            // console.log('make_model gtm sent');
                        }
                    }}
                >
                    <div className={styles.all_icon_wrapper}>
                        <AllModelsIcon
                            className={styles.all_icon}
                            onClick={() => {
                                setIsMenuOpen(false);
                                setIsModalOpen(true);
                            }}
                        />
                    </div>
        
                    <span className={styles.model_name}>Make new</span>
                </button>
                )}
            </div>

        </div>
    );

    return (
        <div className={styles.resolution_options_wrapper}>

            <label className={styles.resolution_options_label} htmlFor="resolution">
                Your model
            </label>

            <div className={`${styles.model_row} ${modelMap.length <= 3 ? styles.model_row_short : ''}`}>
                {modelsToShow.map((model, index) => (

                <div key={index} className={styles.model_card_wrapper}>
                    <button
                        className={`${styles.model_card_closed} ${selectedPhotoshootModelIndex === index ? styles.model_card_selected : ''}`}
                        onClick={() => {
                            if (model.status !== 'generating') {
                            setSelectedPhotoshootModelIndex(index);
                            }
                        }}
                        disabled={model.status === 'generating'}
                        >
                        {model.status === 'generating' ? (
                            <Loader className={styles.model_image_loader} />
                        ) : (
                            <img
                                src={model.model_image ? `${NEXT_PUBLIC_USER_IMAGES_URL}${model.model_image}` : "/assets/images/lola-model.png"}
                                alt={model.name}
                                width={64}
                                height={64}
                                className={styles.model_image}
                            />
                        )}
                    </button>

                    {/* <button
                        className={`${styles.model_card_closed} ${selectedPhotoshootModelIndex === index ? styles.model_card_selected : ''}`}
                        onClick={() => setSelectedPhotoshootModelIndex(index)}
                    >
                        <img
                            src={model.model_image ? `${NEXT_PUBLIC_USER_IMAGES_URL}${model.model_image}` : "/assets/images/lola-model.png"}
                            alt={model.name}
                            width={64}
                            height={64}
                            className={styles.model_image}
                        />
                    </button> */}

                    <span className={styles.model_name}>{model.name}</span>
                </div>
                ))}

                {showNewButton && (
                    <div className={styles.model_card_wrapper}>
                        <button
                            className={styles.model_card_all}
                            onClick={() => setIsModalOpen(true)}
                        >
                            <div className={styles.all_icon_wrapper}>
                                <AllModelsIcon className={styles.all_icon} />
                            </div>
                        </button>
                        <span className={styles.model_name}>New</span>
                    </div>
                )}

                {showAllButton && (
                    <>
                        {(!isMobile) ? (
                            <Popover
                                isOpen={isMenuOpen}
                                onOpenChange={(open) => setIsMenuOpen(open)}
                                placement="right-start"
                            >
                                <PopoverTrigger>
                                    <button className={styles.model_card_all} onClick={() => setSelectedPhotoshootModelIndex(-1)}>
                                        <div className={styles.all_icon_wrapper}>
                                            <AllModelsIcon
                                                className={styles.all_icon}
                                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                            />
                                        </div>
                            
                                        <span className={styles.model_name}>All</span>
                                    </button>
                                </PopoverTrigger>
                                <PopoverContent className={styles.resolution_popover_content_wrapper}>
                                    {ResolutionContent}
                                </PopoverContent>
                            </Popover>
                        ) : ( 
                            <>
                                <button className={styles.model_card_all_mobile} onClick={() => setSelectedPhotoshootModelIndex(-1)}>
                                    <div className={styles.all_icon_wrapper_mobile}>
                                        <AllModelsIcon
                                            className={styles.all_icon}
                                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                                        />
                                    </div>
                            
                                    <span className={styles.model_name}>All</span>
                                </button>

                                {isMenuOpen && (
                                    <div 
                                        className={styles.modal_backdrop}
                                        onClick={(e) => {
                                            if (e.target === e.currentTarget) {
                                                setIsMenuOpen(false);
                                            }
                                        }}
                                    >
                                        <div className={styles.resolution_modal}>
                                            {ResolutionContent}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </>
                )}

            </div>

            <NewModelModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                gender={selectedGenderFilter}
                setGender={setSelectedGenderFilter}
                onToggle={(generationCost) => onToggleCostPrice?.(generationCost)}
            />

        </div>
    );
}