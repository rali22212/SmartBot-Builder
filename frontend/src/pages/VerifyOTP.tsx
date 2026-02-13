import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Mail, ShieldCheck, RefreshCw } from "lucide-react";

const VerifyOTP = () => {
    const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
    const [isLoading, setIsLoading] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    const { verifyOTP, sendOTP } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email || "";

    useEffect(() => {
        if (!email) {
            navigate("/register");
        }
        // Focus first input
        inputRefs.current[0]?.focus();
    }, [email, navigate]);

    useEffect(() => {
        if (resendCooldown > 0) {
            const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendCooldown]);

    const handleChange = (index: number, value: string) => {
        if (value.length > 1) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto-focus next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }

        // Auto-submit when complete
        if (index === 5 && value) {
            const code = [...newOtp.slice(0, 5), value].join("");
            if (code.length === 6) {
                handleVerify(code);
            }
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData("text").slice(0, 6);
        const newOtp = [...otp];
        for (let i = 0; i < pastedData.length; i++) {
            if (/\d/.test(pastedData[i])) {
                newOtp[i] = pastedData[i];
            }
        }
        setOtp(newOtp);

        if (pastedData.length === 6) {
            handleVerify(pastedData);
        }
    };

    const handleVerify = async (code?: string) => {
        const otpCode = code || otp.join("");
        if (otpCode.length !== 6) {
            toast.error("Please enter the complete 6-digit code");
            return;
        }

        setIsLoading(true);

        const result = await verifyOTP(email, otpCode);

        if (result.success) {
            toast.success("Email verified!", { description: "Welcome to SmartBot Builder" });
            navigate("/");
        } else {
            toast.error("Verification failed", { description: result.error });
            setOtp(["", "", "", "", "", ""]);
            inputRefs.current[0]?.focus();
        }

        setIsLoading(false);
    };

    const handleResend = async () => {
        if (resendCooldown > 0) return;

        const result = await sendOTP(email, "verify");

        if (result.success) {
            toast.success("Code resent!", { description: "Check your email for the new code" });
            setResendCooldown(60);
        } else {
            toast.error("Failed to resend", { description: result.error });
        }
    };

    return (
        <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4 relative overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-green-500/10 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
            </div>

            <Card className="w-full max-w-md bg-gradient-card backdrop-blur-xl border-border/50 shadow-2xl animate-fade-in relative z-10">
                <CardHeader className="text-center pb-2">
                    <div className="flex justify-center mb-4">
                        <div className="p-3 rounded-2xl bg-green-500/10 border border-green-500/20">
                            <ShieldCheck className="h-8 w-8 text-green-500" />
                        </div>
                    </div>
                    <CardTitle className="text-3xl font-bold bg-gradient-to-r from-green-400 to-primary bg-clip-text text-transparent">
                        Verify Your Email
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                        We've sent a 6-digit code to
                    </CardDescription>
                    <div className="flex items-center justify-center gap-2 mt-2 text-foreground font-medium">
                        <Mail className="h-4 w-4 text-primary" />
                        {email}
                    </div>
                </CardHeader>

                <CardContent className="pt-6">
                    {/* OTP Input */}
                    <div className="flex justify-center gap-3 mb-8" onPaste={handlePaste}>
                        {otp.map((digit, index) => (
                            <input
                                key={index}
                                ref={(el) => (inputRefs.current[index] = el)}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleChange(index, e.target.value.replace(/\D/g, ""))}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                className="w-12 h-14 text-center text-2xl font-bold rounded-xl border-2 border-border/50 bg-input/50 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                disabled={isLoading}
                            />
                        ))}
                    </div>

                    <Button
                        onClick={() => handleVerify()}
                        className="w-full bg-gradient-button hover:shadow-glow transition-all duration-300 gap-2"
                        disabled={isLoading || otp.some(d => !d)}
                    >
                        {isLoading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Verifying...
                            </>
                        ) : (
                            <>
                                <ShieldCheck className="h-4 w-4" /> Verify Email
                            </>
                        )}
                    </Button>

                    {/* Resend */}
                    <div className="mt-6 text-center">
                        <p className="text-muted-foreground text-sm mb-2">
                            Didn't receive the code?
                        </p>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleResend}
                            disabled={resendCooldown > 0}
                            className="gap-2"
                        >
                            <RefreshCw className={`h-4 w-4 ${resendCooldown > 0 ? '' : 'hover:rotate-180 transition-transform duration-500'}`} />
                            {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend Code"}
                        </Button>
                    </div>

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

export default VerifyOTP;
