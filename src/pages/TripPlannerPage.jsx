import { useEffect, useState } from "react";

import { useNavigate, useSearchParams } from "react-router-dom";

import { ArrowLeft } from "lucide-react";

import MobileNav from "../components/dashboard/MobileNav";
import TripForm from "../components/trips/TripForm";

import { createTrip, getTrip, updateTrip } from "../services/trip.service";

function TripPlannerPage() {
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();

  const editParam = searchParams.get("edit");

  const isEditMode = editParam !== null;

  const editTripId = Number(editParam);

  const validEditTripId = Number.isInteger(editTripId) && editTripId > 0;

  const [editingTrip, setEditingTrip] = useState(null);

  const [loadingTrip, setLoadingTrip] = useState(isEditMode);

  const [submitting, setSubmitting] = useState(false);

  const [pageError, setPageError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadTripForEditing() {
      if (!isEditMode) {
        setEditingTrip(null);
        setLoadingTrip(false);

        return;
      }

      if (!validEditTripId) {
        setPageError("Invalid trip selected for editing.");

        setLoadingTrip(false);

        return;
      }

      try {
        setLoadingTrip(true);
        setPageError("");

        const trip = await getTrip(editTripId);

        if (cancelled) {
          return;
        }

        setEditingTrip(trip);
      } catch (error) {
        if (cancelled) {
          return;
        }

        if (error.status === 401) {
          setPageError("Your session has expired. Please sign in again.");
        } else if (error.status === 403) {
          setPageError("Trip Planner is available to TripWise Pro users only.");
        } else if (error.status === 404) {
          setPageError("The trip you are trying to edit could not be found.");
        } else {
          setPageError(error.message || "Unable to load this trip.");
        }

        setEditingTrip(null);
      } finally {
        if (!cancelled) {
          setLoadingTrip(false);
        }
      }
    }

    loadTripForEditing();

    return () => {
      cancelled = true;
    };
  }, [editTripId, isEditMode, validEditTripId]);

  async function handleCreateTrip(tripData) {
    try {
      setSubmitting(true);
      setPageError("");

      const trip = await createTrip(tripData);

      navigate(`/trips/${trip.id}`);
    } catch (error) {
      if (error.status === 401) {
        setPageError("Your session has expired. Please sign in again.");
      } else if (error.status === 403) {
        setPageError("Trip Planner is available to TripWise Pro users only.");
      } else {
        setPageError(error.message || "Unable to create your trip.");

        throw error;
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleUpdateTrip(tripData) {
    try {
      setSubmitting(true);
      setPageError("");

      const trip = await updateTrip(editTripId, tripData);

      navigate(`/trips/${trip.id}`);
    } catch (error) {
      if (error.status === 401) {
        setPageError("Your session has expired. Please sign in again.");
      } else if (error.status === 403) {
        setPageError("Trip Planner is available to TripWise Pro users only.");
      } else if (error.status === 404) {
        setPageError("This trip could not be found.");
      } else {
        setPageError(error.message || "Unable to update your trip.");

        throw error;
      }
    } finally {
      setSubmitting(false);
    }
  }

  function handleBack() {
    if (isEditMode && validEditTripId) {
      navigate(`/trips/${editTripId}`);

      return;
    }

    navigate("/dashboard");
  }

  if (loadingTrip) {
    return (
      <div className="trip-planner-page">
        <div className="trip-planner-container">
          <div className="trip-details-loading">Loading trip...</div>
        </div>

        <MobileNav />
      </div>
    );
  }

  if (isEditMode && !editingTrip) {
    return (
      <div className="trip-planner-page">
        <div className="trip-planner-container">
          <button
            type="button"
            className="trip-dashboard-button"
            onClick={() => navigate("/trips")}
          >
            <ArrowLeft size={20} />

            <span>My Trips</span>
          </button>

          <div className="trip-planner-heading">
            <div>
              <span className="trip-page-label">TRIPWISE PRO</span>

              <h1>Unable to edit trip</h1>

              <p>We could not load the trip you selected.</p>
            </div>

            <div className="trip-pro-badge">PRO</div>
          </div>

          {pageError && <div className="trip-page-error">{pageError}</div>}
        </div>

        <MobileNav />
      </div>
    );
  }

  return (
    <div className="trip-planner-page">
      <div className="trip-planner-container">
        <button
          type="button"
          className="trip-dashboard-button"
          onClick={handleBack}
        >
          <ArrowLeft size={20} />

          <span>{isEditMode ? "Trip Details" : "Dashboard"}</span>
        </button>

        <div className="trip-planner-heading">
          <div>
            <span className="trip-page-label">TRIPWISE PRO</span>

            <h1>
              {isEditMode ? "Edit your journey" : "Plan your next journey"}
            </h1>

            <p>
              {isEditMode
                ? "Update your trip details, destinations and travel dates."
                : "Build a multi-destination itinerary with precise locations, travel dates and smart trip planning."}
            </p>
          </div>

          <div className="trip-pro-badge">PRO</div>
        </div>

        {pageError && <div className="trip-page-error">{pageError}</div>}

        <TripForm
          key={isEditMode ? `edit-${editingTrip.id}` : "create-trip"}
          initialTrip={isEditMode ? editingTrip : null}
          onSubmit={isEditMode ? handleUpdateTrip : handleCreateTrip}
          submitting={submitting}
          submitLabel={isEditMode ? "Save Changes" : "Create Trip"}
        />
      </div>

      <MobileNav />
    </div>
  );
}

export default TripPlannerPage;
