
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter } from "lucide-react";

interface MemorySearchBarProps {
  onSearch: (query: string) => void;
  onFilterClick: () => void;
}

const MemorySearchBar = ({ onSearch, onFilterClick }: MemorySearchBarProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch(query);
  };

  return (
    <div className="sticky top-0 z-30 bg-[#0A0A0A]/95 backdrop-blur-sm px-4 py-3 border-b border-white/10">
      <div className="flex items-center space-x-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Buscar memórias..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-blue-400"
          />
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onFilterClick}
          className="w-10 h-10 bg-white/10 hover:bg-white/20 text-gray-400 hover:text-white"
        >
          <Filter className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default MemorySearchBar;
