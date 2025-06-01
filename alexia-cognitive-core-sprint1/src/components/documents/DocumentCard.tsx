
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  File, 
  Trash2, 
  FileText, 
  FileType,
  Calendar,
  HardDrive,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Document } from '@/types/document';

interface DocumentCardProps {
  document: Document;
  isReprocessing: boolean;
  onReprocess: (documentId: string) => void;
  onDelete: (documentId: string) => void;
}

const DocumentCard = ({ document, isReprocessing, onReprocess, onDelete }: DocumentCardProps) => {
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

  const getProcessingStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', text: 'Pendente' },
      processing: { color: 'bg-blue-100 text-blue-800', text: 'Processando' },
      completed: { color: 'bg-green-100 text-green-800', text: 'Concluído' },
      failed: { color: 'bg-red-100 text-red-800', text: 'Falhou' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;

    return (
      <Badge variant="secondary" className={config.color}>
        {config.text}
      </Badge>
    );
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <div className="text-blue-600">
              {getFileIcon(document.type)}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-gray-900 truncate">
                {document.title}
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
                {(document as any).status_processing && getProcessingStatusBadge((document as any).status_processing)}
                {document.project && (
                  <Badge variant="outline">
                    {document.project.name}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onReprocess(document.id)}
              disabled={isReprocessing}
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
              title="Reprocessar documento"
            >
              <RefreshCw className={cn(
                "h-4 w-4", 
                isReprocessing && "animate-spin"
              )} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(document.id)}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
              title="Excluir documento"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DocumentCard;
