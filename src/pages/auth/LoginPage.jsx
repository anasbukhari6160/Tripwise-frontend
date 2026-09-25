import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import AuthLayout from "../../components/auth/AuthLayout";
import { loginUser } from "../../services/auth.service";

function LoginPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");

    try {
      setLoading(true);

      await loginUser({
        email: formData.email,
        password: formData.password,
      });

      navigate("/dashboard");
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Welcome Back!"
      subtitle="Sign in to access your trips, weather insights and travel plans."
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email address*</label>

          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="example@gmail.com"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password*</label>

          <input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password"
            required
          />
        </div>

        <div className="login-options">
          <label className="remember-me">
            <input type="checkbox" />
            <span>Remember me</span>
          </label>

          <Link to="/forgot-password">Forgot Password?</Link>
        </div>

        {error && <p className="form-error">{error}</p>}

        <button className="primary-button" type="submit" disabled={loading}>
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>

      <div className="divider">
        <span>Or continue with</span>
      </div>

      <button className="social-button" type="button">
        <span className="google-icon">G</span>
        Google
      </button>

      <p className="auth-switch">
        Don't have an account? <Link to="/register">Sign Up</Link>
      </p>
    </AuthLayout>
  );
}

export default LoginPage;
