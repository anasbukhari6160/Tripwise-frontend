import {
  CloudSun,
  LayoutDashboard,
  MapPinned,
  Route,
  User,
} from "lucide-react";

import { NavLink } from "react-router-dom";

function MobileNav() {
  return (
    <nav className="mobile-dashboard-nav">
      <NavLink
        to="/dashboard"
        className={({ isActive }) =>
          `mobile-nav-item ${isActive ? "active" : ""}`
        }
      >
        <LayoutDashboard size={19} />
        <span>Home</span>
      </NavLink>

      <NavLink
        to="/weather"
        className={({ isActive }) =>
          `mobile-nav-item ${isActive ? "active" : ""}`
        }
      >
        <CloudSun size={19} />
        <span>Weather</span>
      </NavLink>

      <button className="mobile-nav-item" type="button">
        <Route size={19} />
        <span>Trips</span>
      </button>

      <button className="mobile-nav-item" type="button">
        <MapPinned size={19} />
        <span>Saved</span>
      </button>

      <NavLink
        to="/profile"
        className={({ isActive }) =>
          `mobile-nav-item ${isActive ? "active" : ""}`
        }
      >
        <User size={19} />
        <span>Profile</span>
      </NavLink>
    </nav>
  );
}

export default MobileNav;
