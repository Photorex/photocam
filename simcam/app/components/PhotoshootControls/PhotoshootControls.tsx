"use client";

import React, { useState, useEffect, useRef } from "react";

// Next specific import
import { signIn, signOut, useSession } from 'next-auth/react';
import { usePathname, useRouter } from "next/navigation";

// Styles import
import styles from "./PhotoshootControls.module.css";

// Import context
import { useControlMenuContext } from "@/app/context/ControlMenuContext";
import { useUserContext } from '@/app/context/UserContext';

// Functions
import { useWindowSize } from "@/app/lib/hooks/useWindowSize";

// Centralized image import
import ResetIcon from "@/public/images/icons/controller/reset-icon.svg";

import PhotoshootTypeData from "@/app/lib/data/PhotoshootTypeData";

import Loader from '@/public/assets/icons/loader.svg';

import { trackGtmEvent } from "@/app/lib/analytics/google/trackGtmEvent";

// Components import
import UpgradeBanner from "../UpgradeBanner/UpgradeBanner";
import PhotoshootPromptInput from "../Prompt/PhotoshootPromptInput";
import SizeOptions from "../SizeOptions/SizeOptions";
import PhotoshootModelSelector from "../PhotoshootModelSelector/PhotoshootModelSelector";
import LoginModal from "../LoginModal/LoginModal";
import SubscriptionPopup from "../SubscriptionPopup/SubscriptionPopup";
import ImageVideoSwitcher from "./ImageVideoSwitcher";
import PhotoshootImageControls from "./PhotoshootImageControls";
import PhotoshootVideoControls from "./PhotoshootVideoControls";
import ControllersBackIcon from '@/public/assets/icons/back-arrow-icon.svg'

import { eventBus } from "@/app/lib/event/eventBus";

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Add these imports at the top of the file
import DeleteIcon from "@/public/assets/icons/delete-icon.svg";
import RightArrow from "@/public/assets/icons/right-arrow.svg";
import Image from "next/image";

