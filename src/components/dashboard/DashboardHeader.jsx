import {
  Bell,
  Bookmark,
  ChevronDown,
  LogOut,
  MapPin,
  MessageCircle,
  Route as RouteIcon,
  Search,
  UserRound,
} from "lucide-react";

import { useEffect, useMemo, useRef, useState } from "react";

import { useNavigate } from "react-router-dom";

import { apiUrl } from "../../config/api";

const SAVED_API_URL = apiUrl("/api/saved");

function getInitial(name) {
  if (!name) {
    return "U";
  }

  return name.trim().charAt(0).toUpperCase();
}

function formatTripDate(value) {
  if (!value) {
    return "";
  }

  const [year, month, day] = value.slice(0, 10).split("-").map(Number);

  const date = new Date(year, month - 1, day);

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getNotificationKey(trip) {
  return [
    trip.id,
    trip.title || "",
    trip.startDate || "",
    trip.endDate || "",
  ].join("|");
}

function readStoredNotificationKeys(storageKey) {
  try {
    const storedValue = localStorage.getItem(storageKey);

    if (!storedValue) {
      return [];
    }

    const parsedValue = JSON.parse(storedValue);

    return Array.isArray(parsedValue) ? parsedValue : [];
  } catch (error) {
    console.error("Unable to load notification state:", error);

    return [];
  }
}

function DashboardHeader({ user, trips = [], savedDestinations = [] }) {
  const navigate = useNavigate();

  const searchRef = useRef(null);

  const notificationRef = useRef(null);

  const profileRef = useRef(null);

  const [query, setQuery] = useState("");

  const [showSearchResults, setShowSearchResults] = useState(false);

  const [showNotifications, setShowNotifications] = useState(false);

  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const [signingOut, setSigningOut] = useState(false);

  /* =========================================================
     USER-SPECIFIC STORAGE
  ========================================================= */

  const userStorageId = user?.id || user?.email || "guest";

  const seenStorageKey = `tripwise-seen-notifications-${userStorageId}`;

  const readStorageKey = `tripwise-read-notifications-${userStorageId}`;

  /*
   * SEEN:
   * Controls the green dot.
   * Opening notifications marks
   * current notifications as seen.
   */

  const [seenNotificationKeys, setSeenNotificationKeys] = useState(() =>
    readStoredNotificationKeys(seenStorageKey),
  );

  /*
   * READ:
   * Controls the number badge.
   * Opening an individual trip
   * marks that notification as read.
   */

  const [readNotificationKeys, setReadNotificationKeys] = useState(() =>
    readStoredNotificationKeys(readStorageKey),
  );

  const normalizedQuery = query.trim().toLowerCase();

  /* =========================================================
     GLOBAL SEARCH
  ========================================================= */

  const searchResults = useMemo(() => {
    if (normalizedQuery.length < 2) {
      return [];
    }

    const tripResults = trips
      .filter((trip) => {
        const stopText = (trip.stops || [])
          .map((stop) =>
            [stop.locationName, stop.city, stop.country]
              .filter(Boolean)
              .join(" "),
          )
          .join(" ");

        const searchableText = [trip.title, trip.notes, stopText]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return searchableText.includes(normalizedQuery);
      })
      .slice(0, 5)
      .map((trip) => ({
        id: `trip-${trip.id}`,

        type: "trip",

        title: trip.title || "Untitled Trip",

        subtitle:
          trip.stops?.[0]?.city || trip.stops?.[0]?.locationName || "Trip",

        tripId: trip.id,
      }));

    const savedResults = savedDestinations
      .filter((destination) => {
        const searchableText = [
          destination.name,
          destination.locationName,
          destination.city,
          destination.region,
          destination.country,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return searchableText.includes(normalizedQuery);
      })
      .slice(0, 5)
      .map((destination, index) => ({
        id: `saved-${destination.id || index}`,

        type: "saved",

        title:
          destination.name ||
          destination.locationName ||
          destination.city ||
          "Saved Destination",

        subtitle: [destination.city, destination.country]
          .filter(Boolean)
          .join(", "),
      }));

    return [...tripResults, ...savedResults].slice(0, 8);
  }, [trips, savedDestinations, normalizedQuery]);

  /* =========================================================
     NOTIFICATIONS
  ========================================================= */

  const notifications = useMemo(() => {
    const today = new Date();

    today.setHours(0, 0, 0, 0);

    return [...trips]
      .filter((trip) => {
        if (!trip.endDate) {
          return false;
        }

        const endDate = new Date(`${trip.endDate.slice(0, 10)}T00:00:00`);

        return endDate >= today;
      })
      .sort((a, b) => {
        const aDate = a.startDate || "";

        const bDate = b.startDate || "";

        return aDate.localeCompare(bDate);
      })
      .slice(0, 4);
  }, [trips]);

  const notificationKeys = useMemo(
    () => notifications.map((trip) => getNotificationKey(trip)),
    [notifications],
  );

  /* =========================================================
     UNSEEN / UNREAD CALCULATIONS
  ========================================================= */

  const unseenNotificationCount = useMemo(
    () =>
      notificationKeys.filter((key) => !seenNotificationKeys.includes(key))
        .length,
    [notificationKeys, seenNotificationKeys],
  );

  const unreadNotificationCount = useMemo(
    () =>
      notificationKeys.filter((key) => !readNotificationKeys.includes(key))
        .length,
    [notificationKeys, readNotificationKeys],
  );

  const hasUnseenNotifications = unseenNotificationCount > 0;

  /* =========================================================
     OUTSIDE CLICK
  ========================================================= */

  useEffect(() => {
    function handleOutsideClick(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchResults(false);
      }

      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }

      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  /* =========================================================
     SEARCH
  ========================================================= */

  function openSearchResult(result) {
    setShowSearchResults(false);

    setQuery("");

    if (result.type === "trip") {
      navigate(`/trips/${result.tripId}`);

      return;
    }

    navigate("/saved");
  }

  function handleSearchSubmit(event) {
    event.preventDefault();

    if (searchResults.length === 0) {
      return;
    }

    openSearchResult(searchResults[0]);
  }

  /* =========================================================
     MARK ALL CURRENT NOTIFICATIONS AS SEEN
  ========================================================= */

  function markNotificationsAsSeen() {
    if (notificationKeys.length === 0) {
      return;
    }

    const updatedSeenKeys = Array.from(
      new Set([...seenNotificationKeys, ...notificationKeys]),
    );

    setSeenNotificationKeys(updatedSeenKeys);

    try {
      localStorage.setItem(seenStorageKey, JSON.stringify(updatedSeenKeys));
    } catch (error) {
      console.error("Unable to save seen notifications:", error);
    }
  }

  /* =========================================================
     MARK ONE NOTIFICATION AS READ
  ========================================================= */

  function markNotificationAsRead(trip) {
    const key = getNotificationKey(trip);

    if (readNotificationKeys.includes(key)) {
      return;
    }

    const updatedReadKeys = Array.from(new Set([...readNotificationKeys, key]));

    setReadNotificationKeys(updatedReadKeys);

    try {
      localStorage.setItem(readStorageKey, JSON.stringify(updatedReadKeys));
    } catch (error) {
      console.error("Unable to save read notification:", error);
    }
  }

  /* =========================================================
     MARK ALL AS READ
  ========================================================= */

  function markAllNotificationsAsRead() {
    if (notificationKeys.length === 0) {
      return;
    }

    const updatedReadKeys = Array.from(
      new Set([...readNotificationKeys, ...notificationKeys]),
    );

    setReadNotificationKeys(updatedReadKeys);

    try {
      localStorage.setItem(readStorageKey, JSON.stringify(updatedReadKeys));
    } catch (error) {
      console.error("Unable to save read notifications:", error);
    }
  }

  /* =========================================================
     BELL
  ========================================================= */

  function handleBellClick() {
    setShowNotifications((previous) => {
      const willOpen = !previous;

      /*
       * Opening the panel means
       * notifications have been
       * SEEN.
       *
       * Green dot disappears.
       *
       * Notifications are not read
       * until the user opens the
       * notification/trip.
       */

      if (willOpen) {
        markNotificationsAsSeen();
      }

      return willOpen;
    });

    setShowProfileMenu(false);

    setShowSearchResults(false);
  }

  /* =========================================================
     PROFILE
  ========================================================= */

  function handleProfileClick() {
    setShowProfileMenu((previous) => !previous);

    setShowNotifications(false);

    setShowSearchResults(false);
  }

  function navigateFromProfile(path) {
    setShowProfileMenu(false);

    navigate(path);
  }

  /* =========================================================
     SIGN OUT
  ========================================================= */

  async function handleSignOut() {
    try {
      setSigningOut(true);

     const response = await fetch(apiUrl("/api/auth/logout"), {
       method: "POST",
       credentials: "include",
     });

      if (!response.ok) {
        throw new Error("Unable to sign out.");
      }

      navigate("/login", {
        replace: true,
      });
    } catch (error) {
      console.error("Header sign out error:", error);
    } finally {
      setSigningOut(false);

      setShowProfileMenu(false);
    }
  }

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <header className="dashboard-header">
      {/* =====================================================
          SEARCH
      ===================================================== */}

      <div className="dashboard-search-wrapper" ref={searchRef}>
        <form className="dashboard-search" onSubmit={handleSearchSubmit}>
          <Search size={17} />

          <input
            type="search"
            placeholder="Search trips or destinations..."
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);

              setShowSearchResults(true);

              setShowNotifications(false);

              setShowProfileMenu(false);
            }}
            onFocus={() => setShowSearchResults(true)}
            autoComplete="off"
          />
        </form>

        {showSearchResults && normalizedQuery.length >= 2 && (
          <div className="dashboard-global-search-results">
            {searchResults.length > 0 ? (
              searchResults.map((result) => (
                <button
                  key={result.id}
                  type="button"
                  className="dashboard-global-search-item"
                  onClick={() => openSearchResult(result)}
                >
                  <div className="dashboard-global-search-icon">
                    {result.type === "trip" ? (
                      <RouteIcon size={16} />
                    ) : (
                      <Bookmark size={16} />
                    )}
                  </div>

                  <div className="dashboard-global-search-info">
                    <strong>{result.title}</strong>

                    <span>{result.subtitle}</span>
                  </div>

                  <small>{result.type === "trip" ? "Trip" : "Saved"}</small>
                </button>
              ))
            ) : (
              <div className="dashboard-global-search-empty">
                <MapPin size={17} />

                <span>No matching results.</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* =====================================================
          HEADER ACTIONS
      ===================================================== */}

      <div className="dashboard-header-actions">
        {/* =========================
            NOTIFICATIONS
        ========================= */}

        <div className="dashboard-notification-wrapper" ref={notificationRef}>
          <button
            type="button"
            className={`dashboard-icon-button ${
              showNotifications ? "active" : ""
            }`}
            onClick={handleBellClick}
            aria-label="Notifications"
            aria-expanded={showNotifications}
          >
            <Bell size={20} />

            {hasUnseenNotifications && (
              <span className="dashboard-notification-dot" />
            )}
          </button>

          {showNotifications && (
            <div className="dashboard-notification-menu">
              <div className="dashboard-dropdown-heading">
                <div>
                  <strong>Notifications</strong>

                  <span>Trip reminders and updates</span>
                </div>

                {unreadNotificationCount > 0 && (
                  <small>{unreadNotificationCount}</small>
                )}
              </div>

              <div className="dashboard-dropdown-divider" />

              {notifications.length > 0 ? (
                <div className="dashboard-notification-list">
                  {notifications.map((trip) => {
                    const firstStop = trip.stops?.[0];

                    const notificationKey = getNotificationKey(trip);

                    const isRead =
                      readNotificationKeys.includes(notificationKey);

                    return (
                      <button
                        key={trip.id}
                        type="button"
                        className={`dashboard-notification-item ${
                          isRead ? "read" : "unread"
                        }`}
                        onClick={() => {
                          markNotificationAsRead(trip);

                          setShowNotifications(false);

                          navigate(`/trips/${trip.id}`);
                        }}
                      >
                        <div className="dashboard-notification-item-icon">
                          <RouteIcon size={16} />
                        </div>

                        <div>
                          <strong>{trip.title || "Upcoming trip"}</strong>

                          <span>
                            {firstStop?.city ||
                              firstStop?.locationName ||
                              "Upcoming journey"}

                            {trip.startDate
                              ? ` • ${formatTripDate(trip.startDate)}`
                              : ""}
                          </span>
                        </div>
                      </button>
                    );
                  })}

                  <button
                    type="button"
                    className="dashboard-dropdown-footer-button"
                    onClick={() => {
                      markAllNotificationsAsRead();

                      setShowNotifications(false);

                      navigate("/trips");
                    }}
                  >
                    View all trips
                  </button>
                </div>
              ) : (
                <div className="dashboard-notification-empty">
                  <Bell size={22} />

                  <strong>You&apos;re all caught up</strong>

                  <span>Upcoming trip reminders will appear here.</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* =========================
            USER MENU
        ========================= */}

        <div className="dashboard-user-wrapper" ref={profileRef}>
          <button
            type="button"
            className={`dashboard-user ${showProfileMenu ? "active" : ""}`}
            onClick={handleProfileClick}
            aria-expanded={showProfileMenu}
          >
            <div className="dashboard-user-avatar">
              {getInitial(user?.name)}
            </div>

            <div className="dashboard-user-info">
              <strong>{user?.name || "TripWise User"}</strong>

              <span>{user?.plan === "pro" ? "Pro Plan" : "Free Plan"}</span>
            </div>

            <ChevronDown
              size={17}
              className={`dashboard-user-chevron ${
                showProfileMenu ? "open" : ""
              }`}
            />
          </button>

          {showProfileMenu && (
            <div className="dashboard-profile-menu">
              <div className="dashboard-profile-summary">
                <div className="dashboard-profile-large-avatar">
                  {getInitial(user?.name)}
                </div>

                <div>
                  <strong>{user?.name || "TripWise User"}</strong>

                  <span>
                    {user?.email ||
                      `${user?.plan === "pro" ? "Pro" : "Free"} Plan`}
                  </span>
                </div>
              </div>

              <div className="dashboard-dropdown-divider" />

              <button
                type="button"
                className="dashboard-profile-menu-item"
                onClick={() => navigateFromProfile("/profile")}
              >
                <UserRound size={17} />

                <span>My Profile</span>
              </button>

              <button
                type="button"
                className="dashboard-profile-menu-item"
                onClick={() => navigateFromProfile("/trips")}
              >
                <RouteIcon size={17} />

                <span>My Trips</span>
              </button>

              <button
                type="button"
                className="dashboard-profile-menu-item"
                onClick={() => navigateFromProfile("/contact")}
              >
                <MessageCircle size={17} />

                <span>Contact Us</span>
              </button>

              <div className="dashboard-dropdown-divider" />

              <button
                type="button"
                className="dashboard-profile-menu-item dashboard-profile-signout"
                onClick={handleSignOut}
                disabled={signingOut}
              >
                <LogOut size={17} />

                <span>{signingOut ? "Signing out..." : "Sign Out"}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default DashboardHeader;
