"use client";

import React, { useState, ChangeEvent, FormEvent, useEffect } from "react";

import { Input } from "@heroui/react";

import styles from "../../page.module.css";

import { ToastContainer, toast } from 'react-toastify';

import { usePathname, useRouter } from "next/navigation";

import LoginModal from "@/app/components/LoginModal/LoginModal";

import { signIn, signOut, useSession } from "next-auth/react";

export default function PasswordResetForm() {

    const token = usePathname().split('/').pop();
    const { data: session, status, update } = useSession();
    const router = useRouter();

    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const [showResetPassword, setShowResetPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const passwordRegex = /^[\S]{8,}$/;

    const toggleResetPasswordVisibility = () => setShowResetPassword(!showResetPassword);
    const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(!showConfirmPassword);


    const [resetPassword, setResetPassword] = useState('');
    const [resetPasswordError, setResetPasswordError] = useState('');

    const [confirmPassword, setConfirmPassword] = useState('');
    const [confirmPasswordError, setConfirmPasswordError] = useState('');

    const [isLoginModalOpen, setLoginModalOpen] = useState(false);

    // useEffect(() => {
	// 	if (status === "authenticated") {
	// 	//   console.log("No user session");
	// 	  router.push('/');
	// 	}
	// }, [status, router]);

	const toggleLoginModal = () => {
		setLoginModalOpen(!isLoginModalOpen);
	};

    const handleResetPasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
        // console.log(e.target.value)
        setResetPassword(e.target.value);
        if (e.target.value.trim() === '') {
            setResetPasswordError('');
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

        if (!resetPassword || !passwordRegex.test(resetPassword)) {
            setResetPassword("Password must be at least 8 characters long and contain only English letters and numbers.");
            isValid = false;
        } else if (resetPassword.length > 50) {
            setResetPassword("Password cannot exceed 50 characters");
            isValid = false;
        } else {
            setResetPassword("");
        }

        if (resetPassword !== confirmPassword) {
            setConfirmPasswordError("Passwords do not match.");
            isValid = false;
        } else if (confirmPassword.length > 50) {
            setConfirmPasswordError("Confirmation password cannot exceed 50 characters");
            isValid = false;
        } else {
            setConfirmPasswordError("");
        }

        return isValid;
    };

    const handlePasswordResetSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!validateRegistration()) {
            // Validation failed; early exit.
            return;
        }

        setError(''); // Clear any existing errors

        try {
            const response = await fetch('/api/password/reset', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ password: resetPassword, emailToken: token }),
            });

            const resetData = await response.json();

            if (resetData.message === 'Password updated successfully, email token reset.') {
                setSuccessMessage('Password updated successfully.');
            } else {
                // throw new Error('Failed to reset password.');
                setConfirmPasswordError('An error occurred while resetting your password.');
            }
        } catch (error: any) {
            setConfirmPasswordError(error.message || 'An error occurred while resetting your password.');
        }
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

    return (
        <div className="flex flex-col min-h-screen">
			<div className="container mx-auto max-w-7xl pt-16 px-6 flex-grow">
                <div className={styles['reset_container']}>
					<div className={styles['reset_container_inner']}>
						<div className={styles['reset_hero']}>
							<h1 className={styles['reset_h2']}>
                            {successMessage ? (
                                <>
                                    Password Updated!
                                </>
                            ) : (
                                <>
                                    New Password
                                </>
                            )}
							</h1>
						</div>

						{successMessage ? (
                            <>
                                <div className={styles['reset_success_message']}>
                                    {successMessage}
                                </div>
                                <div className={`${styles['login_button_wrapper']}`}>
                                {!session ? (
                                    <button 
                                    className={`${styles['login_button']}`}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        toggleLoginModal();
                                    }}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-lock "><rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                                    Log in
                                </button>
                                ) : (
                                    <button 
                                        className={`${styles['homepage_button']}`}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            router.push('/ai-generator');
                                        }}
                                    >
                                        Start creating
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-right "><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
                                    </button>
                                )}
                                </div>
                            </>                        
                        ) : (
                            <form onSubmit={handlePasswordResetSubmit}>
                                <div className={`${styles['reset_input_field_wrapper']}`}>
                                    <div className={`${styles['reset_input_wrapper']}`}>
                                        <Input
                                            className={`${styles['reset_input']}`}
                                            size={isMobile ? "lg" : "md"}
                                            type={showResetPassword ? "text" : "password"}
                                            placeholder="Enter your password..."
                                            label="Create Password"
                                            labelPlacement="outside"
                                            description="at least 8 characters long"
                                            onChange={handleResetPasswordChange}
                                            maxLength={50}
                                        />
                                        <button 
                                            type="button" 
                                            className={`${styles['input_password_show']}`} 
                                            onClick={toggleResetPasswordVisibility}>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-eye "><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                                        </button>
                                    </div>
                                        <div className={`${styles['reset_field_error']}`}>
                                            {resetPasswordError && <p className={styles.error}>{resetPasswordError}</p>}
                                        </div>
                                    </div>
                                    <div className={`${styles['reset_input_field_wrapper']}`}>
                                        <div className={`${styles['reset_input_wrapper']}`}>
                                            <Input
                                                className={`${styles['reset_input']}`}
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
                                                className={`${styles['input_password_show']}`} 
                                                onClick={toggleConfirmPasswordVisibility}>
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-eye "><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                                            </button>
                                        </div>
                                        <div className={`${styles['reset_field_error']}`}>
                                            {confirmPasswordError && <p className={styles.error}>{confirmPasswordError}</p>}
                                        </div>
                                    </div>
								<div className={`${styles['reset_button_wrapper']}`}>
									<button type="submit" className={`${styles['login_button']}`}>
										<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-lock "><rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
										Reset
									</button>
								</div>
						</form>
                        )}
					</div>
				</div>
            </div>
            <ToastContainer />
            <LoginModal isOpen={isLoginModalOpen} onClose={toggleLoginModal} order='default' />
        </div>
    );
}