
import { Button } from "@/components/ui/button";
import { User, LogOut, Sparkles } from "lucide-react";
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
    <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200/60 px-6 py-4 flex justify-between items-center shadow-sm">
      <div className="flex items-center space-x-4">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div className="flex items-center space-x-3">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Alex iA
          </h1>
          <span className="text-xs font-medium text-white bg-gradient-to-r from-emerald-500 to-blue-500 px-3 py-1 rounded-full shadow-lg">
            Beta
          </span>
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        {user ? (
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-medium text-slate-700">
                {user.email}
              </p>
              <p className="text-xs text-slate-500">
                Agente Cognitivo
              </p>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleSignOut} 
              className="flex items-center space-x-2 rounded-xl border-slate-200 hover:bg-slate-50 transition-all duration-200"
            >
              <LogOut className="w-4 h-4" />
              <span>Sair</span>
            </Button>
          </div>
        ) : (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleLogin} 
            className="flex items-center space-x-2 rounded-xl border-slate-200 hover:bg-slate-50 transition-all duration-200"
          >
            <User className="w-4 h-4" />
            <span>Login</span>
          </Button>
        )}
      </div>
    </header>
  );
};

export default Header;
