'use client';

import React, { useState } from 'react';

//Next specific import
import Image from 'next/image';
import { Popover, PopoverTrigger, PopoverContent } from '@heroui/react';

// Import data
import modelData from '@/data/modelData';

// Import icons
import ArrowRight from "@/public/images/icons/controller/arrow-right.svg";
import ArrowLeft from "@/public/images/icons/controller/arrow-left.svg";
import CloseIcon from "@/public/images/icons/controller/close-icon.svg";

// Import components
import ModelGridItem from './ModelGridItem';

// Import context
import { useControlMenuContext } from '@/app/context/ControlMenuContext';

// Functions import
import { useWindowSize } from "@/app/lib/hooks/useWindowSize";

// Import styles
import styles from './styles/ModelSelector.module.css';

export default function ModelSelector() {

    // State for selected model
    const { model, setModel } = useControlMenuContext();
    const [selectedModel, setSelectedModel] = useState(
        modelData.find((m) => m.apiName === model) || modelData[0]
    );
    // State to track whether models are open
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    // State to track selected model tab
    const [activeTab, setActiveTab] = useState<'models' | 'favorites'>('models');
    // State for selected model category
    const [selectedCategory, setSelectedCategory] = useState('All');
    // Model categories
    const categories = ['All', 'Photorealistic', 'Anime', 'Epic', 'Cartoon', 'Design'];
    // State for user favorite models
    const [favorites, setFavorites] = useState<string[]>([]);

    // Get window size using custom hook
    const windowSize = useWindowSize();
    const isMobile = windowSize.width <= 1000;

    const handleModelSelect = (model: typeof modelData[0]) => {
        setSelectedModel(model);
        setModel(model.apiName);
        setIsMenuOpen(false);
    };

    const toggleFavorite = (modelName: string) => {
        setFavorites((prev) =>
          prev.includes(modelName)
            ? prev.filter((name) => name !== modelName)
            : [...prev, modelName]
        );
    };

    const filteredModels = modelData.filter(
        (model) =>
          selectedCategory === 'All' || model.category === selectedCategory
    );

    const ModelContent = (
        <>
            <div className={styles.model_popover_content}>

                <div className={styles.popover_content_header}>
                    <span className={styles.popover_content_header_text}>Models</span>
                    {!isMobile && (
                        <CloseIcon 
                            className={styles.header_close} 
                            onClick={() => setIsMenuOpen(false)}
                        />
                    )}
                </div>

                <div className={styles.content_spacer}></div>

                <div className={styles.model_tab_selector}>
                    <button
                        className={`${styles.model_tab} ${activeTab === 'models' ? styles.active_tab : ''}`}
                        onClick={() => setActiveTab('models')}
                    >
                        Models
                    </button>
                    <button
                        className={`${styles.model_tab} ${activeTab === 'favorites' ? styles.active_tab : ''}`}
                        onClick={() => setActiveTab('favorites')}
                    >
                        My favorite
                    </button>
                </div>

                <div className={styles.model_category_wrapper}>
                    {categories.map((category, index) => (
                        <button
                            key={index}
                            className={`${styles.model_category_button} ${
                                selectedCategory === category ? styles.model_category_button_active : ''
                            }`}
                            onClick={() => setSelectedCategory(category)}
                        >
                            {category}
                        </button>
                    ))}
                </div>

                <div className={styles.select_models_list}>
                    {filteredModels.map((model, index) => (
                        <ModelGridItem
                            key={index}
                            model={model}
                            isSelected={selectedModel.name === model.name}
                            isFavorite={favorites.includes(model.name)}
                            onClick={() => handleModelSelect(model)}
                            onLikeToggle={() => toggleFavorite(model.name)}
                        />
                    ))}
                </div>

                </div>
        </>
    );

    return (
        <div className={styles.controls_selector_wrapper}>

            <label className={styles.model_controls_label} htmlFor="prompt">
                Models
            </label>

            {!isMobile ? (
                <Popover
                    isOpen={isMenuOpen}
                    onOpenChange={(open) => setIsMenuOpen(open)}
                    placement="right-start"
                >
                    <PopoverTrigger>
                        <button className={`${styles.model_selector_button} ${isMenuOpen ? styles.model_selector_button_active : ''}`}>
                            <div className={styles.image_wrapper}>
                                <Image
                                    src={selectedModel.image}
                                    alt={selectedModel.name}
                                    className={styles.model_image}
                                    fill
                                />
                            </div>

                            <span className={styles.model_name}>{selectedModel.name}</span>
                            {isMenuOpen ? (
                                <ArrowLeft className={`${styles.model_arrow} ${isMenuOpen ? styles.model_arrow_active : ''}`} />
                            ) : (
                                <ArrowRight className={styles.model_arrow} />
                            )}
                        </button>
                    </PopoverTrigger>
                    <PopoverContent className={styles.model_popover_content_wrapper}>
                        {ModelContent}
                    </PopoverContent>
                </Popover>
            ) : ( 
                <>
                    <button
                        className={`${styles.model_selector_button} ${isMenuOpen ? styles.model_selector_button_active : ''}`}
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        <div className={styles.image_wrapper}>
                        <Image
                            src={selectedModel.image}
                            alt={selectedModel.name}
                            className={styles.label_image}
                            fill
                        />
                        </div>
                        <span className={styles.model_name}>{selectedModel.name}</span>
                        {isMenuOpen ? (
                            <ArrowLeft className={`${styles.model_arrow} ${isMenuOpen ? styles.model_arrow_active : ''}`} />
                        ) : (
                            <ArrowRight className={styles.model_arrow} />
                        )}
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
                            <div className={styles.modal}>
                                {ModelContent}
                            </div>
                        </div>
                    )}
                </>
            )}

        </div>
    );
}