const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

/* =========================================================
   TRIPWISE AI CHAT
========================================================= */

export async function sendAiMessage(messages) {
  const response = await fetch(`${API_BASE_URL}/api/ai/chat`, {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
    },

    credentials: "include",

    body: JSON.stringify({
      messages,
    }),
  });

  let data;

  try {
    data = await response.json();
  } catch {
    throw new Error("Invalid response from TripWise AI.");
  }

  if (!response.ok) {
    throw new Error(data.message || "Unable to reach TripWise AI.");
  }

  return data;
}
