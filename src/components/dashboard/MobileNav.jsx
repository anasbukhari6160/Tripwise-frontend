import {
  CloudSun,
  LayoutDashboard,
  MapPinned,
  Route,
  User,
} from "lucide-react";

import { NavLink, useLocation } from "react-router-dom";

function MobileNav() {
  const location = useLocation();

  const tripsActive =
    location.pathname === "/trips" ||
    location.pathname.startsWith("/trips/") ||
    location.pathname === "/trip-planner";

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

      <NavLink
        to="/trips"
        className={`mobile-nav-item ${tripsActive ? "active" : ""}`}
      >
        <Route size={19} />
        <span>Trips</span>
      </NavLink>

      <NavLink
        to="/saved"
        className={({ isActive }) =>
          `mobile-nav-item ${isActive ? "active" : ""}`
        }
      >
        <MapPinned size={19} />
        <span>Saved</span>
      </NavLink>

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
