import { useEffect, useState } from "react";
import { CheckCircle2, Clock3, AlertCircle } from "lucide-react";

import { useNavigate, useSearchParams } from "react-router-dom";

import { verifyPaymentSession } from "../services/payment.service";

import "../styles/payment.css";

function PaymentSuccessPage() {
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();

  const [status, setStatus] = useState("checking");

  const [message, setMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    const sessionId = searchParams.get("session_id");

    async function verifyPayment() {
      if (!sessionId) {
        setStatus("error");
        setMessage("Stripe checkout session was not found.");
        return;
      }

      for (let attempt = 0; attempt < 8; attempt += 1) {
        try {
          const data = await verifyPaymentSession(sessionId);

          if (cancelled) {
            return;
          }

          if (data.success && data.plan === "pro") {
            setStatus("success");
            return;
          }

          if (data.status === "pending") {
            await new Promise((resolve) => setTimeout(resolve, 1500));

            continue;
          }
        } catch (error) {
          console.error("Payment verification error:", error);

          if (attempt === 7) {
            setStatus("error");
            setMessage(error.message);
            return;
          }
        }

        await new Promise((resolve) => setTimeout(resolve, 1500));
      }

      if (!cancelled) {
        setStatus("pending");
      }
    }

    verifyPayment();

    return () => {
      cancelled = true;
    };
  }, [searchParams]);

  return (
    <main className="payment-page">
      <div className="payment-card">
        {status === "success" && (
          <>
            <div className="payment-icon-wrapper success-animation">
              <div className="payment-icon-ring" />

              <div className="payment-icon success">
                <CheckCircle2 size={38} />
              </div>
            </div>

            <span className="payment-label payment-content-animate">
              PAYMENT SUCCESSFUL
            </span>

            <h1 className="payment-content-animate">
              Welcome to TripWise Pro.
            </h1>

            <p className="payment-content-animate">
              Your subscription is active and your premium features are now
              unlocked.
            </p>

            <button
              type="button"
              className="payment-primary-button payment-content-animate"
              onClick={() => navigate("/dashboard")}
            >
              Go to Dashboard
            </button>
          </>
        )}

        {status === "checking" && (
          <>
            <div className="payment-icon pending">
              <Clock3 size={34} />
            </div>

            <span className="payment-label">ACTIVATING PRO</span>

            <h1>Confirming your subscription...</h1>

            <p>
              Your payment was completed. TripWise is securely confirming your
              subscription with Stripe.
            </p>

            <div className="payment-loader" />
          </>
        )}

        {status === "pending" && (
          <>
            <div className="payment-icon pending">
              <Clock3 size={34} />
            </div>

            <span className="payment-label">PAYMENT PROCESSING</span>

            <h1>Your payment is being processed.</h1>

            <p>
              Your Stripe payment is still being confirmed. Your account will
              update when confirmation is complete.
            </p>

            <button
              type="button"
              className="payment-primary-button"
              onClick={() => window.location.reload()}
            >
              Check Again
            </button>

            <button
              type="button"
              className="payment-secondary-button"
              onClick={() => navigate("/dashboard")}
            >
              Return to Dashboard
            </button>
          </>
        )}

        {status === "error" && (
          <>
            <div className="payment-icon error">
              <AlertCircle size={34} />
            </div>

            <span className="payment-label payment-error-label">
              VERIFICATION ISSUE
            </span>

            <h1>We couldn't verify the payment yet.</h1>

            <p>{message || "Please try checking your payment again."}</p>

            <button
              type="button"
              className="payment-primary-button"
              onClick={() => window.location.reload()}
            >
              Try Again
            </button>

            <button
              type="button"
              className="payment-secondary-button"
              onClick={() => navigate("/dashboard")}
            >
              Return to Dashboard
            </button>
          </>
        )}
      </div>
    </main>
  );
}

export default PaymentSuccessPage;
