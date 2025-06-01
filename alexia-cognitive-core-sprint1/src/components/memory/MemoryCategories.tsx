
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, Lightbulb, FileText, Target, RefreshCw, Star } from "lucide-react";

interface MemoryCategoriesProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

const MEMORY_CATEGORIES = [
  { id: 'all', label: 'Todas', icon: '🧠', color: 'text-blue-400' },
  { id: 'note', label: 'Pensamentos', icon: '💭', color: 'text-purple-400' },
  { id: 'decision', label: 'Insights', icon: '💡', color: 'text-yellow-400' },
  { id: 'fact', label: 'Fatos', icon: '📝', color: 'text-green-400' },
  { id: 'preference', label: 'Objetivos', icon: '🎯', color: 'text-red-400' },
  { id: 'patterns', label: 'Padrões', icon: '🔄', color: 'text-indigo-400' },
];

const MemoryCategories = ({ activeCategory, onCategoryChange }: MemoryCategoriesProps) => {
  return (
    <div className="px-4 pb-4">
      <Tabs value={activeCategory} onValueChange={onCategoryChange}>
        <TabsList className="bg-transparent p-0 h-auto w-full justify-start">
          <div className="flex space-x-2 overflow-x-auto scrollbar-none pb-2">
            {MEMORY_CATEGORIES.map((category) => (
              <TabsTrigger
                key={category.id}
                value={category.id}
                className={`
                  flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium
                  transition-all duration-200 min-w-fit whitespace-nowrap
                  ${activeCategory === category.id 
                    ? 'bg-white/20 text-white shadow-lg' 
                    : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                  }
                `}
              >
                <span className="text-base">{category.icon}</span>
                <span>{category.label}</span>
              </TabsTrigger>
            ))}
          </div>
        </TabsList>
      </Tabs>
    </div>
  );
};

export default MemoryCategories;
