
import React from "react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import PremiumSidebar from "@/components/premium/PremiumSidebar";
import BottomNavigation from "@/components/navigation/BottomNavigation";

interface PremiumAppLayoutProps {
  children: React.ReactNode;
}

export default function PremiumAppLayout({ children }: PremiumAppLayoutProps) {
  const isMobile = useIsMobile();

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
      {/* Sidebar desktop */}
      {!isMobile && (
        <div className="hidden lg:block lg:w-64 lg:flex-shrink-0">
          <PremiumSidebar />
        </div>
      )}
      
      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <main className={cn(
          "flex-1 overflow-y-auto bg-white dark:bg-gray-950",
          "premium-scrollbar momentum-scroll",
          isMobile && "pb-20"
        )}>
          <div className="h-full">{children}</div>
        </main>
      </div>
      
      {/* Mobile navigation */}
      {isMobile && <BottomNavigation />}
    </div>
  );
}
