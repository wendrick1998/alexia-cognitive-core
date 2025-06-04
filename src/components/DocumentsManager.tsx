
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Upload, Download } from 'lucide-react';

const DocumentsManager = () => {
  const [documents, setDocuments] = useState([]);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Gerenciador de Documentos
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Faça upload e gerencie seus documentos
          </p>
        </div>
        <Button>
          <Upload className="w-4 h-4 mr-2" />
          Upload Documento
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-500" />
              Total de Documentos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {documents.length}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Documentos processados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Processamento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">100%</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Taxa de sucesso
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Armazenamento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">0 MB</div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Espaço utilizado
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Seus Documentos</CardTitle>
          <CardDescription>
            Lista de documentos carregados e processados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Nenhum documento carregado ainda.
            </p>
            <Button variant="outline">
              <Upload className="w-4 h-4 mr-2" />
              Carregar Primeiro Documento
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DocumentsManager;
