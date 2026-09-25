import { useEffect, useRef, useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";

import { googleLogin } from "../../services/auth.service";

function GoogleAuthButton({ onError }) {
  const navigate = useNavigate();

  const containerRef = useRef(null);
  const [buttonWidth, setButtonWidth] = useState(400);

  useEffect(() => {
    const container = containerRef.current;

    if (!container) {
      return;
    }

    function updateWidth() {
      const width = container.clientWidth;

      setButtonWidth(Math.min(width, 400));
    }

    updateWidth();

    const observer = new ResizeObserver(updateWidth);

    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  }, []);

  async function handleGoogleSuccess(credentialResponse) {
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
    }
  }

  function handleGoogleError() {
    if (onError) {
      onError("Unable to sign in with Google. Please try again.");
    }
  }

  return (
    <div className="google-auth-container" ref={containerRef}>
      <GoogleLogin
        onSuccess={handleGoogleSuccess}
        onError={handleGoogleError}
        theme="filled_black"
        size="large"
        shape="pill"
        text="continue_with"
        logo_alignment="left"
        width={buttonWidth}
      />
    </div>
  );
}

export default GoogleAuthButton;
