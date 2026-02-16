import { useState, useEffect, useRef } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ChatbotCard from "@/components/ChatbotCard";
import ChatInterface from "@/components/ChatInterface";
import { Sparkles, Globe, MessageSquare, PlusCircle, BarChart3, Bot, Download } from "lucide-react";
import { toast } from "sonner";
import BotIcon from "@/components/icons/BotIcon";
import BotFocus from "@/components/icons/BotFocus";
import Logo from "@/components/Logo";
import { Link, useLocation } from "react-router-dom";
import { API_BASE_URL } from "@/config";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth, getAuthHeader } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";

interface Chatbot {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  location: string;
  message_count: number;
}

const Dashboard = () => {
  const [chatbots, setChatbots] = useState<Chatbot[]>([]);
  const [selectedChatbot, setSelectedChatbot] = useState<string | null>(null);

  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isImporting, setIsImporting] = useState(false);
  const { user } = useAuth();
  const location = useLocation();
  const chatSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if there is a hash in the URL and scroll to it
    if (location.hash === '#my-chatbots') {
      const element = document.getElementById('my-chatbots');
      if (element) {
        // Add a small delay to ensure loading state doesn't interfere too much, 
        // though with cache it should be fast.
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
  }, [location.hash, isLoading]); // Re-run when hash changes or loading finishes

  useEffect(() => {
    // Load from cache first
    const cached = sessionStorage.getItem('dashboard_chatbots');
    if (cached) {
      setChatbots(JSON.parse(cached));
      setIsLoading(false);
    }
    fetchChatbots();
  }, []);

  const fetchChatbots = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/organizations`, {
        headers: {
          ...getAuthHeader(),
        },
      });
      const data = await response.json();

      if (Array.isArray(data)) {
        const formattedBots = data.map((org: any) => ({
          id: org.id,
          name: org.name,
          description: org.description,
          createdAt: new Date(org.created_at).toISOString().split('T')[0],
          location: org.location || "Global",
          message_count: org.message_count || 0
        }));
        setChatbots(formattedBots);
        sessionStorage.setItem('dashboard_chatbots', JSON.stringify(formattedBots));
      }
    } catch (error) {
      console.error("Error fetching chatbots:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMessageUpdate = (botId: string, delta: number) => {
    setChatbots(prev => {
      const updated = prev.map(bot => {
        if (bot.id === botId) {
          return { ...bot, message_count: Math.max(0, (bot.message_count || 0) + delta) };
        }
        return bot;
      });
      sessionStorage.setItem('dashboard_chatbots', JSON.stringify(updated));
      return updated;
    });
  };

  const handleChatWithBot = (botId: string, botName: string) => {
    setSelectedChatbot(botName);
    setSelectedOrgId(botId);

    // Smooth scroll to chat section after a brief delay to allow render
    setTimeout(() => {
      chatSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleCloseChat = () => {
    setSelectedChatbot(null);
    setSelectedOrgId(null);
  };

  const handleDeleteBot = async (botId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/bot/${botId}`, {
        method: 'DELETE',
        headers: {
          ...getAuthHeader(),
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete bot');
      }

      setChatbots((prev) => prev.filter((bot) => bot.id !== botId));

      // Clear chat if deleted bot was selected
      if (selectedOrgId === botId) {
        setSelectedChatbot(null);
        setSelectedOrgId(null);
      }
    } catch (error) {
      console.error('Error deleting bot:', error);
    }
  };

  const handleImportBot = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsImporting(true);
      const text = await file.text();
      const data = JSON.parse(text);

      const response = await fetch(`${API_BASE_URL}/bot/import`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Import failed');
      }

      // Refresh list
      fetchChatbots();
      toast.success("Bot imported successfully!");
    } catch (error: any) {
      console.error('Import error:', error);
      toast.error(error.message || 'Failed to import bot');
    } finally {
      setIsImporting(false);
      // Reset input
      e.target.value = '';
    }
  };

  const totalMessages = chatbots.reduce((sum, bot) => sum + (bot.message_count || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Navbar />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-12">
        {/* Hero Section */}
        <div className="text-center mb-8 animate-fade-in relative z-10">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-primary/20 blur-[120px] rounded-full -z-10 pointer-events-none" />

          <div className="flex items-center justify-center gap-3 mb-6">
            <Logo size={100} className="animate-float filter drop-shadow-[0_0_15px_rgba(124,58,237,0.3)]" />
          </div>

          <h1 className="text-4xl md:text-5xl font-bold mb-3 tracking-tight text-foreground">
            {user ? `Welcome back, ${user.email.split('@')[0]}` : 'SmartBot Dashboard'}
          </h1>
          <p className="text-lg text-muted-foreground/80 max-w-2xl mx-auto leading-relaxed">
            Orchestrate your AI workforce. Monitor performance, manage bots, and expand your digital capabilities.
          </p>
        </div>

        {/* Stats Cards */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 animate-slide-up relative z-10">
          <Card className="bg-glass-bg backdrop-blur-md border-glass-border hover:border-primary/50 transition-all duration-300 group hover:shadow-glow">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 group-hover:bg-primary/20 transition-colors">
                <Bot className="h-8 w-8 text-primary group-hover:scale-110 transition-transform duration-300" />
              </div>
              <div>
                <p className="text-3xl font-bold text-foreground tracking-tight">{chatbots.length}</p>
                <p className="text-sm text-muted-foreground group-hover:text-primary/80 transition-colors">Total Bots Active</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-glass-bg backdrop-blur-md border-glass-border hover:border-accent/50 transition-all duration-300 group hover:shadow-glow-accent">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-accent/10 border border-accent/20 group-hover:bg-accent/20 transition-colors">
                <MessageSquare className="h-8 w-8 text-accent group-hover:scale-110 transition-transform duration-300" />
              </div>
              <div>
                <p className="text-3xl font-bold text-foreground tracking-tight">{totalMessages}</p>
                <p className="text-sm text-muted-foreground group-hover:text-accent/80 transition-colors">Total Interactions</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-glass-bg backdrop-blur-md border-glass-border hover:border-secondary/50 transition-all duration-300 group hover:shadow-glow">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-secondary/10 border border-secondary/20 group-hover:bg-secondary/20 transition-colors">
                <BarChart3 className="h-8 w-8 text-secondary group-hover:scale-110 transition-transform duration-300" />
              </div>
              <div>
                <p className="text-3xl font-bold text-foreground tracking-tight">{user?.tier === 'pro' ? 'Unlimited' : `${3 - chatbots.length}`}</p>
                <p className="text-sm text-muted-foreground group-hover:text-secondary/80 transition-colors">{user?.tier === 'pro' ? 'Pro Plan Active' : 'Free Bots Remaining'}</p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Link card to Create Bot page */}
        <section className="mb-12 animate-slide-up relative z-10" style={{ animationDelay: "0.1s" }}>
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-accent/10 to-transparent blur-3xl -z-10" />
          <Card className="bg-glass-bg backdrop-blur-md border-glass-border overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />

            <CardContent className="p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-3">
                  <Sparkles className="h-6 w-6 text-accent animate-pulse" />
                  <h2 className="text-2xl font-bold text-foreground">Create a New Intelligence</h2>
                </div>
                <p className="text-muted-foreground max-w-xl text-lg">
                  Deploy a new AI agent. Upload knowledge bases (PDF/DOCX) or configure manually to start automating.
                </p>
              </div>
              <div className="flex items-center gap-4 relative z-10">
                <Link to="/create-bot">
                  <Button className="h-12 px-6 gap-2 bg-primary hover:bg-primary/90 shadow-glow transition-all duration-300 text-md font-medium">
                    <PlusCircle className="h-5 w-5" /> Launch New Bot
                  </Button>
                </Link>

                <div className="relative">
                  <input
                    type="file"
                    accept=".smartbot"
                    className="hidden"
                    id="import-bot"
                    onChange={handleImportBot}
                  />
                  <Button
                    variant="outline"
                    className="h-12 px-6 gap-2 border-primary/30 hover:bg-primary/10 hover:border-primary/50 transition-all duration-300"
                    onClick={() => document.getElementById('import-bot')?.click()}
                    disabled={isImporting}
                  >
                    {isImporting ? (
                      <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Download className="h-5 w-5 rotate-180" />
                    )}
                    Import Config
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* My Chatbots Section */}
        <section className="animate-slide-up" style={{ animationDelay: "0.2s" }}>
          <div className="flex items-center gap-3 mb-6" id="my-chatbots">
            <Globe className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold text-foreground">My Chatbots</h2>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="bg-gradient-card backdrop-blur-sm border-border/50">
                  <CardContent className="p-6 space-y-4">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-10 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : chatbots.length === 0 ? (
            <div className="text-center py-16 border-2 border-dashed border-border/50 rounded-lg bg-gradient-card backdrop-blur-sm">
              <Bot className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground text-lg mb-4">
                You haven't created any chatbots yet
              </p>
              <Link to="/create-bot">
                <Button className="gap-2 bg-gradient-button hover:shadow-glow">
                  <PlusCircle className="h-5 w-5" /> Create Your First Bot
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {chatbots.map((bot) => (
                <ChatbotCard
                  key={bot.id}
                  id={bot.id}
                  name={bot.name}
                  description={bot.description}
                  createdAt={bot.createdAt}
                  location={bot.location}
                  onChat={() => handleChatWithBot(bot.id, bot.name)}
                  onDelete={handleDeleteBot}
                />
              ))}
            </div>
          )}
        </section>

        {/* Chat Interface Section (only visible after selecting a bot) */}
        {selectedChatbot && selectedOrgId && (
          <section ref={chatSectionRef} className="animate-slide-up mt-16 scroll-mt-24" style={{ animationDelay: "0.1s" }}>
            <ChatInterface
              key={selectedOrgId}
              chatbotName={selectedChatbot}
              organizationId={selectedOrgId}
              onMessageUpdate={handleMessageUpdate}
              onClose={handleCloseChat}
            />
          </section>
        )}
      </main >

      <Footer />
    </div >
  );
};

export default Dashboard;
