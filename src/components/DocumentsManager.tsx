
import { useState } from 'react';
import { useDocuments } from '@/hooks/useDocuments';
import { useProjects } from '@/hooks/useProjects';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import DocumentsHeader from './documents/DocumentsHeader';
import RevolutionaryUploadArea from './documents/RevolutionaryUploadArea';
import SmartFilters from './documents/SmartFilters';
import ModernDocumentCard from './documents/ModernDocumentCard';
import DocumentViewer from './documents/DocumentViewer';
import ProcessingVisualization from './documents/ProcessingVisualization';
import LoadingSpinner from './documents/LoadingSpinner';
import { Document } from '@/types/document';

const DocumentsManager = () => {
  const { 
    documents, 
    loading, 
    uploading, 
    reprocessingIds,
    uploadDocument, 
    deleteDocument, 
    fetchDocuments,
    handleReprocessDocument
  } = useDocuments();
  const { projects } = useProjects();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [filters, setFilters] = useState({
    type: 'all',
    time: 'all',
    status: 'all'
  });

  const handleUpload = async (files: File[]) => {
    for (const file of files) {
      await uploadDocument(file);
    }
  };

  const handleFilterChange = (filterType: 'type' | 'time' | 'status', value: string) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
    
    // Apply filters to documents fetch
    const filterParams: any = {};
    
    if (value !== 'all') {
      switch (filterType) {
        case 'type':
          // Filter by document type
          break;
        case 'time':
          // Filter by time range
          break;
        case 'status':
          // Filter by processing status
          break;
      }
    }
    
    fetchDocuments(filterParams);
  };

  const filteredDocuments = documents.filter(doc => {
    // Search filter
    if (searchQuery && !doc.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    // Type filter
    if (filters.type !== 'all') {
      if (filters.type === 'image' && !['jpg', 'jpeg', 'png', 'gif'].includes(doc.type.toLowerCase())) {
        return false;
      } else if (filters.type !== 'image' && filters.type !== doc.type.toLowerCase()) {
        return false;
      }
    }
    
    // Status filter
    if (filters.status !== 'all') {
      const status = (doc as any).status_processing;
      if (filters.status !== status) {
        return false;
      }
    }
    
    return true;
  });

  const handleChat = (document: Document) => {
    // Navigate to chat with document context
    console.log('Chat about document:', document.title);
    setSelectedDocument(null);
  };

  const handleSearch = (document: Document) => {
    // Navigate to search with document context
    console.log('Search in document:', document.title);
    setSelectedDocument(null);
  };

  const processingDocument = documents.find(doc => reprocessingIds.has(doc.id));

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="flex-1 overflow-hidden bg-gray-50">
      <div className="h-full flex flex-col p-6">
        <DocumentsHeader />
        
        {/* Revolutionary Upload Area */}
        <RevolutionaryUploadArea
          onUpload={handleUpload}
          uploading={uploading}
          projects={projects}
        />

        {/* Processing Visualization */}
        {processingDocument && (
          <ProcessingVisualization
            isProcessing={true}
            progress={45}
            currentStep="Analisando estrutura do documento..."
            document={processingDocument}
          />
        )}

        {/* Search Bar */}
        <div className="sticky top-0 z-30 bg-gray-50/95 backdrop-blur-sm mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="🔍 Buscar documentos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white border-gray-200 focus:border-blue-400"
            />
          </div>
        </div>

        {/* Smart Filters */}
        <SmartFilters
          activeFilters={filters}
          onFilterChange={handleFilterChange}
        />

        {/* Documents Grid */}
        <div className="flex-1 overflow-auto">
          {filteredDocuments.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📁</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum documento encontrado
              </h3>
              <p className="text-gray-600">
                Faça upload de seus primeiros documentos para começar
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {filteredDocuments.map((document) => (
                <ModernDocumentCard
                  key={document.id}
                  document={document}
                  isProcessing={reprocessingIds.has(document.id)}
                  onView={setSelectedDocument}
                  onChat={handleChat}
                  onSearch={handleSearch}
                  onDelete={deleteDocument}
                />
              ))}
            </div>
          )}
        </div>

        {/* Document Viewer Modal */}
        <DocumentViewer
          document={selectedDocument}
          isOpen={!!selectedDocument}
          onClose={() => setSelectedDocument(null)}
          onChat={handleChat}
          onSearch={handleSearch}
          onDelete={deleteDocument}
        />
      </div>
    </div>
  );
};

export default DocumentsManager;
