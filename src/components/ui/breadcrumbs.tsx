
import { ChevronRight, Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumbs = ({ items, className }: BreadcrumbsProps) => {
  return (
    <nav className={cn("flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400", className)}>
      <Link 
        to="/" 
        className="flex items-center hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
      >
        <Home className="w-4 h-4" />
      </Link>
      
      {items.map((item, index) => (
        <div key={index} className="flex items-center space-x-1">
          <ChevronRight className="w-4 h-4 text-gray-400" />
          {item.href && !item.current ? (
            <Link 
              to={item.href}
              className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className={cn(
              item.current && "text-gray-900 dark:text-gray-100 font-medium"
            )}>
              {item.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  );
};
