import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import Logo from "@/components/Logo";
import SparkleLoader from "@/components/ui/sparkle-loader";

const Login = () => {
    const [email, setEmail] = useState("");
    const { login, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthenticated) {
            navigate("/dashboard");
        }
    }, [isAuthenticated, navigate]);
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const location = useLocation();

    const from = location.state?.from?.pathname || "/";

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const result = await login(email, password);

        if (result.success) {
            toast.success("Welcome back!", { description: "Login successful" });
            navigate(from, { replace: true });
        } else if (result.needs_verification) {
            toast.error("Email not verified", { description: "Please verify your email first" });
            navigate("/verify-otp", { state: { email } });
        } else {
            toast.error("Login failed", { description: result.error });
        }

        setIsLoading(false);
    };

    return (
        <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4 relative overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-secondary/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "2s" }} />
            </div>

            <Card className="w-full max-w-md bg-glass-bg backdrop-blur-xl border-glass-border shadow-glow animate-fade-in relative z-10">
                <CardHeader className="text-center pb-2">
                    <div className="flex justify-center mb-4">
                        <Logo size={60} className="animate-float" />
                    </div>
                    <CardTitle className="text-3xl font-bold text-foreground">
                        Welcome Back
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                        Sign in to your SmartBot Builder account
                    </CardDescription>
                </CardHeader>

                <CardContent className="pt-6">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="pl-10 bg-input/50 border-border/50 focus:border-primary transition-all"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                                <Link to="/forgot-password" className="text-sm text-primary hover:text-primary/80 transition-colors">
                                    Forgot password?
                                </Link>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="pl-10 pr-10 bg-input/50 border-border/50 focus:border-primary transition-all"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-gradient-button hover:shadow-glow transition-all duration-300 gap-2 disabled:opacity-80 disabled:cursor-wait"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <SparkleLoader size="sm" text="Signing in..." variant="white" />
                            ) : (
                                <>
                                    Sign In <ArrowRight className="h-4 w-4" />
                                </>
                            )}
                        </Button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-muted-foreground text-sm">
                            Don't have an account?{" "}
                            <Link to="/register" className="text-primary hover:text-primary/80 font-medium transition-colors">
                                Create one
                            </Link>
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default Login;
