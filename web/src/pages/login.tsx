import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoginButton } from "@/components/auth/LoginButton";
import { LoginForm } from "@/components/LoginForm";
import { Monitor, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function LoginPage(): React.ReactElement {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loginMethod, setLoginMethod] = useState<"form" | "oauth">("form");

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const handleFormLogin = async (values: { email: string; password: string }) => {
    // TODO: Implement email/password login
    console.log("Form login:", values);
    // For now, show a message that this is not implemented
    alert("Email/password login not yet implemented. Please use Twitch login.");
  };

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
              Sign in to access your Albion Online stream overlay dashboard and create amazing content for your audience.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex justify-center space-x-4 mb-6">
              <Button
                variant={loginMethod === "form" ? "default" : "outline"}
                onClick={() => setLoginMethod("form")}
                size="sm"
              >
                Email & Password
              </Button>
              <Button
                variant={loginMethod === "oauth" ? "default" : "outline"}
                onClick={() => setLoginMethod("oauth")}
                size="sm"
              >
                Twitch OAuth
              </Button>
            </div>

            {loginMethod === "form" ? (
              <div className="space-y-4">
                <LoginForm onSubmit={handleFormLogin} />

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator className="w-full" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Or continue with
                    </span>
                  </div>
                </div>

                <div className="flex justify-center">
                  <LoginButton />
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-4">
                <LoginButton />
              </div>
            )}

            <div className="text-center text-sm text-muted-foreground">
              By signing in, you agree to our Terms of Service and Privacy Policy
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
