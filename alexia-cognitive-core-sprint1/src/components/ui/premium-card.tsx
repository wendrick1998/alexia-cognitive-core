
import { cn } from "@/lib/utils";
import { forwardRef } from "react";

interface PremiumCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "interactive";
  size?: "sm" | "md" | "lg";
}

const PremiumCard = forwardRef<HTMLDivElement, PremiumCardProps>(
  ({ className, variant = "default", size = "md", children, ...props }, ref) => {
    const variants = {
      default: "glass-card",
      elevated: "glass-card hover-lift",
      interactive: "glass-card hover-lift hover-glow cursor-pointer"
    };

    const sizes = {
      sm: "p-4",
      md: "p-6", 
      lg: "p-8"
    };

    return (
      <div
        ref={ref}
        className={cn(
          variants[variant],
          sizes[size],
          "animate-premium-fade-in",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

PremiumCard.displayName = "PremiumCard";

export { PremiumCard };
