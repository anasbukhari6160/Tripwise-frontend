import { apiRequest } from "./api.service";

export const registerUser = (body) => apiRequest("/api/auth/register", { method: "POST", body });
export const verifyEmail = (email, code) => apiRequest("/api/auth/verify-email", { method: "POST", body: { email, code } });
export const loginUser = (body) => apiRequest("/api/auth/login", { method: "POST", body });
export const getCurrentUser = () => apiRequest("/api/auth/me");
export const logoutUser = () => apiRequest("/api/auth/logout", { method: "POST" });
export const resendVerificationCode = (email) => apiRequest("/api/auth/resend-verification", { method: "POST", body: { email } });
export const forgotPassword = (email) => apiRequest("/api/auth/forgot-password", { method: "POST", body: { email } });
export const resetPassword = (email, code, newPassword) => apiRequest("/api/auth/reset-password", { method: "POST", body: { email, code, newPassword } });
export const googleLogin = (credential) => apiRequest("/api/auth/google", { method: "POST", body: { credential } });
