import { apiRequest } from "./api.service";

export const getProfile = () => apiRequest("/api/profile");
export const updateProfile = (name) => apiRequest("/api/profile", { method: "PUT", body: { name } });
export const requestPasswordChange = ({ currentPassword, newPassword, confirmPassword }) =>
  apiRequest("/api/profile/password/request-change", { method: "POST", body: { currentPassword, newPassword, confirmPassword } });
export const verifyPasswordChange = (code) => apiRequest("/api/profile/password/verify-change", { method: "POST", body: { code } });
export const deleteProfile = () => apiRequest("/api/profile", { method: "DELETE" });
