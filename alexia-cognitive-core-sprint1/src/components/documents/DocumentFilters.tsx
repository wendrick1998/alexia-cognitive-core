
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Project } from '@/types/project';

interface DocumentFiltersProps {
  selectedProject: string;
  projects: Project[];
  onFilterChange: (value: string) => void;
}

const DocumentFilters = ({ selectedProject, projects, onFilterChange }: DocumentFiltersProps) => {
  return (
    <div className="mb-4">
      <Select value={selectedProject} onValueChange={onFilterChange}>
        <SelectTrigger className="w-64">
          <SelectValue placeholder="Filtrar por projeto" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os projetos</SelectItem>
          <SelectItem value="none">Sem projeto</SelectItem>
          {projects.map((project) => (
            <SelectItem key={project.id} value={project.id}>
              {project.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default DocumentFilters;
