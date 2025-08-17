import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Zap, Shield } from 'lucide-react';
import AnimatedBackground from '@/components/AnimatedBackground';
import aiLogo from '@/assets/ai-logo.svg';

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    const userEmail = localStorage.getItem('userEmail');
    if (userEmail) {
      navigate('/chat');
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-background relative overflow-hidden dark">
      {/* Enhanced Animated background */}
      <AnimatedBackground />
      
      <div className="relative z-10">
        {/* Header */}
        <header className="container mx-auto px-4 py-6">
          <nav className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative w-12 h-12 flex items-center justify-center">
                <img src={aiLogo} alt="AI Logo" className="w-10 h-10" />
              </div>
              <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                AI Model Assistant
              </span>
            </div>
            
            <div className="flex space-x-4">
              <Button variant="outline" asChild className="border-border/50 hover:bg-primary/10">
                <Link to="/login">Sign In</Link>
              </Button>
              <Button asChild className="bg-gradient-button hover:opacity-90 shadow-glow">
                <Link to="/signup">Get Started</Link>
              </Button>
            </div>
          </nav>
        </header>

        {/* Hero Section */}
        <main className="container mx-auto px-4 py-20 text-center">
          <div className="max-w-4xl mx-auto animate-fade-in">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                Find the Perfect
              </span>
              <br />
              <span className="text-foreground">AI Model</span>
            </h1>
            
            <p className="text-xl text-foreground/80 mb-8 max-w-2xl mx-auto font-medium bg-card/20 backdrop-blur-sm p-4 rounded-lg border border-border/30">
              Get personalized AI model recommendations based on your specific requirements. 
              Our intelligent assistant analyzes your needs and suggests the best solutions.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <Button 
                size="lg" 
                asChild 
                className="bg-gradient-button hover:opacity-90 shadow-glow text-lg px-8 py-6 text-primary-foreground font-semibold"
              >
                <Link to="/signup">Start Your AI Journey</Link>
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                asChild 
                className="border-accent/50 text-accent hover:bg-accent/10 hover:border-accent text-lg px-8 py-6 hover:shadow-glow transition-all duration-300 backdrop-blur-sm"
              >
                <Link to="/login">Already have an account?</Link>
              </Button>
            </div>

            {/* Features */}
            <div className="grid md:grid-cols-3 gap-8 mt-20">
              <Card className="bg-card/50 backdrop-blur-sm border-border/50 hover:shadow-glow hover:scale-105 transition-all duration-300 group animate-fade-in">
                <CardHeader className="text-center">
                  <div className="mx-auto w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center mb-4 group-hover:animate-neon-glow transition-transform">
                    <Sparkles className="w-6 h-6 text-primary-foreground group-hover:animate-spin" />
                  </div>
                  <CardTitle className="text-primary">Smart Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Our AI analyzes your requirements and suggests the most suitable models for your specific use case.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="bg-card/50 backdrop-blur-sm border-border/50 hover:shadow-glow hover:scale-105 transition-all duration-300 group animate-fade-in delay-200">
                <CardHeader className="text-center">
                  <div className="mx-auto w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center mb-4 group-hover:animate-neon-glow transition-transform">
                    <Zap className="w-6 h-6 text-primary-foreground group-hover:animate-bounce" />
                  </div>
                  <CardTitle className="text-primary">Real-time Pricing</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Get up-to-date pricing information and cost comparisons to make informed decisions about your AI investments.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="bg-card/50 backdrop-blur-sm border-border/50 hover:shadow-glow hover:scale-105 transition-all duration-300 group animate-fade-in delay-500">
                <CardHeader className="text-center">
                  <div className="mx-auto w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center mb-4 group-hover:animate-neon-glow transition-transform">
                    <Shield className="w-6 h-6 text-primary-foreground group-hover:animate-pulse" />
                  </div>
                  <CardTitle className="text-primary">Expert Guidance</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Receive detailed reports and expert insights to help you choose the right AI solution for your business.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
