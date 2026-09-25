import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import AuthLayout from "../../components/auth/AuthLayout";
import { forgotPassword } from "../../services/auth.service";

function ForgotPasswordPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");

    try {
      setLoading(true);

      await forgotPassword(email);

      navigate(`/reset-password?email=${encodeURIComponent(email)}`);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Forgot Password?"
      subtitle="Enter your email address and we'll send you a reset code."
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email address*</label>

          <input
            id="email"
            name="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="example@gmail.com"
            required
          />
        </div>

        {error && <p className="form-error">{error}</p>}

        <button className="primary-button" type="submit" disabled={loading}>
          {loading ? "Sending code..." : "Send Reset Code"}
        </button>
      </form>

      <p className="auth-switch">
        Remember your password? <Link to="/login">Sign In</Link>
      </p>
    </AuthLayout>
  );
}

export default ForgotPasswordPage;
