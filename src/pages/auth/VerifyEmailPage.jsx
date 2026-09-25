import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import AuthLayout from "../../components/auth/AuthLayout";

import {
  verifyEmail,
  resendVerificationCode,
} from "../../services/auth.service";

function VerifyEmailPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const email = searchParams.get("email") || "";

  const [digits, setDigits] = useState(["", "", "", "", "", ""]);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [resendMessage, setResendMessage] = useState("");

  const inputRefs = useRef([]);

  useEffect(() => {
    if (resendTimer <= 0) {
      return;
    }

    const timer = setTimeout(() => {
      setResendTimer((previous) => previous - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [resendTimer]);

  async function handleResend() {
    try {
      setError("");
      setResendMessage("");

      const data = await resendVerificationCode(email);

      setResendMessage(data.message);
      setResendTimer(60);
      setDigits(["", "", "", "", "", ""]);

      inputRefs.current[0]?.focus();
    } catch (error) {
      setError(error.message);
    }
  }

  function handleChange(index, value) {
    const digit = value.replace(/\D/g, "").slice(-1);

    const updatedDigits = [...digits];

    updatedDigits[index] = digit;

    setDigits(updatedDigits);

    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index, event) {
    if (event.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handlePaste(event) {
    event.preventDefault();

    const pastedValue = event.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);

    if (!pastedValue) {
      return;
    }

    const updatedDigits = Array(6).fill("");

    pastedValue.split("").forEach((digit, index) => {
      updatedDigits[index] = digit;
    });

    setDigits(updatedDigits);

    const nextIndex = Math.min(pastedValue.length, 5);

    inputRefs.current[nextIndex]?.focus();
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setResendMessage("");

    const code = digits.join("");

    if (code.length !== 6) {
      setError("Please enter the 6-digit verification code.");
      return;
    }

    try {
      setLoading(true);

      await verifyEmail(email, code);

      navigate("/login");
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Check Your Email"
      subtitle="Enter the 6-digit verification code sent to your email."
    >
      <div className="verification-email">{email}</div>

      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="verification-code-group">
          {digits.map((digit, index) => (
            <input
              key={index}
              ref={(element) => {
                inputRefs.current[index] = element;
              }}
              className="verification-code-box"
              type="text"
              inputMode="numeric"
              autoComplete={index === 0 ? "one-time-code" : "off"}
              maxLength="1"
              value={digit}
              onChange={(event) => handleChange(index, event.target.value)}
              onKeyDown={(event) => handleKeyDown(index, event)}
              onPaste={handlePaste}
              aria-label={`Verification digit ${index + 1}`}
            />
          ))}
        </div>

        {error && <p className="form-error">{error}</p>}

        <button className="primary-button" type="submit" disabled={loading}>
          {loading ? "Verifying..." : "Verify Email"}
        </button>
      </form>

      <p className="verification-note">This code expires in 10 minutes.</p>

      <div className="resend-section">
        {resendMessage && <p className="form-success">{resendMessage}</p>}

        {resendTimer > 0 ? (
          <p className="resend-timer">Resend code in {resendTimer}s</p>
        ) : (
          <button type="button" className="text-button" onClick={handleResend}>
            Resend Code
          </button>
        )}
      </div>
    </AuthLayout>
  );
}

export default VerifyEmailPage;
