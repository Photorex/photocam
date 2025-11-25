"use client";
import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";

import { signIn, signOut, useSession, getSession } from "next-auth/react";

import { useRouter } from "next/navigation";

import { ToastContainer, toast } from 'react-toastify';

import { Spinner } from "@heroui/react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure, Select, SelectItem, Autocomplete, AutocompleteItem } from "@heroui/react";

import styles from './SubscriptionModal.module.css';

import { useWindowSize } from "@/app/lib/hooks/useWindowSize";

import CardPayment from '@/public/assets/logos/card-payment.svg';
import BankTransfer from '@/public/assets/logos/bank-transfer.svg';
import StripePayment from '@/public/assets/logos/stripe-payment.svg';
import CryptoPayment from '@/public/assets/logos/crypto-payment.svg'
import BTC from '@/public/assets/logos/crypto/btc.svg';
import Litecoin from '@/public/assets/logos/crypto/litecoin.svg';
import Dash from '@/public/assets/logos/crypto/dash.svg';
import ZetCash from '@/public/assets/logos/crypto/zetcash.svg';
import Dogecoin from '@/public/assets/logos/crypto/dogecoin.svg';
import BitcoinCash from '@/public/assets/logos/crypto/bitcoincash.svg';
import Monero from '@/public/assets/logos/crypto/monero.svg';
import USDT_TRC20 from '@/public/assets/logos/crypto/usdt-trc20.svg';
import BUSD from '@/public/assets/logos/crypto/busd.svg';
import ETH_CLASSIC from '@/public/assets/logos/crypto/ethclassic.svg';

interface SubscriptionModalProps {
    subscriptionType?: string;
    planPrice?: number;
    isGenerationPurchase?: boolean;
    generationAmount?: number;
    isPayYearlySelected: boolean;
    yearDiscount: number;
    isOpen: boolean;
    onClose: () => void;
}

