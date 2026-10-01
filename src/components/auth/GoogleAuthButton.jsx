import { useRef, useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";

import { googleLogin } from "../../services/auth.service";

function GoogleAuthButton({ onError }) {
  const navigate = useNavigate();

  const pendingRef = useRef(false);
  const [loading, setLoading] = useState(false);

  async function handleGoogleSuccess(credentialResponse) {
    if (pendingRef.current) return;
    pendingRef.current = true;
    setLoading(true);
    try {
      if (!credentialResponse.credential) {
        throw new Error("Google authentication failed.");
      }

      await googleLogin(credentialResponse.credential);

      navigate("/dashboard");
    } catch (error) {
      if (onError) {
        onError(error.message);
      }
    } finally {
      pendingRef.current = false;
      setLoading(false);
    }
  }

  function handleGoogleError() {
    if (onError) {
      onError("Unable to sign in with Google. Please try again.");
    }
  }

  return (
    <div className="google-auth-container" aria-busy={loading}>
      <GoogleLogin
        onSuccess={handleGoogleSuccess}
        onError={handleGoogleError}
        theme="filled_black"
        size="large"
        shape="pill"
        text="continue_with"
        logo_alignment="left"
      />

      {loading && (
        <span className="google-auth-loading" role="status">
          <span className="google-auth-spinner" aria-hidden="true" />
          Signing in...
        </span>
      )}
    </div>
  );
}

export default GoogleAuthButton;
