
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useMemories } from '@/hooks/useMemories';
import { useToast } from '@/hooks/use-toast';
import { Brain, Loader2 } from 'lucide-react';

interface CreateMemoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateMemoryModal = ({ isOpen, onClose }: CreateMemoryModalProps) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { addMemory } = useMemories();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha pelo menos o título e o conteúdo da memória.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      await addMemory({
        title: title.trim(),
        content: content.trim(),
        category: category.trim() || 'Geral',
      });
      
      toast({
        title: "Memória criada",
        description: "Nova memória foi adicionada com sucesso!",
      });
      
      // Reset form
      setTitle('');
      setContent('');
      setCategory('');
      onClose();
    } catch (error) {
      console.error('Erro ao criar memória:', error);
      toast({
        title: "Erro ao criar memória",
        description: "Houve um problema ao salvar a memória. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setTitle('');
      setContent('');
      setCategory('');
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
            <Brain className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Criar Nova Memória
          </DialogTitle>
          <DialogDescription className="text-gray-600 dark:text-gray-400">
            Adicione uma nova memória ao seu sistema de conhecimento pessoal.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-gray-900 dark:text-gray-100">
              Título *
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Receita de bolo de chocolate"
              disabled={loading}
              className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="category" className="text-gray-900 dark:text-gray-100">
              Categoria
            </Label>
            <Input
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Ex: Culinária, Trabalho, Pessoal..."
              disabled={loading}
              className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="content" className="text-gray-900 dark:text-gray-100">
              Conteúdo *
            </Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Descreva o conteúdo da memória..."
              disabled={loading}
              rows={6}
              className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 resize-none"
            />
          </div>
          
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
              className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading || !title.trim() || !content.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Criando...
                </>
              ) : (
                'Criar Memória'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateMemoryModal;
