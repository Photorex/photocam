export const trackEvent = (
    eventName: string,
    eventData: {
        ecommerce?: {
            usid?: string;
            currency?: string;
            value?: number;
            user_id?: string;
            paymentMethodName?: string;
            transaction_id?: string;
            items?: Array<{ item_name: string }>;
        };
        [key: string]: unknown; // Allow additional custom properties
    } = {}
) => {
    if (typeof window === "undefined") return;
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
        event: eventName,
        ...eventData, // Spread any additional properties
    });
    console.log(`GTM Event Sent: ${eventName}`, eventData);

    // Debugging purpose console datalayer output
    // console.log(JSON.stringify(window.dataLayer, null, 2));
};