import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

function AuthCallbackPage() {
  const navigate = useNavigate();
  const { isLoading } = useAuth();

  useEffect(() => {
    // The OAuth callback handling is already done in AuthContext
    // If we reach this page and are not loading, redirect based on auth status
    if (!isLoading) {
      // Small delay to ensure auth processing is complete
      setTimeout(() => {
        navigate("/dashboard");
      }, 100);
    }
  }, [isLoading, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/20">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
        <h2 className="text-lg font-semibold mb-2">Completing Authentication</h2>
        <p className="text-muted-foreground">Please wait while we sign you in...</p>
      </div>
    </div>
  );
}

export default AuthCallbackPage;
