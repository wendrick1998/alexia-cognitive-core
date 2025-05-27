
import { useState } from 'react';
import { useDocuments } from '@/hooks/useDocuments';
import { useProjects } from '@/hooks/useProjects';
import { Separator } from '@/components/ui/separator';
import DocumentsHeader from './documents/DocumentsHeader';
import DocumentUploadArea from './documents/DocumentUploadArea';
import DocumentFilters from './documents/DocumentFilters';
import DocumentsList from './documents/DocumentsList';
import LoadingSpinner from './documents/LoadingSpinner';

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
  const [selectedProject, setSelectedProject] = useState<string>('all');

  const handleProjectFilterChange = (value: string) => {
    setSelectedProject(value);
    const filters = value === 'all' ? {} : { project_id: value };
    fetchDocuments(filters);
  };

  const handleUpload = async (file: File, projectId?: string) => {
    await uploadDocument(file, projectId);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="flex-1 overflow-hidden">
      <div className="h-full flex flex-col p-6">
        <DocumentsHeader />
        
        <DocumentUploadArea
          selectedProject={selectedProject}
          setSelectedProject={setSelectedProject}
          uploading={uploading}
          projects={projects}
          onUpload={handleUpload}
        />

        <DocumentFilters
          selectedProject={selectedProject}
          projects={projects}
          onFilterChange={handleProjectFilterChange}
        />

        <Separator className="mb-4" />

        <div className="flex-1 overflow-auto">
          <DocumentsList
            documents={documents}
            reprocessingIds={reprocessingIds}
            onReprocess={handleReprocessDocument}
            onDelete={deleteDocument}
          />
        </div>
      </div>
    </div>
  );
};

export default DocumentsManager;
