import { useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import AuthLayout from "../../components/auth/AuthLayout";
import { resetPassword } from "../../services/auth.service";

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const email = searchParams.get("email") || "";

  const [digits, setDigits] = useState(["", "", "", "", "", ""]);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const inputRefs = useRef([]);

  function handleCodeChange(index, value) {
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

    const code = digits.join("");

    if (code.length !== 6) {
      setError("Please enter the 6-digit reset code.");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      await resetPassword(email, code, newPassword);

      navigate("/login");
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Reset Your Password"
      subtitle="Enter the reset code and create a new password."
    >
      <div className="verification-email">{email}</div>

      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Reset Code*</label>

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
                maxLength="1"
                value={digit}
                onChange={(event) =>
                  handleCodeChange(index, event.target.value)
                }
                onKeyDown={(event) => handleKeyDown(index, event)}
                onPaste={handlePaste}
                aria-label={`Reset code digit ${index + 1}`}
              />
            ))}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="newPassword">New Password*</label>

          <input
            id="newPassword"
            type="password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            placeholder="Enter new password"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password*</label>

          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            placeholder="Confirm new password"
            required
          />
        </div>

        {error && <p className="form-error">{error}</p>}

        <button className="primary-button" type="submit" disabled={loading}>
          {loading ? "Resetting password..." : "Reset Password"}
        </button>
      </form>

      <p className="auth-switch">
        Back to <Link to="/login">Sign In</Link>
      </p>
    </AuthLayout>
  );
}

export default ResetPasswordPage;
