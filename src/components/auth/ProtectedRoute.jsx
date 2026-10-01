import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

import { getCurrentUser } from "../../services/auth.service";

function ProtectedRoute({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    async function checkAuthentication() {
      try {
        await getCurrentUser();
        if (active) setIsAuthenticated(true);
      } catch (error) {
        if (!active) return;
        if (error.status === 401 || error.status === 404) {
          setIsAuthenticated(false);
        } else {
          setError(error.message);
        }
      }
    }

    checkAuthentication();
    return () => { active = false; };
  }, []);

  if (error) return <p role="alert">{error} Refresh the page to try again.</p>;

  if (isAuthenticated === null) {
    return <p>Loading...</p>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;
