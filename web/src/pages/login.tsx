import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoginButton } from "@/components/auth/LoginButton";
import { Monitor, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function LoginPage(): React.ReactElement {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <Button variant="ghost" asChild className="self-start mb-4">
            <Link to="/" className="flex items-center">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </Button>

          <div className="flex items-center space-x-2 mb-2">
            <Monitor className="h-8 w-8 text-primary" />
            <span className="font-bold text-2xl">Overaction</span>
          </div>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Welcome Back</CardTitle>
            <CardDescription>
              Sign in to access your stream overlay dashboard and create amazing content for your audience.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center space-y-4">
              <LoginButton />

              <div className="text-center text-sm text-muted-foreground">
                By signing in, you agree to our Terms of Service and Privacy Policy
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>New to Overaction?</p>
          <p className="mt-1">
            Sign in with your Twitch account to get started and unlock all features.
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
