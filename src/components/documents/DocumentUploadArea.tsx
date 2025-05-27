
import { useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, HardDrive } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { cn } from '@/lib/utils';
import { Project } from '@/types/project';

interface DocumentUploadAreaProps {
  selectedProject: string;
  setSelectedProject: (value: string) => void;
  uploading: boolean;
  projects: Project[];
  onUpload: (file: File, projectId?: string) => Promise<void>;
}

const DocumentUploadArea = ({
  selectedProject,
  setSelectedProject,
  uploading,
  projects,
  onUpload
}: DocumentUploadAreaProps) => {
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    for (const file of acceptedFiles) {
      const projectId = selectedProject === 'all' || selectedProject === 'none' ? undefined : selectedProject;
      await onUpload(file, projectId);
    }
  }, [onUpload, selectedProject]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/plain': ['.txt'],
      'text/markdown': ['.md'],
      'application/pdf': ['.pdf'],
    },
    multiple: true,
  });

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload de Documentos
        </CardTitle>
        <CardDescription>
          Arraste arquivos ou clique para selecionar. Formatos suportados: .txt, .md, .pdf
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div
          {...getRootProps()}
          className={cn(
            "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
            isDragActive 
              ? "border-blue-400 bg-blue-50" 
              : "border-gray-300 hover:border-gray-400"
          )}
        >
          <input {...getInputProps()} />
          <HardDrive className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          {isDragActive ? (
            <p className="text-blue-600">Solte os arquivos aqui...</p>
          ) : (
            <div>
              <p className="text-gray-600 mb-2">
                Arraste arquivos aqui ou clique para selecionar
              </p>
              <Button variant="outline" disabled={uploading}>
                {uploading ? 'Enviando...' : 'Selecionar Arquivos'}
              </Button>
            </div>
          )}
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Projeto (opcional)
          </label>
          <Select value={selectedProject} onValueChange={setSelectedProject}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione um projeto" />
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
      </CardContent>
    </Card>
  );
};

export default DocumentUploadArea;
