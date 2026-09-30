import { API_URL } from "../config/api";

export async function createCheckoutSession() {
  const response = await fetch(
    `${API_BASE_URL}/api/payments/create-checkout-session`,
    {
      method: "POST",
      credentials: "include",
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Unable to start Stripe checkout.");
  }

  return data;
}

export async function verifyPaymentSession(sessionId) {
  const response = await fetch(
    `${API_BASE_URL}/api/payments/verify-session?session_id=${encodeURIComponent(
      sessionId,
    )}`,
    {
      method: "GET",
      credentials: "include",
    },
  );

  const data = await response.json();

  if (!response.ok && response.status !== 202) {
    throw new Error(data.message || "Unable to verify Stripe payment.");
  }

  return data;
}
export async function cancelSubscription() {
  const response = await fetch(
    `${API_BASE_URL}/api/payments/cancel-subscription`,
    {
      method: "POST",
      credentials: "include",
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Unable to cancel subscription.");
  }

  return data;
}
export async function reactivateSubscription() {
  const response = await fetch(
    `${API_BASE_URL}/api/payments/reactivate-subscription`,
    {
      method: "POST",
      credentials: "include",
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Unable to reactivate subscription.");
  }

  return data;
}
