
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface SearchFiltersProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

const SearchFilters = ({ activeFilter, onFilterChange }: SearchFiltersProps) => {
  const filters = [
    { id: 'all', label: 'Tudo', color: 'bg-gray-100 text-gray-800' },
    { id: 'semantic', label: 'Busca Semântica', color: 'bg-purple-100 text-purple-800' },
    { id: 'hybrid', label: 'Busca Híbrida', color: 'bg-blue-100 text-blue-800' },
    { id: 'bm25', label: 'Busca Exata', color: 'bg-green-100 text-green-800' },
    { id: 'recent', label: 'Últimos 7 dias', color: 'bg-orange-100 text-orange-800' },
    { id: 'docs', label: 'Meus docs', color: 'bg-indigo-100 text-indigo-800' },
    { id: 'conversations', label: 'Conversas', color: 'bg-pink-100 text-pink-800' },
    { id: 'high-relevance', label: 'Alta relevância', color: 'bg-red-100 text-red-800' },
  ];

  return (
    <div className="flex flex-wrap gap-2 mt-4">
      {filters.map((filter) => (
        <Badge
          key={filter.id}
          variant={activeFilter === filter.id ? "default" : "secondary"}
          className={cn(
            "cursor-pointer transition-all duration-200 hover:scale-105",
            activeFilter === filter.id 
              ? "bg-blue-600 text-white shadow-md" 
              : filter.color
          )}
          onClick={() => onFilterChange(filter.id)}
        >
          {filter.label}
        </Badge>
      ))}
    </div>
  );
};

export default SearchFilters;
