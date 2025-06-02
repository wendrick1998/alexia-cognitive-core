
import { Loader2 } from "lucide-react";

interface FullPageLoaderProps {
  text?: string;
}

export function FullPageLoader({ text = "Carregando..." }: FullPageLoaderProps) {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto" />
        <p className="text-white/60 text-lg font-medium">{text}</p>
      </div>
    </div>
  );
}
