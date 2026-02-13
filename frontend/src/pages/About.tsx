import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Zap, Shield, Sparkles, ArrowRight } from "lucide-react";
import Logo from "@/components/Logo";

const About = () => {
  return (
    <div className="min-h-screen bg-gradient-hero">
      <Navbar />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        {/* Hero Section */}
        <div className="text-center mb-16 animate-fade-in">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="relative">
              <Logo size={120} className="animate-float" />
              <div className="absolute inset-0 blur-3xl opacity-20 bg-primary/50 rounded-full" />
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-foreground drop-shadow-glow">
            SmartBot Builder
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            The future of AI-powered automation. Build intelligent chatbots that understand, learn, and adapt to your business needs.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 animate-slide-up">
          <div className="p-8 rounded-2xl border border-border/50 bg-gradient-card backdrop-blur-sm hover:shadow-glow transition-all duration-500 group">
            <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 w-fit mb-4 group-hover:animate-glow-pulse">
              <Zap className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-foreground">Lightning Fast</h3>
            <p className="text-muted-foreground">
              Deploy production-ready chatbots in minutes, not weeks. Our streamlined interface makes AI accessible to everyone.
            </p>
          </div>

          <div className="p-8 rounded-2xl border border-border/50 bg-gradient-card backdrop-blur-sm hover:shadow-glow-accent transition-all duration-500 group">
            <div className="p-3 rounded-lg bg-accent/10 border border-accent/20 w-fit mb-4 group-hover:animate-glow-pulse">
              <Sparkles className="h-8 w-8 text-accent" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-foreground">AI-Powered</h3>
            <p className="text-muted-foreground">
              Leverage cutting-edge natural language processing to create bots that truly understand and engage with your users.
            </p>
          </div>

          <div className="p-8 rounded-2xl border border-border/50 bg-gradient-card backdrop-blur-sm hover:shadow-glow transition-all duration-500 group">
            <div className="p-3 rounded-lg bg-secondary/10 border border-secondary/20 w-fit mb-4 group-hover:animate-glow-pulse">
              <Shield className="h-8 w-8 text-secondary" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-foreground">Enterprise Ready</h3>
            <p className="text-muted-foreground">
              Built with security and scalability in mind. Your data is protected with industry-standard encryption.
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto space-y-8 mb-16 animate-slide-up" style={{ animationDelay: "0.2s" }}>
          <div className="p-8 rounded-2xl border border-border/50 bg-gradient-card backdrop-blur-sm">
            <h2 className="text-3xl font-bold mb-4 text-foreground">What is SmartBot Builder?</h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-4">
              SmartBot Builder is a revolutionary platform that empowers businesses and developers to create sophisticated AI chatbots without writing a single line of code. Our intuitive interface combined with powerful AI capabilities makes automation accessible to everyone.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Whether you're looking to automate customer support, boost sales, or streamline internal processes, SmartBot Builder provides the tools you need to succeed in the AI-powered future.
            </p>
          </div>

          <div className="p-8 rounded-2xl border border-border/50 bg-gradient-card backdrop-blur-sm">
            <h2 className="text-3xl font-bold mb-4 text-foreground">How It Works</h2>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 border border-primary flex items-center justify-center text-primary font-bold">
                  1
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Create Your Bot</h3>
                  <p className="text-muted-foreground">
                    Give your chatbot a name and define its purpose. Our AI will help you get started.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent/20 border border-accent flex items-center justify-center text-accent font-bold">
                  2
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Train with Your Data</h3>
                  <p className="text-muted-foreground">
                    Upload documents, FAQs, or knowledge bases to teach your bot about your business.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary/20 border border-secondary flex items-center justify-center text-secondary font-bold">
                  3
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Deploy & Scale</h3>
                  <p className="text-muted-foreground">
                    Launch your bot and watch it handle thousands of conversations simultaneously.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center animate-slide-up" style={{ animationDelay: "0.3s" }}>
          <div className="p-12 rounded-2xl border border-border/50 bg-gradient-card backdrop-blur-sm relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-ai opacity-10" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
                Ready to Build Your First Bot?
              </h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Join thousands of businesses already using SmartBot Builder to automate their workflows and delight their customers.
              </p>
              <Link to="/">
                <Button size="lg" className="bg-gradient-button hover:shadow-glow transition-all duration-300 text-lg px-8">
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default About;
