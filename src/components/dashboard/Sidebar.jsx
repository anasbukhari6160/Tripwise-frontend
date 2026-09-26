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

function Sidebar() {
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
            <strong>Upgrade to Pro</strong>
            <p>Unlock smarter travel tools.</p>
          </div>

          <button type="button">Upgrade</button>
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
