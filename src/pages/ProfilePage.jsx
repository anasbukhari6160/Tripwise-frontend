import { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";

import {
  deleteProfile,
  getProfile,
  requestPasswordChange,
  updateProfile,
  verifyPasswordChange,
} from "../services/profile.service";

import "../styles/profile.css";

export default function ProfilePage() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);

  const [name, setName] = useState("");

  const [loading, setLoading] = useState(true);

  const [savingProfile, setSavingProfile] = useState(false);

  const [profileSuccess, setProfileSuccess] = useState("");

  const [profileError, setProfileError] = useState("");

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [passwordStep, setPasswordStep] = useState("password");

  const [passwordVerificationCode, setPasswordVerificationCode] = useState("");

  const [changingPassword, setChangingPassword] = useState(false);

  const [passwordSuccess, setPasswordSuccess] = useState("");

  const [passwordError, setPasswordError] = useState("");

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);

  const [showNewPassword, setShowNewPassword] = useState(false);

  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [deletingAccount, setDeletingAccount] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true);

        const data = await getProfile();

        const userData = data.user || data.profile || data;

        setProfile(userData);

        setName(userData.name || "");
      } catch (error) {
        if (import.meta.env.DEV) console.error("Failed to load profile:", error);

        if (error.status === 401) {
          navigate("/login", {
            replace: true,
          });

          return;
        }

        setProfileError(error.message || "Unable to load your profile.");
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [navigate]);

  async function handleProfileSubmit(event) {
    event.preventDefault();

    setProfileSuccess("");
    setProfileError("");

    const trimmedName = name.trim();

    if (!trimmedName) {
      setProfileError("Name is required.");

      return;
    }

    try {
      setSavingProfile(true);

      const data = await updateProfile(trimmedName);

      const updatedProfile = data.user ||
        data.profile || {
          ...profile,
          name: trimmedName,
        };

      setProfile((previousProfile) => ({
        ...previousProfile,
        ...updatedProfile,

        name: updatedProfile.name || trimmedName,
      }));

      setName(updatedProfile.name || trimmedName);

      setProfileSuccess(data.message || "Profile updated successfully.");
    } catch (error) {
      if (import.meta.env.DEV) console.error("Profile update failed:", error);

      setProfileError(error.message || "Unable to update profile.");
    } finally {
      setSavingProfile(false);
    }
  }

  function handlePasswordInputChange(event) {
    const { name: fieldName, value } = event.target;

    setPasswordForm((previousForm) => ({
      ...previousForm,

      [fieldName]: value,
    }));

    setPasswordError("");
    setPasswordSuccess("");
  }

  async function handlePasswordSubmit(event) {
    event.preventDefault();

    setPasswordSuccess("");
    setPasswordError("");

    const { currentPassword, newPassword, confirmPassword } = passwordForm;

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("Please complete all password fields.");

      return;
    }

    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters.");

      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirm password do not match.");

      return;
    }

    if (currentPassword === newPassword) {
      setPasswordError(
        "Your new password must be different from your current password.",
      );

      return;
    }

    try {
      setChangingPassword(true);

      const data = await requestPasswordChange({
        currentPassword,
        newPassword,
        confirmPassword,
      });

      setPasswordStep("verify");

      setPasswordSuccess(
        data.message || "Verification code sent to your email.",
      );
    } catch (error) {
      if (import.meta.env.DEV) console.error("Password verification request failed:", error);

      setPasswordError(error.message || "Unable to send verification code.");
    } finally {
      setChangingPassword(false);
    }
  }

  async function handlePasswordVerification(event) {
    event.preventDefault();

    setPasswordSuccess("");
    setPasswordError("");

    const cleanCode = passwordVerificationCode.trim();

    if (!cleanCode) {
      setPasswordError("Please enter the verification code.");

      return;
    }

    if (!/^\d{6}$/.test(cleanCode)) {
      setPasswordError("Verification code must contain 6 digits.");

      return;
    }

    try {
      setChangingPassword(true);

      const data = await verifyPasswordChange(cleanCode);

      setPasswordSuccess(data.message || "Password changed successfully.");

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setPasswordVerificationCode("");

      setPasswordStep("password");

      setShowCurrentPassword(false);

      setShowNewPassword(false);

      setShowConfirmPassword(false);
    } catch (error) {
      if (import.meta.env.DEV) console.error("Password verification failed:", error);

      setPasswordError(error.message || "Unable to verify code.");
    } finally {
      setChangingPassword(false);
    }
  }

  async function handleDeleteAccount() {
    const confirmed = window.confirm(
      "Are you sure you want to permanently delete your TripWise account? This action cannot be undone.",
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingAccount(true);

      await deleteProfile();

      navigate("/login", {
        replace: true,
      });
    } catch (error) {
      if (import.meta.env.DEV) console.error("Delete account failed:", error);

      setProfileError(error.message || "Unable to delete account.");

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } finally {
      setDeletingAccount(false);
    }
  }

  function getInitials() {
    const profileName = profile?.name?.trim();

    if (!profileName) {
      return "TW";
    }

    const words = profileName.split(" ").filter(Boolean);

    if (words.length === 1) {
      return words[0].slice(0, 2).toUpperCase();
    }

    return `${words[0][0]}${words[1][0]}`.toUpperCase();
  }

  if (loading) {
    return <div className="profile-loading">Loading your profile...</div>;
  }

  return (
    <main className="profile-page">
      <div className="profile-container">

        <button
          type="button"
          className="profile-back-button"
          onClick={() => navigate(-1)}
        >
          <span aria-hidden="true">←</span>
          Back
        </button>

        <header className="profile-heading">
          <span>ACCOUNT SETTINGS</span>

          <h1>Your Profile</h1>

          <p>
            Manage your TripWise personal information, account security, and
            preferences.
          </p>
        </header>

        <section className="profile-layout">

          <aside className="profile-summary-card">
            <div className="profile-large-avatar">{getInitials()}</div>

            <h2>{profile?.name || "TripWise User"}</h2>

            <p>{profile?.email || "No email available"}</p>

            <div className="profile-plan-badge">
              <span>●</span>

              {profile?.plan ? `${profile.plan} Plan` : "Free Plan"}
            </div>

            <div className="profile-account-info">
              <div>
                <span>
                  <small>EMAIL ADDRESS</small>

                  <strong>{profile?.email || "Not available"}</strong>
                </span>
              </div>

              <div>
                <span>
                  <small>ACCOUNT</small>

                  <strong>
                    {profile?.plan === "pro" ? "TripWise Pro" : "TripWise Free"}
                  </strong>
                </span>
              </div>

              {profile?.created_at && (
                <div>
                  <span>
                    <small>MEMBER SINCE</small>

                    <strong>
                      {new Date(profile.created_at).toLocaleDateString()}
                    </strong>
                  </span>
                </div>
              )}
            </div>
          </aside>

          <div className="profile-settings">

            <section className="profile-form-card">
              <div className="profile-section-heading">
                <h2>Personal Information</h2>

                <p>Update your basic TripWise account information.</p>
              </div>

              {profileSuccess && (
                <div className="profile-success-message">{profileSuccess}</div>
              )}

              {profileError && (
                <div className="profile-error-message">{profileError}</div>
              )}

              <form onSubmit={handleProfileSubmit}>
                <div className="profile-form-group">
                  <label htmlFor="profile-name">Full Name</label>

                  <div className="profile-input">
                    <input
                      id="profile-name"
                      type="text"
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      placeholder="Enter your full name"
                      autoComplete="name"
                    />
                  </div>
                </div>

                <div className="profile-form-group">
                  <label htmlFor="profile-email">Email Address</label>

                  <div className="profile-input profile-input-disabled">
                    <input
                      id="profile-email"
                      type="email"
                      value={profile?.email || ""}
                      disabled
                      readOnly
                    />
                  </div>

                  <small>
                    Your account email cannot be changed from this page.
                  </small>
                </div>

                <button
                  type="submit"
                  className="profile-save-button"
                  disabled={savingProfile}
                >
                  {savingProfile ? "Saving..." : "Save Changes"}
                </button>
              </form>
            </section>

            <section className="profile-form-card">
              <div className="profile-section-heading">
                <h2>Change Password</h2>

                <p>
                  For your security, TripWise will verify your registered email
                  before changing your password.
                </p>
              </div>

              {passwordSuccess && (
                <div className="profile-success-message">{passwordSuccess}</div>
              )}

              {passwordError && (
                <div className="profile-error-message">{passwordError}</div>
              )}

              {passwordStep === "password" ? (
                <form onSubmit={handlePasswordSubmit}>
                  <div className="profile-form-group">
                    <label htmlFor="current-password">Current Password</label>

                    <div className="profile-input">
                      <input
                        id="current-password"
                        name="currentPassword"
                        type={showCurrentPassword ? "text" : "password"}
                        value={passwordForm.currentPassword}
                        onChange={handlePasswordInputChange}
                        placeholder="Enter current password"
                        autoComplete="current-password"
                      />

                      <button
                        type="button"
                        className="profile-password-toggle"
                        onClick={() =>
                          setShowCurrentPassword((previous) => !previous)
                        }
                      >
                        {showCurrentPassword ? "Hide" : "Show"}
                      </button>
                    </div>
                  </div>

                  <div className="profile-form-group">
                    <label htmlFor="new-password">New Password</label>

                    <div className="profile-input">
                      <input
                        id="new-password"
                        name="newPassword"
                        type={showNewPassword ? "text" : "password"}
                        value={passwordForm.newPassword}
                        onChange={handlePasswordInputChange}
                        placeholder="Enter new password"
                        autoComplete="new-password"
                      />

                      <button
                        type="button"
                        className="profile-password-toggle"
                        onClick={() =>
                          setShowNewPassword((previous) => !previous)
                        }
                      >
                        {showNewPassword ? "Hide" : "Show"}
                      </button>
                    </div>
                  </div>

                  <div className="profile-form-group">
                    <label htmlFor="confirm-password">
                      Confirm New Password
                    </label>

                    <div className="profile-input">
                      <input
                        id="confirm-password"
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={passwordForm.confirmPassword}
                        onChange={handlePasswordInputChange}
                        placeholder="Confirm new password"
                        autoComplete="new-password"
                      />

                      <button
                        type="button"
                        className="profile-password-toggle"
                        onClick={() =>
                          setShowConfirmPassword((previous) => !previous)
                        }
                      >
                        {showConfirmPassword ? "Hide" : "Show"}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="profile-save-button"
                    disabled={changingPassword}
                  >
                    {changingPassword ? "Sending..." : "Send Code"}
                  </button>
                </form>
              ) : (
                <form onSubmit={handlePasswordVerification}>
                  <div className="profile-form-group">
                    <label htmlFor="password-code">Verification Code</label>

                    <div className="profile-input">
                      <input
                        id="password-code"
                        type="text"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        maxLength={6}
                        value={passwordVerificationCode}
                        onChange={(event) => {
                          const value = event.target.value
                            .replace(/\D/g, "")
                            .slice(0, 6);

                          setPasswordVerificationCode(value);

                          setPasswordError("");
                        }}
                        placeholder="Enter 6-digit code"
                      />
                    </div>

                    <small>
                      A 6-digit verification code was sent to {profile?.email}.
                    </small>
                  </div>

                  <div className="profile-password-actions">
                    <button
                      type="submit"
                      className="profile-save-button"
                      disabled={
                        changingPassword ||
                        passwordVerificationCode.length !== 6
                      }
                    >
                      {changingPassword ? "Verifying..." : "Verify Code"}
                    </button>

                    <button
                      type="button"
                      className="profile-secondary-button"
                      disabled={changingPassword}
                      onClick={() => {
                        setPasswordStep("password");

                        setPasswordVerificationCode("");

                        setPasswordSuccess("");

                        setPasswordError("");
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </section>

            <section className="profile-danger-card">
              <div>
                <div className="profile-danger-icon">!</div>

                <div>
                  <h2>Delete Account</h2>

                  <p>
                    Permanently delete your TripWise account and account data.
                    This action cannot be undone.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={deletingAccount}
              >
                {deletingAccount ? "Deleting..." : "Delete"}
              </button>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}
