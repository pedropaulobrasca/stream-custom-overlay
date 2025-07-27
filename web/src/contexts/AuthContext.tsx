import React, { createContext, useContext, useEffect, useState, ReactNode, useRef } from "react";
import { AuthContextType, User } from "@/types/auth";
import { AuthService } from "@/services/auth";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const callbackProcessing = useRef(false);
  const authService = AuthService.getInstance();

  useEffect(() => {
    initializeAuth();
  }, []);

  useEffect(() => {
    // Handle OAuth callback
    const handleOAuthCallback = async (): Promise<void> => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get("code");
      const state = urlParams.get("state");

      if (code && state && !callbackProcessing.current) {
        console.log("Processing OAuth callback...");
        callbackProcessing.current = true;

        try {
          setIsLoading(true);
          const authData = await authService.handleCallback(code, state);
          setUser(authData.user);
          setToken(authData.token);

          console.log("OAuth callback success, redirecting to dashboard");
          // Clear URL parameters and redirect to dashboard
          window.history.replaceState({}, document.title, "/dashboard");
          window.location.href = "/dashboard";
        } catch (error) {
          console.error("OAuth callback error:", error);

          // Handle different types of auth errors
          if (error instanceof Error && error.message.includes("OAuth state")) {
            console.error("Security error: OAuth state validation failed");
            // Redirect to login with error indication
            window.history.replaceState({}, document.title, "/login?error=security");
          } else {
            console.error("General authentication error");
            // Redirect to login with general error indication
            window.history.replaceState({}, document.title, "/login?error=auth");
          }

          callbackProcessing.current = false;
          setIsLoading(false);
        }
      }
    };

    handleOAuthCallback();
  }, []);

  const initializeAuth = async (): Promise<void> => {
    try {
      const storedToken = authService.getStoredToken();
      const storedUser = authService.getStoredUser();

      if (storedToken && storedUser) {
        // Check if token is expired
        if (!authService.isTokenExpired(storedToken)) {
          setToken(storedToken);
          setUser(storedUser);
        } else {
          // Token expired, clear data
          authService.logout();
        }
      }
    } catch (error) {
      console.error("Auth initialization error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (): Promise<void> => {
    try {
      setIsLoading(true);
      const authUrl = await authService.initializeAuth();

      // Redirect to Twitch OAuth
      window.location.href = authUrl;
    } catch (error) {
      console.error("Login error:", error);
      setIsLoading(false);
      throw error;
    }
  };

  const logout = (): void => {
    authService.logout();
    setUser(null);
    setToken(null);
  };

  const contextValue: AuthContextType = {
    user,
    token,
    login,
    logout,
    isLoading,
    isAuthenticated: !!user && !!token,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
