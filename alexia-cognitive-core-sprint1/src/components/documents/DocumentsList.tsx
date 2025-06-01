
import { File } from 'lucide-react';
import { Document } from '@/types/document';
import DocumentCard from './DocumentCard';

interface DocumentsListProps {
  documents: Document[];
  reprocessingIds: Set<string>;
  onReprocess: (documentId: string) => void;
  onDelete: (documentId: string) => void;
}

const DocumentsList = ({ documents, reprocessingIds, onReprocess, onDelete }: DocumentsListProps) => {
  if (documents.length === 0) {
    return (
      <div className="text-center py-12">
        <File className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Nenhum documento encontrado
        </h3>
        <p className="text-gray-600">
          Faça upload de seus primeiros documentos para começar
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {documents.map((document) => (
        <DocumentCard
          key={document.id}
          document={document}
          isReprocessing={reprocessingIds.has(document.id)}
          onReprocess={onReprocess}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

export default DocumentsList;
