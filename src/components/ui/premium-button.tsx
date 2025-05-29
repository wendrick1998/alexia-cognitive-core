
import { cn } from "@/lib/utils";
import { forwardRef, useState, useCallback } from "react";
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
    onClick,
    ...props 
  }, ref) => {
    const [isPressed, setIsPressed] = useState(false);

    const variants = {
      primary: "btn-primary shadow-md hover:shadow-lg",
      secondary: "btn-secondary shadow-sm hover:shadow-md", 
      ghost: "bg-transparent hover:bg-white/5 text-white/80 hover:text-white",
      success: "bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-md hover:shadow-lg",
      warning: "bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white shadow-md hover:shadow-lg"
    };

    const sizes = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-4 py-2 text-sm", 
      lg: "px-6 py-3 text-base"
    };

    const handleClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
      if (loading || disabled) return;
      
      setIsPressed(true);
      setTimeout(() => setIsPressed(false), 150);
      
      if (onClick) {
        onClick(e);
      }
    }, [loading, disabled, onClick]);

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-lg font-medium",
          "transition-all duration-200 ease-out",
          "focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:ring-offset-2",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "active:scale-95",
          "relative overflow-hidden",
          variants[variant],
          sizes[size],
          isPressed && "transform scale-95",
          className
        )}
        disabled={disabled || loading}
        onClick={handleClick}
        {...props}
      >
        {/* Ripple effect overlay */}
        <div className="absolute inset-0 bg-white/10 opacity-0 transition-opacity duration-200 hover:opacity-100 rounded-lg" />
        
        {/* Content */}
        <div className="relative z-10 flex items-center justify-center gap-2">
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : icon ? (
            icon
          ) : null}
          {children}
        </div>
      </button>
    );
  }
);

PremiumButton.displayName = "PremiumButton";

export { PremiumButton };
