
import { PremiumCard } from '@/components/ui/premium-card';
import { Target, CheckCircle2, ArrowRight } from 'lucide-react';

const ObjectivesCard = () => {
  const objectives = [
    {
      id: '1',
      title: 'Melhorar conhecimento em React',
      progress: 78,
      target: 100,
      nextAction: 'Estudar hooks avançados'
    },
    {
      id: '2',
      title: 'Organizar documentação',
      progress: 45,
      target: 100,
      nextAction: 'Categorizar documentos'
    },
    {
      id: '3',
      title: 'Consolidar memórias',
      progress: 92,
      target: 100,
      nextAction: 'Revisar conexões'
    }
  ];

  const getProgressColor = (progress: number) => {
    if (progress >= 90) return 'from-green-500 to-emerald-500';
    if (progress >= 70) return 'from-blue-500 to-purple-500';
    if (progress >= 50) return 'from-yellow-500 to-orange-500';
    return 'from-gray-500 to-gray-600';
  };

  return (
    <PremiumCard variant="elevated" className="h-full">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
          <Target className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-white font-semibold">Objetivos</h3>
          <p className="text-white/50 text-sm">Metas de aprendizado</p>
        </div>
      </div>

      <div className="space-y-4">
        {objectives.map((objective) => (
          <div key={objective.id} className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-white text-sm font-medium">
                {objective.title}
              </h4>
              <div className="flex items-center gap-1">
                {objective.progress >= 90 && (
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                )}
                <span className="text-white/60 text-xs">
                  {objective.progress}%
                </span>
              </div>
            </div>
            
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
              <div 
                className={`h-full bg-gradient-to-r ${getProgressColor(objective.progress)} rounded-full transition-all duration-1000`}
                style={{ width: `${objective.progress}%` }}
              />
            </div>
            
            <div className="flex items-center gap-2 text-xs text-white/60">
              <ArrowRight className="w-3 h-3" />
              <span>{objective.nextAction}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-white/10">
        <div className="text-center">
          <div className="text-2xl font-bold text-white">
            {Math.round(objectives.reduce((sum, obj) => sum + obj.progress, 0) / objectives.length)}%
          </div>
          <div className="text-white/60 text-sm">Progresso geral</div>
        </div>
      </div>
    </PremiumCard>
  );
};

export default ObjectivesCard;
