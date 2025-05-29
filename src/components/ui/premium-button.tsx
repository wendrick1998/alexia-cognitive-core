
import { cn } from "@/lib/utils";
import { forwardRef } from "react";
import { Loader2 } from "lucide-react";

interface PremiumButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "success" | "warning";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  icon?: React.ReactNode;
}

const PremiumButton = forwardRef<HTMLButtonElement, PremiumButtonProps>(
  ({ 
    className, 
    variant = "primary", 
    size = "md", 
    loading = false,
    icon,
    children, 
    disabled,
    ...props 
  }, ref) => {
    const variants = {
      primary: "btn-primary",
      secondary: "btn-secondary", 
      ghost: "bg-transparent hover:bg-white/5 text-white/80 hover:text-white",
      success: "bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white",
      warning: "bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white"
    };

    const sizes = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-4 py-2 text-sm", 
      lg: "px-6 py-3 text-base"
    };

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-lg font-medium",
          "transition-all duration-300 cubic-bezier(0.4, 0, 0.2, 1)",
          "focus:outline-none focus:ring-2 focus:ring-blue-500/20",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "hover:transform hover:-translate-y-0.5",
          variants[variant],
          sizes[size],
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : icon ? (
          icon
        ) : null}
        {children}
      </button>
    );
  }
);

PremiumButton.displayName = "PremiumButton";

export { PremiumButton };
