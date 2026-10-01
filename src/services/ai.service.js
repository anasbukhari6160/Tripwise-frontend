import { apiRequest } from "./api.service";

export const sendAiMessage = (messages) => apiRequest("/api/ai/chat", { method: "POST", body: { messages }, timeout: 90000 });
