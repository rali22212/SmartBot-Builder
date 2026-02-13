import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface SparkleLoaderProps {
    size?: "sm" | "md" | "lg";
    text?: string;
    className?: string;
    variant?: "default" | "white";
}

const SparkleLoader = ({ size = "md", text, className, variant = "default" }: SparkleLoaderProps) => {
    const sizeClasses = {
        sm: "h-4 w-4",
        md: "h-6 w-6",
        lg: "h-10 w-10",
    };

    const colorClass = variant === "white" ? "text-white/90" : "text-primary";
    const bgClass = variant === "white" ? "bg-white/30" : "bg-primary/20";
    const textClass = variant === "white" ? "text-white/90" : "bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent";

    return (
        <div className={cn("flex items-center gap-2", className)}>
            <div className="relative">
                <Sparkles
                    className={cn(
                        "animate-spin",
                        colorClass,
                        sizeClasses[size]
                    )}
                    style={{ animationDuration: "1.5s" }}
                />
                <div className={cn("absolute inset-0 blur-lg animate-pulse", bgClass)} />
            </div>
            {text && (
                <span className={cn("animate-pulse font-medium", textClass)}>
                    {text}
                </span>
            )}
        </div>
    );
};

export default SparkleLoader;
