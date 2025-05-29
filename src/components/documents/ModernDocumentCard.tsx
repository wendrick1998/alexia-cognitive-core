
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  FileText, 
  File, 
  Image as ImageIcon,
  Brain,
  MessageSquare,
  Search,
  Trash2,
  Calendar,
  HardDrive,
  Eye
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Document } from '@/types/document';

interface ModernDocumentCardProps {
  document: Document;
  isProcessing: boolean;
  onView: (document: Document) => void;
  onChat: (document: Document) => void;
  onSearch: (document: Document) => void;
  onDelete: (documentId: string) => void;
}

const ModernDocumentCard = ({ 
  document, 
  isProcessing, 
  onView, 
  onChat, 
  onSearch, 
  onDelete 
}: ModernDocumentCardProps) => {
  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'N/A';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getPreviewComponent = () => {
    const baseClasses = "w-full h-32 rounded-t-lg flex items-center justify-center";
    
    switch (document.type.toLowerCase()) {
      case 'pdf':
        return (
          <div className={cn(baseClasses, "bg-red-50 border-2 border-dashed border-red-200")}>
            <div className="text-center">
              <File className="h-8 w-8 text-red-500 mx-auto mb-2" />
              <span className="text-xs text-red-600 font-medium">PDF Preview</span>
            </div>
          </div>
        );
      case 'txt':
      case 'md':
        return (
          <div className={cn(baseClasses, "bg-blue-50 border-2 border-dashed border-blue-200 p-3")}>
            <div className="text-center w-full">
              <FileText className="h-6 w-6 text-blue-500 mx-auto mb-1" />
              <p className="text-xs text-blue-700 line-clamp-3 leading-tight">
                {document.summary || "Preview das primeiras linhas do documento de texto..."}
              </p>
            </div>
          </div>
        );
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return (
          <div className={cn(baseClasses, "bg-green-50 border-2 border-dashed border-green-200")}>
            <div className="text-center">
              <ImageIcon className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <span className="text-xs text-green-600 font-medium">Image File</span>
            </div>
          </div>
        );
      default:
        return (
          <div className={cn(baseClasses, "bg-purple-50 border-2 border-dashed border-purple-200")}>
            <div className="text-center">
              <Brain className="h-8 w-8 text-purple-500 mx-auto mb-2" />
              <span className="text-xs text-purple-600 font-medium">Notion Page</span>
            </div>
          </div>
        );
    }
  };

  const getProcessingProgress = () => {
    const status = (document as any).status_processing;
    if (status === 'processing') return 45;
    if (status === 'completed') return 100;
    return 0;
  };

  const getSourceBadge = () => {
    const sourceColors = {
      upload: 'bg-blue-500',
      notion: 'bg-purple-500',
      drive: 'bg-green-500',
      github: 'bg-gray-700',
    };

    return (
      <Badge 
        variant="secondary" 
        className={cn("text-white text-xs", sourceColors[document.source as keyof typeof sourceColors])}
      >
        {document.source}
      </Badge>
    );
  };

  return (
    <Card className="w-40 h-50 hover:shadow-xl transition-all duration-300 hover:scale-105 group relative overflow-hidden">
      <CardContent className="p-0">
        {/* Preview Area */}
        <div className="relative">
          {getPreviewComponent()}
          
          {/* Hover Actions */}
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => onView(document)}
              className="h-8 w-8 p-0"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => onChat(document)}
              className="h-8 w-8 p-0"
            >
              <MessageSquare className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => onSearch(document)}
              className="h-8 w-8 p-0"
            >
              <Search className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => onDelete(document.id)}
              className="h-8 w-8 p-0"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          {/* Processing Animation */}
          {isProcessing && (
            <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-1"></div>
                <span className="text-xs text-blue-700 font-medium">Processando...</span>
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-3">
          <h3 className="font-semibold text-sm text-gray-900 line-clamp-2 leading-tight mb-1">
            {document.title}
          </h3>
          
          <div className="text-xs text-gray-500 mb-2">
            <span className="uppercase font-medium">{document.type}</span>
            <span className="mx-1">•</span>
            <span>{formatFileSize(document.file_size)}</span>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1 mb-2">
            {getSourceBadge()}
            {document.project && (
              <Badge variant="outline" className="text-xs">
                {document.project.name}
              </Badge>
            )}
          </div>

          {/* Processing Progress */}
          {isProcessing && (
            <div className="mb-2">
              <Progress value={getProcessingProgress()} className="h-1" />
              <span className="text-xs text-blue-600 mt-1">Entendendo documento...</span>
            </div>
          )}

          {/* Date */}
          <div className="flex items-center text-xs text-gray-400">
            <Calendar className="h-3 w-3 mr-1" />
            {new Date(document.created_at).toLocaleDateString('pt-BR')}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ModernDocumentCard;
