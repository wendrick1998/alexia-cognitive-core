
import { useState, useCallback } from 'react';
import { useDocuments } from '@/hooks/useDocuments';
import { useProjects } from '@/hooks/useProjects';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  File, 
  Trash2, 
  FileText, 
  FileType,
  Calendar,
  HardDrive
} from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { cn } from '@/lib/utils';

const DocumentsManager = () => {
  const { documents, loading, uploading, uploadDocument, deleteDocument, fetchDocuments } = useDocuments();
  const { projects } = useProjects();
  const [selectedProject, setSelectedProject] = useState<string>('all');

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    for (const file of acceptedFiles) {
      const projectId = selectedProject === 'all' || selectedProject === 'none' ? undefined : selectedProject;
      await uploadDocument(file, projectId);
    }
  }, [uploadDocument, selectedProject]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/plain': ['.txt'],
      'text/markdown': ['.md'],
      'application/pdf': ['.pdf'],
    },
    multiple: true,
  });

  const handleProjectFilterChange = (value: string) => {
    setSelectedProject(value);
    const filters = value === 'all' ? {} : { project_id: value };
    fetchDocuments(filters);
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'N/A';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'txt':
        return <FileText className="h-5 w-5" />;
      case 'md':
        return <FileType className="h-5 w-5" />;
      case 'pdf':
        return <File className="h-5 w-5" />;
      default:
        return <File className="h-5 w-5" />;
    }
  };

  const getSourceBadge = (source: string) => {
    const sourceColors = {
      upload: 'bg-blue-100 text-blue-800',
      notion: 'bg-purple-100 text-purple-800',
      drive: 'bg-green-100 text-green-800',
      github: 'bg-gray-100 text-gray-800',
    };

    return (
      <Badge variant="secondary" className={sourceColors[source as keyof typeof sourceColors]}>
        {source}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Carregando documentos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-hidden">
      <div className="h-full flex flex-col p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            Documentos Conectados
          </h1>
          <p className="text-gray-600">
            Gerencie seus documentos e prepare-os para busca semântica
          </p>
        </div>

        {/* Upload Area */}
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

            {/* Project Selection */}
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

        {/* Filters */}
        <div className="mb-4">
          <Select value={selectedProject} onValueChange={handleProjectFilterChange}>
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

        <Separator className="mb-4" />

        {/* Documents List */}
        <div className="flex-1 overflow-auto">
          {documents.length === 0 ? (
            <div className="text-center py-12">
              <File className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum documento encontrado
              </h3>
              <p className="text-gray-600">
                Faça upload de seus primeiros documentos para começar
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {documents.map((document) => (
                <Card key={document.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="text-blue-600">
                          {getFileIcon(document.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 truncate">
                            {document.name}
                          </h3>
                          <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <FileType className="h-3 w-3" />
                              {document.type.toUpperCase()}
                            </span>
                            <span className="flex items-center gap-1">
                              <HardDrive className="h-3 w-3" />
                              {formatFileSize(document.file_size)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(document.created_at).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            {getSourceBadge(document.source)}
                            {document.project && (
                              <Badge variant="outline">
                                {document.project.name}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteDocument(document.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentsManager;
