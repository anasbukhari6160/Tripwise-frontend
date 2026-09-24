import { Link } from "react-router-dom";
import AuthLayout from "../../components/auth/AuthLayout";

function ForgotPasswordPage() {
  function handleSubmit(event) {
    event.preventDefault();
  }

  return (
    <AuthLayout
      title="Forgot Password?"
      subtitle="Enter your email and we'll send you instructions to recover your TripWise account."
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

        <button className="primary-button" type="submit">
        Send Recovery Email
        </button>
      </form>

      <p className="auth-switch forgot-switch">
        Remember your password? <Link to="/login">Sign In</Link>
      </p>
    </AuthLayout>
  );
}

export default ForgotPasswordPage;
