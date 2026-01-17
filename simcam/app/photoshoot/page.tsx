'use client';

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Tabs, Tab } from "@heroui/react";
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';

import { useUserImages } from "@/app/context/UserImagesContext";
import { useControlMenuContext } from "@/app/context/ControlMenuContext";

import { useUserVideos } from "../context/UserVideosContext";

// Components
import ModelCategorySelector from "../components/ModelCategorySelector/ModelCategorySelector";
import GenderFilterDropdown from "../components/GenderFilterDropdown/GenderFilterDropdown";
import PhotoshootCard from "../components/PhotoshootCard/PhotoshootCard";
import PhotoshootTypeData from "../lib/data/PhotoshootTypeData";
import SpinningLoader from "../components/SpinningLoader/SpinningLoader";
import ModelDetailsModal from "../components/ModelDetailsModal/ModelDetailsModal";
import GeneratedImage from "../components/GeneratedImage/GeneratedImage";
import GeneratedVideo from "../components/GeneratedVideo/GeneratedVideo";
import ImageDetailsModal from "../components/ImageDetailsModal/ImageDetailsModal";
import VideoDetailsModal from "../components/VideoDetailsModal/VideoDetailsModal";
import Footer from "../components/Footer/Footer";
import PhotoshootControls from "../components/PhotoshootControls/PhotoshootControls";
import ImageVideoSwitcher from "../components/PhotoshootControls/ImageVideoSwitcher";
import StyleCardOne from "../components/StyleCard/StyleCardOne";
import StyleCardTwo from "../components/StyleCard/StyleCardTwo";
import StyleCardThree from "../components/StyleCard/StyleCardThree";
import StyleCardFour from "../components/StyleCard/StyleCardFour";
import StyleCardFive from "../components/StyleCard/StyleCardFive";
import StyleCardSix from "../components/StyleCard/StyleCardSix";
import LoginModal from "../components/LoginModal/LoginModal";
import MobileMenu from "../components/MobileMenu/MobileMenu";

import SubscriptionPopup from "../components/SubscriptionPopup/SubscriptionPopup";

import { deleteImageById, toggleFavoriteImage } from "../lib/api/imageActions";
import { deleteVideoById, toggleFavoriteVideo } from "../lib/api/videoActions";

import { eventBus } from "../lib/event/eventBus";

import { signIn, signOut, useSession } from "next-auth/react";

import styles from "./page.module.css";

// Functions import
import { useWindowSize } from "@/app/lib/hooks/useWindowSize";

import { fetchUserImages, ImageMetadata } from "../lib/api/fetchUserImages";
import { MemoryTracker } from '@/app/lib/memoryTracker';
import { VideoMetadata } from "../lib/api/fetchUserVideos";

// Import icons
import FilterIcon from "@/public/assets/icons/filter-icon.svg";
import ArrowIcon from "@/public/assets/icons/arrow-down-photoshoot.svg";
import ControllersBackIcon from '@/public/assets/icons/back-arrow-icon.svg'
import Image from "next/image";

const NEXT_PUBLIC_USER_IMAGES_URL = process.env.NEXT_PUBLIC_USER_IMAGES_URL!;
const NEXT_PUBLIC_USER_VIDEOS_URL = process.env.NEXT_PUBLIC_USER_VIDEOS_URL!;

const IMAGES_PER_PAGE = 20;

const VISIBLE_TYPES = new Set([
    "Instagram Model",
    "Future Baby",
    "Private Jet",
    "K-pop Idol",
    "High School",
    "Anime Style",
]);

const mobileRoundImgSrc = '/assets/images/onboarding/selfie_3.png'     
const mobileRoundImgSrcTwo = '/assets/images/onboarding/slider_1.png'      

type MediaItem =
  | (ImageMetadata & { kind: 'image' })
  | (VideoMetadata & { kind: 'video' });

const mergeMedia = (imgs: ImageMetadata[], vids: VideoMetadata[]) =>
    [
        ...imgs.map(i => ({ ...i, kind: 'image' as const })),
        ...vids.map(v => ({ ...v, kind: 'video' as const })),
    ].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));

    const splitIntoColumns = (media: MediaItem[]) => {
    const cols = Array.from(
        { length: window.innerWidth < 768 ? 1 : window.innerWidth >= 1600 ? 5 : 3 },
        () => [] as MediaItem[]
    );
    media.forEach((m, idx) => cols[idx % cols.length].push(m));
    return cols;
};

// Controller Arrow Button Component
const ControllerArrowButton = ({ isOpen }: { isOpen: boolean }) => {
    return (
        <div className={`${styles.controller_arrow} ${isOpen ? styles.controller_arrow_open : ''}`}>
            <Image 
                src="/assets/icons/controller-icon-arrow.svg" 
                alt="Controller toggle"
                width={24}
                height={24}
            />
        </div>
    );
};

