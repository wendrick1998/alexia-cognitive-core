
import { Button } from "@/components/ui/button";
import { Paperclip, Mic, Camera, Lightbulb, Sparkles } from "lucide-react";

interface QuickActionsBarProps {
  onAction: (action: string) => void;
}

const QUICK_ACTIONS = [
  { id: 'attach', icon: Paperclip, label: 'Anexar', color: 'from-blue-500 to-indigo-600' },
  { id: 'audio', icon: Mic, label: 'Áudio', color: 'from-red-500 to-pink-600' },
  { id: 'photo', icon: Camera, label: 'Foto', color: 'from-green-500 to-emerald-600' },
  { id: 'ideas', icon: Lightbulb, label: 'Ideias', color: 'from-yellow-500 to-orange-600' },
  { id: 'deep-think', icon: Sparkles, label: 'Deep Think', color: 'from-purple-500 to-violet-600' },
];

const QuickActionsBar = ({ onAction }: QuickActionsBarProps) => {
  return (
    <div className="px-4 pb-3">
      <div className="flex space-x-3 overflow-x-auto scrollbar-none">
        {QUICK_ACTIONS.map((action) => {
          const Icon = action.icon;
          return (
            <Button
              key={action.id}
              onClick={() => onAction(action.id)}
              className={`flex-shrink-0 px-4 py-2 rounded-full bg-gradient-to-r ${action.color} hover:scale-105 transition-all duration-200 text-white border-0 shadow-lg min-w-fit`}
            >
              <Icon className="w-4 h-4 mr-2" />
              <span className="text-sm font-medium">{action.label}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
};

export default QuickActionsBar;
