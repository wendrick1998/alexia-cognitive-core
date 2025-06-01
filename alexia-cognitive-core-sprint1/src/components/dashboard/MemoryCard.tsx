
import { PremiumCard } from '@/components/ui/premium-card';
import { Brain, TrendingUp } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

interface MemoryCardProps {
  totalMemories: number;
}

const MemoryCard = ({ totalMemories }: MemoryCardProps) => {
  // Mock data for mini chart
  const miniData = [
    { value: totalMemories - 20 },
    { value: totalMemories - 15 },
    { value: totalMemories - 10 },
    { value: totalMemories - 5 },
    { value: totalMemories },
  ];

  const mockTopMemories = [
    { title: "Conceitos React", strength: 95 },
    { title: "TypeScript Patterns", strength: 89 },
    { title: "Design Systems", strength: 84 }
  ];

  return (
    <PremiumCard variant="elevated" className="h-full">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg">
          <Brain className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-white font-semibold">Memórias</h3>
          <p className="text-white/50 text-sm">Conhecimento ativo</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-end gap-4">
          <div className="flex-1">
            <div className="text-3xl font-bold text-white animate-premium-glow">
              {totalMemories.toLocaleString()}
            </div>
            <div className="flex items-center gap-1 text-green-400 text-sm">
              <TrendingUp className="w-3 h-3" />
              +12% esta semana
            </div>
          </div>
          
          <div className="w-20 h-12">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={miniData}>
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#8B5CF6" 
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-white/60 text-sm font-medium">Memórias mais fortes</p>
          {mockTopMemories.map((memory, index) => (
            <div key={index} className="flex items-center justify-between">
              <span className="text-white/80 text-sm">{memory.title}</span>
              <div className="flex items-center gap-2">
                <div className="w-12 h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-1000"
                    style={{ width: `${memory.strength}%` }}
                  />
                </div>
                <span className="text-white/60 text-xs w-8">{memory.strength}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PremiumCard>
  );
};

export default MemoryCard;
