
import { NavLink } from "react-router-dom";
import { menuSections } from "@/config/navConfig";
import { LucideIcon } from "lucide-react";
import * as Icons from "lucide-react";

export default function PremiumSidebar() {
  return (
    <aside className="w-64 bg-card border-r h-full">
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-4">Alex iA</h2>
      </div>
      <nav className="px-4">
        {menuSections.map((section) => {
          const IconComponent = Icons[section.icon as keyof typeof Icons] as LucideIcon;
          return (
            <NavLink
              key={section.id}
              to={section.path}
              className={({ isActive }) =>
                `flex items-center gap-3 p-3 rounded-lg mb-2 transition-colors ${
                  isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                }`
              }
            >
              <IconComponent className="w-5 h-5" />
              <span>{section.title}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
