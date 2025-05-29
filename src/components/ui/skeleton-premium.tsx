
import { cn } from "@/lib/utils";

interface SkeletonPremiumProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "text" | "circular" | "rectangular";
}

const SkeletonPremium = ({ className, variant = "rectangular", ...props }: SkeletonPremiumProps) => {
  const variants = {
    text: "h-4 w-full",
    circular: "rounded-full",
    rectangular: "rounded-lg"
  };

  return (
    <div
      className={cn(
        "skeleton-premium animate-premium-shimmer",
        variants[variant],
        className
      )}
      {...props}
    />
  );
};

export { SkeletonPremium };
