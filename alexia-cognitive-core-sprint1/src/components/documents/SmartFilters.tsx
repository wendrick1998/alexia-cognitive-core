
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { File, FileText, Image, Brain, Calendar, Clock, CheckCircle, Loader } from 'lucide-react';

interface SmartFiltersProps {
  activeFilters: {
    type: string;
    time: string;
    status: string;
  };
  onFilterChange: (filterType: 'type' | 'time' | 'status', value: string) => void;
}

const SmartFilters = ({ activeFilters, onFilterChange }: SmartFiltersProps) => {
  const typeFilters = [
    { id: 'all', label: 'Todos', icon: '📁' },
    { id: 'pdf', label: 'PDFs', icon: '📄' },
    { id: 'txt', label: 'Textos', icon: '📝' },
    { id: 'image', label: 'Imagens', icon: '🖼️' },
    { id: 'notion', label: 'Notion', icon: '🧠' },
  ];

  const timeFilters = [
    { id: 'all', label: 'Todos', icon: <Calendar className="w-3 h-3" /> },
    { id: 'today', label: 'Hoje', icon: <Clock className="w-3 h-3" /> },
    { id: 'week', label: 'Semana', icon: <Calendar className="w-3 h-3" /> },
    { id: 'month', label: 'Mês', icon: <Calendar className="w-3 h-3" /> },
  ];

  const statusFilters = [
    { id: 'all', label: 'Todos', icon: <File className="w-3 h-3" /> },
    { id: 'completed', label: 'Processados', icon: <CheckCircle className="w-3 h-3" /> },
    { id: 'processing', label: 'Processando', icon: <Loader className="w-3 h-3" /> },
  ];

  return (
    <div className="space-y-4 mb-6">
      {/* Type Filters */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">Tipo</h4>
        <div className="flex gap-2 overflow-x-auto scrollbar-none pb-2">
          {typeFilters.map((filter) => (
            <Badge
              key={filter.id}
              variant={activeFilters.type === filter.id ? "default" : "outline"}
              className={cn(
                "cursor-pointer whitespace-nowrap transition-all duration-200 hover:scale-105",
                "flex items-center gap-1.5 px-3 py-1.5",
                activeFilters.type === filter.id 
                  ? "bg-blue-500 text-white shadow-lg" 
                  : "hover:bg-gray-100"
              )}
              onClick={() => onFilterChange('type', filter.id)}
            >
              <span className="text-sm">{filter.icon}</span>
              <span className="text-sm font-medium">{filter.label}</span>
            </Badge>
          ))}
        </div>
      </div>

      {/* Time Filters */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">Período</h4>
        <div className="flex gap-2 overflow-x-auto scrollbar-none pb-2">
          {timeFilters.map((filter) => (
            <Badge
              key={filter.id}
              variant={activeFilters.time === filter.id ? "default" : "outline"}
              className={cn(
                "cursor-pointer whitespace-nowrap transition-all duration-200 hover:scale-105",
                "flex items-center gap-1.5 px-3 py-1.5",
                activeFilters.time === filter.id 
                  ? "bg-green-500 text-white shadow-lg" 
                  : "hover:bg-gray-100"
              )}
              onClick={() => onFilterChange('time', filter.id)}
            >
              {filter.icon}
              <span className="text-sm font-medium">{filter.label}</span>
            </Badge>
          ))}
        </div>
      </div>

      {/* Status Filters */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">Status</h4>
        <div className="flex gap-2 overflow-x-auto scrollbar-none pb-2">
          {statusFilters.map((filter) => (
            <Badge
              key={filter.id}
              variant={activeFilters.status === filter.id ? "default" : "outline"}
              className={cn(
                "cursor-pointer whitespace-nowrap transition-all duration-200 hover:scale-105",
                "flex items-center gap-1.5 px-3 py-1.5",
                activeFilters.status === filter.id 
                  ? "bg-purple-500 text-white shadow-lg" 
                  : "hover:bg-gray-100"
              )}
              onClick={() => onFilterChange('status', filter.id)}
            >
              {filter.icon}
              <span className="text-sm font-medium">{filter.label}</span>
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SmartFilters;
