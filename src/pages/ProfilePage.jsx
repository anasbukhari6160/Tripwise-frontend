import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MobileNav from "../components/dashboard/MobileNav";
import {
  ArrowLeft,
  BadgeCheck,
  Crown,
  Mail,
  ShieldCheck,
  Trash2,
  User,
} from "lucide-react";

import {
  deleteProfile,
  getProfile,
  updateProfile,
} from "../services/profile.service";

import "../styles/profile.css";

function ProfilePage() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [name, setName] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProfile() {
      try {
        const profileData = await getProfile();

        setProfile(profileData);
        setName(profileData.name);
      } catch (profileError) {
        setError(profileError.message);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();

    const cleanName = name.trim();

    if (!cleanName) {
      setError("Name is required.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setMessage("");

      const data = await updateProfile(cleanName);

      setProfile(data.profile);
      setName(data.profile.name);
      setMessage("Profile updated successfully.");
    } catch (profileError) {
      setError(profileError.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteAccount() {
    const confirmed = window.confirm(
      "Are you sure you want to permanently delete your TripWise account?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeleting(true);
      setError("");

      await deleteProfile();

      navigate("/login", {
        replace: true,
      });
    } catch (profileError) {
      setError(profileError.message);
      setDeleting(false);
    }
  }

  if (loading) {
    return <div className="profile-loading">Loading your profile...</div>;
  }

  if (!profile) {
    return (
      <div className="profile-loading">
        {error || "Unable to load profile."}
      </div>
    );
  }

  const initials = profile.name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="profile-page">
      <div className="profile-container">
        <button
          className="profile-back-button"
          type="button"
          onClick={() => navigate("/dashboard")}
        >
          <ArrowLeft size={18} />
          Dashboard
        </button>

        <div className="profile-heading">
          <div>
            <span>ACCOUNT</span>

            <h1>Your Profile</h1>

            <p>Manage your personal TripWise account information.</p>
          </div>
        </div>

        <section className="profile-layout">
          <div className="profile-summary-card">
            <div className="profile-large-avatar">{initials}</div>

            <h2>{profile.name}</h2>

            <p>{profile.email}</p>

            <div className="profile-plan-badge">
              <Crown size={14} />

              {profile.plan === "pro" ? "Pro Plan" : "Free Plan"}
            </div>

            <div className="profile-account-info">
              <div>
                <User size={17} />

                <span>
                  <small>Account ID</small>
                  <strong>#{profile.id}</strong>
                </span>
              </div>

              <div>
                <ShieldCheck size={17} />

                <span>
                  <small>Sign-in method</small>
                  <strong>
                    {profile.auth_provider === "google"
                      ? "Google"
                      : "Email & Password"}
                  </strong>
                </span>
              </div>

              <div>
                <BadgeCheck size={17} />

                <span>
                  <small>Email status</small>
                  <strong>
                    {profile.is_verified ? "Verified" : "Not verified"}
                  </strong>
                </span>
              </div>
            </div>
          </div>

          <div className="profile-settings">
            <div className="profile-form-card">
              <div className="profile-section-heading">
                <div>
                  <h2>Personal Information</h2>

                  <p>Update the name associated with your TripWise account.</p>
                </div>
              </div>

              {message && (
                <div className="profile-success-message">{message}</div>
              )}

              {error && <div className="profile-error-message">{error}</div>}

              <form onSubmit={handleSubmit}>
                <div className="profile-form-group">
                  <label htmlFor="profile-name">Full Name</label>

                  <div className="profile-input">
                    <User size={18} />

                    <input
                      id="profile-name"
                      type="text"
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      maxLength={100}
                    />
                  </div>
                </div>

                <div className="profile-form-group">
                  <label htmlFor="profile-email">Email Address</label>

                  <div className="profile-input profile-input-disabled">
                    <Mail size={18} />

                    <input
                      id="profile-email"
                      type="email"
                      value={profile.email}
                      disabled
                    />
                  </div>

                  <small>
                    Email changes are currently disabled because email
                    verification is required.
                  </small>
                </div>

                <button
                  className="profile-save-button"
                  type="submit"
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </form>
            </div>

            <div className="profile-danger-card">
              <div>
                <span className="profile-danger-icon">
                  <Trash2 size={19} />
                </span>

                <div>
                  <h2>Delete Account</h2>

                  <p>
                    Permanently remove your TripWise account and account
                    information.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Delete Account"}
              </button>
            </div>
          </div>
        </section>
      </div>
      <MobileNav />
    </div>
  );
}

export default ProfilePage;
