import React from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { LogIn } from "lucide-react";

export function LoginButton(): React.ReactElement {
  const { login, isLoading } = useAuth();

  const handleLogin = async (): Promise<void> => {
    try {
      await login();
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <Button
      onClick={handleLogin}
      disabled={isLoading}
      className="bg-purple-600 hover:bg-purple-700 text-white"
    >
      <LogIn className="w-4 h-4 mr-2" />
      {isLoading ? "Connecting..." : "Login with Twitch"}
    </Button>
  );
}
