import { apiUrl } from "../../config/api";
import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

import {
  Bookmark,
  CloudSun,
  Crown,
  LayoutDashboard,
  LogOut,
  MapPin,
  MessageCircle,
  Route as RouteIcon,
  UserRound,
} from "lucide-react";

function Sidebar({ user }) {
  const navigate = useNavigate();

  const [signingOut, setSigningOut] = useState(false);

  const isPro = user?.plan === "pro";

  function getLinkClass({ isActive }) {
    return isActive ? "sidebar-link active" : "sidebar-link";
  }

  function handleProClick() {
    const proSection = document.getElementById("pro-section");

    if (proSection) {
      proSection.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });

      return;
    }

    navigate("/dashboard");
  }

  async function handleSignOut() {
    if (signingOut) {
      return;
    }

    try {
      setSigningOut(true);

     const response = await fetch(apiUrl("/api/auth/logout"), {
       method: "POST",
       credentials: "include",
     });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to sign out.");
      }

      navigate("/login", {
        replace: true,
      });
    } catch (error) {
      console.error("Sign out error:", error);

      window.alert(error.message || "Unable to sign out.");
    } finally {
      setSigningOut(false);
    }
  }

  return (
    <aside className="dashboard-sidebar">
      <div className="sidebar-brand">
        Trip<span>Wise</span>
      </div>

      <div className="sidebar-scroll-area">
        <nav className="sidebar-nav">
          <NavLink to="/dashboard" className={getLinkClass}>
            <LayoutDashboard size={19} />
            <span>Overview</span>
          </NavLink>

          <NavLink to="/weather" className={getLinkClass}>
            <CloudSun size={19} />
            <span>Weather</span>
          </NavLink>

          <NavLink to="/trips" className={getLinkClass}>
            <RouteIcon size={19} />
            <span>My Trips</span>
          </NavLink>

          <NavLink to="/saved" className={getLinkClass}>
            <Bookmark size={19} />
            <span>Saved</span>
          </NavLink>

          <NavLink to="/trip-planner" className={getLinkClass}>
            <MapPin size={19} />
            <span>Trip Planner</span>
          </NavLink>

          <NavLink
            to="/contact"
            className={({ isActive }) =>
              `sidebar-link${isActive ? " active" : ""}`
            }
          >
            <MessageCircle size={18} />

            <span>Contact Us</span>
          </NavLink>
        </nav>
      </div>

      <div className="sidebar-fixed-bottom">
        <div className="sidebar-pro-card">
          <div className="sidebar-pro-icon">
            <Crown size={18} />
          </div>

          <strong>TripWise Pro</strong>

          <p>
            {isPro
              ? "Premium features unlocked."
              : "Unlock premium travel features."}
          </p>

          <button type="button" onClick={handleProClick}>
            {isPro ? "Manage Pro" : "Upgrade to Pro"}
          </button>
        </div>

        <div className="sidebar-account-actions">
          <NavLink to="/profile" className={getLinkClass}>
            <UserRound size={19} />
            <span>Profile</span>
          </NavLink>

          <button
            type="button"
            className="sidebar-signout-button"
            onClick={handleSignOut}
            disabled={signingOut}
          >
            <LogOut size={19} />

            <span>{signingOut ? "Signing Out..." : "Sign Out"}</span>
          </button>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
