import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Mail, Lock, Eye, EyeOff, KeyRound, ArrowLeft, CheckCircle } from "lucide-react";

type Step = "email" | "otp" | "password";

const ForgotPassword = () => {
    const [step, setStep] = useState<Step>("email");
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const { forgotPassword, resetPassword } = useAuth();
    const navigate = useNavigate();

    const handleSendCode = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const result = await forgotPassword(email);

        if (result.success) {
            toast.success("Code sent!", { description: "Check your email for the reset code" });
            setStep("otp");
        } else {
            toast.error("Failed to send code", { description: result.error });
        }

        setIsLoading(false);
    };

    const handleVerifyCode = (e: React.FormEvent) => {
        e.preventDefault();
        if (otp.length !== 6) {
            toast.error("Please enter the 6-digit code");
            return;
        }
        setStep("password");
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            toast.error("Passwords don't match");
            return;
        }

        if (newPassword.length < 6) {
            toast.error("Password must be at least 6 characters");
            return;
        }

        setIsLoading(true);

        const result = await resetPassword(email, otp, newPassword);

        if (result.success) {
            toast.success("Password reset!", { description: "You can now login with your new password" });
            navigate("/login");
        } else {
            toast.error("Reset failed", { description: result.error });
            setStep("otp");
        }

        setIsLoading(false);
    };

    const renderStep = () => {
        switch (step) {
            case "email":
                return (
                    <form onSubmit={handleSendCode} className="space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
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
                            <p className="text-xs text-muted-foreground">
                                We'll send a verification code to this email
                            </p>
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-gradient-button hover:shadow-glow transition-all duration-300 gap-2"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Sending...
                                </>
                            ) : (
                                <>
                                    <Mail className="h-4 w-4" /> Send Reset Code
                                </>
                            )}
                        </Button>
                    </form>
                );

            case "otp":
                return (
                    <form onSubmit={handleVerifyCode} className="space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="otp" className="text-sm font-medium">Verification Code</Label>
                            <Input
                                id="otp"
                                type="text"
                                placeholder="Enter 6-digit code"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                                className="text-center text-2xl tracking-widest bg-input/50 border-border/50 focus:border-primary transition-all"
                                required
                            />
                            <p className="text-xs text-muted-foreground">
                                Enter the code sent to {email}
                            </p>
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-gradient-button hover:shadow-glow transition-all duration-300"
                            disabled={otp.length !== 6}
                        >
                            Verify Code
                        </Button>

                        <Button
                            type="button"
                            variant="ghost"
                            className="w-full"
                            onClick={() => setStep("email")}
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" /> Change email
                        </Button>
                    </form>
                );

            case "password":
                return (
                    <form onSubmit={handleResetPassword} className="space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="newPassword" className="text-sm font-medium">New Password</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="newPassword"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
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

                        {/* Password check */}
                        <div className="flex items-center gap-2 text-sm">
                            <CheckCircle className={`h-4 w-4 ${newPassword.length >= 6 && newPassword === confirmPassword ? 'text-green-500' : 'text-muted-foreground/50'}`} />
                            <span className={newPassword.length >= 6 && newPassword === confirmPassword ? 'text-green-500' : 'text-muted-foreground'}>
                                Passwords match and at least 6 characters
                            </span>
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-gradient-button hover:shadow-glow transition-all duration-300 gap-2"
                            disabled={isLoading || newPassword.length < 6 || newPassword !== confirmPassword}
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Resetting...
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="h-4 w-4" /> Reset Password
                                </>
                            )}
                        </Button>
                    </form>
                );
        }
    };

    return (
        <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4 relative overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
            </div>

            <Card className="w-full max-w-md bg-gradient-card backdrop-blur-xl border-border/50 shadow-2xl animate-fade-in relative z-10">
                <CardHeader className="text-center pb-2">
                    <div className="flex justify-center mb-4">
                        <div className="p-3 rounded-2xl bg-orange-500/10 border border-orange-500/20">
                            <KeyRound className="h-8 w-8 text-orange-500" />
                        </div>
                    </div>
                    <CardTitle className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-primary bg-clip-text text-transparent">
                        Reset Password
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                        {step === "email" && "Enter your email to receive a reset code"}
                        {step === "otp" && "Enter the verification code"}
                        {step === "password" && "Create your new password"}
                    </CardDescription>

                    {/* Step indicator */}
                    <div className="flex justify-center gap-2 mt-4">
                        {["email", "otp", "password"].map((s, i) => (
                            <div
                                key={s}
                                className={`w-2 h-2 rounded-full transition-all ${step === s ? 'w-6 bg-primary' : i < ["email", "otp", "password"].indexOf(step) ? 'bg-green-500' : 'bg-muted-foreground/30'
                                    }`}
                            />
                        ))}
                    </div>
                </CardHeader>

                <CardContent className="pt-6">
                    {renderStep()}

                    <div className="mt-6 text-center">
                        <Link to="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                            ← Back to login
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default ForgotPassword;
