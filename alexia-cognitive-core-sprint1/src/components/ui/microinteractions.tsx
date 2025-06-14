
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Check, Copy, X } from "lucide-react";

interface InteractiveButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: "default" | "secondary" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
}

export const InteractiveButton = ({ 
  children, 
  className, 
  onClick,
  ...props 
}: InteractiveButtonProps) => {
  const [isPressed, setIsPressed] = useState(false);

  return (
    <Button
      className={cn(
        "transition-all duration-150 active:scale-95 hover:scale-105",
        "hover:shadow-lg active:shadow-sm",
        "relative overflow-hidden group",
        className
      )}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      onClick={onClick}
      {...props}
    >
      <span className="relative z-10">{children}</span>
      <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-out" />
    </Button>
  );
};

interface HoverCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  elevation?: "sm" | "md" | "lg";
}

export const HoverCard = ({ 
  children, 
  className, 
  elevation = "md",
  ...props 
}: HoverCardProps) => {
  const elevationClasses = {
    sm: "hover:shadow-md hover:-translate-y-1",
    md: "hover:shadow-lg hover:-translate-y-2",
    lg: "hover:shadow-xl hover:-translate-y-3"
  };

  return (
    <Card
      className={cn(
        "transition-all duration-300 ease-out cursor-pointer",
        "hover:scale-[1.02]",
        elevationClasses[elevation],
        className
      )}
      {...props}
    >
      {children}
    </Card>
  );
};

export const RippleButton = ({ 
  children, 
  className, 
  onClick,
  ...props 
}: InteractiveButtonProps) => {
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const newRipple = { id: Date.now(), x, y };
    setRipples(prev => [...prev, newRipple]);

    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
    }, 600);

    onClick?.(e);
  };

  return (
    <Button
      className={cn(
        "relative overflow-hidden",
        className
      )}
      onClick={handleClick}
      {...props}
    >
      {children}
      {ripples.map(ripple => (
        <span
          key={ripple.id}
          className="absolute bg-white/30 rounded-full animate-ping"
          style={{
            left: ripple.x - 10,
            top: ripple.y - 10,
            width: 20,
            height: 20,
          }}
        />
      ))}
    </Button>
  );
};

type FeedbackType = "success" | "error" | "copy";
type FeedbackState = "success" | "error" | "copied" | null;

interface FeedbackButtonProps extends Omit<InteractiveButtonProps, 'type'> {
  type?: FeedbackType;
}

export const FeedbackButton = ({ 
  children, 
  className,
  type = "success",
  ...props 
}: FeedbackButtonProps) => {
  const [feedback, setFeedback] = useState<FeedbackState>(null);

  const handleFeedback = () => {
    let newFeedback: FeedbackState = null;
    
    if (type === "success") {
      newFeedback = "success";
    } else if (type === "error") {
      newFeedback = "error";
    } else if (type === "copy") {
      newFeedback = "copied";
    }
    
    setFeedback(newFeedback);
    setTimeout(() => setFeedback(null), 2000);
  };

  const getFeedbackIcon = (): React.ReactNode => {
    if (feedback === "success") {
      return <Check className="w-4 h-4 text-green-500" />;
    }
    if (feedback === "error") {
      return <X className="w-4 h-4 text-red-500" />;
    }
    if (feedback === "copied") {
      return <Copy className="w-4 h-4 text-blue-500" />;
    }
    return children;
  };

  const getFeedbackClass = (): string => {
    if (feedback === "success") {
      return "bg-green-100 border-green-200 text-green-700";
    }
    if (feedback === "error") {
      return "bg-red-100 border-red-200 text-red-700 animate-shake";
    }
    if (feedback === "copied") {
      return "bg-blue-100 border-blue-200 text-blue-700";
    }
    return "";
  };

  return (
    <Button
      type="button"
      className={cn(
        "transition-all duration-300",
        feedback && getFeedbackClass(),
        className
      )}
      onClick={handleFeedback}
      {...props}
    >
      {getFeedbackIcon()}
    </Button>
  );
};
