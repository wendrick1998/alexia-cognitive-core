
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Brain, Lightbulb, FileText, Target } from "lucide-react";

interface AddMemoryFABProps {
  onAddMemory: (type: 'fact' | 'preference' | 'decision' | 'note') => void;
}

const QUICK_MEMORY_TYPES = [
  { id: 'note', icon: Brain, label: 'Pensamento', color: 'from-purple-500 to-violet-600' },
  { id: 'decision', icon: Lightbulb, label: 'Insight', color: 'from-yellow-500 to-orange-600' },
  { id: 'fact', icon: FileText, label: 'Fato', color: 'from-green-500 to-emerald-600' },
  { id: 'preference', icon: Target, label: 'Objetivo', color: 'from-red-500 to-pink-600' },
];

const AddMemoryFAB = ({ onAddMemory }: AddMemoryFABProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
  };

  const handleAddMemory = (type: 'fact' | 'preference' | 'decision' | 'note') => {
    setIsOpen(false);
    onAddMemory(type);
    if ('vibrate' in navigator) {
      navigator.vibrate(100);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {/* Quick Memory Types */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/20 backdrop-blur-sm -z-10"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Memory Type Buttons */}
          {QUICK_MEMORY_TYPES.map((type, index) => {
            const Icon = type.icon;
            const angle = index * 90; // 90 degrees apart
            const radius = 80;
            const angleRad = (angle * Math.PI) / 180;
            const x = Math.cos(angleRad) * radius;
            const y = Math.sin(angleRad) * radius;
            
            return (
              <Button
                key={type.id}
                onClick={() => handleAddMemory(type.id as any)}
                className={`absolute w-12 h-12 rounded-full bg-gradient-to-r ${type.color} text-white shadow-lg transition-all duration-300 hover:scale-110`}
                style={{
                  transform: `translate(${x}px, ${y}px)`,
                  animation: `scale-in 0.2s ease-out ${index * 0.05}s both`
                }}
                title={`Adicionar ${type.label}`}
              >
                <Icon className="w-5 h-5" />
              </Button>
            );
          })}
        </>
      )}

      {/* Main FAB */}
      <Button
        onClick={toggleMenu}
        className={`w-14 h-14 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-xl transition-all duration-300 hover:scale-110 ${
          isOpen ? 'rotate-45' : ''
        }`}
      >
        <Plus className="w-6 h-6" />
      </Button>
    </div>
  );
};

export default AddMemoryFAB;
