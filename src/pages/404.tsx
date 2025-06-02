
import { Home, ArrowLeft, Search } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center dark:bg-gray-900/50">
        <CardHeader className="pb-4">
          <div className="mx-auto mb-4 p-3 rounded-full bg-gray-100 dark:bg-gray-800">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
            Página Não Encontrada
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            A página que você está procurando não existe ou foi movida.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="text-6xl font-bold text-gray-200 dark:text-gray-700 mb-4">
            404
          </div>
          
          <div className="space-y-3">
            <Link to="/" className="w-full">
              <Button className="w-full" size="lg">
                <Home className="w-4 h-4 mr-2" />
                Ir para Início
              </Button>
            </Link>
            
            <Button 
              variant="outline" 
              className="w-full" 
              size="lg"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </div>
          
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-6">
            Alex iA está sempre aprendendo e evoluindo
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotFound;
