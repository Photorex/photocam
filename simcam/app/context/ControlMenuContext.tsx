"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

type SizeType = '1280x1280' | '1024x1280' | '856x1280' | '736x1280' | '1280x1024' | '1280x856' | '1280x736';
type VideoSizeType = '1:1' | '9:16' | '16:9';
type ImageType = 'image' | 'facelock' | 'upscale' | 'pose' | 'canvas' | 'video' | '';
type UpscaleType = 'None' | '2x' | '4x';
type SelectedUpscaleType = '2x' | '4x';
type WeightsInterpretatorType = 'Lite' | 'Pro';
interface UserModel {
    name: string;
    image: string;
}
type StudioType = "Creative Studio" | "AI Photoshoot";

interface ControlMenuContextType {
    generationMode: 'image' | 'video';
    setGenerationMode: (mode: 'image' | 'video') => void;
    videoGenerationMode: 'image' | 'model';
    setVideoGenerationMode: (mode: 'image' | 'model') => void;
    prompt: string;
    setPrompt: (value: string) => void;
    type_gen: string;
    setTypeGen: (value: string) => void;
    model: string;
    setModel: (value: string) => void;
    size: SizeType;
    setSize: (value: SizeType) => void;
    videoSize: VideoSizeType;
    setVideoSize: (value: VideoSizeType) => void;
    steps: number;
    setSteps: (value: number) => void;
    cfg: number;
    setCfg: (value: number) => void;
    denoise: number;
    setDenoise: (value: number) => void;
    weights_interpretator: WeightsInterpretatorType;
    setWeightsInterpretator: (value: WeightsInterpretatorType) => void;
    upscale: UpscaleType;
    setUpscale: (value: UpscaleType) => void;
    upscaleSelectedValue: SelectedUpscaleType;
    setUpscaleSelectedValue: (value: SelectedUpscaleType) => void;
    facelock_weight: number;
    setFacelockWeight: (value: number) => void;
    facelock_type: string;
    setFacelockType: (value: string) => void;
    pose_weight: number;
    setPoseWeight: (value: number) => void;
    inpaint_what: string;
    setInpaintWhat: (value: string) => void;
    neg_prompt: string;
    setNegPrompt: (value: string) => void;
    videoPrompt: string;
    setVideoPrompt: (value: string) => void;
    loras: string;
    setLoras: (value: string) => void;
    userImage: { image: string | null; imageType: ImageType };
    setUserImage: (value: { image: string | null; imageType: ImageType }) => void;
    poseImage: { image: string | null; imageType: ImageType };
    setPoseImage: (value: { image: string | null; imageType: ImageType }) => void;
    maskImage: { image: string | null; imageType: ImageType };
    setMaskImage: (value: { image: string | null; imageType: ImageType }) => void;
    maskBaseImage: string | null;
    setMaskBaseImage: (value: string | null) => void;
    numberOfImages: number;
    setNumberOfImages: (value: number) => void;
    allowPublicGallery: boolean;
    setAllowPublicGallery: (value: boolean) => void;
    resetToDefault: () => void;
    studioType: StudioType;
    setStudioType: (value: StudioType) => void;
    selectedPhotoshootModelIndex: number;
    setSelectedPhotoshootModelIndex: (index: number) => void;
    userModelTrainImages: string[];
    setUserModelTrainImages: React.Dispatch<React.SetStateAction<string[]>>;
    userModelTrainFiles: File[];
    setUserModelTrainFiles: React.Dispatch<React.SetStateAction<File[]>>;
    selectedGenderFilter: 'Male' | 'Female';
    setSelectedGenderFilter: (value: 'Male' | 'Female') => void;
    isTrainingLoading: boolean;
    setIsTrainingLoading: (value: boolean) => void;
    selectedTypeIndex: number;
    setSelectedTypeIndex: (value: number) => void;
}

