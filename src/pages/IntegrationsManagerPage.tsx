
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import IntegrationsManagerPage from '@/components/integrations/IntegrationsManagerPage';

const IntegrationsManager = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950">
      <div className="sticky top-0 z-40 bg-black/20 backdrop-blur-xl border-b border-white/10">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <Link to="/">
              <Button variant="ghost" size="sm" className="flex items-center gap-2 text-white hover:bg-white/10">
                <ArrowLeft className="w-4 h-4" />
                Voltar
              </Button>
            </Link>
          </div>
          <Breadcrumbs 
            items={[
              { label: 'Integrações', href: '/integrations-status' },
              { label: 'Gerenciar', current: true }
            ]}
            className="text-white/70"
          />
        </div>
      </div>
      
      <div className="h-[calc(100vh-80px)]">
        <IntegrationsManagerPage />
      </div>
    </div>
  );
};

export default IntegrationsManager;
