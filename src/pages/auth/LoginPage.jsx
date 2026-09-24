import { Link } from "react-router-dom";
import AuthLayout from "../../components/auth/AuthLayout";

function LoginPage() {
  function handleSubmit(event) {
    event.preventDefault();
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
            type="email"
            placeholder="example@gmail.com"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password*</label>

          <input
            id="password"
            type="password"
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

        <button className="primary-button" type="submit">
           Sign In
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
