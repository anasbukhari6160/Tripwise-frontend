import { ArrowLeft, XCircle } from "lucide-react";

import { useNavigate } from "react-router-dom";

import "../styles/payment.css";

function PaymentCancelPage() {
  const navigate = useNavigate();

  return (
    <main className="payment-page">
      <div className="payment-card">
        <div className="payment-icon-wrapper cancel-animation">
          <div className="payment-icon-cancel-ring" />

          <div className="payment-icon cancelled">
            <XCircle size={38} />
          </div>
        </div>

        <span className="payment-label cancelled-label payment-content-animate">
          PAYMENT CANCELLED
        </span>

        <h1 className="payment-content-animate">No changes were made.</h1>

        <p className="payment-content-animate">
          Your TripWise account remains on its current plan. You can upgrade
          whenever you're ready.
        </p>

        <button
          type="button"
          className="payment-primary-button payment-content-animate"
          onClick={() => navigate("/dashboard")}
        >
          <ArrowLeft size={17} />
          Back to Dashboard
        </button>
      </div>
    </main>
  );
}

export default PaymentCancelPage;
