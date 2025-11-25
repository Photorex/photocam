"use client";
import React, { useState, ChangeEvent, FormEvent, useEffect } from "react";

import { Input, Spinner } from "@heroui/react";
import styles from "./page.module.css";
import { signIn, signOut, useSession } from "next-auth/react";

export default function PasswordReset() {

	const PASSWORD_RESET_URL = process.env.NEXT_PUBLIC_PASSWORD_RESET_URL!;
	const { data: session, status, update } = useSession();

	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

	const [resetEmail, setResetEmail] = useState('');
    const [resetEmailError, setResetEmailError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
	const [isLoading, setIsLoading] = useState(false);

	const handleResetEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
        // console.log(e.target.value)
        setResetEmail(e.target.value);
        if (e.target.value.trim() === '') {
            setResetEmailError('');
        }
    };

	const handleResetSubmit = async (e: FormEvent<HTMLFormElement>) => {
        // Assume no errors initially
        let emailErrorMessage = '';
		e.preventDefault();
      
        // Check if the email is valid
        if (!resetEmail) {
          emailErrorMessage = 'Please provide an Email';
        } 
        else if (!emailRegex.test(resetEmail)) {
          emailErrorMessage = 'Please enter a valid email.';
        }
      
        // If there are any errors, update the state, otherwise log the submission
        if (emailErrorMessage) {
			setResetEmailError(emailErrorMessage);
        } else {
          // Clear any existing errors
		  	setIsLoading(true);
		  	setResetEmail('');
          	setResetEmailError('');

			try {
				const resetResponse = await fetch(`${PASSWORD_RESET_URL}/initiate`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email: resetEmail.toLowerCase() }),
                });

                const resetData = await resetResponse.json();

                if (resetData.message === 'Password reset email sent') {
                    setSuccessMessage('A link to reset your password has been sent to your email. Make sure to look in your spam folder if you can\'t find it. Click the link to proceed with resetting your password.');
                    setResetEmail('');
                } else if (resetData.message === 'Password reset is only available for accounts created with an email and password.') {
					setResetEmailError('Password reset is only available for accounts created with an email and password.');
				} else {
                    throw new Error('Failed to send password reset email.');
                }
			} catch (error) {
				console.error('Reset password error:', error);
                setResetEmailError('Failed to initiate password reset, please try again');
			} finally {
			setIsLoading(false);  // Stop loading
		}
      
			// console.log("Reset form submitted with email:", resetEmail);
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
								Reset Password
							</h1>
							<p className={styles['reset_p2']}>
								Enter email address used for getimg.ai.
								<br/> 
								We will send you a link to reset your password.
							</p>
						</div>

						{successMessage ? (
                            <div className={styles['reset_success_message']}>
                                {successMessage}
                            </div>
                        ) : (
                            <form onSubmit={handleResetSubmit}>
								<div className={`${styles['reset_input_field_wrapper']}`}>
									<div className={`${styles['reset_input_wrapper']}`}>
										<Input
											className={`${styles['reset_input']}`}
											size={isMobile ? "lg" : "md"}
											type="text"
											placeholder="Enter your email address..."
											label="Email address"
											labelPlacement="outside"
											value={resetEmail}
											onChange={handleResetEmailChange}
										/>
									</div>
									<div className={`${styles['reset_field_error']}`}>
										{resetEmailError && <p className={styles.error}>{resetEmailError}</p>}
									</div>
								</div>
								<div className={`${styles['reset_button_wrapper']}`}>
									<button type="submit" className={`${styles['login_button']}`}>
										{isLoading ? 
											<Spinner color="secondary" /> 
										: 
										<>
											<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-lock "><rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
											Reset
										</>}
									</button>
								</div>
						</form>
                        )}
					</div>
				</div>
			</div>
		</div>
	);
}
