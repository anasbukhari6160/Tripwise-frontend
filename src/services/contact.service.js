import { API_URL } from "../config/api";

export async function submitContactMessage(contactData) {
  const response = await fetch(`${API_BASE_URL}/api/contact`, {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
    },

    credentials: "include",

    body: JSON.stringify(contactData),
  });

  let data = {};

  try {
    data = await response.json();
  } catch {
    // Keep controlled fallback below.
  }

  if (!response.ok) {
    const error = new Error(data.message || "Unable to send your message.");

    error.status = response.status;

    throw error;
  }

  return data;
}