export default function Photoshoot() {

    const { data: session } = useSession();
    const searchParams = useSearchParams();
    const router = useRouter();
    // Get window size using custom hook
    const windowSize = useWindowSize();
    const isMobile = windowSize.width <= 1000;

    const [isLoginModalOpen, setLoginModalOpen] = useState(false);
    
    const toggleLoginModal = () => {
        setLoginModalOpen(!isLoginModalOpen);
    };

    const [generationCost, setGenerationCost] = useState<number | undefined>(undefined);
    const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
    const togglePricingModal = (cost?: number) => {
        // If cost is passed, log it, otherwise, log that no cost is provided
        if (cost !== undefined) {
            setGenerationCost(cost);  // Set the cost in the state
            // console.log("Generation cost:", cost);
        }
        setIsPricingModalOpen((v) => !v);
    };
    // Add state for controller panel
    const [isControllerOpen, setIsControllerOpen] = useState(false);
    const [isPanelClosing, setIsPanelClosing] = useState(false);
    
    const toggleController = () => {
        if (isControllerOpen) {
            // Start closing animation
            setIsPanelClosing(true);
            // Panel will be closed after animation completes
        } else {
            setIsControllerOpen(true);
        }
    };

    useEffect(() => {
        if (isControllerOpen) {
            // Lock scrolling on body when panel is open
            document.body.style.overflow = 'hidden';
        } else {
            // Re-enable scrolling when panel is closed
            document.body.style.overflow = '';
        }
        
        return () => {
            // Cleanup - ensure scrolling is re-enabled when component unmounts
            document.body.style.overflow = '';
        };
    }, [isControllerOpen]);

    useEffect(() => {
        if (isControllerOpen || isPanelClosing) {
            document.body.classList.add('scroll-locked');
        } else {
            document.body.classList.remove('scroll-locked');
        }

        return () => document.body.classList.remove('scroll-locked');
    }, [isControllerOpen, isPanelClosing]);

    const categories = [
        'All', 
        'Popular & Trending', 
        'Business & Professional Style', 
        'Romantic & Wedding',
        'Fashion & Editorial',
        'Nature & Outdoor',
        'Black & White Photography',
        'Creative & Fantasy',
        'Sport & Active Lifestyle',
        'Career & Professions',
        'Hairstyle & Beauty'
    ];

    const [selectedCategory, setSelectedCategory] = useState('All');
    
    const { 
        generationMode,
        setGenerationMode,
        prompt,
        setPrompt,
        selectedGenderFilter, 
        setSelectedGenderFilter, 
        isTrainingLoading, 
        setIsTrainingLoading, 
        selectedTypeIndex, 
        setSelectedTypeIndex, 
    } = useControlMenuContext();
        
    // Initialize activeTab based on URL parameter
    const getInitialTab = (): 'AI Photoshoot' | 'My Photoshoot' => {
        const tabParam = searchParams.get('tab');
        if (tabParam === 'ai') return 'AI Photoshoot';
        if (tabParam === 'my') return 'My Photoshoot';
        return 'AI Photoshoot'; // default
    };

    const [activeTab, setActiveTab] = useState<'AI Photoshoot' | 'My Photoshoot'>(getInitialTab());

    // Update activeTab when URL parameters change
    useEffect(() => {
        const tabParam = searchParams.get('tab');
        if (tabParam === 'ai') {
            setActiveTab('AI Photoshoot');
        } else if (tabParam === 'my') {
            setActiveTab('My Photoshoot');
        }
    }, [searchParams]);

    const [shouldRefetch, setShouldRefetch] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedType, setSelectedType] = useState<string | null>(null);
    const [selectedMainImage, setSelectedMainImage] = useState<string | null>(null);
    const [selectedAdditionalImages, setSelectedAdditionalImages] = useState<string[]>([]);

    const handleDetailsClick = (type: string) => {
        const model = indexedPhotoshoots.find(ps => ps.type === type);
        if (!model) return;

        // work out the new index first
        const newIndex = model.originalIndex;

        // then pass the number (not a function) to the setter
        setSelectedTypeIndex(newIndex);

        // open the modal exactly as before
        setSelectedType(model.type);
        setSelectedMainImage(model.mainImage);
        setSelectedAdditionalImages(model.additionalImages);
        setIsModalOpen(true);
    };

    // Filter cards by selected category
    const filteredPhotoshoots = PhotoshootTypeData[selectedGenderFilter].filter(
        (item) => selectedCategory === 'All' || item.category.some(category => category.toLowerCase().includes(selectedCategory.toLowerCase()))
    );

    const indexedPhotoshoots = filteredPhotoshoots.map((item, index) => ({
        ...item,
        originalIndex: index,
    }));

    const getType = (type: string) => indexedPhotoshoots.find(ps => ps.type === type);

    const photoshootsByCategory: { [key: string]: typeof indexedPhotoshoots } = {};

    indexedPhotoshoots.forEach(item => {
    item.category.forEach(cat => {
        if (!photoshootsByCategory[cat]) {
        photoshootsByCategory[cat] = [];
        }
        photoshootsByCategory[cat].push(item);
    });
    });

    // Special buckets
    const popularItems = photoshootsByCategory["Popular & Trending"] || [];
    const otherItems = indexedPhotoshoots.filter(
    item => !item.category.includes("Popular & Trending")
    );

    // Further categorize non-popular items
    const allOtherCategories = categories.filter(
    cat => cat !== "Popular & Trending" && cat !== "All"
    );

    const dropdownRef = useRef<HTMLDivElement>(null);
    const [isOpen, setIsOpen] = useState(false);
    const toggleDropdown = () => setIsOpen(!isOpen);

    const handleSelect = (value: "Male" | "Female") => {
        setSelectedGenderFilter(value);
        setIsOpen(false);

    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const masonryRef = useRef<HTMLDivElement>(null);
    const lastMediaRef = useRef<HTMLDivElement | null>(null);
    // const [columns, setColumns] = useState<ImageMetadata[][]>([]);
    const [columns,  setColumns]  = useState<MediaItem[][]>([]);
    const [selectedImage, setSelectedImage] = useState<ImageMetadata | null>(null);
    const [selectedVideo, setSelectedVideo] = useState<VideoMetadata | null>(null);


    const {
        images,
        setImages,
        fetchMoreImages,
        refetchImages,
        loading,
        hasMore,
        resetImages,
      } = useUserImages();

    const {
        videos,
        setVideos,
        fetchMoreVideos,
        refetchVideos,
        videoLoading,
        videoHasMore,
    } = useUserVideos();

    const [media, setMedia] = useState<MediaItem[]>([]);

    const updateLayout = async () => {
        const freshlyImages = await refetchImages();
        const freshlyVideos = await refetchVideos();

        const merged: MediaItem[] = [
            ...freshlyImages.map(img => ({ ...img, kind: 'image' as const })),
            ...freshlyVideos.map(vid => ({ ...vid, kind: 'video' as const })),
        ].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)); // newest first

        setMedia(merged);

        const numCols = getNumberOfColumns();
        const cols = Array.from({ length: numCols }, () => [] as MediaItem[]);
        merged.forEach((item, i) => {
            cols[i % numCols].push(item);
        });

        setColumns(cols);
    };

    useEffect(() => {
        MemoryTracker.track('photoshoot-merge-start');
        
        const merged = mergeMedia(images, videos);
        console.log(`[PHOTOSHOOT] Merging media:`, {
            imagesCount: images.length,
            videosCount: videos.length,
            mergedCount: merged.length,
            imagesSize: JSON.stringify(images).length,
            videosSize: JSON.stringify(videos).length,
            timestamp: new Date().toISOString(),
        });
        
        setMedia(merged);
        setColumns(splitIntoColumns(merged));
        
        MemoryTracker.track('photoshoot-merge-end');
        MemoryTracker.compare('photoshoot-merge-start', 'photoshoot-merge-end');
    }, [images, videos]);

    // useEffect(() => {
    //     console.log('media useEffect 1');
    //     updateLayout();
    // }, [images, videos]);

    const getNumberOfColumns = () => {
        if (window.innerWidth < 768) return 1;
        if (window.innerWidth >= 1600) return 5;
        return 3;
    };
      
    // const createColumns = (images: ImageMetadata[], numCols: number): ImageMetadata[][] => {
    //     const cols = Array.from({ length: numCols }, () => [] as ImageMetadata[]);
    //     images.forEach((img, i) => {
    //         cols[i % numCols].push(img);
    //     });
    //     return cols;
    // };

    const createColumns = (items: MediaItem[], numCols: number): MediaItem[][] => {
        const cols = Array.from({ length: numCols }, () => [] as MediaItem[]);
        items.forEach((m, i) => cols[i % numCols].push(m));
        return cols;
    };
      
    // const updateLayout = (images: ImageMetadata[]) => {
    //     const numCols = getNumberOfColumns();
    //     setColumns(createColumns(images, numCols));
    // };

    // listen for image generation start event from studio control menu and start image refetching 
    // const onGenerationStart = useCallback(async () => {
    //     if (!session?.user?.id) return;

    //     setActiveTab("My Photoshoot");

    //     // immediate first fetch
    //     const freshly = await refetchImages();
    //     updateLayout();

    //     setShouldRefetch(true); // start 10-s polling loop
    // }, [session?.user?.id, activeTab, refetchImages]);

    const onGenerationStart = useCallback(async () => {
        if (!session?.user?.id) return;

        setActiveTab("My Photoshoot");
        setUrl('my');

        // immediate first fetch
        await Promise.all([refetchImages(), refetchVideos()]);
        setShouldRefetch(true);

        setShouldRefetch(true); // start 10-s polling loop
    }, [session?.user?.id, refetchImages, refetchVideos]);

    useEffect(() => {
        // console.log('media useEffect 2');
        eventBus.addEventListener('generation-start', onGenerationStart);
        return () => eventBus.removeEventListener('generation-start', onGenerationStart);
    }, [onGenerationStart]);
      
    // useEffect(() => {
    //     console.log('media useEffect 3');
    //     if (!shouldRefetch) return;
      
    //     const interval = setInterval(async () => {
    //         const [imgs, vids] = await Promise.all([
    //             refetchImages(),
    //             refetchVideos()
    //         ]);
    //         const stillGenerating = imgs.some(i => i.status === 'generating') ||
    //                             vids.some(v => v.status === 'generating');
    //         updateLayout();
      
    //       if (!stillGenerating) {
    //         clearInterval(interval);
    //         setShouldRefetch(false);
    //         eventBus.dispatchEvent(new Event("generation-finish"));
    //       }
    //     }, 10000);
      
    //     return () => clearInterval(interval);
    // }, [shouldRefetch]);

    useEffect(() => {
        // console.log('media useEffect 3');
        if (!shouldRefetch) return;
      
        console.log('[PHOTOSHOOT] Starting polling for pending media');
        MemoryTracker.track('polling-start');
      
        const interval = setInterval(async () => {
            MemoryTracker.track('poll-tick-start');
            console.log('[PHOTOSHOOT] Polling tick - checking for updates');
            
            const [imgs, vids] = await Promise.all([
                refetchImages(),
                refetchVideos()
            ]);
            
            console.log('[PHOTOSHOOT] Poll results:', {
                imagesCount: imgs.length,
                videosCount: vids.length,
                generatingImages: imgs.filter(img => img.status === 'generating').length,
                generatingVideos: vids.filter(vid => vid.status === 'generating').length,
            });
            
            const stillGenerating = imgs.some(i => i.status === 'generating') ||
                                vids.some(v => v.status === 'generating');
            
            MemoryTracker.track('poll-tick-end');
            MemoryTracker.compare('poll-tick-start', 'poll-tick-end');
      
          if (!stillGenerating) {
            console.log('[PHOTOSHOOT] No more generating media, stopping poll');
            clearInterval(interval);
            setShouldRefetch(false);
            eventBus.dispatchEvent(new Event("generation-finish"));
          }
        }, 10000);
      
        return () => {
            console.log('[PHOTOSHOOT] Cleaning up polling interval');
            clearInterval(interval);
        };
    }, [shouldRefetch, refetchImages, refetchVideos]);
      
    // useEffect(() => {
    //     console.log('media useEffect 4');
    //     const handleResize = () => updateLayout();
    //     window.addEventListener('resize', handleResize);
    //     return () => window.removeEventListener('resize', handleResize);
    // }, [images]);

    useEffect(() => {
        // console.log('media useEffect 4');
        const handleResize = () => setColumns(splitIntoColumns(media));

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [media]);
      
    useEffect(() => {
        // console.log('media useEffect 5');
        if (!lastMediaRef.current || activeTab !== 'My Photoshoot') return;
      
        const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && !loading && !videoLoading && (hasMore || videoHasMore)) {
            if (hasMore) fetchMoreImages();
            if (videoHasMore) fetchMoreVideos();
            }
        }, { threshold: 0.5 });

        observer.observe(lastMediaRef.current);
        return () => observer.disconnect();
    }, [columns, loading, hasMore, fetchMoreImages, activeTab]);

    // useEffect(() => {
    //     console.log('media useEffect 6');
    //     if (session?.user?.id) {
    //         fetchMoreImages().then(() => {
    //             updateLayout();
    //         });
    //     }
    // }, [session?.user?.id]);

    useEffect(() => {
        // console.log('media useEffect 6');
        if (!session?.user?.id) return;
        fetchMoreImages();
        fetchMoreVideos();
    }, [session?.user?.id]);

    // useEffect(() => {
    //     console.log('media useEffect 7');
    //     if (images.length > 0) {
    //       updateLayout();
    //     }
    // }, [images]);

    const setUrl = async (path: string) => {
        const newParams = new URLSearchParams(searchParams.toString());
        newParams.set('tab', path);
        router.push(`?${newParams.toString()}`, { scroll: false });
    };

    const handleDeleteImage = async (imageId: string) => {
        await deleteImageById(imageId, setImages);
        refetchImages();
    };

    const handleDeleteVideo = async (videoId: string) => {
        await deleteVideoById(videoId, setVideos);
        refetchVideos();
    };

    const handleToggleFavoriteImage = async (image: ImageMetadata) => {
        if (session?.user?.id) {
            await toggleFavoriteImage(image._id, session.user.id, image.res_image, setImages);
        }
    };

    const handleToggleFavoriteVideo = async (video: VideoMetadata) => {
        if (session?.user?.id) {
            await toggleFavoriteVideo(video._id, session.user.id, video.res_video, setVideos);
        }
    };

    useEffect(() => {
        if (prompt && prompt.trim().length > 0) {
            setSelectedTypeIndex(-1);
        }
    }, [prompt]);
    
    const sendGenerateFromCard = (index: number) => {
        if (!session?.user) {
            toggleLoginModal();
            return;
        }
        // pick / highlight the style the user clicked
        setPrompt('');
        setSelectedTypeIndex(index);
        // console.log('sendGenerateFromCard');
        // notify PhotoshootControls
        eventBus.dispatchEvent(new CustomEvent('photoshoot-card-generate', {
            detail: { index }
        }));
        // console.log('sendGenerateFromCard after');
        // console.log(eventBus)

    };

    const handleGenerateFromModal = () => {
        // find index of the style currently shown in the modal
        const idx = PhotoshootTypeData[selectedGenderFilter]
                        .findIndex(s => s.type === selectedType);
        if (idx !== -1) sendGenerateFromCard(idx);
    };

    // Add this effect to handle animation end
    useEffect(() => {
        const handleAnimationEnd = () => {
            if (isPanelClosing) {
                setIsControllerOpen(false);
                setIsPanelClosing(false);
            }
        };

        const panel = document.querySelector(`.${styles.controller_panel}`);
        if (panel) {
            panel.addEventListener('animationend', handleAnimationEnd);
        }
        
        return () => {
            if (panel) {
                panel.removeEventListener('animationend', handleAnimationEnd);
            }
        };
    }, [isPanelClosing]);

    const handleStyleSelectFromController = () => {
        // Start closing animation for the panel
        setIsPanelClosing(true);
        
        // Switch to AI Photoshoot tab
        setActiveTab('AI Photoshoot');
        setUrl('ai');

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleGenerateFromController = () => {
        // Start closing animation for the panel
        setIsPanelClosing(true);
        
        // Switch to My Photoshoot tab
        setActiveTab('My Photoshoot');
        setUrl('my');
    };

    // Add these new states for touch handling
    const [touchStartY, setTouchStartY] = useState<number | null>(null);
    const buttonRef = useRef<HTMLDivElement>(null);
    const headerRef = useRef<HTMLDivElement>(null);
    
    // Handle touch start on button or panel header
    const handleTouchStart = (e: React.TouchEvent) => {
        setTouchStartY(e.touches[0].clientY);
    };
    
    // Handle touch end on button (for opening)
    const handleButtonTouchEnd = (e: React.TouchEvent) => {
        if (touchStartY === null) return;
        
        const touchEndY = e.changedTouches[0].clientY;
        const diffY = touchStartY - touchEndY;
        
        // If swiped up by at least 50px, open the panel
        if (diffY > 50) {
            setIsControllerOpen(true);
        }
        
        setTouchStartY(null);
    };
    
    // Handle touch end on panel header only (for closing)
    const handleHeaderTouchEnd = (e: React.TouchEvent) => {
        if (touchStartY === null) return;
        
        const touchEndY = e.changedTouches[0].clientY;
        const diffY = touchEndY - touchStartY;
        
        // If swiped down by at least 75px, close the panel
        if (diffY > 75) {
            setIsPanelClosing(true);
        }
        
        setTouchStartY(null);
    };
    
    const wrapperRefs = useRef<(HTMLDivElement | null)[]>([]);
    const isDragging = useRef(false);
    const startX = useRef(0);
    const scrollLeft = useRef(0);
    const activeIndex = useRef<number | null>(null);
    const dragging = useRef(false);


    const makeDragHandlers = (index: number) => ({
        onMouseDown: (e: React.MouseEvent) => {
            isDragging.current = true;
            dragging.current = false;
            activeIndex.current = index;
            startX.current = e.pageX - (wrapperRefs.current[index]?.offsetLeft || 0);
            scrollLeft.current = wrapperRefs.current[index]?.scrollLeft || 0;
        },
        onMouseMove: (e: React.MouseEvent) => {
            if (!isDragging.current || activeIndex.current !== index || e.buttons !== 1) return;
            e.preventDefault();
            dragging.current = true;
            const x = e.pageX - (wrapperRefs.current[index]?.offsetLeft || 0);
            const walk = (x - startX.current) * -1;
            wrapperRefs.current[index]!.scrollLeft = scrollLeft.current + walk;
        },
        onMouseUp: () => {
            isDragging.current = false;
            activeIndex.current = null;
            setTimeout(() => (dragging.current = false), 0);
        },
        onMouseLeave: () => {
            isDragging.current = false;
            activeIndex.current = null;
            setTimeout(() => (dragging.current = false), 0);
        }
    });

    const stripRef = useRef<HTMLDivElement | null>(null);

    const isDraggingStrip = useRef(false);
    const startXiStrip = useRef(0);
    const scrollLeftStrip = useRef(0);
    const draggingStrip = useRef(false);
    const suppressNextClick = useRef(false);


    // For 'strip'
    const handleStripDragStart = (e: React.MouseEvent) => {
        isDraggingStrip.current = true;
        draggingStrip.current = false;
        startXiStrip.current = e.pageX - (stripRef.current?.offsetLeft || 0);
        scrollLeftStrip.current = stripRef.current?.scrollLeft || 0;
    };

    const handleStripDragMove = (e: React.MouseEvent) => {
        if (!isDraggingStrip.current || e.buttons !== 1) return;
        e.preventDefault();
        draggingStrip.current = true;
        const x = e.pageX - (stripRef.current?.offsetLeft || 0);
        const walk = (x - startXiStrip.current) * -1;
        if (stripRef.current) {
            stripRef.current.scrollLeft = scrollLeftStrip.current + walk;
        }
    };

    const handleStripDragEnd = () => {
        if (draggingStrip.current) suppressNextClick.current = true;

        isDraggingStrip.current = false;
        setTimeout(() => (draggingStrip.current = false), 0);
    };

    useEffect(() => {
        const el = stripRef.current;
        if (!el) return;

        const handleClickCapture = (e: MouseEvent) => {
            if (suppressNextClick.current) {
            e.stopPropagation();   // stops StyleCard onClick
            e.preventDefault();    // optional – prevents focus, etc.
            suppressNextClick.current = false; // ready for the next gesture
            }
        };

        // capture: true  →  this runs *before* children get the event
        el.addEventListener("click", handleClickCapture, true);
        return () => el.removeEventListener("click", handleClickCapture, true);
    }, []);

    useEffect(() => {
        const handleMouseUpGlobal = () => {
            isDragging.current = false;
            isDraggingStrip.current = false;
            activeIndex.current = null;
            dragging.current = false;
            draggingStrip.current = false;
        };

        window.addEventListener('mouseup', handleMouseUpGlobal);
        return () => window.removeEventListener('mouseup', handleMouseUpGlobal);
    }, []);
    
    return (
        <div className={styles.page_wrapper}>

            <div 
                className={styles.page_working_area_empty}
                style={{ display: ((isControllerOpen || isPanelClosing) && isMobile) ? '' : 'none' }}
            >
            </div>

            <div 
                className={`${styles.page_working_area} ${isMobile && (isControllerOpen || isPanelClosing) ? styles.pageHidden : ''}`}
                style={{ display: (!isControllerOpen || !isPanelClosing) ? '' : 'none' }}
            >
                {!isMobile && (
                    <div className={styles.controls__outer}>
                        <PhotoshootControls openedFromController={false} />
                    </div>
                )}
                
                <div className={styles.creation_page_content}>
                    <div className={styles.generator_page_wrapper}>
                        
                        {isMobile && searchParams.get('tab') !== 'my' && (
                            <div className={styles.image_video_switcher_wrapper}>
                                <ImageVideoSwitcher />    
                            </div>
                        )}

                        {!isMobile && (
                            <div className={styles.model_tab_selector}>
                                <button
                                    className={`${styles.model_tab} ${activeTab === 'AI Photoshoot' ? styles.active_tab : ''}`}
                                    onClick={() => {
                                        setActiveTab('AI Photoshoot');
                                        setUrl('ai');
                                    }}
                                >
                                    {generationMode === 'image' ? 'AI Photoshoot' : 'AI Video'}
                                </button>
                                <button
                                    className={`${styles.model_tab} ${activeTab === 'My Photoshoot' ? styles.active_tab : ''}`}
                                    onClick={() => {
                                        setActiveTab('My Photoshoot');
                                        setUrl('my');
                                }}
                                >
                                    {generationMode === 'image' ? 'My Photoshoot' : 'My Video'}
                                </button>
                            </div>
                        )}

                        <div className={styles.models_page_inner_wrapper} style={{ display: activeTab === 'AI Photoshoot' ? '' : 'none' }}>
                            {!isMobile && (
                                <div className={styles.photoshoot_header_wrapper_dsk}>
                                    <div className={styles.photoshoot_header}>
                                        Select your style
                                    </div>

                                    <GenderFilterDropdown
                                        selectedGender={selectedGenderFilter}
                                        setSelectedGender={setSelectedGenderFilter}
                                    />
                                </div>
                            )}

                            {!isMobile ? (
                                <div className={styles.model_category_wrapper_combined}>

                                    {/* <ModelCategorySelector
                                        categories={categories}
                                        selectedCategory={selectedCategory}
                                        onSelect={setSelectedCategory}
                                    /> */}

                                </div>
                            ) : (
                                <div className={styles.model_category_wrapper_combined}>

                                    <div className={styles.photoshoot_header_wrapper}>
                                        <div className={styles.photoshoot_header}>
                                            Select your style
                                        </div>

                                        <GenderFilterDropdown
                                            selectedGender={selectedGenderFilter}
                                            setSelectedGender={setSelectedGenderFilter}
                                        />
                                    </div>
                                    {/* <ModelCategorySelector
                                        categories={categories}
                                        selectedCategory={selectedCategory}
                                        onSelect={setSelectedCategory}
                                    /> */}
                                </div>
                            )}

                            <div className={styles.photoshoot_grid_wrapper}>
                                <div
                                    className={styles.styleStrip}
                                    ref={stripRef}
                                    onMouseDown={handleStripDragStart}
                                    onMouseMove={handleStripDragMove}
                                    onMouseUp={handleStripDragEnd}
                                    onMouseLeave={handleStripDragEnd}
                                    >
                                        {(() => {
                                            const ps = getType("Instagram Model");
                                            return ps && (
                                                <StyleCardOne
                                                    key={ps.type}
                                                    name={ps.type}
                                                    avatarSrc={mobileRoundImgSrc}
                                                    images={[ps.mainImage, ...ps.additionalImages]}
                                                    onSelect={() => {
                                                        if (isDraggingStrip.current) return;

                                                        if (!isMobile) {
                                                        handleDetailsClick(ps.type);
                                                        setSelectedTypeIndex(
                                                            selectedTypeIndex === ps.originalIndex ? -1 : ps.originalIndex
                                                        );
                                                        } else {
                                                        setPrompt('');
                                                        setSelectedTypeIndex(
                                                            selectedTypeIndex === ps.originalIndex ? -1 : ps.originalIndex
                                                        );
                                                        if (!isControllerOpen) setIsControllerOpen(true);
                                                        }
                                                    }}
                                                />
                                            );
                                        })()}

                                        {(() => {
                                            const ps = getType("Future Baby");
                                            return ps && (
                                                <StyleCardTwo
                                                    key={ps.type}
                                                    name={ps.type}
                                                    images={[ps.mainImage, ...ps.additionalImages]}
                                                    onSelect={() => {
                                                        if (isDraggingStrip.current) return;

                                                        if (!isMobile) {
                                                        handleDetailsClick(ps.type);
                                                        setSelectedTypeIndex(
                                                            selectedTypeIndex === ps.originalIndex ? -1 : ps.originalIndex
                                                        );
                                                        } else {
                                                        setPrompt('');
                                                        setSelectedTypeIndex(
                                                            selectedTypeIndex === ps.originalIndex ? -1 : ps.originalIndex
                                                        );
                                                        if (!isControllerOpen) setIsControllerOpen(true);
                                                        }
                                                    }}
                                                />
                                            );
                                        })()}

                                        {(() => {
                                            const ps = getType("Private Jet");
                                            return ps && (
                                                <StyleCardThree
                                                    key={ps.type}
                                                    name={ps.type}
                                                    images={[ps.mainImage, ...ps.additionalImages]}
                                                    onSelect={() => {
                                                        if (isDraggingStrip.current) return;

                                                        if (!isMobile) {
                                                        handleDetailsClick(ps.type);
                                                        setSelectedTypeIndex(
                                                            selectedTypeIndex === ps.originalIndex ? -1 : ps.originalIndex
                                                        );
                                                        } else {
                                                        setPrompt('');
                                                        setSelectedTypeIndex(
                                                            selectedTypeIndex === ps.originalIndex ? -1 : ps.originalIndex
                                                        );
                                                        if (!isControllerOpen) setIsControllerOpen(true);
                                                        }
                                                    }}
                                                />
                                            );
                                        })()}

                                        {(() => {
                                            const ps = getType("K-pop Idol");
                                            return ps && (
                                                <StyleCardFour
                                                    key={ps.type}
                                                    name={ps.type}
                                                    images={[ps.mainImage, ...ps.additionalImages]}
                                                    onSelect={() => {
                                                        if (isDraggingStrip.current) return;

                                                        if (!isMobile) {
                                                        handleDetailsClick(ps.type);
                                                        setSelectedTypeIndex(
                                                            selectedTypeIndex === ps.originalIndex ? -1 : ps.originalIndex
                                                        );
                                                        } else {
                                                        setPrompt('');
                                                        setSelectedTypeIndex(
                                                            selectedTypeIndex === ps.originalIndex ? -1 : ps.originalIndex
                                                        );
                                                        if (!isControllerOpen) setIsControllerOpen(true);
                                                        }
                                                    }}
                                                />
                                            );
                                        })()}

                                        {(() => {
                                            const ps = getType("High School");
                                            return ps && (
                                                <StyleCardFive
                                                    key={ps.type}
                                                    name={ps.type}
                                                    avatarSrc={mobileRoundImgSrcTwo}
                                                    images={[ps.mainImage, ...ps.additionalImages]}
                                                    onSelect={() => {
                                                        if (isDraggingStrip.current) return;

                                                        if (!isMobile) {
                                                        handleDetailsClick(ps.type);
                                                        setSelectedTypeIndex(
                                                            selectedTypeIndex === ps.originalIndex ? -1 : ps.originalIndex
                                                        );
                                                        } else {
                                                        setPrompt('');
                                                        setSelectedTypeIndex(
                                                            selectedTypeIndex === ps.originalIndex ? -1 : ps.originalIndex
                                                        );
                                                        if (!isControllerOpen) setIsControllerOpen(true);
                                                        }
                                                    }}
                                                />
                                            );
                                        })()}

                                        {(() => {
                                            const ps = getType("Anime Style");
                                            return ps && (
                                                <StyleCardSix
                                                    key={ps.type}
                                                    name={ps.type}
                                                    images={[ps.mainImage, ...ps.additionalImages]}
                                                    onSelect={() => {
                                                        if (isDraggingStrip.current) return;

                                                        if (!isMobile) {
                                                        handleDetailsClick(ps.type);
                                                        setSelectedTypeIndex(
                                                            selectedTypeIndex === ps.originalIndex ? -1 : ps.originalIndex
                                                        );
                                                        } else {
                                                        setPrompt('');
                                                        setSelectedTypeIndex(
                                                            selectedTypeIndex === ps.originalIndex ? -1 : ps.originalIndex
                                                        );
                                                        if (!isControllerOpen) setIsControllerOpen(true);
                                                        }
                                                    }}
                                                />
                                            );
                                        })()}

                                        {/* {filteredPhotoshoots
                                            .filter(ps => VISIBLE_TYPES.has(ps.type))
                                            .map((ps, index) => (
                                                <StyleCard
                                                    key={ps.type}
                                                    name={ps.type}
                                                    avatarSrc={mobileRoundImgSrc}
                                                    images={[ps.mainImage, ...ps.additionalImages]}
                                                    // onGenerate={() => sendGenerateFromCard(index)}
                                                    onSelect={() => {
                                                        if (isDraggingStrip.current) return;

                                                        if (!isMobile) {
                                                        // desktop: open details
                                                        handleDetailsClick(ps.type);
                                                        setSelectedTypeIndex(
                                                            selectedTypeIndex === index ? -1 : index
                                                        );
                                                        } else {
                                                        // mobile: pick style & open controller
                                                        setPrompt('');
                                                        setSelectedTypeIndex(
                                                            selectedTypeIndex === index ? -1 : index
                                                        );
                                                        if (!isControllerOpen) setIsControllerOpen(true);
                                                        }
                                                    }}
                                                />
                                        ))} */}
                                </div>

                                {popularItems.length > 0 && (
                                    <div className={styles.scroll_section}>
                                        <div className={styles.scroll_section_header}>Popular</div>
                                        <div
                                        className={styles.scroll_row_wrapper}
                                        ref={(el) => {
                                            wrapperRefs.current[0] = el;
                                        }}
                                        {...makeDragHandlers(0)}
                                        >
                                        <div className={styles.scroll_row}>
                                            {popularItems.map((item) => (
                                            <PhotoshootCard
                                                key={`popular-${item.type}`}
                                                type={item.type}
                                                imageSrc={item.mainImage}
                                                isSelected={selectedTypeIndex === item.originalIndex}
                                                onClick={() => {
                                                if (!dragging.current) {
                                                    setPrompt('');
                                                    if (!isMobile && (selectedTypeIndex === item.originalIndex)) {
                                                    setSelectedTypeIndex(-1);
                                                    } else {
                                                    setSelectedTypeIndex(item.originalIndex);
                                                    }
                                                    if (isMobile && !isControllerOpen) {
                                                    setIsControllerOpen(true);
                                                    }
                                                }
                                                }}
                                                onDetailsClick={() => handleDetailsClick(item.type)}
                                                onGenerate={() => sendGenerateFromCard(item.originalIndex)}
                                                showControls={!isMobile}
                                            />
                                            ))}
                                        </div>
                                        </div>
                                    </div>
                                )}

                                {otherItems.length > 0 && (
                                    <div className={styles.scroll_section}>
                                        <div className={styles.scroll_section_header}>All Styles</div>
                                        <div
                                        className={styles.scroll_row_wrapper}
                                        ref={(el) => {
                                            wrapperRefs.current[1] = el;
                                        }}
                                        {...makeDragHandlers(1)}
                                        >
                                        <div className={styles.scroll_row}>
                                            {otherItems.map((item) => (
                                            <PhotoshootCard
                                                key={`all-${item.type}`}
                                                type={item.type}
                                                imageSrc={item.mainImage}
                                                isSelected={selectedTypeIndex === item.originalIndex}
                                                onClick={() => {
                                                if (!dragging.current) {
                                                    setPrompt('');
                                                    setSelectedTypeIndex(
                                                    selectedTypeIndex === item.originalIndex ? -1 : item.originalIndex
                                                    );
                                                    if (isMobile && !isControllerOpen) setIsControllerOpen(true);
                                                }
                                                }}
                                                onDetailsClick={() => handleDetailsClick(item.type)}
                                                onGenerate={() => sendGenerateFromCard(item.originalIndex)}
                                                showControls={!isMobile}
                                            />
                                            ))}
                                        </div>
                                        </div>
                                    </div>
                                )}


                                {allOtherCategories.map((category, catIndex) => {
                                    const items = photoshootsByCategory[category] || [];
                                    if (items.length === 0) return null;

                                    const refIndex = 2 + catIndex;

                                    return (
                                        <div key={category} className={styles.scroll_section}>
                                        <div className={styles.scroll_section_header}>{category}</div>
                                        <div
                                            className={styles.scroll_row_wrapper}
                                            ref={(el) => {
                                                wrapperRefs.current[refIndex] = el;
                                            }}
                                            {...makeDragHandlers(refIndex)}
                                        >
                                            <div className={styles.scroll_row}>
                                            {items.map((item) => (
                                                <PhotoshootCard
                                                key={`${category}-${item.type}`}
                                                type={item.type}
                                                imageSrc={item.mainImage}
                                                isSelected={selectedTypeIndex === item.originalIndex}
                                                onClick={() => {
                                                    if (!dragging.current) {
                                                    setPrompt('');
                                                    setSelectedTypeIndex(
                                                        selectedTypeIndex === item.originalIndex ? -1 : item.originalIndex
                                                    );
                                                    if (isMobile && !isControllerOpen) setIsControllerOpen(true);
                                                    }
                                                }}
                                                onDetailsClick={() => handleDetailsClick(item.type)}
                                                onGenerate={() => sendGenerateFromCard(item.originalIndex)}
                                                showControls={!isMobile}
                                                />
                                            ))}
                                            </div>
                                        </div>
                                        </div>
                                    );
                                })}

                                {/* <div className={styles.photoshoot_grid}>
                                    {filteredPhotoshoots.map((item, index) => (
                                        <PhotoshootCard
                                            key={index}
                                            type={item.type}
                                            imageSrc={item.mainImage}
                                            isSelected={selectedTypeIndex === index}
                                            onClick={() => {
                                                // Set the prompt and update selected index
                                                setPrompt('');
                                                if (selectedTypeIndex === index) {
                                                    setSelectedTypeIndex(-1);
                                                } else {
                                                    setSelectedTypeIndex(index);
                                                }
                                                
                                                // Open controller panel in mobile view
                                                if (isMobile && !isControllerOpen) {
                                                    setIsControllerOpen(true);
                                                }
                                            }}
                                            onDetailsClick={() => handleDetailsClick(item.type)}
                                            onGenerate={() => sendGenerateFromCard(index)}
                                        />
                                    ))}
                                </div> */}
                            </div>
                        </div>

                        <div 
                            className={styles.masonry_scroll_wrapper}
                            style={{ display: activeTab === 'My Photoshoot' ? '' : 'none' }}
                        >
                            <div className={styles.masonry} ref={masonryRef}>
                                {/* {columns.map((col, colIndex) => (
                                    <div key={colIndex} className={styles.column}>
                                        {col.map((image, idx) => {
                                            const isLast = images.indexOf(image) === images.length - 1;
                                            return (
                                                <GeneratedImage
                                                    key={image._id}
                                                    ref={isLast ? lastImageRef : null}
                                                    src={`${NEXT_PUBLIC_USER_IMAGES_URL}${image.res_image}`}
                                                    status={image.status}
                                                    isFavorite={false}
                                                    onToggleFavorite={() => console.log('Favorite', image._id)}
                                                    onDelete={() => handleDeleteImage(image._id)}
                                                    onGenerateSimilar={() => console.log('Similar', image._id)}
                                                    onReuse={() => console.log('Reuse', image._id)}
                                                    onReusePrompt={() => console.log('Prompt', image._id)}
                                                    onClickDetails={() => setSelectedImage(image)}
                                                    downloadName={`${image._id}.png`}
                                                />
                                            );
                                        })}
                                    </div>
                                ))} */}

                                {columns.map((col,colIndex)=>(
                                    <div key={colIndex} className={styles.column}>
                                        {col.map((item,idx)=>{
                                        const isLast = media.indexOf(item) === media.length-1;
                                        const ref = isLast ? lastMediaRef : null;
                                        return item.kind==='image' ? (
                                            <GeneratedImage
                                                key={item._id}
                                                ref={ref}
                                                src={`${NEXT_PUBLIC_USER_IMAGES_URL}${item.res_image}`}
                                                status={item.status}
                                                isFavorite={item.favorite}
                                                onToggleFavorite={() => handleToggleFavoriteImage(item)}
                                                onDelete={()=>handleDeleteImage(item._id)}
                                                onGenerateSimilar={()=>{}}
                                                onReuse={()=>{}}
                                                onReusePrompt={()=>{}}
                                                onClickDetails={()=>setSelectedImage(item)}
                                                downloadName={`${item._id}.png`}
                                            />
                                        ) : (
                                            <GeneratedVideo
                                                key={item._id}
                                                ref={ref}
                                                src={`${NEXT_PUBLIC_USER_VIDEOS_URL}${item.res_video}`}
                                                status={item.status}
                                                isFavorite={item.favorite}
                                                onToggleFavorite={() => handleToggleFavoriteVideo(item)}
                                                onDelete={() => handleDeleteVideo(item._id)}
                                                // onGenerateSimilar={()=>{}}
                                                // onReuse={()=>{}}
                                                // onReusePrompt={()=>{}}
                                                onClickDetails={() => setSelectedVideo(item)}
                                                downloadName={`${item._id}.mp4`}
                                            />
                                        );
                                        })}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {selectedType && selectedMainImage && (
                            <ModelDetailsModal
                                isOpen={isModalOpen}
                                onClose={() => setIsModalOpen(false)}
                                onGenerate={handleGenerateFromModal}
                                type={selectedType}
                                gender={selectedGenderFilter}
                                mainImage={selectedMainImage}
                                additionalImages={selectedAdditionalImages}
                            />
                        )}

                        <ImageDetailsModal
                            isOpen={!!selectedImage}
                            image={selectedImage}
                            onClose={() => setSelectedImage(null)}
                        />
                        <VideoDetailsModal
                            isOpen={!!selectedVideo}
                            video={selectedVideo}
                            onClose={() => setSelectedVideo(null)}
                        />
                    </div>
                </div>
            </div>
            
            {/* Controller Button & Panel - Only visible on mobile */}
            
            {isMobile && (
                <div className={styles.controller_wrapper}>
                    {/* <div 
                        ref={buttonRef}
                        className={styles.controller_button}
                        onClick={toggleController}
                        onTouchStart={handleTouchStart}
                        onTouchEnd={handleButtonTouchEnd}
                        style={{ display: isControllerOpen ? 'none' : 'flex' }}
                    >
                        <ControllerArrowButton isOpen={false} />
                    </div> */}

                    {(isControllerOpen || isPanelClosing) && (
                        <div 
                            className={`${styles.controller_panel} ${isPanelClosing ? styles.panel_closing : ''}`}
                            style={{ display: (isControllerOpen || isPanelClosing) ? 'flex' : 'none'}}
                        >
                            {/* <div 
                                ref={headerRef}
                                className={styles.controller_button_top}
                                onClick={toggleController}
                                onTouchStart={handleTouchStart}
                                onTouchEnd={handleHeaderTouchEnd}
                            >
                                <ControllerArrowButton isOpen={true} />
                            </div> */}

                            <div className={styles.controls__outer}>
                                <PhotoshootControls 
                                    openedFromController={true} 
                                    onStyleSelect={handleStyleSelectFromController}
                                    onGenerate={handleGenerateFromController}
                                    onClose={() => setIsPanelClosing(true)}
                                    onToggle={(generationCost) => togglePricingModal(generationCost)}
                                />
                            </div>

                            {/* <div className={styles.controller_generate_footer}>
                                <button
                                    className={styles.controller_generate_button}
                                    onClick={handleGenerateFromController}
                                >
                                    Generate
                                </button>
                            </div> */}
                        </div>
                    )}

                    {isMobile && (
                        <div style={{ display: 'none' }}>
                            <PhotoshootControls 
                                openedFromController={true}
                                onStyleSelect={() => {}}
                                onGenerate={() => {}}
                            />
                        </div>
                    )}
                </div>
            )}
            <LoginModal 
                isOpen={isLoginModalOpen} 
                onClose={toggleLoginModal} 
                order='default'
                returnTo="/pricing?onb=1" 
            />

            <SubscriptionPopup 
                openedFromPhotoshoot={true} 
                isOpen={isPricingModalOpen} 
                onClose={togglePricingModal} 
                generationCost={generationCost}
                onCloseGen={() => setIsPanelClosing(true)}
            />
            
            <div className={`${styles.page_working_footer_wrapper} ${isMobile && (isControllerOpen || isPanelClosing) ? styles.pageHidden : ''}`}>
                <Footer />
            </div>
            
            {(!isControllerOpen) && (
                <MobileMenu />
            )}
        </div>
    );
}