export default function SubscriptionModal({ 
    subscriptionType,
    planPrice,
    isGenerationPurchase,
    generationAmount,
    isPayYearlySelected,
    yearDiscount,
    isOpen, 
    onClose 
}: SubscriptionModalProps) {
    const { data: session, update, status } = useSession();
    const [shouldFetchData, setShouldFetchData] = useState(true);
    const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);
    const [showCryptoOptions, setShowCryptoOptions] = useState(false);
    const [userCountry, setUserCountry] = useState(''); 
    const [isFirstTimeDeposit, setIsFirstTimeDeposit] = useState(false);
    const [allowedPaymentOptions, setAllowedPaymentOptions] = useState<string[]>([]);

    // Get window size using custom hook
    const windowSize = useWindowSize();
    const isMobile = windowSize.width <= 768;

    // Payment method info
    const paymentOptions = ["Pay with card", "Instant bank transfer"];

    const [selectedPaymentOption, setSelectedPaymentOption] = useState<Set<string>>(new Set(["Pay with card"]));

    const selectedPaymentMethod = Array.from(selectedPaymentOption).length ? Array.from(selectedPaymentOption)[0] : "Pay with card";

    let paymentMethod: string;
    
    if (selectedPaymentMethod === "Pay with card") {
        paymentMethod = "BASIC_CARD";
    } else if (selectedPaymentMethod === "Instant bank transfer") {
        paymentMethod = "NODA";
    } else if (selectedPaymentMethod === "Crypto") {
        paymentMethod = "CRYPTO";
    } else if (selectedPaymentMethod === "Stripe") {
        paymentMethod = "STRIPE";
    } else {
        paymentMethod = "CRYPTO";
    }
    
    const [referenceId, setReferenceId] = useState('');
    const [amount, setAmount] = useState(0);
    const [currency, setCurrency] = useState('USD');
    const router = useRouter();
    const locale = 'en';

    const fetchUpdatedUserData = async () => {
        try {
            const response = await fetch(`/api/user/${session?.user?.id}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            });
            const data = await response.json();
            if (response.ok) {
                const newVisitedSocials = data.user.visitedSocials;
                update({ user: { ...session?.user, credits: data.user.credits, visitedSocials: newVisitedSocials } });
            } else {
                console.error('Failed to fetch updated user data:', data.message);
            }
        } catch (error) {
            console.error('Error fetching updated user data:', error);
        }
    };

    const countriesFirstTimeNoCard = [
        "AF", "BY", "CN", "EG", "ID", "IN", "IQ", "IR", "KP", "KZ", "MA", "NI",
        "PK", "RU", "SY", "TJ", "TR", "TW", "UA", "US", "VE", "YE", "ZW", "IL", "KR"
    ];
    
    const countriesNonFirstTimeNoCard = [
        "LV", "IQ", "IR", "BA", "UG", "LA", "YE", "GY", "MM", "VU", "AF", "KP", "ET",
        "SY", "NG", "CU", "PG", "TO", "LY", "GW", "TM", "LK", "AO", "CF", "CG", "CD",
        "CI", "HT", "LB", "LR", "ML", "SL", "SO", "ER", "SS", "SD", "RW", "DK", "NL",
        "GB", "IN", "US", "RU", "IL", "ES", "BR", "AR", "CN", "BO", "NI", "TW", "UA",
        "MA", "GT", "EG", "ID", "AZ", "BY", "PK", "TR"
    ];
    
    const countriesWithInstantBankTransfer = [
        "AU", "BE", "BG", "CZ", "DK", "EE", "FI", "FR", "GR", "HU", "IE", "IT", "LV",
        "LT", "LU", "NO", "PL", "PT", "RO", "SK", "SI", "SE"
    ];

    const countriesWithStripe = [
        "AU","GB","CA","US","NZ","AT","BE","DE","DK","IE","IT","IS","IL","NL","NO","SI","FI","FR","CZ","SE","CH" 
    ];

    const countriesPremiumRegions = [
        "AU", "AT", "BE", "CA", "DK", "FI", "FR", "DE", "IE", "IT", "LU", "NZ",
        "NO", "SE", "CH", "BG", "HR", "CY", "EE", "GR", "HU", "IS", "JP", "LT",
        "MT", "PL", "PT", "RO", "SK", "SI", "CL", "HK"
    ];

    const determineAllowedPaymentOptions = (country: string, firstTime: boolean) => {
        // console.log('country', country);
        // let paymentOptions = ["Stripe", "Pay with card", "Instant bank transfer", "Crypto"];

        let paymentOptions = ["Pay with card", "Crypto"];

        if (country === '' || country === 'unknown' || !country) {
            return ["Crypto"];
        } 

        // if (!countriesWithStripe.includes(country)) {
        //     // console.log("!== Stripe")
        //     paymentOptions = paymentOptions.filter(option => option !== "Stripe");
        // }

        // if (!countriesWithInstantBankTransfer.includes(country)) {
        //     paymentOptions = paymentOptions.filter(option => option !== "Instant bank transfer");
        // }

        if (!countriesPremiumRegions.includes(country)) {
            // console.log("!== Pay with card1")
            paymentOptions = paymentOptions.filter(option => option !== "Pay with card");
        }

        // if (paymentOptions.includes("Stripe")) {
        //     return ["Stripe"];
        // }
        
        // console.log('paymentOptions', paymentOptions)
        return paymentOptions;
    };

    const fetchInitialData = async () => {
        const country = await fetchUserCountry();
        const firstTime = await checkFirstTimeDeposit();
        if (country && typeof firstTime === 'boolean') {
            const allowedOptions = determineAllowedPaymentOptions(country, firstTime);
            setAllowedPaymentOptions(allowedOptions);
        }
    };

    const fetchUserCountry = async () => {
        try {
            const response = await fetch('/api/ip-info', {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            });
            const data = await response.json();
            if (response.ok) {
                // console.log("data.country", data.country);
                if (data.country && data.country !== "unknown") {
                    setUserCountry(data.country);
                    return data.country;
                }
                return 'unknown';
            } else {
                console.error('Failed to fetch user country:', data.message);
            }
        } catch (error) {
            console.error('Error fetching user country:', error);
        }
        return 'unknown';
    };

    const checkFirstTimeDeposit = async () => {
        try {
            const response = await fetch('/api/payment/checkFtd', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: session?.user?.id })
            });
            const data = await response.json();
            if (response.ok) {
                setIsFirstTimeDeposit(data.isFirstBasicCardPayment);
                return data.isFirstBasicCardPayment;
            } else {
                console.error('Failed to check first time deposit:', data.message);
            }
        } catch (error) {
            console.error('Error checking first time deposit:', error);
        }
        return false; // Ensure the function returns a boolean
    };

    // Mapping function for cryptocurrency codes
    const mapCryptoToCode = (crypto: string) => {
        const cryptoMapping: { [key: string]: string } = {
            BTC: "BTC",
            Monero: "XMR",
            Dogecoin: "DOGE",
            ZetCash: "ZEC",
            Dash: "DASH",
            BitcoinCash: "BCH",
            Litecoin: "LTC",
            USDT_TRC20: "USDT_TRX",
            BUSD: "BUSD",
            ETH_CLASSIC: "ETC",
        };
        return cryptoMapping[crypto] || "USDT_TRX"; // Default to BTC if not found
    };
    
	// const redirectUserToPayment = async (url: string) => {
    //     let urlString = url.toString();
    //     console.log('url _blank', urlString)
	// 	window.open(urlString, '_newtab');
    //     // router.push(url);
	// };

    const redirectUserToPayment = (url: string) => {
        if (typeof window !== 'undefined') {
            const a = document.createElement('a');
            a.href = url;
            a.target = '_blank';
            a.rel = 'noopener noreferrer';
            a.style.display = 'none'; // Ensure the link is not visible
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        } else {
            console.error('Window is undefined');
        }
    };

    // const redirectUserToPayment = (url: string) => {
    //     if (typeof window !== 'undefined') {
    //         // Open a new window with about:blank
    //         const newWindow = window.open('about:blank', '_blank');
    
    //         if (newWindow) {
    //             // Write a placeholder message or any other content to the new window
    //             newWindow.document.write('<html><head><title>Loading...</title></head><body><p></p></body></html>');
    
    //             newWindow.location.href = url;
    //         } else {
    //             console.error('Failed to open new window');
    //         }
    //     } else {
    //         console.error('Window is undefined');
    //     }
    // };

    // NEW: Payblis payment handler
    const handlePayblisPaymentSubmit = async (directAmount?: number) => {
        let safariWindow = window.open();
        safariWindow!.document?.write('<html><head><title>Loading...</title></head><body><p>Redirecting to secure payment...</p></body></html>');

        setIsSubmittingPayment(true);

        // Use the directAmount if provided, otherwise use the state amount
        const paymentAmount = directAmount !== undefined ? directAmount : amount;

        try {
            // Step 1: Add payment to the database using existing fields
            const addPaymentResponse = await fetch('/api/payment/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: session?.user?.id,
                    paymentMethod: "PAYBLIS", // Uses existing paymentMethod field
                    state: "CREATED",
                    amount: paymentAmount,
                    currency,
                    paymentMethodCode: "PAYBLIS",
                    annual: isPayYearlySelected,
                    locale,
                    subscriptionType,
                    isGenerationPurchase, // Uses existing isGenerationPurchase field
                    generationAmount: isGenerationPurchase ? generationAmount : undefined,
                }),
            });

            const addPaymentData = await addPaymentResponse.json();
            if (!addPaymentResponse.ok) {
                throw new Error(`Failed to add payment: ${addPaymentData.message}`);
            }

            const paymentId = addPaymentData.paymentId;
            const ftd = addPaymentData.firstTimeDeposit;

            // Step 2: Submit payment to Payblis API
            const submitPaymentResponse = await fetch('/api/payment/payblis/submitPayblisPayment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    referenceId: paymentId,
                    amount: paymentAmount,
                    currency,
                    annual: isPayYearlySelected,
                    ftd,
                    userEmail: session?.user?.email, // Pass session email
                }),
            });

            const submitPaymentData = await submitPaymentResponse.json();
            if (!submitPaymentResponse.ok) {
                throw new Error(`Failed to submit payment: ${submitPaymentData.message}`);
            }

            // Track the payment event
            await trackEvent("PAYBLIS", paymentId);

            // Redirect to Payblis payment page
            let paymentUrl = submitPaymentData.result.redirectUrl;
            safariWindow!.location.href = paymentUrl;

            toast.success('Redirecting to secure payment...');
        } catch (error) {
            console.error('Payment error:', error);
            toast.error(`Error submitting payment: ${error}`);
        }
        setIsSubmittingPayment(false);
    };

    // COMMENTED OUT: Old payment methods (keeping for reference)
    /*
    const handleStripePaymentSubmit = async () => {
        let safariWindow = window.open();
        safariWindow!.document?.write('<html><head><title>Loading...</title></head><body><p></p></body></html>');

        setIsSubmittingPayment(true);
        
        try {
            // Step 1: Add payment to the database
            const addPaymentResponse = await fetch('/api/payment/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: session?.user?.id,
                    paymentMethod: "STRIPE",
                    state: "CREATED",
                    amount,
                    currency,
                    paymentMethodCode: paymentMethod,
                    annual: isPayYearlySelected,
                    locale,
                    subscriptionType,
                    isGenerationPurchase,
                    generationAmount: isGenerationPurchase ? generationAmount : undefined,
                }),
            });

            const addPaymentData = await addPaymentResponse.json();
            if (!addPaymentResponse.ok) {
                throw new Error(`Failed to add payment: ${addPaymentData.message}`);
            }

            const paymentId = addPaymentData.paymentId;
            const ftd = addPaymentData.firstTimeDeposit;

            // Step 2: Submit payment to the external API
            const submitPaymentResponse = await fetch('/api/payment/stripe/createPaymentLink', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: session?.user.id,
                    paymentId,
                    subscriptionType,
                    annual: isPayYearlySelected,
                    isGenerationPurchase,
                    generationAmount: isGenerationPurchase ? planPrice : undefined,
                }),
            });

            const submitPaymentData = await submitPaymentResponse.json();
            if (!submitPaymentResponse.ok) {
                throw new Error(`Failed to submit payment: ${submitPaymentData.message}`);
            }

            await trackEvent("STRIPE", paymentId);

            // console.log('submitPaymentData', submitPaymentData.result.redirectUrl)
            // console.log(submitPaymentData.result.redirectUrl)
            // console.log('submitPaymentData.url', submitPaymentData.url)
            let paymentUrl = submitPaymentData.url;
            // await redirectUserToPayment(paymentUrl);
            
            safariWindow!.location.href = paymentUrl;

            toast.success('Payment submitted successfully');
        } catch (error) {
            toast.error(`Error submitting payment: ${error}`);
        }
        setIsSubmittingPayment(false);
    }

    const handlePaytechPaymentSubmit = async (paymentMethod: string, directAmount?: number) => {
        let safariWindow = window.open();
        safariWindow!.document?.write('<html><head><title>Loading...</title></head><body><p></p></body></html>');

        setIsSubmittingPayment(true);

        // Use the directAmount if provided, otherwise use the state amount
        const paymentAmount = directAmount !== undefined ? directAmount : amount;

        try {
            // Step 1: Add payment to the database
            const addPaymentResponse = await fetch('/api/payment/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: session?.user?.id,
                    paymentMethod,
                    state: "CREATED",
                    amount: paymentAmount, // Use the paymentAmount here
                    currency,
                    paymentMethodCode: paymentMethod,
                    annual: isPayYearlySelected,
                    locale,
                    subscriptionType,
                    isGenerationPurchase,
                    generationAmount: isGenerationPurchase ? generationAmount : undefined,
                }),
            });

            const addPaymentData = await addPaymentResponse.json();
            if (!addPaymentResponse.ok) {
                throw new Error(`Failed to add payment: ${addPaymentData.message}`);
            }

            const paymentId = addPaymentData.paymentId;
            const ftd = addPaymentData.firstTimeDeposit;

            // Step 2: Submit payment to the external API
            const submitPaymentResponse = await fetch('/api/payment/paytech/submitPaytechPayment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    referenceId: paymentId,
                    paymentMethod,
                    amount: paymentAmount,
                    currency,
                    annual: isPayYearlySelected,
                    ftd,
                }),
            });

            const submitPaymentData = await submitPaymentResponse.json();
            if (!submitPaymentResponse.ok) {
                throw new Error(`Failed to submit payment: ${submitPaymentData.message}`);
            }

            await trackEvent("PAYTECH", paymentId);

            // console.log('submitPaymentData', submitPaymentData.result.redirectUrl)
            // console.log(submitPaymentData.result.redirectUrl)
            let paymentUrl = submitPaymentData.result.redirectUrl;
            // await redirectUserToPayment(paymentUrl);
            
            safariWindow!.location.href = paymentUrl;

            toast.success('Payment submitted successfully');
        } catch (error) {
            toast.error(`Error submitting payment: ${error}`);
        }
        setIsSubmittingPayment(false);
    };

    const handleCryptoPaymentSubmit = async (cryptoType: string) => {
        setIsSubmittingPayment(true);
        
        let safariWindow = window.open();
        safariWindow!.document?.write('<html><head><title>Loading...</title></head><body><p></p></body></html>');

        try {
            const cryptoCode = mapCryptoToCode(cryptoType); // Map selected crypto to its code

            // Step 1: Add payment to the database
            const addPaymentResponse = await fetch('/api/payment/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: session?.user?.id,
                    paymentMethod: "CRYPTO",
                    state: "CREATED",
                    amount,
                    currency: cryptoCode, // Use the mapped crypto code
                    paymentMethodCode: cryptoCode,
                    annual: isPayYearlySelected,
                    locale,
                    subscriptionType,
                    isGenerationPurchase,
                    generationAmount: isGenerationPurchase ? generationAmount : undefined,
                }),
            });

            const addPaymentData = await addPaymentResponse.json();
            if (!addPaymentResponse.ok) {
                throw new Error(`Failed to add payment: ${addPaymentData.message}`);
            }

            const paymentId = addPaymentData.paymentId;
            const ftd = addPaymentData.firstTimeDeposit;

            // Step 2: Submit payment to the external API
            const submitPaymentResponse = await fetch('/api/payment/crypto/submitCryptoPayment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    referenceId: paymentId,
                    paymentMethod: "CRYPTO",
                    amount,
                    currency: cryptoCode,
                    annual: isPayYearlySelected,
                    email: session?.user?.email,
                    ftd,
                }),
            });

            const submitPaymentData = await submitPaymentResponse.json();
            if (!submitPaymentResponse.ok) {
                throw new Error(`Failed to submit payment: ${submitPaymentData.message}`);
            }

            await trackEvent("CRYPTO", paymentId);

            // console.log('submitPaymentData', submitPaymentData.data.invoice_url)

            // console.log(submitPaymentData.data.invoice_url)
            let paymentUrl = submitPaymentData.data.invoice_url;
            // await redirectUserToPayment(paymentUrl);

            safariWindow!.location.href = paymentUrl;

            toast.success('Payment submitted successfully');
        } catch (error) {
            toast.error(`Error submitting payment: ${error}`);
        }
        setIsSubmittingPayment(false);
    };
    */

    const handleClose = () => {
        onClose();
        setShowCryptoOptions(false); // Reset to initial state when modal is closed
    };

    useEffect(() => {
        if (session?.user?.id && shouldFetchData) {
            fetchUpdatedUserData();
            fetchInitialData();
            setShouldFetchData(false);
        }
    }, [session, shouldFetchData]);

    useEffect(() => {
        if (planPrice) {
            const newAmount = isPayYearlySelected ? planPrice * 12 : planPrice;
            setAmount(parseFloat(newAmount.toFixed(2)));
        }
    }, [isPayYearlySelected, planPrice]);

    // Function to fetch user IP
    const getUserIP = async () => {
        try {
            const response = await fetch('https://api.ipify.org?format=json');
            const data = await response.json();
            // console.log(data)
            // console.log('User IP:', data.ip);
        } catch (error) {
            console.error('Error fetching user IP:', error);
        }
    };
    
    const trackEvent = async (paymentMethodName: string, transaction_id: string) => {
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
          event: "begin_checkout",
          ecommerce: {
            currency: "USD", // Assuming USD as the currency, you can change it if needed
            value: amount, // The amount of the transaction
            user_id: session?.user?.id, // User ID
            paymentMethodName: paymentMethodName, // Payment method name
            transaction_id: transaction_id, // Transaction ID
            items: [
              {
                item_name: "Пополнение аккаунта", // Formality for Google
              },
            ],
          },
        });
        // console.log('window.dataLayer', window.dataLayer);
      };

    // UPDATED: Auto-redirect to Payblis for ALL users (not just premium regions)
    useEffect(() => {
        if (isOpen && planPrice) {
            // Calculate the amount directly
            const directAmount = isPayYearlySelected ? planPrice * 12 : planPrice;
            
            // Call Payblis payment function with the direct amount
            handlePayblisPaymentSubmit(directAmount);
        }
    }, [isOpen, planPrice, isPayYearlySelected]);

    // COMMENTED OUT: Old auto-redirect logic for premium regions
    /*
    useEffect(() => {
        if (isOpen && userCountry && countriesPremiumRegions.includes(userCountry) && planPrice) {
            // Calculate the amount directly
            const directAmount = isPayYearlySelected ? planPrice * 12 : planPrice;
            
            // Call payment function with the direct amount
            handlePaytechPaymentSubmit("BASIC_CARD", directAmount);
        }
    }, [isOpen, userCountry]);
    */

    return (
        <div className={`${styles['image__overlay']} ${!isOpen ? 'hidden' : ''}`}>
            <div className={styles['pricing__modal']}>
                <Modal backdrop="blur" isOpen={isOpen} onClose={handleClose} size="md" placement="center" className={`${styles['modal_pricing']} ${styles['modal_sm_pricing']}`}>
                    <ModalContent className={`${styles['modal_pricing_content']}`}>
                        {/* Always show loading spinner since we auto-redirect to Payblis */}
                        <div className={`${styles['modal_pricing_content__inner_loading']}`}>
                            <Spinner color="secondary" />
                            <p>Redirecting to secure payment...</p>
                        </div>
                        
                        {/* COMMENTED OUT: Old payment method selection UI */}
                        {/*
                        {isSubmittingPayment ? (
                            <div className={`${styles['modal_pricing_content__inner_loading']}`}>
                                <Spinner color="secondary" />
                            </div>
                        ) : userCountry && countriesPremiumRegions.includes(userCountry) ? (
                            // If user is from a premium region, show loading spinner
                            <div className={`${styles['modal_pricing_content__inner_loading']}`}>
                                <Spinner color="secondary" />
                            </div>
                        ) : (
                            <div className={`${styles['modal_pricing_content__inner']}`}>
                                <p className={`${styles['modal_pricing_p']}`}>Payment Method</p>
                                <p className={`${styles['modal_pricing_price']}`}>
                                {isGenerationPurchase
                                    ? `$${planPrice?.toFixed(2)}`
                                    : `$${amount.toFixed(2)}`
                                }
                                </p>
                                {showCryptoOptions ? (
                                    <div className={`${styles['modal_pricing_content__inner_crypto']}`}>
                                        <div className={`${styles['paymentGridCrypto']}`}>
                                            <div 
                                                className={`${styles['payment_button']}`}
                                                onClick={() => setShowCryptoOptions(false)} // Deselect crypto options
                                            >
                                                <CardPayment className={`${styles['paymentLogo']}`} />
                                                <div className={`${styles['payment_button_text']}`}>Other Methods</div>
                                            </div>
                                            <div 
                                                className={`${styles['payment_button']}`}
                                                onClick={() => handleCryptoPaymentSubmit("USDT_TRC20")}
                                            >
                                                <USDT_TRC20 className={`${styles['paymentLogo']}`} />
                                                <div className={`${styles['payment_button_text']}`}>{`USDT (TRC-20)`}</div>
                                            </div>
                                            <div 
                                                className={`${styles['payment_button']}`}
                                                onClick={() => handleCryptoPaymentSubmit("BTC")}
                                            >
                                                <BTC className={`${styles['paymentLogo']}`} />
                                                <div className={`${styles['payment_button_text']}`}>BTC</div>
                                            </div>
                                            <div 
                                                className={`${styles['payment_button']}`}
                                                onClick={() => handleCryptoPaymentSubmit("Dogecoin")}
                                            >
                                                <Dogecoin className={`${styles['paymentLogo']}`} />
                                                <div className={`${styles['payment_button_text']}`}>Dogecoin</div>
                                            </div>
                                            <div 
                                                className={`${styles['payment_button']}`}
                                                onClick={() => handleCryptoPaymentSubmit("Dash")}
                                            >
                                                <Dash className={`${styles['paymentLogo']}`} />
                                                <div className={`${styles['payment_button_text']}`}>Dash</div>
                                            </div>
                                            <div 
                                                className={`${styles['payment_button']}`}
                                                onClick={() => handleCryptoPaymentSubmit("BitcoinCash")}
                                            >
                                                <BitcoinCash className={`${styles['paymentLogo']}`} />
                                                <div className={`${styles['payment_button_text']}`}>BitcoinCash</div>
                                            </div>
                                            <div 
                                                className={`${styles['payment_button']}`}
                                                onClick={() => handleCryptoPaymentSubmit("Litecoin")}
                                            >
                                                <Litecoin className={`${styles['paymentLogo']}`} />
                                                <div className={`${styles['payment_button_text']}`}>Litecoin</div>
                                            </div>
                                            <div 
                                                className={`${styles['payment_button']}`}
                                                onClick={() => handleCryptoPaymentSubmit("BUSD")}
                                            >
                                                <BUSD className={`${styles['paymentLogo']}`} />
                                                <div className={`${styles['payment_button_text']}`}>BUSD</div>
                                            </div>
                                            <div 
                                                className={`${styles['payment_button']}`}
                                                onClick={() => handleCryptoPaymentSubmit("ETH_CLASSIC")}
                                            >
                                                <ETH_CLASSIC className={`${styles['paymentLogo']}`} />
                                                <div className={`${styles['payment_button_text']}`}>ETC</div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className={`${styles['paymentGrid']}`}>
                                        {allowedPaymentOptions.includes("Stripe") && (
                                            <div 
                                                className={`${styles['payment_button']}`}
                                                onClick={() => handleStripePaymentSubmit()}
                                            >
                                                <StripePayment className={`${styles['paymentLogo']}`} />
                                                <div className={`${styles['payment_button_text']}`}>Stripe</div>
                                            </div>
                                        )}
                                        {allowedPaymentOptions.includes("Pay with card") && (
                                            <div 
                                                className={`${styles['payment_button']}`}
                                                onClick={() => handlePaytechPaymentSubmit("BASIC_CARD")}
                                            >
                                                <CardPayment className={`${styles['paymentLogo']}`} />
                                                <div className={`${styles['payment_button_text']}`}>Card payment</div>
                                            </div>
                                        )}
                                        {allowedPaymentOptions.includes("Instant bank transfer") && (
                                            <div 
                                                className={`${styles['payment_button']}`}
                                                onClick={() => handlePaytechPaymentSubmit("NODA")}
                                            >
                                                <BankTransfer className={`${styles['paymentLogo']}`} />
                                                <div className={`${styles['payment_button_text']}`}>Bank transfer</div>
                                            </div>
                                        )}
                                        {allowedPaymentOptions.includes("Crypto") && (
                                            <div 
                                                className={`${styles['payment_button']}`}
                                                onClick={() => setShowCryptoOptions(true)}
                                            >
                                                <CryptoPayment className={`${styles['paymentLogoCrypto']}`} />
                                                <div className={`${styles['payment_button_text']}`}>Crypto</div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                        */}
                    </ModalContent>
                </Modal>
            </div>
        </div>
    );
}