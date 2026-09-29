import { useState } from "react";

import {
  Crown,
  CloudSun,
  MapPinned,
  Route,
  Sparkles,
  X,
  AlertTriangle,
  RotateCcw,
} from "lucide-react";

import {
  createCheckoutSession,
  cancelSubscription,
  reactivateSubscription,
} from "../../services/payment.service";

function ProFeaturesCard({ user }) {
  const [loading, setLoading] = useState(false);

  const [cancelLoading, setCancelLoading] = useState(false);

  const [reactivateLoading, setReactivateLoading] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const [cancelAtPeriodEndOverride, setCancelAtPeriodEndOverride] =
    useState(null);

  const isPro = user?.plan === "pro";

  const cancelAtPeriodEnd =
    cancelAtPeriodEndOverride ?? user?.cancel_at_period_end === true;

  const features = [
    {
      icon: <MapPinned size={17} />,
      text: "Unlimited saved destinations",
    },
    {
      icon: <CloudSun size={17} />,
      text: "Extended weather insights",
    },
    {
      icon: <Route size={17} />,
      text: "Multi-city trip planning",
    },
  ];

  async function handleUpgrade() {
    try {
      setLoading(true);
      setError("");
      setMessage("");

      const data = await createCheckoutSession();

      if (!data.checkoutUrl) {
        throw new Error("Stripe checkout URL was not returned.");
      }

      window.location.href = data.checkoutUrl;
    } catch (error) {
      console.error("Unable to start Stripe checkout:", error);

      setError(error.message || "Unable to start Stripe checkout.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCancelSubscription() {
    try {
      setCancelLoading(true);
      setError("");
      setMessage("");

      const data = await cancelSubscription();

      setCancelAtPeriodEndOverride(true);

      setMessage(
        data.message ||
          "Your subscription will cancel at the end of the current billing period.",
      );

      setShowCancelConfirm(false);
    } catch (error) {
      console.error("Unable to cancel subscription:", error);

      setError(error.message || "Unable to cancel subscription.");

      setShowCancelConfirm(false);
    } finally {
      setCancelLoading(false);
    }
  }

  async function handleReactivateSubscription() {
    try {
      setReactivateLoading(true);
      setError("");
      setMessage("");

      const data = await reactivateSubscription();

      setCancelAtPeriodEndOverride(false);

      setMessage(
        data.message || "Your TripWise Pro subscription has been reactivated.",
      );
    } catch (error) {
      console.error("Unable to reactivate subscription:", error);

      setError(error.message || "Unable to reactivate subscription.");
    } finally {
      setReactivateLoading(false);
    }
  }

  function handleOpenCancelModal() {
    setError("");
    setMessage("");
    setShowCancelConfirm(true);
  }

  function handleCloseCancelModal() {
    if (cancelLoading) {
      return;
    }

    setShowCancelConfirm(false);
  }

  return (
    <div className="dashboard-panel pro-features-panel">
      <div className="pro-features-heading">
        <div className="pro-features-icon">
          <Crown size={20} />
        </div>

        <div>
          <span className="pro-features-label">TRIPWISE PRO</span>

          <h2>
            {isPro
              ? "Your Pro features are unlocked."
              : "Travel with fewer limits."}
          </h2>
        </div>
      </div>

      <div className="pro-features-list">
        {features.map((feature) => (
          <div className="pro-feature-item" key={feature.text}>
            <span className="pro-feature-icon">{feature.icon}</span>

            <span>{feature.text}</span>
          </div>
        ))}
      </div>

      {error && <p className="pro-payment-error">{error}</p>}

      {message && <p className="pro-cancel-success">{message}</p>}

      {isPro ? (
        <div className="pro-active-actions">
          <button className="pro-upgrade-button" type="button" disabled>
            <Crown size={17} />
            Pro Active
          </button>

          {cancelAtPeriodEnd ? (
            <>
              <div className="pro-cancellation-status">
                Subscription cancellation scheduled. Your Pro access remains
                active until the end of the current billing period.
              </div>

              <button
                type="button"
                className="pro-reactivate-button"
                onClick={handleReactivateSubscription}
                disabled={reactivateLoading}
              >
                <RotateCcw size={16} />

                {reactivateLoading ? "Reactivating..." : "Keep Pro"}
              </button>
            </>
          ) : (
            <button
              type="button"
              className="pro-cancel-button"
              onClick={handleOpenCancelModal}
            >
              Cancel subscription
            </button>
          )}
        </div>
      ) : (
        <button
          className="pro-upgrade-button"
          type="button"
          onClick={handleUpgrade}
          disabled={loading}
        >
          <Sparkles size={17} />

          {loading ? "Opening checkout..." : "Upgrade to Pro"}
        </button>
      )}

      {showCancelConfirm && (
        <div className="subscription-confirm-overlay">
          <div className="subscription-confirm-card">
            <button
              type="button"
              className="subscription-confirm-close"
              onClick={handleCloseCancelModal}
              disabled={cancelLoading}
              aria-label="Close"
            >
              <X size={18} />
            </button>

            <div className="subscription-warning-icon">
              <AlertTriangle size={24} />
            </div>

            <h3>Cancel TripWise Pro?</h3>

            <p>
              Your Pro features will remain active until the end of your current
              billing period. You will not be charged again after the
              subscription ends.
            </p>

            <div className="subscription-confirm-actions">
              <button
                type="button"
                className="subscription-keep-button"
                onClick={handleCloseCancelModal}
                disabled={cancelLoading}
              >
                Keep Pro
              </button>

              <button
                type="button"
                className="subscription-cancel-confirm-button"
                onClick={handleCancelSubscription}
                disabled={cancelLoading}
              >
                {cancelLoading ? "Cancelling..." : "Confirm cancellation"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProFeaturesCard;
