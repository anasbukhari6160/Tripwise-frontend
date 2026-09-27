import { useState } from "react";
import { NavLink } from "react-router-dom";

import {
  CloudSun,
  Compass,
  Crown,
  LayoutDashboard,
  MapPinned,
  Route,
  Settings,
  User,
} from "lucide-react";

import { createCheckoutSession } from "../../services/payment.service";

function Sidebar({ user }) {
  const [upgrading, setUpgrading] = useState(false);
  const [upgradeError, setUpgradeError] = useState("");

  const isPro = user?.plan === "pro";

  async function handleUpgrade() {
    try {
      setUpgrading(true);
      setUpgradeError("");

      const data = await createCheckoutSession();

      if (!data.checkoutUrl) {
        throw new Error("Stripe checkout URL was not returned.");
      }

      window.location.href = data.checkoutUrl;
    } catch (error) {
      console.error("Sidebar Stripe checkout error:", error);

      setUpgradeError(error.message || "Unable to start Stripe checkout.");
    } finally {
      setUpgrading(false);
    }
  }

  return (
    <aside className="dashboard-sidebar">
      <div className="sidebar-brand">
        Trip<span>Wise</span>
      </div>

      <nav className="sidebar-nav">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `sidebar-link ${isActive ? "active" : ""}`
          }
        >
          <LayoutDashboard size={19} />
          <span>Overview</span>
        </NavLink>

        <NavLink
          to="/weather"
          className={({ isActive }) =>
            `sidebar-link ${isActive ? "active" : ""}`
          }
        >
          <CloudSun size={19} />
          <span>Weather</span>
        </NavLink>

        <a className="sidebar-link" href="#">
          <Route size={19} />
          <span>My Trips</span>
        </a>

        <NavLink
          to="/saved"
          className={({ isActive }) =>
            `sidebar-link ${isActive ? "active" : ""}`
          }
        >
          <MapPinned size={19} />
          <span>Saved</span>
        </NavLink>

        <a className="sidebar-link" href="#">
          <Compass size={19} />
          <span>Trip Planner</span>
        </a>

        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `sidebar-link ${isActive ? "active" : ""}`
          }
        >
          <User size={19} />
          <span>Profile</span>
        </NavLink>
      </nav>

      <div className="sidebar-bottom">
        <div className="sidebar-pro-card">
          <div className="sidebar-pro-icon">
            <Crown size={18} />
          </div>

          <div>
            <strong>{isPro ? "TripWise Pro" : "Upgrade to Pro"}</strong>

            <p>
              {isPro
                ? "Premium features unlocked."
                : "Unlock smarter travel tools."}
            </p>
          </div>

          {isPro ? (
            <button type="button" disabled>
              Pro Active
            </button>
          ) : (
            <button type="button" onClick={handleUpgrade} disabled={upgrading}>
              {upgrading ? "Opening..." : "Upgrade"}
            </button>
          )}

          {upgradeError && (
            <small className="sidebar-pro-error">{upgradeError}</small>
          )}
        </div>

        <a className="sidebar-link" href="#">
          <Settings size={19} />
          <span>Settings</span>
        </a>
      </div>
    </aside>
  );
}

export default Sidebar;
