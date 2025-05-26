
import { Button } from "@/components/ui/button";
import { User, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const Header = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: "Erro ao sair",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Logout realizado com sucesso",
        description: "Até logo!",
      });
      navigate('/auth');
    }
  };

  const handleLogin = () => {
    navigate('/auth');
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-sm">A</span>
        </div>
        <h1 className="text-xl font-semibold text-gray-800">Alex iA</h1>
        <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
          Beta
        </span>
      </div>
      
      <div className="flex items-center space-x-3">
        {user ? (
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-600">
              {user.email}
            </span>
            <Button variant="outline" size="sm" onClick={handleSignOut} className="flex items-center space-x-2">
              <LogOut className="w-4 h-4" />
              <span>Sair</span>
            </Button>
          </div>
        ) : (
          <Button variant="outline" size="sm" onClick={handleLogin} className="flex items-center space-x-2">
            <User className="w-4 h-4" />
            <span>Login</span>
          </Button>
        )}
      </div>
    </header>
  );
};

export default Header;
