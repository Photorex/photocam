"use client";
import React, { useState, ChangeEvent, FormEvent, useEffect, useRef } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ToastContainer, toast } from 'react-toastify';
import { Spinner, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Select, SelectItem } from "@heroui/react";
import FingerprintJS from '@fingerprintjs/fingerprintjs';
import {Input} from "@heroui/react";
import { trackGtmEvent } from '@/app/lib/analytics/google/trackGtmEvent';

import CloseIcon from '@/public/images/icons/controller/close-icon.svg';

import Image from "next/image";

import styles from "./loginModal.module.css";

const topImagesFinal = [
    "/assets/images/compressed/yoga_mindfulness_1.png",
    "/assets/images/compressed/linkedin_headshot.png",
    "/assets/images/compressed/anime_style_2.png",
];

const bottomImagesFinal = [
    "/assets/images/compressed/tattoo_lover_1.png",
    "/assets/images/compressed/streamer.png",
    "/assets/images/compressed/wedding_style.png",
];

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
    order: 'default' | 'reverse';
    returnTo?: string;
}

type Props = {
    images: string[];
    direction: "left" | "right";
};

function SeamlessGlider({ images, direction }: Props) {
        const wrapperRef = useRef<HTMLDivElement>(null);
        const [repeatSet, setRepeatSet] = useState<string[]>([]);
        const [isReady, setIsReady] = useState(false);

        useEffect(() => {
            if (!wrapperRef.current) return;

            const observer = new ResizeObserver(() => {
                const containerWidth = wrapperRef.current?.offsetWidth || window.innerWidth;
                const imageWidth = 148 + 8; // image width + margin
                const setsNeeded = Math.ceil(containerWidth / (images.length * imageWidth)) + 1;

                const sequence: string[] = [];
                for (let i = 0; i < setsNeeded; i++) sequence.push(...images);

                setRepeatSet([...sequence, ...sequence]); // for seamless loop
                setIsReady(true);
            });

            observer.observe(wrapperRef.current);

            return () => observer.disconnect();
        }, [images]);

        return (
            <div className={styles.gliderRow} ref={wrapperRef}>
                {isReady && (
                    <div
                        className={`${styles.gliderTrack}`}
                    >
                        {repeatSet.map((src, i) => (
                            <div className={styles.gliderImageWrapper} key={i}>
                                <Image
                                    key={i}
                                    src={src}
                                    alt="glider"
                                    className={styles.gliderImage}
                                    width={148}
                                    height={224}
                                    priority={i < 2}
                                />
                                {/* <img src={src} alt="glider" className={styles.gliderImage} /> */}
                                <div className={styles.aiPhotoBadge}>AI Photo</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    }

export default function LoginModal({ isOpen, onClose, order, returnTo }: LoginModalProps) {

    const searchParams = new URLSearchParams(
        typeof window !== 'undefined' ? window.location.search : '',
    );

    const { data: session } = useSession();

    const params = searchParams;
    const router = useRouter();
    const callbackUrl = returnTo
        ? `/activation/google?return=${encodeURIComponent(returnTo)}`
        : '/activation/google';

    const loginFirst = order === 'default';

    const [isRegistering, setIsRegistering] = useState(false);
    const [isRegisteringInProgress, setIsRegisteringInProgress] = useState(false);
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^[~`!@#$%^&*()_+=[\]\{}|;':",.\/<>?a-zA-Z0-9-]+$/;

    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [loginEmailError, setLoginEmailError] = useState('');
    const [loginPasswordError, setLoginPasswordError] = useState('');

    const handleLoginEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
        // console.log(e.target.value)
        setLoginEmail(e.target.value);
        if (e.target.value.trim() === '') {
            setLoginEmailError('');
        }
    };

    const handleLoginPasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
        // console.log(e.target.value)
        setLoginPassword(e.target.value);
        if (e.target.value.trim() === '') {
            setLoginPasswordError('');
        }
    };

    const handleLoginSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        // console.log('Email1:', loginEmail, 'Password:', loginPassword);
      
        // Assume no errors initially
        let emailErrorMessage = '';
        let passwordErrorMessage = '';
      
        // Check if the email is valid
        if (!loginEmail) {
          emailErrorMessage = 'Please provide an Email';
        } 
        else if (!emailRegex.test(loginEmail)) {
          emailErrorMessage = 'Please enter a valid email.';
        }
      
        // Check if the password is valid
        if (!loginPassword) {
          passwordErrorMessage = 'Please provide a password';
        } else if (!passwordRegex.test(loginPassword)) {
          passwordErrorMessage = 'Password must be at least 8 characters long and contain only English letters and numbers.';
        }
      
        // If there are any errors, update the state, otherwise log the submission
        if (emailErrorMessage || passwordErrorMessage) {
          setLoginEmailError(emailErrorMessage);
          setLoginPasswordError(passwordErrorMessage);
        } else {
          // Clear any existing errors
          setLoginEmailError('');
          setLoginPasswordError('');
      
        //   console.log("Login form submitted with email:", loginEmail, "and password:", loginPassword);
          
          try {
            // Check if user exists before tracking
            const response = await fetch('/api/auth/check-user', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email: loginEmail.toLowerCase() })
            });
            
            const data = await response.json();
            
            if (data.exists) {
              trackGtmEvent('auth', { ecommerce: { usid: session?.user?.id } });
            }
            
            // Continue with sign in...
            const result = await signIn('credentials', {
              email: loginEmail.toLowerCase(),
              password: loginPassword,
              redirect: false,
            });

            if (result?.error) {
              if (result.error === 'This email is not registered') {
                  // console.log('IF result.error', result.error);
                  setLoginEmailError(result.error);
              } else if (result.error === 'Incorrect password') {
                  // console.log('IF result.error', result.error);
                  setLoginPasswordError(result.error);
              } else {
                  // console.log('result.error', result.error);
                  setLoginEmailError('An error occurred. Please try again.');
              }
            } else {
              onClose();
              router.push(returnTo || '/photoshoot');
            }
          } catch (error) {
            console.error('Error:', error);
          }
        }
    };

    const toggleIsRegistering = () => {
        setIsRegistering(!isRegistering);
    };

    const handleClose = () => {
        setIsRegistering(false);
        onClose();
    };

    const [showLoginPassword, setShowLoginPassword] = useState(false);

    const togglePasswordVisibility = () => setShowLoginPassword(!showLoginPassword);

    const [registrationStatus, setRegistrationStatus] = useState(false);

    const [registerEmail, setRegisterEmail] = useState('');
    const [registerPassword, setRegisterPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [registerEmailError, setRegisterEmailError] = useState('');
    const [registerPasswordError, setRegisterPasswordError] = useState('');
    const [confirmPasswordError, setConfirmPasswordError] = useState('');
    const [registerName, setRegisterName] = useState('');
    const [registerNameError, setRegisterNameError] = useState('');

    const [showRegisterPassword, setShowRegisterPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const toggleRegisterPasswordVisibility = () => setShowRegisterPassword(!showRegisterPassword);
    const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(!showConfirmPassword);

    const handleRegisterNameChange = (e: ChangeEvent<HTMLInputElement>) => {
        setRegisterName(e.target.value);
        if (e.target.value.trim() === '') {
            setRegisterNameError('');
        } else if (e.target.value.length > 50) {
            setRegisterNameError('Name cannot exceed 50 characters');
        } else {
            setRegisterNameError('');
        }
    };

    const handleRegisterEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
        // console.log(e.target.value)
        setRegisterEmail(e.target.value);
        if (e.target.value.trim() === '') {
            setRegisterEmailError('');
        }
    };

    const handleRegisterPasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
        // console.log(e.target.value)
        setRegisterPassword(e.target.value);
        if (e.target.value.trim() === '') {
            setRegisterPasswordError('');
        }
    };

    const handleConfirmPasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
        // console.log(e.target.value)
        setConfirmPassword(e.target.value);
        if (e.target.value.trim() === '') {
            setConfirmPasswordError('');
        }
    };

    const validateRegistration = () => {
        let isValid = true;
        // if (!registerName) {
        //     setRegisterNameError("Please enter your name.");
        //     isValid = false;
        // } else if (registerName.length > 50) {
        //     setRegisterNameError("Name cannot exceed 50 characters");
        //     isValid = false;
        // } else {
        //     setRegisterNameError("");
        // }
        
        if (!registerEmail || !emailRegex.test(registerEmail)) {
            setRegisterEmailError("Please enter a valid email.");
            isValid = false;
        } else if (registerEmail.length > 100) {
            setRegisterEmailError("Email cannot exceed 50 characters");
            isValid = false;
        } else {
            setRegisterEmailError("");
        }

        if (!registerPassword || !passwordRegex.test(registerPassword)) {
            setRegisterPasswordError("Password must be at least 8 characters long and contain only English letters and numbers.");
            isValid = false;
        } else if (registerPassword.length > 50) {
            setRegisterPasswordError("Password cannot exceed 50 characters");
            isValid = false;
        } else {
            setRegisterPasswordError("");
        }

        // if (registerPassword !== confirmPassword) {
        //     setConfirmPasswordError("Passwords do not match.");
        //     isValid = false;
        // } else if (confirmPassword.length > 50) {
        //     setConfirmPasswordError("Confirmation password cannot exceed 50 characters");
        //     isValid = false;
        // } else {
        //     setConfirmPasswordError("");
        // }

        return isValid;
    };

    const handleRegisterSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!validateRegistration()) {
            // Validation failed; early exit.
            return;
        }
        setRegistrationStatus(false);
        setIsRegisteringInProgress(true);

        const cookies = document.cookie.split(';').reduce((acc, cookie) => {
            const [key, value] = cookie.split('=').map(c => c.trim());
            acc[key] = value;
            return acc;
        }, {} as {[key: string]: string});
    
        let refCode = cookies['simcam_refcode'] || null;
        // console.log('refCode', refCode);

        try {
            const fingerprintId = await getFingerprintID();

            const registrationBody = {
                // name: registerName,
                name: 'user',
                email: registerEmail,
                password: registerPassword,
                refCode,
                fingerprintId,
                returnTo,
            };
            
            const registrationResponse = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(registrationBody),
            });
    
            const registrationData = await registrationResponse.json();
    
            if (registrationData.message == 'Email already in use') {
                setRegisterEmailError('Email already in use');
                setRegistrationStatus(false);
            }

            if (registrationData.message == 'Multi-accounting is not welcome') {
                setRegisterEmailError('Multi-accounting is not welcome');
                setRegistrationStatus(false);
            }

            if (!registrationResponse.ok) {
                throw new Error(registrationData.message || 'Registration failed');
            }
    
            // Attempt to sign in the user
            const signInResponse = await signIn('credentials', {
                redirect: false,
                email: registerEmail,
                password: registerPassword,
                // callbackUrl: '/ai-generator'
            });
    
            if (signInResponse && !signInResponse.error) {
                setRegistrationStatus(true);
                router.push(returnTo || '/photoshoot');
            } else {
                setRegistrationStatus(false);
                if (signInResponse && signInResponse.error) {
                    console.error('Sign-in after registration failed:', signInResponse.error);
                } else {
                    console.error('Sign-in after registration failed with unknown error');
                }
            }
        } catch (error: any) {
            // Handle registration errors
            console.error('Registration failed:', error);
            setRegistrationStatus(false);
    
            // Update error messages based on error content
            // Adjust error handling as needed
            toast.error('An unexpected error occurred. Please try again', {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "dark",
              });
        }

        setIsRegisteringInProgress(false);
    };

    const useWindowSize = () => {
        const [windowSize, setWindowSize] = useState({
          width: 0,
          height: 0,
        });
      
        useEffect(() => {
          // Handler to call on window resize
          function handleResize() {
            // Set window width/height to state
            setWindowSize({
              width: window.innerWidth,
              height: window.innerHeight,
            });
          }
      
          // Add event listener
          window.addEventListener("resize", handleResize);
      
          // Call handler right away so state gets updated with initial window size
          handleResize();
      
          // Remove event listener on cleanup
          return () => window.removeEventListener("resize", handleResize);
        }, []); // Empty array ensures that effect is only run on mount
      
        return windowSize;
      };

    const windowSize = useWindowSize();
    const isMobile = windowSize.width <= 768;

    const getFingerprintID = async () => {
        try {
            const fpPromise = FingerprintJS.load();
    
            const fp = await fpPromise;
            const result = await fp.get();
            // This is the visitor identifier:
            const visitorId = result.visitorId;
            // console.log('FingerprintJS visitorId', visitorId);
    
            return visitorId;
        } catch (error) {
            console.error('Error getting fingerprint id:', error);
            return null;
        }
    };

    const loginModalRef = useRef<HTMLDivElement>(null);
    
    useEffect(() => {
        if (!isOpen) return;

        // Remember the current setting (in case the parent page already changed it)
        const prev = document.body.style.overflow;

        // 1 — lock the document
        document.body.style.overflow = 'hidden';

        // 2 — cleanup → unlock again
        return () => {
            document.body.style.overflow = prev || '';
        };
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) return; // don't bind listener if modal is closed
    
        const handleOutsideClick = (event: MouseEvent) => {
            if (
                loginModalRef.current &&
                !loginModalRef.current.contains(event.target as Node)
            ) {
                onClose();
            }
        };
    
        document.addEventListener("mousedown", handleOutsideClick);
    
        return () => {
            document.removeEventListener("mousedown", handleOutsideClick);
        };
    }, [isOpen, onClose]);

    return (
        <div className={`${styles.image__overlay} ${!isOpen ? styles.hidden : ''}`}>
            <div className={styles.login__modal}>
                <div ref={loginModalRef} className={`${styles.modal_login} ${styles.modal_sm_login}`}>
                    <div className={styles.modal_login_content}>
                        <CloseIcon 
                            className={styles.header_close} 
                            onClick={onClose}
                        />
                    {/* {loginFirst && !isRegistering ? (
                        //
                        ) : (
                    )} */}

                        {!isRegisteringInProgress && (
                            <div className={styles.glidersWrapper}>
                                <SeamlessGlider images={topImagesFinal} direction="right" />
                                <SeamlessGlider images={bottomImagesFinal} direction="left" />
                                <div className={styles.bottomOverlay} />
                            </div>
                        )}
                        {!isRegistering ? (
                            <div className={styles.modal_login_content__inner}>
                                <h2 className={styles.login_h}>Log in to continue</h2>
                                <p className={styles.login_p}>
                                    Don&apos;t have an account? <button 
                                        onClick={() => {
                                            trackGtmEvent('create_now');
                                            toggleIsRegistering();
                                        }} 
                                        className={styles.create_acc_link}
                                    > 
                                        <div className={styles.create_acc_link_text}>
                                            Create it now
                                        </div>
                                    </button>
                                </p>
                                <br/>
                                <div id="google-login" className={styles.login_components_outer_wrapper}>
                            
                                    <div className={styles.login_form}>
                                        <form className={styles.login_form_inner} onSubmit={handleLoginSubmit}>
                                            <div className={styles.login_fields_wrapper}>
                                                <div className={styles.login_input_field_wrapper}>
                                                    <div className={styles.login_input_wrapper}>
                                                        <input
                                                            className={`${styles.login_input} ${styles.customInput}`}
                                                            type="email"
                                                            placeholder="Enter your email"
                                                            onChange={handleLoginEmailChange}
                                                            maxLength={100}
                                                        />
                                                        {/* <Input
                                                            className={styles.login_input}
                                                            size={isMobile ? "lg" : "md"}
                                                            type="email"
                                                            placeholder="Enter your email address..."
                                                            // label="Email address"
                                                            labelPlacement="outside"
                                                            onChange={handleLoginEmailChange}
                                                            maxLength={100}
                                                        /> */}
                                                    </div>
                                                    <div className={styles.login_password_error}>
                                                        {loginEmailError && <p className={styles.error}>{loginEmailError}</p>}
                                                    </div>
                                                </div>
                                                <div className={styles.login_input_field_wrapper}>
                                                    <div className={styles.login_input_wrapper}>
                                                        <input
                                                            className={`${styles.login_input} ${styles.customInput}`}
                                                            type={showLoginPassword ? 'text' : 'password'}
                                                            placeholder="Enter your password..."
                                                            onChange={handleLoginPasswordChange}
                                                            maxLength={100}
                                                        />
                                                        {/* <Input
                                                            className={styles.login_input}
                                                            size={isMobile ? "lg" : "md"}
                                                            type={showLoginPassword ? "text" : "password"}
                                                            placeholder="Enter your password..."
                                                            // label="Password"
                                                            labelPlacement="outside"
                                                            description="at least 8 characters long"
                                                            onChange={handleLoginPasswordChange}
                                                            maxLength={100}
                                                        /> */}
                                                        <button 
                                                            type="button" 
                                                            className={styles.input_password_show_login} 
                                                            onClick={togglePasswordVisibility}>
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-eye "><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                                                        </button>
                                                        {/* <div className={styles.input_help}>at least 8 characters long</div> */}
                                                    </div>
                                                    <div className={styles.login_password_error}>
                                                        {loginPasswordError && <p className={styles.error}>{loginPasswordError}</p>}
                                                    </div>

                                                    <div className={styles.login_button_wrapper}>
                                                        <button type="submit" className={styles.login_button}>
                                                            Log in
                                                        </button>
                                                        <span className={styles.login_foot}>
                                                            <a href="/forgot-password">
                                                                Forgot your password?
                                                            </a>
                                                        </span>
                                                    </div>

                                                    <div className={styles.login_actions_wrapper}>
                                                        {/* <div className={styles.login_button_wrapper}>
                                                            <button type="submit" className={styles.login_button}>
                                                                Log in
                                                            </button>
                                                            <span className={styles.login_foot}>
                                                                <a href="/forgot-password">
                                                                    Forgot your password?
                                                                </a>
                                                            </span>
                                                        </div> */}

                                                        <div className={styles.divider_login}>
                                                            <div className={styles.divider_line}>
                                                                <div className={styles.divider_text}>
                                                                    <span >Or sign up with</span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <button 
                                                            onClick={async (e) => {
                                                                e.preventDefault();
                                                                
                                                                const fingerprintId = await getFingerprintID();

                                                                if (fingerprintId) {
                                                                    document.cookie = `fingerprintId=${JSON.stringify({ fingerprintId })}; path=/; max-age=31536000; samesite=Lax`;
                                                                }

                                                                await signIn('google', { callbackUrl });
                                                                
                                                            }} 
                                                            className={styles.google_button_inner_wrapper}>
                                                            <div className={styles.google_button}>
                                                                <div className={styles.google_button_icon_wrapper}>
                                                                    <div className={styles.google_button_icon}>
                                                                        <svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="18px" height="18px" viewBox="0 0 48 48" className="abcRioButtonSvg"><g><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path><path fill="none" d="M0 0h48v48H0z"></path></g></svg>
                                                                    </div>
                                                                </div>
                                                                <span className={styles.google_button_text_wrapper}>
                                                                    Sign in with Google
                                                                </span>
                                                            </div>
                                                        </button>
                                                    </div>
                                                </div>    
                                            </div>       
                                        </form>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className={styles.modal_login_content__inner}>
                                {
                                    isRegisteringInProgress ? (
                                        <div style={{ textAlign: 'center', padding: '20px' }}>
                                            <Spinner
                                                color="secondary"
                                            />
                                        </div>
                                    ) : registrationStatus ? (
                                        <div className={styles.activation_link}>
                                            Registration successful, We have sent verification link to you. <br /> <br />
                                            Please check your email to confirm your Email address. Make sure to look in your spam folder if you can&apos;t find it.  <br /> <br />
                                            Click the link to verify Email address ownership.
                                        </div>
                                    ) : (
                                    // Content for login
                                    <div className={styles.register_wrapper}>
                                        
                                        <div id="google-login" className={styles.register_components_outer_wrapper}>
                                            <h2 className={styles.login_h}>Create an account</h2>
                                                <p className={styles.login_p}>
                                                    Already have an account? <button className={styles.create_acc_link} onClick={toggleIsRegistering}><div className={styles.create_acc_link_text}>Log in</div></button>
                                                </p>
                                            <br/>
                                            {/* <p 
                                                className={styles.register_license}
                                            >
                                                By signing up, you agree to our <a 
                                                    href="/legal/terms-of-service" 
                                                    target="_blank" 
                                                >
                                                    Terms of Service
                                                </a> and <a 
                                                    href="/legal/privacy-policy" 
                                                    target="_blank" 
                                                >
                                                    Privacy Policy
                                                </a>
                                                .
                                            </p> */}

                                            <div className={styles.login_form}>
                                                <form className={styles.login_form_inner} onSubmit={handleRegisterSubmit}>
                                                    <div className={styles.login_fields_wrapper}>
                                                        {/* <div className={styles.login_input_field_wrapper}>
                                                            <div className={styles.login_input_wrapper}>
                                                                <Input
                                                                    className={styles.login_input}
                                                                    size={isMobile ? "lg" : "md"}
                                                                    type="text"
                                                                    placeholder="Enter your name..."
                                                                    label="Name"
                                                                    labelPlacement="outside"
                                                                    onChange={handleRegisterNameChange}
                                                                    value={registerName}
                                                                    maxLength={50}
                                                                />
                                                            </div>
                                                            <div className={styles.login_password_error}>
                                                                {registerNameError && <p className={styles.error}>{registerNameError}</p>}
                                                            </div>
                                                        </div> */}
                                                        <div className={styles.login_input_field_wrapper}>
                                                            <div className={`${styles['login_input_wrapper']}`}>
                                                                
                                                                <input
                                                                    className={`${styles.login_input} ${styles.customInput}`}
                                                                    type="email"
                                                                    placeholder="Enter your email"
                                                                    onChange={handleRegisterEmailChange}
                                                                    maxLength={100}
                                                                />
                                                                {/* <Input
                                                                    className={styles.login_input}
                                                                    size={isMobile ? "lg" : "md"}
                                                                    type="email"
                                                                    placeholder="Enter your email address..."
                                                                    label="Email address"
                                                                    labelPlacement="outside"
                                                                    onChange={handleRegisterEmailChange}
                                                                    maxLength={100}
                                                                /> */}
                                                            </div>
                                                            <div className={styles.login_password_error}>
                                                                {registerEmailError && <p className={styles.error}>{registerEmailError}</p>}
                                                            </div>
                                                        </div>
                                                        <div className={styles.login_input_field_wrapper}>
                                                            <div className={styles.login_input_wrapper}>
                                                                <input
                                                                    className={`${styles.login_input} ${styles.customInput}`}
                                                                    type={showLoginPassword ? 'text' : 'password'}
                                                                    placeholder="Enter your password..."
                                                                    onChange={handleRegisterPasswordChange}
                                                                    maxLength={50}
                                                                />
                                                                {/* <Input
                                                                    className={styles.login_input}
                                                                    size={isMobile ? "lg" : "md"}
                                                                    type={showRegisterPassword ? "text" : "password"}
                                                                    placeholder="Enter your password..."
                                                                    label="Create Password"
                                                                    labelPlacement="outside"
                                                                    description="at least 8 characters long"
                                                                    onChange={handleRegisterPasswordChange}
                                                                    maxLength={50}
                                                                /> */}
                                                                <button 
                                                                    type="button" 
                                                                    className={styles.input_password_show} 
                                                                    onClick={toggleRegisterPasswordVisibility}>
                                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-eye "><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                                                                </button>
                                                                <div className={styles.input_help}>at least 8 characters long</div>
                                                            </div>
                                                            <div className={styles.login_password_error}>
                                                                {registerPasswordError && <p className={styles.error}>{registerPasswordError}</p>}
                                                            </div>
                                                        </div>
                                                        {/* <div className={styles.login_input_field_wrapper}>
                                                            <div className={styles.login_input_wrapper}>
                                                                <Input
                                                                    className={styles.login_input}
                                                                    size={isMobile ? "lg" : "md"}
                                                                    type={showConfirmPassword ? "text" : "password"}
                                                                    placeholder="Enter your password..."
                                                                    label="Confirm Password"
                                                                    labelPlacement="outside"
                                                                    description="Type your password one more time"
                                                                    onChange={handleConfirmPasswordChange}
                                                                    maxLength={50}
                                                                />
                                                                <button 
                                                                    type="button" 
                                                                    className={styles.input_password_show} 
                                                                    onClick={toggleConfirmPasswordVisibility}>
                                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-eye "><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                                                                </button>
                                                            </div>
                                                            <div className={styles.login_password_error}>
                                                                {confirmPasswordError && <p className={styles.error}>{confirmPasswordError}</p>}
                                                            </div>
                                                        </div> */}
                                                        <div className={styles.login_button_wrapper}>
                                                            <button 
                                                                type="submit"  
                                                                className={styles.login_button}
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-lock "><rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                                                                Register
                                                            </button>
                                                        </div>

                                                        <div className={styles.login_actions_wrapper}>

                                                            <div className={styles.divider_login}>
                                                                <div className={styles.divider_line}>
                                                                    <div className={styles.divider_text}>
                                                                        <span >Or sign up with</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            
                                                            <button 
                                                                onClick={async (e) => {
                                                                    e.preventDefault();
                                                                    
                                                                    const fingerprintId = await getFingerprintID();

                                                                    if (fingerprintId) {
                                                                        document.cookie = `fingerprintId=${JSON.stringify({ fingerprintId })}; path=/; max-age=31536000; samesite=Lax`;
                                                                    }

                                                                    await signIn('google', { callbackUrl });
                                                                }} 
                                                                className={styles.google_button_inner_wrapper}
                                                            >
                                                                <div className={styles.google_button}>
                                                                    <div className={styles.google_button_icon_wrapper}>
                                                                        <div className={styles.google_button_icon}>
                                                                            <svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="18px" height="18px" viewBox="0 0 48 48" className="abcRioButtonSvg"><g><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path><path fill="none" d="M0 0h48v48H0z"></path></g></svg>
                                                                        </div>
                                                                    </div>
                                                                    <span className={styles.google_button_text_wrapper}>
                                                                        Sign up with Google
                                                                    </span>
                                                                </div>
                                                            </button>
                                                        </div>
                                                    </div>
                                                </form>
                                            </div>
                                        </div>
                                    </div>
                                )}   
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}