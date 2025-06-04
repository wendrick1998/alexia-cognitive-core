
import { useNavigate, useLocation } from "react-router-dom";
import { menuSections } from "@/config/navConfig";
import { LucideIcon } from "lucide-react";
import * as Icons from "lucide-react";

export default function BottomNavigation() {
  const navigate = useNavigate();
  const location = useLocation();

  // Show only the first 5 main sections on mobile
  const mainSections = menuSections.slice(0, 5);

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t md:hidden z-50">
      <div className="flex">
        {mainSections.map((section) => {
          const IconComponent = Icons[section.icon as keyof typeof Icons] as LucideIcon;
          const isActive = location.pathname === section.path;

          return (
            <button
              key={section.id}
              onClick={() => navigate(section.path)}
              className={`flex-1 flex flex-col items-center py-2 px-1 ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <IconComponent className="w-5 h-5" />
              <span className="text-xs mt-1">{section.title}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
