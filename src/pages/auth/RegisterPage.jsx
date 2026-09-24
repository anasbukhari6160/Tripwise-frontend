import { Link } from "react-router-dom";
import AuthLayout from "../../components/auth/AuthLayout";

function RegisterPage() {
  function handleSubmit(event) {
    event.preventDefault();
  }

  return (
    <AuthLayout
      title="Create Your Account"
      subtitle="Create your TripWise account and start planning smarter journeys."
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Full Name*</label>

          <input
            id="name"
            type="text"
            placeholder="Syed Anas Bukhari"
            required
          />
        </div>

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
            placeholder="Create your password"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password*</label>

          <input
            id="confirmPassword"
            type="password"
            placeholder="Confirm your password"
            required
          />
        </div>

        <button className="primary-button" type="submit">
        Register
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
        Already have an account? <Link to="/login">Sign In</Link>
      </p>
    </AuthLayout>
  );
}

export default RegisterPage;