export default function PhotoshootControls({ 
    openedFromController = false, 
    onStyleSelect,
    onGenerate,
    onClose,
    onToggle,
}: { 
    openedFromController?: boolean;
    onStyleSelect?: () => void;
    onGenerate?: () => void;
    onClose?: () => void;
    onToggle?: (generationCost: number) => void; 
}) {

    const { data: session, status, update } = useSession();
    const router = useRouter();
    const pathname = usePathname();

    const [activeIndex, setActiveIndex] = useState<number | null>(null);

    // Get window size using custom hook
    const windowSize = useWindowSize();
    const isMobile = windowSize.width <= 1000;

    const [isLoraTraining, setIsLoraTraining] = useState(false);

    const [isLoginModalOpen, setLoginModalOpen] = useState(false);
    
    const toggleLoginModal = () => {
        setLoginModalOpen(!isLoginModalOpen);
    };

    const [generationCostPopup, setGenerationCostPopup] = useState<number | undefined>(undefined);
    const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
    const togglePricingModal = (cost?: number) => {
        // If cost is passed, log it, otherwise, log that no cost is provided
        if (cost !== undefined) {
            setGenerationCostPopup(cost);  // Set the cost in the state
            // console.log("Generation cost:", cost);
        }
        setIsPricingModalOpen((v) => !v);
    };

    // Use the context
    const {
        generationMode,
        setGenerationMode,
        videoGenerationMode,
        prompt,
        setPrompt,
        steps,
        setSteps,
        neg_prompt,
        setNegPrompt,
        cfg,
        setCfg,
        allowPublicGallery,
        setAllowPublicGallery,
        model,
        size,
        videoSize,
        denoise,
        weights_interpretator,
        upscale,
        facelock_weight,
        facelock_type,
        pose_weight,
        inpaint_what,
        loras,
        userImage,
        poseImage,
        maskImage,
        type_gen,
        resetToDefault,
        selectedTypeIndex, 
        setSelectedTypeIndex,
        selectedPhotoshootModelIndex,
        setSelectedPhotoshootModelIndex,
        selectedGenderFilter,
        setSelectedGenderFilter,
    } = useControlMenuContext();

    const [resetHighlight, setResetHighlight] = useState(false);
    const [generationAllowed, setGenerationAllowed] = useState(true);

    const reportedReadyModels = useRef<Set<string>>(new Set());

    const { modelMap, updateModelMap } = useUserContext();

    useEffect(() => {
        const map = modelMap;
        map.forEach((m) => {
          if (m.status === "ready") {
            reportedReadyModels.current.add(m.id_gen || m._id || m.name_lora);
          }
        });
    }, [modelMap]);
    
    useEffect(() => {
        const handleLoraStart = async () => {
          // Fetch updated user data including modelMap
          await updateModelMap();
          setIsLoraTraining(true);
        };
      
        eventBus.addEventListener("generation-lora-start", handleLoraStart);
      
        return () => {
          eventBus.removeEventListener("generation-lora-start", handleLoraStart);
        };
    }, [updateModelMap]);

    useEffect(() => {
        if (!isLoraTraining) return;
      
        const interval = setInterval(async () => {
          await updateModelMap();
      
          // Process model map data
          modelMap.forEach((model) => {
            if (model.status === "ready") {
              const id = model.id_gen || model._id || model.name_lora;
              if (!reportedReadyModels.current.has(id)) {
                trackGtmEvent("added_model", {
                  ecommerce: { usid: session?.user?.id }
                });
                reportedReadyModels.current.add(id);
              }
            }
          });
      
          // Check if still training
          const stillTraining = modelMap.some(
            (m) => m.status === "generating" || (m.status === "ready" && !m.model_image)
          );
      
          if (!stillTraining) {
            setIsLoraTraining(false);
            clearInterval(interval);
          }
        }, 10000);
      
        return () => clearInterval(interval);
    }, [isLoraTraining, modelMap, updateModelMap, session?.user?.id]);

    const handleReset = () => {
        resetToDefault();

        // Highlight reset button for 0.2 seconds
        setResetHighlight(true);
        setTimeout(() => setResetHighlight(false), 200);
    };

    const handleGenerate = async (
        event: React.MouseEvent<HTMLButtonElement> | { preventDefault(): void },
        forcedIndex?: number
    ) => {
        if (generationMode === 'image') {
            await handleImageGeneration(event, forcedIndex);
        } else if (generationMode === 'video') {
            await handleVideoGeneration(event, forcedIndex);
        }
    };
    
    const handleImageGeneration = async (
        event: React.MouseEvent<HTMLButtonElement> | { preventDefault(): void },
        forcedIndex?: number
    ) => {
        event.preventDefault();
        if (!generationAllowed) return;
        setGenerationAllowed(false);
      
        if (!session?.user?.id) {
            return;
        };

        const userModels = modelMap;
        const selectedModel = userModels?.[selectedPhotoshootModelIndex];

        const actualIndex = typeof forcedIndex === 'number' ? forcedIndex : selectedTypeIndex;
        const selectedPhotoshootType = PhotoshootTypeData[selectedGenderFilter]?.[actualIndex ?? 0];
      
        const genderKey = selectedGenderFilter.toLowerCase() as 'female' | 'male';

        const useCustomPrompt = prompt && prompt.trim().length > 0;

        const promptsForGender = selectedPhotoshootType?.prompts?.[genderKey];

        const promptsToUse = useCustomPrompt ? [prompt.trim()] : promptsForGender || [];
        // console.log('promptsToUse', promptsToUse);
        const totalImages = useCustomPrompt ? 1 : promptsToUse.length * 2;

        const tokensPerImage = 1;
        const totalCost = tokensPerImage * totalImages;

        if (session?.user?.credits! < totalCost) {
            if (openedFromController && onToggle) {
                onToggle(totalCost);
            } else {
                togglePricingModal(totalCost);
            }
            
            setGenerationAllowed(true);
            return;
        }

        // if (session?.user?.subscription === "Free") {
        //     togglePricingModal();
        //     setGenerationAllowed(true);
        //     return;
        // }

        // if (session?.user?.credits === 0) {
        //     // checkFeedbackModalOpenCase();
        //     toast.error('You do not have enough tokens to generate these images.', {
        //         position: "top-right",
        //         autoClose: 3000,
        //         hideProgressBar: false,
        //         closeOnClick: true,
        //         pauseOnHover: false,
        //         draggable: true,
        //         progress: undefined,
        //         theme: "dark",
        //     });
        //     setGenerationAllowed(true);
        //     return;
        // }
        
        // if (session?.user?.emailVerified !== true) {
        //     // checkFeedbackModalOpenCase();
        //     toast.error('Please verify your email to generate images. If you already did - please reopen our site.', {
        //         position: "top-right",
        //         autoClose: 3000,
        //         hideProgressBar: false,
        //         closeOnClick: true,
        //         pauseOnHover: false,
        //         draggable: true,
        //         progress: undefined,
        //         theme: "dark",
        //     });
        //     setGenerationAllowed(true);
        //     return;
        // }

        if (selectedModel?.status === 'generating') {
            toast.info('Please wait around 5 minutes for model to finish training.', {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: false,
                draggable: true,
                progress: undefined,
                theme: "dark",
            });
            setGenerationAllowed(true);
            return;
        }

        // console.log('useCustomPrompt', useCustomPrompt)
        
        if (!selectedModel) {
            toast.error('Please choose your model.', {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: false,
                draggable: true,
                progress: undefined,
                theme: "dark",
            });
            setGenerationAllowed(true);
            return;
        }

        if (!useCustomPrompt && (selectedTypeIndex === -1 || !selectedPhotoshootType)) {
            toast.error('Please select style or enter prompt.', {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: false,
                draggable: true,
                progress: undefined,
                theme: "dark",
            });
            setGenerationAllowed(true);
            return;
        }

        if (!useCustomPrompt && (!selectedModel || !selectedPhotoshootType)) {
            toast.error('Please select photoshoot style.', {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: false,
                draggable: true,
                progress: undefined,
                theme: "dark",
            });
            setGenerationAllowed(true);
            return;
        }

        if ((session?.user?.credits ?? 0) < totalCost) {
            toast.error('You do not have enough tokens to generate these images.', {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "dark",
            });
            setGenerationAllowed(true);
            return;
        }

        try {
            // 🔁 Loop through each prompt
            for (const promptToUse of promptsToUse) {

                // console.log('prompt of promptsToUse', promptToUse);

                const loops = useCustomPrompt ? 1 : 2;
                // console.log('loops', loops);

                for (let i = 0; i < loops; i++) {
                    let imageId;
                    try {
                        const deductionResponse = await fetch('/api/user/tokens/subtract', {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ email: session.user.email, tokensToDeduct: tokensPerImage }),
                        });
                        
                        const deductionData = await deductionResponse.json();
                        // console.log('deductionData', deductionData);
                        if (deductionData.message !== 'User credits updated successfully') throw new Error(deductionData.message);
                        // if (!deductionResponse.ok) throw new Error(deductionData.message);
                        
                        // Update session with new token count
                        await update({ user: { ...session?.user, credits: deductionData.newTokenCount } });
    
                        // Step 1: Create image doc
                        const createImageRes = await fetch("/api/image/add", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                            userId: session.user.id,
                            type_gen: "txt2img",
                            prompt: promptToUse,
                            model: 'realism',
                            steps,
                            cfg,
                            denoise,
                            weights_interpretator,
                            upscale,
                            facelock_weight,
                            facelock_type,
                            pose_weight,
                            inpaint_what,
                            size,
                            seed: null,
                            neg_prompt,
                            loras,
                            cost: 1,
                            style: useCustomPrompt ? 'None' : selectedPhotoshootType.type,
                            tool: "Photoshoot",
                            pipeline: "Photoshoot",
                            favorite: false,
                            user_shared_settings: false,
                            }),
                        });
                
                        const createData = await createImageRes.json();
                        // console.log('createData', createData);

                        const id_gen = createData.imageId;
                        imageId = createData.imageId;

                        const genderToSend =
                            useCustomPrompt && selectedModel?.gender
                                ? selectedModel.gender
                                : selectedGenderFilter === 'Male'
                                ? 'man'
                                : 'woman';
                
                        // Step 2: Trigger LoRA generation
                        const formData = new FormData();
                        formData.append("userId", session.user.id);
                        formData.append("id_gen", id_gen);
                        formData.append("name_lora", selectedModel.name_lora);
                        formData.append("prompt", promptToUse);
                        formData.append("resolution", size);
                        formData.append("gender", genderToSend);

                        // console.log('formData', formData);
                
                        const generateRes = await fetch("/api/gen/image/lora/gen", {
                            method: "POST",
                            body: formData,
                        });
                
                        if (!generateRes.ok) {
                            const errText = await generateRes.text();
                            throw new Error(errText);
                        }
                
                        const result = await generateRes.json();
                        // console.log('result', result);
                        // console.log(`✅ Generated for prompt: "${promptToUse}" (run ${i + 1}/2):`, result);
                    } catch (error) {
                        // console.log('error', error);
                        const addResponse = await fetch('/api/user/tokens/add', {
                            method: 'PUT',
                            headers: {
                            'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ email: session.user.email, tokensToAdd: tokensPerImage }),
                        });
    
                        const addData = await addResponse.json();
                        // console.log('addData', addData);
                    
                        if (addData.message !== 'User credits updated successfully') throw new Error(addData.message);
                    
                        // Update session with new token count
                        await update({ user: { ...session?.user, credits: addData.newTokenCount } });
                        // console.log('addData.newTokenCount', addData.newTokenCount);
                        // console.log('session', session);
    
                        if (imageId) {
                            const deleteResponse = await fetch('/api/image/delete', {
                                method: 'DELETE',
                                headers: {'Content-Type': 'application/json'},
                                body: JSON.stringify({imageId})
                            });
    
                            const deleteResult = await deleteResponse.json();
                            if (deleteResult.message !== 'Image deleted successfully') throw new Error(deleteResult.message);
                        }
                    }
                }
            }
        
            toast.success(`Your image${useCustomPrompt ? "" : "s"} will be generated soon!`);
            eventBus.dispatchEvent(new Event("generation-start"));
            if (openedFromController && onGenerate) {
                onGenerate();
            }
        
        } catch (err) {
        console.error("❌ LoRA Generation failed:", err);
        toast.error(`Generation failed: ${(err as Error).message}`);
        setGenerationAllowed(true);
        }
    };

    const handleVideoGeneration = async (
        event: React.MouseEvent<HTMLButtonElement> | { preventDefault(): void },
        forcedIndex?: number
    ) => {
        event.preventDefault();
        if (!generationAllowed) return;
        setGenerationAllowed(false);

        /* --- BASIC CREDIT / ACCOUNT CHECKS ----------------------------- */
        if (!session?.user?.id) return;

        if (typeof session?.user?.credits !== 'number' || session.user.credits < 25) {
            if (openedFromController && onToggle) {
                onToggle(25);
            } else {
                togglePricingModal(25);
            }
            setGenerationAllowed(true);
            return;
        }

        /* --- MODEL STATE & CONTEXT ------------------------------------- */
        const userModels      = modelMap;
        const selectedModel   = userModels?.[selectedPhotoshootModelIndex];
        const useCustomPrompt = prompt && prompt.trim().length > 0;

        type VideoGenMode = 'text' | 'image' | 'model';

        /* --- VALIDATION ------------------------------------------------- */
        if (selectedModel?.status === 'generating') {
            toast.info('Please wait around 5 minutes for model to finish training.', {
                position: "top-right", autoClose: 3000, theme: "dark"
            });
            setGenerationAllowed(true);
            return;
        }

        if (videoGenerationMode === 'model' && !selectedModel) {
            toast.error('Please choose your model.', { position: "top-right", autoClose: 3000, theme: "dark" });
            setGenerationAllowed(true);
            return;
        }

        if (videoGenerationMode !== 'model' && !useCustomPrompt) {
            toast.error('Please provide a prompt.', { position: "top-right", autoClose: 3000, theme: "dark" });
            setGenerationAllowed(true);
            return;
        }

        if (videoGenerationMode === 'model' && (selectedTypeIndex === -1)) {
            toast.error('Please select style or enter prompt.', {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: false,
                draggable: true,
                progress: undefined,
                theme: "dark",
            });
            setGenerationAllowed(true);
            return;
        }

        /* --- DETERMINE type_gen & prompt ------------------------------- */
        let type_gen: 'gen_video_text' | 'gen_video' | 'gen_video_lora' = 'gen_video_text';

        if (videoGenerationMode === 'image') {
            if (userImage.image && userImage.imageType === 'video') {
                type_gen = 'gen_video';
            } else {
                type_gen = 'gen_video_text';
            }
        }

        if (videoGenerationMode === 'model' && selectedModel) {
            type_gen = 'gen_video_lora';
        }

        let promptToUse = prompt.trim();

        if (videoGenerationMode === 'model') {
            // fallback to the first gender prompt from the selected style
            const genderKey = selectedGenderFilter.toLowerCase() as 'female' | 'male';
            const actualIndex = typeof forcedIndex === 'number' ? forcedIndex : selectedTypeIndex;
            
            const selType   = PhotoshootTypeData[selectedGenderFilter]?.[actualIndex ?? 0];
            promptToUse     = selType?.prompts?.[genderKey]?.[0] || promptToUse;
        }
        // console.log('promptToUse', promptToUse);

        /* --- TOKEN DEDUCTION (25) -------------------------------------- */
        const tokensPerVideo = 25;
        let videoId: string | undefined;

        try {
            /* subtract tokens */
            const deduct = await fetch('/api/user/tokens/subtract', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: session.user.email, tokensToDeduct: tokensPerVideo })
            });
            const deductData = await deduct.json();
            if (deductData.message !== 'User credits updated successfully') throw new Error(deductData.message);
            await update({ user: { ...session.user, credits: deductData.newTokenCount } });

            /* 1️⃣  create DB doc */
            const createRes = await fetch('/api/video/add', {
                method : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body   : JSON.stringify({
                    userId : session.user.id,
                    type_gen,
                    prompt : videoGenerationMode === 'model' ? 'gen_video_lora' : promptToUse,
                    resolution: videoSize,
                    image_prompt: null,
                    scene  : null,
                    version: null,
                    gender : videoGenerationMode === 'model'
                              ? (selectedGenderFilter === 'Male' ? 'man' : 'woman')
                              : null,
                    loras  : videoGenerationMode === 'model' ? selectedModel.name_lora : "None",
                    user_shared_settings: false,
                })
            });
            const createJson = await createRes.json();
            videoId = createJson.videoId;
            
            if (!videoId) throw new Error("Video ID is undefined");

            /* 2️⃣  send to generation engine */
            const blobFromBase64 = (b64: string) => {
                const byte = atob(b64.split(',')[1]);
                const arr  = new Uint8Array(byte.length);
                for (let i = 0; i < byte.length; i++) arr[i] = byte.charCodeAt(i);
                return new Blob([arr], { type: 'image/png' });
            };

            const fd = new FormData();
            fd.append('userId', session.user.id);
            fd.append('id_gen', videoId);
            fd.append('resolution', videoSize);
            fd.append('prompt', promptToUse);
            fd.append('gender', videoGenerationMode === 'model'
                ? (selectedGenderFilter === 'Male' ? 'man' : 'woman')
            : '');

            // console.log('type_gen', type_gen)
            switch (type_gen) {
            case "gen_video":               // image present
                fd.append(
                "image",
                blobFromBase64(userImage.image!),
                "image.png"
                );
                break;

            case "gen_video_text":          // prompt-only
                break;

            case "gen_video_lora":          // LoRA / model
                fd.append("image_prompt", promptToUse);
                fd.append("loras", selectedModel!.name_lora);
                break;
            }


            const genRes = await fetch('/api/gen/video/gen', { method: 'POST', body: fd });
            if (!genRes.ok) throw new Error(await genRes.text());

            toast.success('Your video is being generated!');
            eventBus.dispatchEvent(new Event('generation-start'));
            if (openedFromController && onGenerate) {
                onGenerate();
            }

        } catch (err: any) {
            /* refund on failure */
            await fetch('/api/user/tokens/add', {
                method : 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body   : JSON.stringify({ email: session?.user?.email, tokensToAdd: tokensPerVideo })
            });
            if (videoId) {
                await fetch('/api/video/delete', {
                    method : 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body   : JSON.stringify({ videoId })
                });
            }
            console.error('❌ Video generation failed:', err);
            toast.error(`Generation failed: ${err.message || err}`);
            setGenerationAllowed(true);
        }
    };

    const generateVideoFromImage = async (
        imageB64: string,                // full data-URL (e.g. "data:image/png;base64,....")
        promptForVideo: string,          // user-facing prompt (already cleaned)
    ) => {

        if (!generationAllowed) return;
        setGenerationAllowed(false);

        if (!session?.user?.id) return;


        if (typeof session?.user?.credits !== 'number' || session.user.credits < 25) {
            if (openedFromController && onToggle) {
                onToggle(25);
            } else {
                togglePricingModal(25);
            }
            setGenerationAllowed(true);
            return;
        }

        const tokensPerVideo = 25;
        let videoId: string | undefined;

        try {
            const deductRes = await fetch('/api/user/tokens/subtract', {
                method : 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body   : JSON.stringify({
                    email         : session.user.email,
                    tokensToDeduct: tokensPerVideo,
                }),
            });
            const deductJson = await deductRes.json();
            if (deductJson.message !== 'User credits updated successfully')
            throw new Error(deductJson.message);

            // instantly update session with new credit balance
            await update({ user: { ...session.user, credits: deductJson.newTokenCount } });

            const createRes = await fetch('/api/video/add', {
                method : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body   : JSON.stringify({
                    userId     : session.user.id,
                    type_gen   : 'gen_video',          // **always** gen_video for this flow
                    prompt     : promptForVideo,
                    resolution : videoSize,
                    image_prompt: null,
                    scene      : null,
                    version    : null,
                    gender     : null,
                    loras      : 'None',
                    user_shared_settings: false,
                }),
            });
            const createJson = await createRes.json();
            videoId = createJson.videoId;

            if (!videoId) throw new Error("Video ID is undefined");

            const blobFromB64 = (b64: string) => {
                const byteString = atob(b64.split(',')[1]);          // strip "data:image/..."
                const array      = new Uint8Array(byteString.length);
                for (let i = 0; i < byteString.length; i++) {
                array[i] = byteString.charCodeAt(i);
                }
                return new Blob([array], { type: 'image/png' });
            };

            const fd = new FormData();
            fd.append('userId',     session.user.id);
            fd.append('id_gen',     videoId);
            fd.append('resolution', videoSize);
            fd.append('prompt',     promptForVideo);

            /* attach source image */
            fd.append('image', blobFromB64(imageB64), 'image.png');

            const genRes = await fetch('/api/gen/video/gen', { method: 'POST', body: fd });
            if (!genRes.ok) throw new Error(await genRes.text());

            /* SUCCESS 🎉 */
            toast.success('Your video is being generated!');
            eventBus.dispatchEvent(new Event('generation-start'));


        } catch (err: any) {
            /* refund on failure */
            await fetch('/api/user/tokens/add', {
                method : 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body   : JSON.stringify({ email: session?.user?.email, tokensToAdd: tokensPerVideo })
            });
            if (videoId) {
                await fetch('/api/video/delete', {
                    method : 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body   : JSON.stringify({ videoId })
                });
            }
            console.error('❌ Video generation failed:', err);
            toast.error(`Generation failed: ${err.message || err}`);
            setGenerationAllowed(true);
        }
    };

    useEffect(() => {
        const fromCard = (e: Event) => {
            const customEvent = e as CustomEvent<{ index: number }>;
            const newIndex = customEvent.detail?.index;
            if (typeof newIndex === 'number') {
                setSelectedTypeIndex(newIndex); // optional: still useful for highlighting UI
                handleGenerate({ preventDefault() {} } as any, newIndex);
            }
        };        
    
        eventBus.addEventListener('photoshoot-card-generate', fromCard);
        return () => eventBus.removeEventListener('photoshoot-card-generate', fromCard);
    }, [handleGenerate]);
    
    useEffect(() => {
        const listener = (e: Event) => {
            const { imageB64, prompt } =
            (e as CustomEvent<{ imageB64: string; prompt: string;}>).detail;
            generateVideoFromImage(imageB64, prompt);
        };
        eventBus.addEventListener('photoshoot-video-from-image', listener);
        return () => eventBus.removeEventListener('photoshoot-video-from-image', listener);
    }, [videoSize, session, update]);

    useEffect(() => {
        async function handleUnblockGeneration() {
            // console.log("🚀 Heard 'generation-finish' event, unblocking generation");
            setGenerationAllowed(true);
        }
                      
        // Subscribe to the event
        eventBus.addEventListener("generation-finish", handleUnblockGeneration);
        // Or using window directly:
        // window.addEventListener("generation-finish", handleUnblockGeneration);
                      
        return () => {
            eventBus.removeEventListener("generation-finish", handleUnblockGeneration);
            // Or:
            // window.removeEventListener("generation-finish", handleUnblockGeneration);
        };
    }, [session?.user?.id]);

    useEffect(() => {
        async function handleBlockGeneration() {
            // console.log("🚀 Heard 'generation-start' event, unblocking generation");
            setGenerationAllowed(false);
        }
                        
        // Subscribe to the event
        eventBus.addEventListener("generation-start", handleBlockGeneration);
        // Or using window directly:
        // window.addEventListener("generation-start", handleUnblockGeneration);
                        
        return () => {
            eventBus.removeEventListener("generation-start", handleBlockGeneration);
                // Or:
            // window.removeEventListener("generation-start", handleUnblockGeneration);
        };
    }, [session?.user?.id]);

    const handleMenuClick = (index: number) => {
        setActiveIndex(index);
    
        const paths = [
            "/studio/generator",
            "/studio/canvas",
            "/studio/upscale",
            "/studio/video",
        ];
    
        const path = paths[index];
        if (path) {
            resetToDefault();
            router.push(path);
        }
    };

    // Function to navigate back to `/studio`
    const navigateToCreation = () => {
        router.push("/");
    };

    const models = modelMap;
    const hasTrainingModel = models.some(
        model =>
          model.status === "generating" ||
          (model.status === "ready" && !model.model_image)
      );

      let generationCost = 1;

    if (generationMode === 'image') {
        const useCustomPrompt = prompt && prompt.trim().length > 0;
        generationCost = useCustomPrompt ? 1 : 6;
    } else if (generationMode === 'video') {
        generationCost = 25;
    }

    return (
        <div className={`${openedFromController ? styles.controls_menu_inner_mobile : styles.controls_menu_inner}`}>
            <div className={styles.generator_controls_wrapper}>

                <div className={styles.generator_controls_header}>
                    {isMobile && (
                        <ControllersBackIcon 
                            onClick={onClose}
                            className={styles.back_icon}
                        />
                    )}
                    <span className={styles.controls_return_text}>{generationMode === 'image' ? 'AI Photoshoot' : 'AI Video'}</span>
                </div>

                {isMobile ? (
                    <div className={styles.scrollable_area}>
                        {generationMode === 'image' ? (
                            <PhotoshootImageControls
                                resetHighlight={resetHighlight}
                                onReset={handleReset}
                                openedFromController={openedFromController}
                                isLoraTraining={isLoraTraining}
                                hasTrainingModel={hasTrainingModel}
                                onStyleSelect={onStyleSelect}
                                onToggleCost={(generationCost) => onToggle?.(generationCost)}
                            />
                            ) : (
                            <PhotoshootVideoControls
                                resetHighlight={resetHighlight}
                                onReset={handleReset}
                                openedFromController={openedFromController}
                                isLoraTraining={isLoraTraining}
                                hasTrainingModel={hasTrainingModel}
                                onStyleSelect={onStyleSelect}
                                onToggleCost={(generationCost) => onToggle?.(generationCost)}
                            />
                        )}
                    </div>
                    ) : (
                        <>
                            {generationMode === 'image' ? (
                            <PhotoshootImageControls
                                resetHighlight={resetHighlight}
                                onReset={handleReset}
                                openedFromController={openedFromController}
                                isLoraTraining={isLoraTraining}
                                hasTrainingModel={hasTrainingModel}
                                onStyleSelect={onStyleSelect}
                                onToggleCost={(generationCost) => togglePricingModal(generationCost)}
                            />
                            ) : (
                            <PhotoshootVideoControls
                                resetHighlight={resetHighlight}
                                onReset={handleReset}
                                openedFromController={openedFromController}
                                isLoraTraining={isLoraTraining}
                                hasTrainingModel={hasTrainingModel}
                                onStyleSelect={onStyleSelect}
                                onToggleCost={(generationCost) => togglePricingModal(generationCost)}
                            />
                        )}
                    </>
                )}
                
                <div className={styles.controls_generation_actions_wrapper}>
                    <small className={styles.controls_gemeration_small_text}>
                        You will be charged <span className={styles.controls_gemeration_small_text_credits}>{generationCost} credit{generationCost > 1 ? 's' : ''} </span>
                    </small>
                    <div className={styles.controls_generation_actions}>
                        <button
                            disabled={!generationAllowed}
                            className={`${styles.controls_generation_button} ${!generationAllowed ? styles.controls_generation_button_disabled : ''}`}
                            onClick={e => {
                                if (session?.user?.id) {
                                    trackGtmEvent("Generate_shoot", {
                                        ecommerce: { usid: session.user.id }
                                    });
                                    // console.log('Generate_shoot gtm sent');
                                    handleGenerate(e);
                                    // if (openedFromController && onGenerate) {
                                    //     onGenerate();
                                    // }
                                } else {
                                    toggleLoginModal();
                                }
                            }}
                        >
                            <span className={styles.button_text}>
                                {!session 
                                    ? "Create free account" 
                                    : !generationAllowed 
                                        ? "Generating photos" 
                                        : "Generate"
                                }
                            </span>
                        </button>
                    </div>
                </div>
                
                <LoginModal isOpen={isLoginModalOpen} onClose={toggleLoginModal} order='default'/>
                <SubscriptionPopup 
                    isOpen={isPricingModalOpen} 
                    onClose={togglePricingModal} 
                    generationCost={generationCostPopup}
                />

            </div>
            <ToastContainer position="top-right" autoClose={3000} />
        </div>
    );
};
