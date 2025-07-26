import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Monitor, Zap, Shield, Users, Palette, BarChart3, Star, CheckCircle, Play, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { SparklesText } from "@/components/magicui/sparkles-text";
import { Globe } from "@/components/magicui/globe";

function LandingPage(): React.ReactElement {
  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 },
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const fadeInScale = {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.5 },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.02] pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-secondary/10 rounded-full blur-3xl animate-pulse delay-1000" />

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="border-b bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50"
      >
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <motion.div
            className="flex items-center space-x-2"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <div className="relative">
              <Monitor className="h-7 w-7 text-primary" />
              <motion.div
                className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-primary to-secondary rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
            <span className="font-bold text-xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Overaction
            </span>
          </motion.div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" asChild className="hover:bg-primary/10">
              <Link to="/login">Login</Link>
            </Button>
            <Button asChild className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 shadow-lg">
              <Link to="/login">Get Started</Link>
            </Button>
          </div>
        </div>
      </motion.header>

      <main>
        {/* Hero Section */}
        <section className="relative py-32 px-4 overflow-hidden">
          <div className="container mx-auto text-center relative z-10">
            <motion.div {...fadeInUp} className="mb-6">
              <Badge variant="outline" className="mb-6 px-4 py-2 text-sm font-medium border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors">
                <Sparkles className="w-4 h-4 mr-2" />
                Albion Online Streaming Tools
              </Badge>
            </motion.div>

            <motion.div {...fadeInUp} className="mb-8">
              <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                Elevate Your Albion Stream with{" "}
                <SparklesText
                  className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent"
                  colors={{
                    first: "hsl(var(--primary))",
                    second: "hsl(var(--secondary))",
                  }}
                  sparklesCount={15}
                >
                  Custom Overlays
                </SparklesText>
              </h1>
            </motion.div>

            <motion.p
              {...fadeInUp}
              transition={{ delay: 0.2 }}
              className="text-xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed"
            >
              Create stunning Albion Online stream overlays with real-time game integration,
              Twitch bit interactions, and professional layouts that captivate your audience.
            </motion.p>

            <motion.div
              {...fadeInUp}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-6 justify-center items-center"
            >
              <Button size="lg" asChild className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 shadow-xl text-lg px-8 py-6 group">
                <Link to="/login" className="flex items-center">
                  Start Creating
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-primary/20 hover:bg-primary/5 text-lg px-8 py-6 group">
                <Play className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                Watch Demo
              </Button>
            </motion.div>
          </div>

          {/* Globe Background */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] opacity-20 pointer-events-none">
            <Globe className="w-full h-full" />
          </div>
        </section>

        {/* Features Section */}
        <section className="py-32 px-4 bg-gradient-to-r from-muted/20 via-background to-muted/20 relative">
          <div className="container mx-auto relative z-10">
            <motion.div
              {...fadeInUp}
              className="text-center mb-20"
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                Everything You Need for Professional Streams
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Powerful features designed by streamers, for streamers
              </p>
            </motion.div>

            <motion.div
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {[
                {
                  icon: Zap,
                  title: "Real-time Updates",
                  description: "Live data integration with instant updates for followers, donations, and game stats",
                  color: "text-yellow-500",
                },
                {
                  icon: Palette,
                  title: "Custom Design",
                  description: "Fully customizable overlays with drag-and-drop interface and unlimited styling options",
                  color: "text-purple-500",
                },
                {
                  icon: Shield,
                  title: "Secure & Reliable",
                  description: "Enterprise-grade security with 99.9% uptime guarantee for your streaming needs",
                  color: "text-green-500",
                },
                {
                  icon: Users,
                  title: "Multi-platform",
                  description: "Works seamlessly with Twitch, YouTube, and other major streaming platforms",
                  color: "text-blue-500",
                },
                {
                  icon: BarChart3,
                  title: "Analytics Dashboard",
                  description: "Comprehensive analytics to track your stream performance and audience engagement",
                  color: "text-orange-500",
                },
                {
                  icon: Monitor,
                  title: "Easy Integration",
                  description: "Simple setup with one-click integration to your streaming software",
                  color: "text-indigo-500",
                },
              ].map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <motion.div key={index} variants={fadeInScale}>
                    <Card className="group h-full hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 border-primary/10 hover:border-primary/20 bg-card/50 backdrop-blur-sm">
                      <CardHeader className="text-center space-y-4">
                        <motion.div
                          className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-500"
                          whileHover={{ rotate: 5 }}
                        >
                          <Icon className={`h-8 w-8 ${feature.color}`} />
                        </motion.div>
                        <CardTitle className="text-xl group-hover:text-primary transition-colors">
                          {feature.title}
                        </CardTitle>
                        <CardDescription className="text-base leading-relaxed">
                          {feature.description}
                        </CardDescription>
                      </CardHeader>
                    </Card>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </section>

        {/* Social Proof Section */}
        <section className="py-24 px-4">
          <div className="container mx-auto">
            <motion.div
              {...fadeInUp}
              className="text-center mb-16"
            >
              <h3 className="text-2xl font-semibold mb-8 text-muted-foreground">
                Trusted by thousands of streamers worldwide
              </h3>
              <div className="flex justify-center items-center space-x-8 opacity-60">
                {[1, 2, 3, 4, 5].map((_, i) => (
                  <motion.div
                    key={i}
                    className="flex items-center space-x-1"
                    whileHover={{ scale: 1.1 }}
                  >
                    <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />
                  </motion.div>
                ))}
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                4.9/5 stars from 10,000+ streamers
              </p>
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-32 px-4 bg-gradient-to-r from-primary/5 via-background to-secondary/5 relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]" />
          <div className="container mx-auto text-center relative z-10">
            <motion.div {...fadeInUp}>
              <h2 className="text-4xl md:text-5xl font-bold mb-8">
                Ready to Transform Your Stream?
              </h2>
              <p className="text-xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
                Join thousands of streamers who trust Overaction to deliver professional,
                engaging content that grows their communities and maximizes their impact.
              </p>

              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
                <Button size="lg" asChild className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 shadow-xl text-lg px-10 py-6 group">
                  <Link to="/login" className="flex items-center">
                    Get Started Now
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </div>

              <div className="flex justify-center items-center space-x-8 text-sm text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Free 14-day trial</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Cancel anytime</span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="border-t border-primary/10 py-12 px-4 bg-gradient-to-r from-background to-muted/20"
      >
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2">
              <Monitor className="h-5 w-5 text-primary" />
              <span className="font-semibold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Overaction
              </span>
            </div>
            <p className="text-muted-foreground text-sm">
              &copy; 2025 Overaction. All rights reserved.
            </p>
            <div className="flex space-x-6 text-sm text-muted-foreground">
              <motion.a href="#" className="hover:text-primary transition-colors" whileHover={{ scale: 1.05 }}>
                Privacy
              </motion.a>
              <motion.a href="#" className="hover:text-primary transition-colors" whileHover={{ scale: 1.05 }}>
                Terms
              </motion.a>
              <motion.a href="#" className="hover:text-primary transition-colors" whileHover={{ scale: 1.05 }}>
                Support
              </motion.a>
            </div>
          </div>
        </div>
      </motion.footer>
    </div>
  );
}

export default LandingPage;
