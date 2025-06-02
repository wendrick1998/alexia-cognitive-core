
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Home, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <Card className="max-w-md w-full bg-gray-900 border-gray-800 text-white text-center">
        <CardHeader>
          <div className="text-6xl font-bold text-blue-400 mb-4">404</div>
          <CardTitle className="text-2xl">Página não encontrada</CardTitle>
          <CardDescription className="text-gray-400">
            A página que você está procurando não existe ou foi movida.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={() => navigate(-1)}
              variant="outline"
              className="border-gray-700 text-gray-300 hover:bg-gray-800"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <Button
              onClick={() => navigate('/')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Home className="w-4 h-4 mr-2" />
              Início
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