const defaultValues: ControlMenuContextType = {
    generationMode: 'image',
    setGenerationMode: () => {},
    videoGenerationMode: 'model',
    setVideoGenerationMode: () => {},
    prompt: "",
    setPrompt: () => {},
    type_gen: "txt2img",
    setTypeGen: () => {},
    model: "realism",
    setModel: () => {},
    size: "856x1280",
    setSize: () => {},
    videoSize: "9:16",
    setVideoSize: () => {},
    steps: 30,
    setSteps: () => {},
    cfg: 4,
    setCfg: () => {},
    denoise: 1,
    setDenoise: () => {},
    weights_interpretator: "Lite",
    setWeightsInterpretator: () => {},
    upscale: "None",
    setUpscale: () => {},
    upscaleSelectedValue: '2x',
    setUpscaleSelectedValue: () => {},
    facelock_weight: 1,
    setFacelockWeight: () => {},
    facelock_type: "None",
    setFacelockType: () => {},
    pose_weight: 1,
    setPoseWeight: () => {},
    inpaint_what: "None",
    setInpaintWhat: () => {},
    neg_prompt: "ugly, deformed, noisy, blurry, low contrast, bad anatomy, watermark, text",
    setNegPrompt: () => {},
    videoPrompt: "",
    setVideoPrompt: () => {},
    loras: "None",
    setLoras: () => {},
    userImage: { image: null, imageType: '' },
    setUserImage: () => {},
    poseImage: { image: null, imageType: '' },
    setPoseImage: () => {},
    maskImage: { image: null, imageType: '' },
    setMaskImage: () => {},
    maskBaseImage: null,
    setMaskBaseImage: () => {},
    numberOfImages: 2,
    setNumberOfImages: () => {},
    allowPublicGallery: true,
    setAllowPublicGallery:() => {},
    resetToDefault:() => {},
    studioType: "Creative Studio",
    setStudioType: () => {},
    selectedPhotoshootModelIndex: 0,
    setSelectedPhotoshootModelIndex: () => {},
    userModelTrainImages: [],
    setUserModelTrainImages: () => {},
    userModelTrainFiles: [],
    setUserModelTrainFiles: () => {},
    selectedGenderFilter: 'Female',
    setSelectedGenderFilter: () => {},
    isTrainingLoading: false,
    setIsTrainingLoading: () => {},
    selectedTypeIndex: 0,
    setSelectedTypeIndex: () => {},
};

const ControlMenuContext = createContext<ControlMenuContextType>(defaultValues);

