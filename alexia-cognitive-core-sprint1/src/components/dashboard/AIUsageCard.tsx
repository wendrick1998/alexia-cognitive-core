
import { PremiumCard } from '@/components/ui/premium-card';
import { Bot, Zap, DollarSign } from 'lucide-react';

interface AIUsageCardProps {
  tokensUsed: number;
  tokenLimit: number;
}

const AIUsageCard = ({ tokensUsed, tokenLimit }: AIUsageCardProps) => {
  const usagePercentage = (tokensUsed / tokenLimit) * 100;
  const estimatedCost = (tokensUsed * 0.002).toFixed(2); // Mock calculation
  
  const getUsageColor = () => {
    if (usagePercentage < 50) return 'from-green-500 to-emerald-500';
    if (usagePercentage < 80) return 'from-yellow-500 to-orange-500';
    return 'from-red-500 to-pink-500';
  };

  const mockModels = [
    { name: "GPT-4o", usage: 65, color: "bg-blue-500" },
    { name: "Claude-3", usage: 25, color: "bg-purple-500" },
    { name: "Gemini", usage: 10, color: "bg-green-500" }
  ];

  return (
    <PremiumCard variant="elevated" className="h-full">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg">
          <Bot className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-white font-semibold">Uso de IA</h3>
          <p className="text-white/50 text-sm">Tokens e modelos</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-white/80 text-sm">Tokens utilizados</span>
            <span className="text-white/60 text-xs">
              {tokensUsed.toLocaleString()} / {tokenLimit.toLocaleString()}
            </span>
          </div>
          
          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
            <div 
              className={`h-full bg-gradient-to-r ${getUsageColor()} rounded-full transition-all duration-1000 animate-premium-glow`}
              style={{ width: `${Math.min(usagePercentage, 100)}%` }}
            />
          </div>
          
          <div className="text-right mt-1">
            <span className="text-white/60 text-xs">{usagePercentage.toFixed(1)}%</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-center">
          <div className="p-2 bg-white/5 rounded-lg">
            <Zap className="w-4 h-4 text-yellow-400 mx-auto mb-1" />
            <div className="text-sm text-white font-medium">GPT-4o</div>
            <div className="text-xs text-white/60">Mais usado</div>
          </div>
          
          <div className="p-2 bg-white/5 rounded-lg">
            <DollarSign className="w-4 h-4 text-green-400 mx-auto mb-1" />
            <div className="text-sm text-white font-medium">R$ {estimatedCost}</div>
            <div className="text-xs text-white/60">Custo estimado</div>
          </div>
        </div>
      </div>
    </PremiumCard>
  );
};

export default AIUsageCard;
