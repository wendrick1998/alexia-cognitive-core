
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Upload, Trash2, Download, Eye } from 'lucide-react';
import { useDropzone } from 'react-dropzone';

interface Document {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: Date;
  processed: boolean;
}

const DocumentsManager = () => {
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: '1',
      name: 'Manual_Alex_IA.pdf',
      size: 2048576,
      type: 'application/pdf',
      uploadedAt: new Date('2024-01-15'),
      processed: true
    },
    {
      id: '2',
      name: 'Relatório_Mensal.docx',
      size: 1024768,
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      uploadedAt: new Date('2024-01-10'),
      processed: false
    }
  ]);

  const [isUploading, setIsUploading] = useState(false);

  const onDrop = (acceptedFiles: File[]) => {
    setIsUploading(true);
    
    // Simular upload
    setTimeout(() => {
      const newDocuments = acceptedFiles.map(file => ({
        id: Date.now().toString() + Math.random(),
        name: file.name,
        size: file.size,
        type: file.type,
        uploadedAt: new Date(),
        processed: false
      }));

      setDocuments(prev => [...newDocuments, ...prev]);
      setIsUploading(false);
    }, 2000);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/msword': ['.doc'],
      'text/plain': ['.txt'],
      'text/markdown': ['.md']
    },
    multiple: true
  });

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDeleteDocument = (id: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== id));
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
          <FileText className="w-8 h-8 text-green-500" />
          Gerenciador de Documentos
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Upload e processamento de documentos para análise cognitiva
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Area */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Upload de Documentos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                isDragActive 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <input {...getInputProps()} />
              {isUploading ? (
                <div className="space-y-2">
                  <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
                  <p className="text-sm text-gray-600">Processando...</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto" />
                  <p className="text-sm text-gray-600">
                    {isDragActive 
                      ? 'Solte os arquivos aqui...' 
                      : 'Clique ou arraste arquivos aqui'
                    }
                  </p>
                  <p className="text-xs text-gray-500">
                    PDF, DOC, DOCX, TXT, MD
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Documents List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Documentos ({documents.length})</CardTitle>
              <CardDescription>
                Gerencie seus documentos e acompanhe o processamento
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="w-8 h-8 text-blue-500" />
                      <div>
                        <h3 className="font-medium">{doc.name}</h3>
                        <p className="text-sm text-gray-500">
                          {formatFileSize(doc.size)} • {doc.uploadedAt.toLocaleDateString()}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            doc.processed 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {doc.processed ? 'Processado' : 'Pendente'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleDeleteDocument(doc.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}

                {documents.length === 0 && (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Nenhum documento enviado ainda</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DocumentsManager;
