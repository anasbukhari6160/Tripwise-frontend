import { apiRequest } from "./api.service";

export const createCheckoutSession = () => apiRequest("/api/payments/create-checkout-session", { method: "POST" });
export const verifyPaymentSession = (sessionId) => apiRequest("/api/payments/verify-session?session_id=" + encodeURIComponent(sessionId));
export const cancelSubscription = () => apiRequest("/api/payments/cancel-subscription", { method: "POST" });
export const reactivateSubscription = () => apiRequest("/api/payments/reactivate-subscription", { method: "POST" });
