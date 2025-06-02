
import { ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import SettingsScreen from '@/components/settings/SettingsScreen';

const SettingsPage = () => {
  const navigate = useNavigate();

  const handleClose = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <div className="sticky top-0 z-40 bg-white/95 dark:bg-gray-950/95 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <Link to="/">
              <Button variant="ghost" size="sm" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Voltar
              </Button>
            </Link>
          </div>
          <Breadcrumbs 
            items={[
              { label: 'Configurações', current: true }
            ]}
          />
        </div>
      </div>
      
      <div className="h-[calc(100vh-80px)]">
        <SettingsScreen isOpen={true} onClose={handleClose} />
      </div>
    </div>
  );
};

export default SettingsPage;
