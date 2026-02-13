import { Link } from "react-router-dom";
import Logo from "@/components/Logo";

const Footer = () => {
  return (
    <footer className="border-t border-border/50 backdrop-blur-xl bg-glass-bg mt-20 relative overflow-hidden">
      {/* Decorative gradient line */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Logo size={36} className="filter drop-shadow-[0_0_8px_rgba(124,58,237,0.4)]" />
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-white drop-shadow-sm">
                SmartBot Builder
              </span>
              <span className="text-xs text-muted-foreground/80 font-medium">
                &copy; {new Date().getFullYear()} &middot; Copyright Ali Raza
              </span>
            </div>
          </div>

          <div className="flex gap-6 items-center">
            <Link
              to="/privacy"
              className="text-xs font-medium uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors duration-200"
            >
              Privacy
            </Link>
            <div className="w-1 h-1 rounded-full bg-border" />
            <Link
              to="/terms"
              className="text-xs font-medium uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors duration-200"
            >
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
