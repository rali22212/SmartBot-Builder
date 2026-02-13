
import React from 'react';
import { cn } from "@/lib/utils";

interface LogoProps extends React.HTMLAttributes<HTMLDivElement> {
    size?: number | string;
    className?: string;
}

const Logo: React.FC<LogoProps> = ({ size = 40, className, ...props }) => {
    const dimension = typeof size === "number" ? `${size}px` : size;

    // Inline styles for animations to avoid external CSS
    const blinkKeyframes = `
    @keyframes blink {
      0%, 96%, 100% { transform: scaleY(1); opacity: 1; }
      98% { transform: scaleY(0.1); opacity: 0.8; }
    }
    .animate-blink { animation: blink 4s infinite; transform-origin: center; }
  `;

    return (
        <div
            className={cn("relative inline-flex items-center justify-center", className)}
            style={{ width: dimension, height: dimension }}
            {...props}
        >
            <style>{blinkKeyframes}</style>
            <svg
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full drop-shadow-[0_0_15px_rgba(124,58,237,0.3)] transition-transform duration-300 group-hover:drop-shadow-[0_0_25px_rgba(124,58,237,0.6)]"
            >
                <defs>
                    <linearGradient id="logo-gradient" x1="10" y1="10" x2="90" y2="90" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="hsl(263, 90%, 65%)" /> {/* Primary: Violet */}
                        <stop offset="50%" stopColor="hsl(190, 95%, 50%)" /> {/* Secondary: Cyan */}
                        <stop offset="100%" stopColor="hsl(320, 85%, 60%)" /> {/* Accent: Magenta */}
                    </linearGradient>

                    <radialGradient id="eye-glow" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                        <stop offset="0%" stopColor="hsl(190, 95%, 60%)" stopOpacity="1" />
                        <stop offset="100%" stopColor="hsl(190, 95%, 40%)" stopOpacity="0" />
                    </radialGradient>
                </defs>

                {/* --- Main Head Outline (Hexagon-ish Shield) --- */}
                <path
                    d="M50 8 L85 28 V72 L50 92 L15 72 V28 Z"
                    stroke="url(#logo-gradient)"
                    strokeWidth="3.5"
                    fill="hsl(240, 10%, 8%)"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="animate-[pulse_3s_ease-in-out_infinite]"
                />

                {/* --- Forehead Circuitry --- */}
                <path
                    d="M50 8 V25 M32 18 L50 28 L68 18"
                    stroke="hsl(263, 90%, 65%)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    opacity="0.8"
                />

                {/* --- Eyes (Human-like) --- */}
                <g className="animate-blink origin-center">
                    {/* Left Eye */}
                    <circle cx="35" cy="48" r="5" fill="hsl(190, 95%, 60%)" filter="url(#glow)" />
                    <circle cx="35" cy="48" r="2" fill="white" opacity="0.8" />

                    {/* Right Eye */}
                    <circle cx="65" cy="48" r="5" fill="hsl(190, 95%, 60%)" filter="url(#glow)" />
                    <circle cx="65" cy="48" r="2" fill="white" opacity="0.8" />
                </g>

                {/* --- Mouth (Friendly Smile) --- */}
                <path
                    d="M38 68 Q50 76 62 68"
                    stroke="url(#logo-gradient)"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    fill="none"
                />

                {/* --- Cheek Accents (Tech Blush) --- */}
                <circle cx="25" cy="58" r="1.5" fill="hsl(320, 85%, 60%)" opacity="0.6" />
                <circle cx="75" cy="58" r="1.5" fill="hsl(320, 85%, 60%)" opacity="0.6" />
            </svg>
        </div>
    );
};

export default Logo;
