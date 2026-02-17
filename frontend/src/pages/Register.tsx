import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Mail, Lock, Eye, EyeOff, Sparkles, CheckCircle } from "lucide-react";
import Logo from "@/components/Logo";
import SparkleLoader from "@/components/ui/sparkle-loader";

const Register = () => {
    const [email, setEmail] = useState("");
    const { register, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthenticated) {
            navigate("/dashboard");
        }
    }, [isAuthenticated, navigate]);
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);



    const passwordRequirements = [
        { text: "At least 6 characters", met: password.length >= 6 },
        { text: "Passwords match", met: password === confirmPassword && confirmPassword.length > 0 },
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error("Passwords don't match");
            return;
        }

        if (password.length < 6) {
            toast.error("Password must be at least 6 characters");
            return;
        }

        setIsLoading(true);

        const result = await register(email, password);

        if (result.success) {
            toast.success("Account created!", { description: "Please check your email for verification code" });
            navigate("/verify-otp", { state: { email } });
        } else {
            toast.error("Registration failed", { description: result.error });
        }

        setIsLoading(false);
    };

    return (
        <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4 relative overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-secondary/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "2s" }} />
            </div>

            <Card className="w-full max-w-md bg-glass-bg backdrop-blur-xl border-glass-border shadow-glow animate-fade-in relative z-10">
                <CardHeader className="text-center pb-2">
                    <div className="flex justify-center mb-4">
                        <Logo size={60} className="animate-float" />
                    </div>
                    <CardTitle className="text-3xl font-bold text-foreground">
                        Create Account
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                        Start building AI chatbots in minutes
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
                            <Label htmlFor="password" className="text-sm font-medium">Password</Label>
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

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirm Password</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="confirmPassword"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="pl-10 bg-input/50 border-border/50 focus:border-primary transition-all"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password requirements */}
                        <div className="space-y-2">
                            {passwordRequirements.map((req, idx) => (
                                <div key={idx} className="flex items-center gap-2 text-sm">
                                    <CheckCircle className={`h-4 w-4 transition-colors ${req.met ? 'text-green-500' : 'text-muted-foreground/50'}`} />
                                    <span className={req.met ? 'text-green-500' : 'text-muted-foreground'}>{req.text}</span>
                                </div>
                            ))}
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-gradient-button hover:shadow-glow transition-all duration-300 gap-2 disabled:opacity-80 disabled:cursor-wait"
                            disabled={isLoading || !passwordRequirements.every(r => r.met)}
                        >
                            {isLoading ? (
                                <SparkleLoader size="sm" text="Creating Account..." variant="white" />
                            ) : (
                                <>
                                    <Sparkles className="h-4 w-4" /> Create Account
                                </>
                            )}
                        </Button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-muted-foreground text-sm">
                            Already have an account?{" "}
                            <Link to="/login" className="text-primary hover:text-primary/80 font-medium transition-colors">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default Register;
