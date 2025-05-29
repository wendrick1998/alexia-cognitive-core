
import { PremiumCard } from '@/components/ui/premium-card';
import { MessageCircle, Users, Hash } from 'lucide-react';

interface ConversationCardProps {
  totalConversations: number;
  avgMessages: number;
}

const ConversationCard = ({ totalConversations, avgMessages }: ConversationCardProps) => {
  const mockTopics = [
    { name: "Desenvolvimento", count: 15, color: "bg-blue-500" },
    { name: "Design", count: 8, color: "bg-purple-500" },
    { name: "IA & Tech", count: 6, color: "bg-green-500" }
  ];

  return (
    <PremiumCard variant="elevated" className="h-full">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
          <MessageCircle className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-white font-semibold">Conversas</h3>
          <p className="text-white/50 text-sm">Interações ativas</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-2xl font-bold text-white">
              {totalConversations}
            </div>
            <div className="text-white/60 text-sm">Total</div>
          </div>
          
          <div>
            <div className="text-2xl font-bold text-white">
              {avgMessages}
            </div>
            <div className="text-white/60 text-sm">Média/conversa</div>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-white/60 text-sm font-medium">Tópicos mais discutidos</p>
          {mockTopics.map((topic, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 ${topic.color} rounded-full`} />
                <span className="text-white/80 text-sm">{topic.name}</span>
              </div>
              <span className="text-white/60 text-xs">{topic.count}</span>
            </div>
          ))}
        </div>
      </div>
    </PremiumCard>
  );
};

export default ConversationCard;
