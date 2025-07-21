import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Monitor, Zap, Shield, Users, Palette, BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";

function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Monitor className="h-6 w-6" />
            <span className="font-bold text-xl">Stream Custom Overlay</span>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" asChild>
              <Link to="/login">Login</Link>
            </Button>
            <Button asChild>
              <Link to="/login">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      <main>
        <section className="py-20 px-4">
          <div className="container mx-auto text-center">
            <Badge variant="outline" className="mb-4">
              Professional Streaming Tools
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Elevate Your Stream with
              <span className="text-primary"> Custom Overlays</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Create stunning, interactive overlays for your streams with real-time data integration, 
              custom animations, and professional layouts that engage your audience.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link to="/login" className="flex items-center">
                  Start Creating <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline">
                Watch Demo
              </Button>
            </div>
          </div>
        </section>

        <section className="py-20 px-4 bg-muted/20">
          <div className="container mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">
              Everything You Need for Professional Streams
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card>
                <CardHeader>
                  <Zap className="h-8 w-8 text-primary mb-2" />
                  <CardTitle>Real-time Updates</CardTitle>
                  <CardDescription>
                    Live data integration with instant updates for followers, donations, and game stats
                  </CardDescription>
                </CardHeader>
              </Card>
              
              <Card>
                <CardHeader>
                  <Palette className="h-8 w-8 text-primary mb-2" />
                  <CardTitle>Custom Design</CardTitle>
                  <CardDescription>
                    Fully customizable overlays with drag-and-drop interface and unlimited styling options
                  </CardDescription>
                </CardHeader>
              </Card>
              
              <Card>
                <CardHeader>
                  <Shield className="h-8 w-8 text-primary mb-2" />
                  <CardTitle>Secure & Reliable</CardTitle>
                  <CardDescription>
                    Enterprise-grade security with 99.9% uptime guarantee for your streaming needs
                  </CardDescription>
                </CardHeader>
              </Card>
              
              <Card>
                <CardHeader>
                  <Users className="h-8 w-8 text-primary mb-2" />
                  <CardTitle>Multi-platform</CardTitle>
                  <CardDescription>
                    Works seamlessly with Twitch, YouTube, and other major streaming platforms
                  </CardDescription>
                </CardHeader>
              </Card>
              
              <Card>
                <CardHeader>
                  <BarChart3 className="h-8 w-8 text-primary mb-2" />
                  <CardTitle>Analytics Dashboard</CardTitle>
                  <CardDescription>
                    Comprehensive analytics to track your stream performance and audience engagement
                  </CardDescription>
                </CardHeader>
              </Card>
              
              <Card>
                <CardHeader>
                  <Monitor className="h-8 w-8 text-primary mb-2" />
                  <CardTitle>Easy Integration</CardTitle>
                  <CardDescription>
                    Simple setup with one-click integration to your streaming software
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>

        <section className="py-20 px-4">
          <div className="container mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Ready to Transform Your Stream?</h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of streamers who trust Stream Custom Overlay to deliver professional, 
              engaging content to their audiences.
            </p>
            <Button size="lg" asChild>
              <Link to="/login" className="flex items-center">
                Get Started Now <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t py-8 px-4">
        <div className="container mx-auto text-center text-muted-foreground">
          <p>&copy; 2024 Stream Custom Overlay. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;