export const ControlMenuProvider = ({ children }: { children: ReactNode }) => {
    const [generationMode, setGenerationMode] = useState(defaultValues.generationMode);
    const [videoGenerationMode, setVideoGenerationMode] = useState(defaultValues.videoGenerationMode);
    const [prompt, setPrompt] = useState(defaultValues.prompt);
    const [type_gen, setTypeGen] = useState(defaultValues.type_gen);
    const [model, setModel] = useState(defaultValues.model);
    const [size, setSize] = useState(defaultValues.size);
    const [videoSize, setVideoSize] = useState(defaultValues.videoSize);
    const [steps, setSteps] = useState(defaultValues.steps);
    const [cfg, setCfg] = useState(defaultValues.cfg);
    const [denoise, setDenoise] = useState(defaultValues.denoise);
    const [weights_interpretator, setWeightsInterpretator] = useState(defaultValues.weights_interpretator);
    const [upscale, setUpscale] = useState(defaultValues.upscale);
    const [upscaleSelectedValue, setUpscaleSelectedValue] = useState(defaultValues.upscaleSelectedValue);
    const [facelock_weight, setFacelockWeight] = useState(defaultValues.facelock_weight);
    const [facelock_type, setFacelockType] = useState(defaultValues.facelock_type);
    const [pose_weight, setPoseWeight] = useState(defaultValues.pose_weight);
    const [inpaint_what, setInpaintWhat] = useState(defaultValues.inpaint_what);
    const [neg_prompt, setNegPrompt] = useState(defaultValues.neg_prompt);
    const [videoPrompt, setVideoPrompt] = useState(defaultValues.videoPrompt);
    const [loras, setLoras] = useState(defaultValues.loras);
    const [userImage, setUserImage] = useState(defaultValues.userImage);
    const [poseImage, setPoseImage] = useState(defaultValues.poseImage);
    const [maskImage, setMaskImage] = useState(defaultValues.maskImage);
    const [maskBaseImage, setMaskBaseImage] = useState(defaultValues.maskBaseImage);
    const [numberOfImages, setNumberOfImages] = useState(defaultValues.numberOfImages);
    const [allowPublicGallery, setAllowPublicGallery] = useState(defaultValues.allowPublicGallery);
    const [studioType, setStudioType] = useState<StudioType>(defaultValues.studioType);
    const [selectedPhotoshootModelIndex, setSelectedPhotoshootModelIndex] = useState<number>(0);
    const [userModelTrainImages, setUserModelTrainImages] = useState<string[]>([]);
    const [userModelTrainFiles, setUserModelTrainFiles] = useState<File[]>([]);
    const [selectedGenderFilter, setSelectedGenderFilter] = useState<'Male' | 'Female'>('Female');
    const [isTrainingLoading, setIsTrainingLoading] = useState(defaultValues.isTrainingLoading);
    const [selectedTypeIndex, setSelectedTypeIndex] = useState(defaultValues.selectedTypeIndex);


    const resetToDefault = () => {
        setGenerationMode('image');
        setVideoGenerationMode('model');
        setPrompt(defaultValues.prompt);
        setTypeGen(defaultValues.type_gen);
        setModel(defaultValues.model);
        setSize(defaultValues.size);
        setVideoSize(defaultValues.videoSize);
        setSteps(defaultValues.steps);
        setCfg(defaultValues.cfg);
        setDenoise(defaultValues.denoise);
        setWeightsInterpretator(defaultValues.weights_interpretator);
        setUpscale(defaultValues.upscale);
        setFacelockWeight(defaultValues.facelock_weight);
        setFacelockType(defaultValues.facelock_type);
        setPoseWeight(defaultValues.pose_weight);
        setInpaintWhat(defaultValues.inpaint_what);
        setNegPrompt(defaultValues.neg_prompt);
        setVideoPrompt(defaultValues.videoPrompt);
        setLoras(defaultValues.loras);
        setUserImage(defaultValues.userImage);
        setPoseImage(defaultValues.poseImage);
        setMaskImage(defaultValues.maskImage);
        setMaskBaseImage(defaultValues.maskBaseImage);
        setNumberOfImages(defaultValues.numberOfImages);
        setAllowPublicGallery(defaultValues.allowPublicGallery);
        setSelectedPhotoshootModelIndex(defaultValues.selectedPhotoshootModelIndex);
        setUpscaleSelectedValue(defaultValues.upscaleSelectedValue);
        setSelectedTypeIndex(defaultValues.selectedTypeIndex);
    };


    return (
        <ControlMenuContext.Provider
        value={{
            generationMode,
            setGenerationMode,
            videoGenerationMode,
            setVideoGenerationMode,
            prompt,
            setPrompt,
            type_gen,
            setTypeGen,
            model,
            setModel,
            size,
            setSize,
            videoSize,
            setVideoSize,
            steps,
            setSteps,
            cfg,
            setCfg,
            denoise,
            setDenoise,
            weights_interpretator,
            setWeightsInterpretator,
            upscale,
            setUpscale,
            upscaleSelectedValue,
            setUpscaleSelectedValue,
            facelock_weight,
            setFacelockWeight,
            facelock_type,
            setFacelockType,
            pose_weight,
            setPoseWeight,
            inpaint_what,
            setInpaintWhat,
            neg_prompt,
            setNegPrompt,
            videoPrompt,
            setVideoPrompt,
            loras,
            setLoras,
            userImage,
            setUserImage,
            poseImage, 
            setPoseImage,
            maskImage,
            setMaskImage,
            maskBaseImage,
            setMaskBaseImage,
            numberOfImages,
            setNumberOfImages,
            allowPublicGallery,
            setAllowPublicGallery,
            resetToDefault,
            studioType,
            setStudioType,
            selectedPhotoshootModelIndex,
            setSelectedPhotoshootModelIndex,
            userModelTrainImages,
            setUserModelTrainImages,
            userModelTrainFiles,
            setUserModelTrainFiles,
            selectedGenderFilter,
            setSelectedGenderFilter,
            isTrainingLoading,
            setIsTrainingLoading,
            selectedTypeIndex, 
            setSelectedTypeIndex,
        }}
        >
        {children}
        </ControlMenuContext.Provider>
    );
};

export const useControlMenuContext = () => {
  const context = useContext(ControlMenuContext);
  if (!context) {
    throw new Error("useControlMenuContext must be used within a ControlMenuProvider");
  }
  return context;
};