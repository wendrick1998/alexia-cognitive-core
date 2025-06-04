
import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SmartLoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  message?: string;
  className?: string;
  type?: string; // Added to support the type prop
}

export const SmartLoadingSpinner: React.FC<SmartLoadingSpinnerProps> = ({
  size = "md",
  message = "Carregando...",
  className,
  type
}) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8"
  };

  return (
    <div className={cn("flex flex-col items-center justify-center space-y-2", className)}>
      <Loader2 className={cn("animate-spin text-primary", sizeClasses[size])} />
      {message && (
        <p className="text-sm text-muted-foreground animate-pulse">
          {message}
        </p>
      )}
      {type && (
        <p className="text-xs text-muted-foreground/70">
          {type}
        </p>
      )}
    </div>
  );
};
