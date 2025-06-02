
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Upload, 
  Trash2, 
  Eye, 
  Download,
  Search,
  Filter,
  Plus,
  RefreshCw
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const Documents = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      // Simulate API call
      setTimeout(() => {
        setDocuments([
          {
            id: '1',
            title: 'Manual do Usuário',
            type: 'PDF',
            size: '2.5 MB',
            created_at: new Date().toISOString(),
            status: 'processed'
          },
          {
            id: '2',
            title: 'Relatório Mensal',
            type: 'DOCX',
            size: '1.2 MB',
            created_at: new Date().toISOString(),
            status: 'processing'
          }
        ]);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Erro ao carregar documentos:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os documentos",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      // Simulate upload
      for (const file of Array.from(files)) {
        console.log('Uploading file:', file.name);
        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
      toast({
        title: "Upload concluído",
        description: `${files.length} arquivo(s) enviado(s) com sucesso`,
      });
      
      await loadDocuments();
    } catch (error) {
      console.error('Erro no upload:', error);
      toast({
        title: "Erro no upload",
        description: "Não foi possível enviar os arquivos",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (documentId: string) => {
    try {
      // Simulate API call
      setDocuments(prev => prev.filter(doc => doc.id !== documentId));
      toast({
        title: "Documento excluído",
        description: "O documento foi removido com sucesso",
      });
    } catch (error) {
      console.error('Erro ao excluir documento:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o documento",
        variant: "destructive",
      });
    }
  };

  const filteredDocuments = documents.filter(doc =>
    doc.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'processed':
        return 'bg-green-500/20 text-green-300';
      case 'processing':
        return 'bg-yellow-500/20 text-yellow-300';
      case 'error':
        return 'bg-red-500/20 text-red-300';
      default:
        return 'bg-gray-500/20 text-gray-300';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'processed':
        return 'Processado';
      case 'processing':
        return 'Processando';
      case 'error':
        return 'Erro';
      default:
        return 'Desconhecido';
    }
  };

  return (
    <div className="h-full w-full overflow-y-auto">
      <div className="min-h-full p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Documentos</h1>
            <p className="text-white/60 mt-1">
              Gerencie seus documentos e arquivos
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              onClick={loadDocuments}
              variant="outline"
              size="sm"
              disabled={loading}
              className="border-white/20 text-white hover:bg-white/10"
              aria-label="Atualizar lista de documentos"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
            
            <label className="cursor-pointer">
              <input
                type="file"
                multiple
                onChange={handleUpload}
                className="hidden"
                accept=".pdf,.doc,.docx,.txt,.md"
                disabled={uploading}
              />
              <Button
                asChild
                disabled={uploading}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                aria-label="Fazer upload de documentos"
              >
                <span>
                  {uploading ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload
                    </>
                  )}
                </span>
              </Button>
            </label>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-4 h-4" />
            <Input
              type="text"
              placeholder="Buscar documentos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white/5 border-white/20 text-white placeholder:text-white/40"
            />
          </div>
          
          <Button
            variant="outline"
            size="sm"
            className="border-white/20 text-white hover:bg-white/10"
            aria-label="Filtrar documentos"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filtros
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm">Total</p>
                  <p className="text-2xl font-bold text-white">{documents.length}</p>
                </div>
                <FileText className="w-8 h-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm">Processados</p>
                  <p className="text-2xl font-bold text-white">
                    {documents.filter(d => d.status === 'processed').length}
                  </p>
                </div>
                <Eye className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm">Processando</p>
                  <p className="text-2xl font-bold text-white">
                    {documents.filter(d => d.status === 'processing').length}
                  </p>
                </div>
                <RefreshCw className="w-8 h-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm">Tamanho Total</p>
                  <p className="text-2xl font-bold text-white">
                    {documents.reduce((total, doc) => {
                      const size = parseFloat(doc.size);
                      return total + size;
                    }, 0).toFixed(1)} MB
                  </p>
                </div>
                <Download className="w-8 h-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Documents List */}
        <div className="space-y-4">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="bg-white/5 border-white/10">
                  <CardContent className="p-6">
                    <div className="animate-pulse space-y-3">
                      <div className="h-4 bg-white/20 rounded w-3/4"></div>
                      <div className="h-3 bg-white/10 rounded w-1/2"></div>
                      <div className="h-3 bg-white/10 rounded w-1/4"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredDocuments.length === 0 ? (
            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-12 text-center">
                <FileText className="w-16 h-16 text-white/40 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  {searchQuery ? 'Nenhum documento encontrado' : 'Nenhum documento ainda'}
                </h3>
                <p className="text-white/60 mb-6">
                  {searchQuery 
                    ? 'Tente ajustar os termos de busca'
                    : 'Faça upload de seus primeiros documentos para começar'
                  }
                </p>
                {!searchQuery && (
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      multiple
                      onChange={handleUpload}
                      className="hidden"
                      accept=".pdf,.doc,.docx,.txt,.md"
                      disabled={uploading}
                    />
                    <Button asChild>
                      <span>
                        <Plus className="w-4 h-4 mr-2" />
                        Adicionar Documentos
                      </span>
                    </Button>
                  </label>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDocuments.map((document) => (
                <Card key={document.id} className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                          <FileText className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-white text-sm font-medium truncate">
                            {document.title}
                          </CardTitle>
                          <p className="text-white/60 text-xs">
                            {document.type} • {document.size}
                          </p>
                        </div>
                      </div>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-8 h-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/20"
                            aria-label={`Excluir documento: ${document.title}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-gray-900 border-white/20">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-white">
                              Excluir documento
                            </AlertDialogTitle>
                            <AlertDialogDescription className="text-white/70">
                              Tem certeza que deseja excluir "{document.title}"? 
                              Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="bg-white/10 text-white border-white/20 hover:bg-white/20">
                              Cancelar
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(document.id)}
                              className="bg-red-500 hover:bg-red-600 text-white"
                            >
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between">
                      <Badge className={`text-xs ${getStatusColor(document.status)}`}>
                        {getStatusText(document.status)}
                      </Badge>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-8 h-8 p-0 text-white/60 hover:text-white hover:bg-white/10"
                          aria-label={`Visualizar documento: ${document.title}`}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-8 h-8 p-0 text-white/60 hover:text-white hover:bg-white/10"
                          aria-label={`Baixar documento: ${document.title}`}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <p className="text-white/40 text-xs mt-2">
                      Criado em {new Date(document.created_at).toLocaleDateString('pt-BR')}
                    </p>
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

export default Documents;
