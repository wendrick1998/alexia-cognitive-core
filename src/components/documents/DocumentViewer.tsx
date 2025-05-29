
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { 
  MessageSquare, 
  Search, 
  Trash2, 
  X, 
  ZoomIn, 
  ZoomOut,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Document } from '@/types/document';

interface DocumentViewerProps {
  document: Document | null;
  isOpen: boolean;
  onClose: () => void;
  onChat: (document: Document) => void;
  onSearch: (document: Document) => void;
  onDelete: (documentId: string) => void;
}

const DocumentViewer = ({
  document,
  isOpen,
  onClose,
  onChat,
  onSearch,
  onDelete
}: DocumentViewerProps) => {
  const [zoom, setZoom] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);

  if (!document) return null;

  const renderDocumentContent = () => {
    switch (document.type.toLowerCase()) {
      case 'pdf':
        return (
          <div className="flex-1 bg-gray-100 flex items-center justify-center p-8">
            <div className="text-center">
              <div className="w-64 h-80 bg-white shadow-lg rounded-lg flex items-center justify-center mb-4">
                <div className="text-gray-400">
                  <div className="text-6xl mb-4">📄</div>
                  <p className="text-lg font-medium">PDF Viewer</p>
                  <p className="text-sm">Página {currentPage} de 1</p>
                </div>
              </div>
              
              {/* PDF Controls */}
              <div className="flex items-center justify-center gap-2 mb-4">
                <Button variant="outline" size="sm" disabled>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="px-4 py-1 bg-white rounded text-sm">
                  {currentPage} / 1
                </span>
                <Button variant="outline" size="sm" disabled>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>

              {/* Zoom Controls */}
              <div className="flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setZoom(Math.max(50, zoom - 25))}
                  disabled={zoom <= 50}
                >
                  <ZoomOut className="w-4 h-4" />
                </Button>
                <span className="px-3 py-1 bg-white rounded text-sm">
                  {zoom}%
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setZoom(Math.min(200, zoom + 25))}
                  disabled={zoom >= 200}
                >
                  <ZoomIn className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        );

      case 'txt':
      case 'md':
        return (
          <div className="flex-1 bg-white p-8 overflow-auto">
            <div className="max-w-4xl mx-auto">
              <div className="prose prose-lg max-w-none">
                <p className="text-gray-600 leading-relaxed">
                  {document.summary || "Conteúdo do documento de texto apareceria aqui..."}
                </p>
                <p className="text-gray-600 leading-relaxed">
                  Este é um preview do conteúdo do documento. O texto real seria carregado 
                  dinamicamente do arquivo original.
                </p>
                <p className="text-gray-600 leading-relaxed">
                  Você pode usar as ações flutuantes para interagir com este documento:
                  conversar sobre o conteúdo, fazer buscas específicas ou gerenciar o arquivo.
                </p>
              </div>
            </div>
          </div>
        );

      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return (
          <div className="flex-1 bg-gray-100 flex items-center justify-center p-8">
            <div className="text-center">
              <div className="w-96 h-64 bg-white shadow-lg rounded-lg flex items-center justify-center mb-4">
                <div className="text-gray-400">
                  <div className="text-6xl mb-4">🖼️</div>
                  <p className="text-lg font-medium">Image Preview</p>
                  <p className="text-sm">Visualizador de imagem</p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="flex-1 bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-8">
            <div className="text-center">
              <div className="text-6xl mb-4">🧠</div>
              <p className="text-2xl font-semibold text-gray-800 mb-2">Notion Document</p>
              <p className="text-gray-600">Conteúdo sincronizado do Notion</p>
            </div>
          </div>
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[90vh] p-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b bg-white">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold truncate">
              {document.title}
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span className="font-medium uppercase">{document.type}</span>
            <span>•</span>
            <span>{new Date(document.created_at).toLocaleDateString('pt-BR')}</span>
            {document.file_size && (
              <>
                <span>•</span>
                <span>{Math.round(document.file_size / 1024)} KB</span>
              </>
            )}
          </div>
        </DialogHeader>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {renderDocumentContent()}
        </div>

        {/* Floating Actions */}
        <div className="absolute bottom-6 right-6 flex gap-2">
          <Button
            onClick={() => onChat(document)}
            className="bg-blue-500 hover:bg-blue-600 text-white shadow-lg"
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            💬 Chat sobre
          </Button>
          <Button
            onClick={() => onSearch(document)}
            variant="secondary"
            className="shadow-lg"
          >
            <Search className="w-4 h-4 mr-2" />
            🔍 Buscar
          </Button>
          <Button
            onClick={() => onDelete(document.id)}
            variant="destructive"
            className="shadow-lg"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            🗑️ Deletar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentViewer;
