'use client';

import React, { useState, useRef, useEffect } from "react";

import Image from 'next/image';

import styles from './NewModelModal.module.css';

import ArrowIcon from "@/public/assets/icons/arrow-down.svg";
import CloseIcon from '@/public/images/icons/controller/close-icon.svg';
import ModelUploadIcon from '@/public/assets/icons/upload-model-base.svg';
import DeleteIcon from "@/public/images/icons/controller/delete-icon.svg";
import UploadPhotoIcon from "@/public/assets/icons/upload-photo-icon.svg";

import { eventBus } from "@/app/lib/event/eventBus";

import { signIn, signOut, useSession } from "next-auth/react";

import { useControlMenuContext } from "@/app/context/ControlMenuContext";

import { trackGtmEvent } from "@/app/lib/analytics/google/trackGtmEvent";

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import LoginModal from "../LoginModal/LoginModal";
interface Props {
    isOpen: boolean;
    onClose: () => void;
    gender: 'Male' | 'Female';
    setGender: (value: 'Male' | 'Female') => void;
    onToggle?: (generationCost: number) => void; 
}

export default function NewModelModal({ isOpen, onClose, gender, setGender, onToggle }: Props) {
    const { data: session, status, update } = useSession();

    const [isLoginModalOpen, setLoginModalOpen] = useState(false);
        
    const toggleLoginModal = () => {
        setLoginModalOpen(!isLoginModalOpen);
    };
    const [name, setName] = useState('');
    const [age, setAge] = useState('');
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [page, setPage] = useState<1 | 2>(1);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const uploadInputRef = useRef<HTMLInputElement>(null);
    const [totalImageSize, setTotalImageSize] = useState<number>(0); // in bytes

    const { 
        userModelTrainImages, 
        setUserModelTrainImages, 
        userModelTrainFiles, 
        setUserModelTrainFiles, 
        isTrainingLoading, 
        setIsTrainingLoading 
    } = useControlMenuContext();

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files || []);
        const fileUrls = files.map(file => URL.createObjectURL(file));
        
        // Calculate new total size
        const newFiles = [...userModelTrainFiles, ...files].slice(0, 10);
        const newTotalSize = newFiles.reduce((sum, file) => sum + file.size, 0);
        
        // Store both URLs (for display) and File objects (for upload)
        setUserModelTrainImages((prev: string[]) => [...prev, ...fileUrls].slice(0, 10));
        setUserModelTrainFiles((prev: File[]) => [...prev, ...files].slice(0, 10));
        setTotalImageSize(newTotalSize);
    };
      
    const removeImage = (indexToRemove: number) => {
        setUserModelTrainImages((prev: string[]) => prev.filter((_, i: number) => i !== indexToRemove));
        setUserModelTrainFiles((prev: File[]) => {
            const newFiles = prev.filter((_, i: number) => i !== indexToRemove);
            const newTotalSize = newFiles.reduce((sum, file) => sum + file.size, 0);
            setTotalImageSize(newTotalSize);
            return newFiles;
        });
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const basePath = `/assets/images/models/modal/${gender.toLowerCase()}`;

    const modalRef = useRef<HTMLDivElement>(null);
    
    const handleClose = () => {
        setPage(1);                          
        setName('');                         
        setAge('');                          
        setUserModelTrainImages([]);
        setUserModelTrainFiles([]);
        setTotalImageSize(0);
        onClose();                           
    };

    useEffect(() => {
        const handleOutsideClick = (event: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                handleClose();
            }
        };
    
        document.addEventListener("mousedown", handleOutsideClick);
        return () => document.removeEventListener("mousedown", handleOutsideClick);
    }, []);

    const refreshUserSession = async () => {
        if (!session?.user?.id) return;
      
        try {
          const response = await fetch(`/api/user/${session.user.id}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
          });
      
          const data = await response.json();
          if (response.ok) {
            await update({
              user: {
                ...session.user,
                name: data.user.name,
                email: data.user.email,
                emailVerified: data.user.emailVerified,
                credits: data.user.credits,
                subscription: data.user.subscription,
                feedbackSubmitted: data.user.feedbackSubmitted,
                serviceModalShown: data.user.serviceModalShown,
                registrationGtmSent: data.user.registrationGtmSent,
                modelMap: data.user.modelMap,
              },
            });
          } else {
            console.error("❌ Failed to refresh session:", data.message);
          }
        } catch (err) {
          console.error("❌ Error refreshing session:", err);
        }
    };

    async function userStillHasFreeModel(id: string) {
        const r = await fetch(`/api/model/allow?userId=${id}`, { cache:'no-store' });
        const j = await r.json();
        return j.freeAvailable as boolean;
    }

    const handleTrainModel = async () => {
        if (!session?.user) {
            toggleLoginModal();
            return;
        }

        // Check if we have EITHER 10 files OR 10 image URLs
        const hasRequiredImages = userModelTrainFiles.length === 10 || userModelTrainImages.length === 10;
        
        if (!hasRequiredImages || !name || !age || !session?.user?.id) {
            toast.error('Please fill all fields and upload exactly 10 images.', {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "dark",
            });
            return;
          }

        //   const checkResp = await fetch(
        //     `/api/model/allow?userId=${encodeURIComponent(session.user.id)}`,   // GET!
        //     { cache: 'no-store' }                                               // avoid stale result
        //   );
          
        //   const check = await checkResp.json();
        
        //   if (!check.allowed) {
        //     toast.error('Please consider upgrading plan to generate more AI Profiles', {
        //         position: "top-right",
        //         autoClose: 5000,
        //         hideProgressBar: false,
        //         closeOnClick: true,
        //         pauseOnHover: true,
        //         draggable: true,
        //         progress: undefined,
        //         theme: "dark",
        //     });
        //     return;                                  //  <-- stop right here
        //   }

        const isFirstCustomModel = await userStillHasFreeModel(session.user.id);
        const TOKEN_COST = isFirstCustomModel ? 0 : 50;

        if ((session?.user?.credits ?? 0) < TOKEN_COST) {
            if (onToggle) {
                onToggle(TOKEN_COST);
            }
            // checkFeedbackModalOpenCase();
            toast.error('You need 50 credits to train model.', {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: false,
                draggable: true,
                progress: undefined,
                theme: "dark",
            });
            return;
        }

        try {

            if (TOKEN_COST > 0) {
                const deductionResponse = await fetch('/api/user/tokens/subtract', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email: session.user.email, tokensToDeduct: TOKEN_COST }),
                });
                            
                const deductionData = await deductionResponse.json();
                // console.log('deductionData', deductionData);
                if (deductionData.message !== 'User credits updated successfully') throw new Error(deductionData.message);
                // if (!deductionResponse.ok) throw new Error(deductionData.message);
                            
                // Update session with new token count
                await update({ user: { ...session?.user, credits: deductionData.newTokenCount } });
            }
            //   setIsTrainingLoading(true);
            eventBus.dispatchEvent(new Event("generation-lora-start"));
            // DON'T close modal yet - we need the files!
            // handleClose(); // MOVED TO END
        
                const { ObjectId } = await import('bson');
                const id_gen = new ObjectId().toHexString();
                const base = name.toLowerCase().replace(/\s+/g, "-");
                const name_lora = `${base}_${id_gen}`;
        
                const genderLabel = gender === 'Male' ? 'man' : 'woman';

            // Step 1: Save model metadata in user DB
            await fetch("/api/user/lora/add", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                userId: session.user.id,
                id_gen,
                name_lora,
                name,
                age,
                gender: genderLabel,
                }),
            });
        
            // Step 2: Prepare image FormData for training
            let formData;
            try {
                formData = new FormData();
                formData.append("userId", session.user.id);
                formData.append("id_gen", id_gen);
                formData.append("name_lora", name_lora);
                formData.append("name", name);
                formData.append("age", age);
                formData.append("gender", genderLabel);
            } catch (formError) {
                toast.error(`❌ FormData creation failed: ${(formError as Error).message}`, {
                    position: "top-center",
                    autoClose: 5000,
                    theme: "dark",
                });
                throw new Error(`FormData creation failed: ${(formError as Error).message}`);
            }
        
            // Determine which files to use
            let filesToUpload: File[] = [];
            
            if (userModelTrainFiles.length === 10) {
                // Use stored File objects (new method - works on mobile)
                filesToUpload = userModelTrainFiles;
            } else if (userModelTrainImages.length === 10) {
                // Fallback: Convert blob URLs to Files (old method - may fail on mobile)
                try {
                    filesToUpload = await Promise.all(
                        userModelTrainImages.map(async (url, i) => {
                            const blob = await fetch(url).then(res => res.blob());
                            return new File([blob], `image_${i}.png`, { type: blob.type });
                        })
                    );
                } catch (blobError) {
                    throw new Error("Failed to process images. Please re-upload and try again.");
                }
            } else {
                throw new Error("No images available. Please upload 10 images.");
            }
        
            // Add files to FormData with mobile-safe approach
            try {
                for (let i = 0; i < filesToUpload.length; i++) {
                    const file = filesToUpload[i];
                    
                    // On mobile, create a new Blob from the File then a new File from that Blob
                    // This fixes mobile browser File object issues
                    const blob = new Blob([file], { type: file.type });
                    const cleanFile = new File([blob], `image_${i}.png`, { 
                        type: file.type,
                        lastModified: Date.now()
                    });
                    
                    formData.append("images", cleanFile);
                }
            } catch (appendError) {
                throw new Error(`Failed to prepare files: ${(appendError as Error).message}`);
            }
        
            // Step 3: Send to training backend
            const res = await fetch("/api/lora/train", {
                method: "POST",
                body: formData,
            });

            const json = await res.json();
            
            if (!res.ok) {
                throw new Error(json.error || "Training failed");
            }

            await refreshUserSession();
            
            // NOW close the modal after everything succeeded
            handleClose();

            } catch (err) {
                
                const addResponse = await fetch('/api/user/tokens/add', {
                    method: 'PUT',
                    headers: {
                    'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email: session.user.email, tokensToAdd: TOKEN_COST }),
                });
    
                const addData = await addResponse.json();
                    
                if (addData.message !== 'User credits updated successfully') throw new Error(addData.message);
                    
                // Update session with new token count
                await update({ user: { ...session?.user, credits: addData.newTokenCount } });
                
                toast.error(`Model training failed: ${(err as Error).message}`, {
                    position: "top-right",
                    autoClose: 5000,
                    theme: "dark",
                });
            } finally {
            //   setIsTrainingLoading(false);
            }
        };

    if (!isOpen) return null;

    return (
        <div className={styles.overlay}>
            <div className={styles.modal} ref={modalRef}>

                <div className={styles.popover_content_header}>
                    <CloseIcon 
                        className={styles.header_close} 
                        onClick={handleClose}
                    />
                </div>
                
                {page === 1 && (
                    <div className={styles.firstPageModalContent}>
                        {/* Placeholder content */}
                        <div className={styles.modalHeader}>
                            {/* <div className={styles.modalImages}>
                                <Image
                                    src={`${basePath}/modal_image_1.png`}
                                    alt="left"
                                    className={styles.leftImage}
                                    width={154}
                                    height={171}
                                />
                                <Image
                                    src={`${basePath}/modal_image_2.png`}
                                    alt="center"
                                    className={styles.centerImage}
                                    width={154}
                                    height={171}
                                />
                                <Image
                                    src={`${basePath}/modal_image_3.png`}
                                    alt="right"
                                    className={styles.rightImage}
                                    width={154}
                                    height={171}
                                />
                            </div> */}

                            <div className={styles.modalImages}>
                                <div className={styles.gridWrapper}>
                                    <div className={styles.gridLeftColumn}>
                                    {["slider_3.png", "selfie_1.png", "slider_1.png"].map((img, index) => (
                                        <div key={index} className={styles.gridBoxSmall}>
                                        <Image
                                            src={`/assets/images/onboarding/${img}`}
                                            alt="Selfie"
                                            fill
                                            className={styles.gridImage}
                                        />
                                        <div className={styles.gridLabelSmall}>Selfie</div>
                                        </div>
                                    ))}
                                    </div>
                                    <div className={styles.gridBoxLarge}>
                                    <Image
                                        src="/assets/images/onboarding/slider_6.png"
                                        alt="AI Result"
                                        fill
                                        className={styles.gridImage}
                                    />
                                    <div className={styles.gridLabelLarge}>AI Result</div>
                                    </div>
                                </div>
                            </div>

                            <div className={styles.modalText}>
                                <div className={styles.title}>Create new model</div>
                                <div className={styles.subtitle}>Tell us a little about yourself so we can take <br/> high-quality photos that truly look like you!</div>
                            </div>
                        </div>

                        <div className={styles.modalForm}>

                            <div className={styles.inputGroup}>
                                {/* <label className={styles.inputLabel}>Your name</label> */}
                                <input
                                    className={styles.inputField}
                                    placeholder="Your name"
                                    maxLength={10}
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>

                            <div className={styles.inputGroup}>
                                {/* <label className={styles.inputLabel}>Age</label> */}
                                <input
                                    className={styles.inputField}
                                    type="number"
                                    placeholder="Age"
                                    value={age}
                                    onChange={(e) => {
                                    const value = e.target.value;
                                    if (/^\d*$/.test(value)) {
                                        setAge(value);
                                    }
                                    }}
                                />
                            </div>

                            <div className={styles.inputGroup} ref={dropdownRef}>
                                {/* <label className={styles.inputLabel}>Gender</label> */}
                                <div className={styles.dropdownWrapper}>
                                    <button onClick={() => setDropdownOpen(!dropdownOpen)} className={styles.trigger}>
                                        <span>{gender}</span>
                                        <ArrowIcon className={`${styles.arrow} ${dropdownOpen ? styles.arrowOpen : ''}`} />
                                    </button>

                                    {dropdownOpen && (
                                        <div className={styles.dropdown}>
                                        {['Male', 'Female'].map((option) => (
                                            <div
                                            key={option}
                                            onClick={() => {
                                                setGender(option as 'Male' | 'Female');
                                                setDropdownOpen(false);
                                            }}
                                            className={`${styles.option} ${option === gender ? styles.optionSelected : ''}`}
                                            >
                                            {option}
                                            </div>
                                        ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <button 
                                className={styles.nextButton}
                                onClick={() => setPage(2)}
                            >
                                    Next
                            </button>
                        </div>
                    </div>
                )}

                {page === 2 && (
                    <div className={styles.secondPageModalContent}>

                        <div className={styles.second_page_header}>
                            {!userModelTrainImages.length && (
                                <div className={styles.second_page_text}>
                                    Get the Best Results 
                                    <br />
                                    Upload 10 High-Quality Photos
                                </div>
                            )}

                            {userModelTrainImages.length < 10 && (
                                <>
                                    {userModelTrainImages.length < 10 && userModelTrainImages.length > 0 && (
                                        <>
                                            {totalImageSize > 10 * 1024 * 1024 ? (
                                                <div className={styles.imageCounter} style={{ color: '#ff4444', fontSize: '14px' }}>
                                                    ⚠️ Images too large ({(totalImageSize / (1024 * 1024)).toFixed(1)} MB). Max 10 MB total.
                                                </div>
                                            ) : (
                                                <div className={styles.imageCounter}>
                                                    {userModelTrainImages.length}/<span className={styles.gradientText}>10</span>
                                                </div>
                                            )}
                                        </>
                                    )}
                                
                                    <div className={styles.uploadBox} onClick={() => document.getElementById("uploadInput")?.click()}>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            ref={uploadInputRef}
                                            id="uploadInput"
                                            style={{ display: 'none' }}
                                            onChange={handleImageUpload}
                                        />
                                        <div className={styles.uploadInner}>
                                            <button className={styles.uploadBtn} type="button">
                                                <UploadPhotoIcon width={20} height={20} />
                                                <span>Upload photo</span>
                                            </button>
                                            <div className={styles.dragText}>Or drag and drop your photos</div>
                                        </div>
                                    </div>
                                    </>
                                )}
                        </div>

                        {userModelTrainImages.length > 0 ? (
                            <>
                                <div className={styles.uploadedImagesList}>
                                    {userModelTrainImages.map((src, index) => (
                                    <div key={index} className={styles.uploadedImageRow}>
                                        <div className={styles.uploadedImagePreview}>
                                            <Image src={src} alt={`Uploaded ${index}`} width={40} height={40} />
                                        </div>
                                        <button
                                            className={styles.deleteButton}
                                            onClick={() => removeImage(index)}
                                        >
                                        <DeleteIcon className={styles.image_options_delete_button}  />
                                        </button>
                                    </div>
                                    ))}
                                </div>
                                
                            </>
                        ) : (
                            <div className={styles.photoExamplesSection}>
                                <div className={styles.photoBlock}>
                                    <div className={styles.photoBlockTitleGood}>✅ Good photos</div>
                                    <div className={styles.photoRow}>
                                        {['High resolution', 'No accessories', 'Neutral expression', 'One person'].map((label, index) => {
                                            const imgIndex = index + 1;

                                            return (
                                                <div className={styles.photoItem} key={imgIndex}>
                                                    <div className={styles.photoImageWrapper}>
                                                        <Image
                                                            src={`/assets/images/models/modal/${gender.toLowerCase()}/good/good_${imgIndex}.png`}
                                                            alt={label}
                                                            className={`${styles.photoImage}`}
                                                            width={136}
                                                            height={150}
                                                        />
                                                        <div className={styles.photoLabel}>{label}</div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className={styles.photoBlock}>
                                    <div className={styles.photoBlockTitleAvoid}>❌ Avoid</div>
                                    <div className={styles.photoRow}>
                                        {['Low-quality images', 'Sunglasses, masks', 'Extreme facial', 'Group photos'].map((label, index) => {
                                            const imgIndex = index + 1;
                                            return (
                                                <div className={styles.photoItem} key={index}>
                                                    <div className={styles.photoImageWrapper}>
                                                        <Image
                                                            src={`/assets/images/models/modal/${gender.toLowerCase()}/avoid/avoid_${imgIndex}.png`}
                                                            alt={label}
                                                            className={`${styles.photoImage} ${imgIndex === 1 ? styles.blurred : ''}`}
                                                            width={136}
                                                            height={150}
                                                        />
                                                        <div className={styles.photoLabel}>{label}</div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        <div className={styles.uploadButtonWrapper}>
                            {/* Show warning if 10 images but size exceeds 10MB */}
                            {userModelTrainImages.length === 10 && totalImageSize > 10 * 1024 * 1024 && (
                                <div style={{
                                    padding: '12px 16px',
                                    backgroundColor: '#ff4444',
                                    color: 'white',
                                    borderRadius: '8px',
                                    marginBottom: '12px',
                                    textAlign: 'center',
                                    fontSize: '14px',
                                    fontWeight: '500'
                                }}>
                                    ⚠️ Images too large ({(totalImageSize / (1024 * 1024)).toFixed(1)} MB). Max 10 MB total.
                                </div>
                            )}
                            
                            {userModelTrainImages.length === 10 && (
                                <button
                                    className={styles.uploadButton}
                                    disabled={totalImageSize > 10 * 1024 * 1024}
                                    style={{
                                        opacity: totalImageSize > 10 * 1024 * 1024 ? 0.5 : 1,
                                        cursor: totalImageSize > 10 * 1024 * 1024 ? 'not-allowed' : 'pointer'
                                    }}
                                    onClick={async () => {
                                        try {
                                            if (session?.user) {
                                                trackGtmEvent("train_model", {
                                                ecommerce: { usid: session.user.id }
                                                });
                                            }
                                            await handleTrainModel();
                                        } catch (error) {
                                            console.error("🚨 Button click error:", error);
                                        }
                                    }}
                                >
                                    Train model
                                </button>
                            )}
                        </div>
                    </div>
                )}

            </div>
            <ToastContainer position="top-right" autoClose={3000} />
            <LoginModal 
                isOpen={isLoginModalOpen} 
                onClose={toggleLoginModal} 
                order='default'
                returnTo="/pricing?onb=1" 
            />
        </div>
    );
}