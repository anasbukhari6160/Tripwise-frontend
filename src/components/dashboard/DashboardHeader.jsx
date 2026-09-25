import { Bell, ChevronDown, Search } from "lucide-react";

function DashboardHeader({ user }) {
  const name = user?.name || "TripWise User";
  const plan = user?.plan || "free";

  const initials = name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="dashboard-header">
      <div className="dashboard-search">
        <Search size={18} />

        <input type="text" placeholder="Search trips or destinations..." />
      </div>

      <div className="dashboard-header-actions">
        <button className="header-icon-button" type="button">
          <Bell size={19} />
        </button>

        <button className="profile-menu" type="button">
          <div className="profile-avatar">{initials}</div>

          <div className="profile-details">
            <strong>{name}</strong>

            <span>{plan === "pro" ? "Pro Plan" : "Free Plan"}</span>
          </div>

          <ChevronDown size={17} />
        </button>
      </div>
    </header>
  );
}

export default DashboardHeader;
