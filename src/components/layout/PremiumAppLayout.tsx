
import React from "react";
import { cn } from "@/lib/utils";
import { useMobile } from "@/hooks/use-mobile";
import PremiumSidebar from "@/components/premium/PremiumSidebar";
import BottomNavigation from "@/components/navigation/BottomNavigation";
import ServiceWorkerManager from "@/components/optimization/ServiceWorkerManager";

interface PremiumAppLayoutProps {
  children: React.ReactNode;
  currentSection?: string;
  onSectionChange?: (section: string) => void;
}

export default function PremiumAppLayout({ 
  children, 
  currentSection, 
  onSectionChange 
}: PremiumAppLayoutProps) {
  const isMobile = useMobile();

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
      {/* Service Worker Manager */}
      {typeof window !== "undefined" && <ServiceWorkerManager />}
      
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
