
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Volume2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VoiceSearchProps {
  isOpen: boolean;
  onClose: () => void;
  onResult: (transcript: string) => void;
}

const VoiceSearch = ({ isOpen, onClose, onResult }: VoiceSearchProps) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check if browser supports Speech Recognition
    const SpeechRecognition = (window as any).SpeechRecognition || 
                             (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      setIsSupported(true);
      recognitionRef.current = new SpeechRecognition();
      
      const recognition = recognitionRef.current;
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'pt-BR';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            finalTranscript += result[0].transcript;
          } else {
            interimTranscript += result[0].transcript;
          }
        }

        setTranscript(finalTranscript + interimTranscript);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const startListening = () => {
    if (recognitionRef.current && isSupported) {
      setTranscript('');
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const handleUseTranscript = () => {
    if (transcript.trim()) {
      onResult(transcript.trim());
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full text-center">
        {!isSupported ? (
          <div>
            <Volume2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Busca por voz não suportada
            </h3>
            <p className="text-gray-600 mb-6">
              Seu navegador não suporta reconhecimento de voz.
            </p>
            <Button onClick={onClose}>Fechar</Button>
          </div>
        ) : (
          <div>
            {/* Mic Animation */}
            <div className="relative mb-6">
              <div className={cn(
                "w-24 h-24 rounded-full mx-auto flex items-center justify-center transition-all duration-300",
                isListening 
                  ? "bg-red-100 scale-110" 
                  : "bg-blue-100 hover:bg-blue-200"
              )}>
                {isListening ? (
                  <MicOff className="w-12 h-12 text-red-600" />
                ) : (
                  <Mic className="w-12 h-12 text-blue-600" />
                )}
              </div>
              
              {/* Pulse Animation */}
              {isListening && (
                <>
                  <div className="absolute inset-0 w-24 h-24 rounded-full bg-red-200 animate-ping mx-auto" />
                  <div className="absolute inset-0 w-24 h-24 rounded-full bg-red-100 animate-ping mx-auto delay-75" />
                </>
              )}
            </div>

            {/* Status */}
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {isListening ? 'Ouvindo...' : 'Toque para falar'}
            </h3>
            
            <p className="text-gray-600 mb-6">
              {isListening 
                ? 'Fale sua pergunta agora' 
                : 'Ative o microfone para buscar por voz'
              }
            </p>

            {/* Transcript */}
            {transcript && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                <p className="text-sm text-gray-500 mb-1">Transcrição:</p>
                <p className="text-gray-900">{transcript}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 justify-center">
              {!isListening ? (
                <Button 
                  onClick={startListening}
                  className="px-6"
                >
                  <Mic className="w-4 h-4 mr-2" />
                  Começar
                </Button>
              ) : (
                <Button 
                  onClick={stopListening}
                  variant="destructive"
                  className="px-6"
                >
                  <MicOff className="w-4 h-4 mr-2" />
                  Parar
                </Button>
              )}
              
              {transcript && (
                <Button 
                  onClick={handleUseTranscript}
                  variant="outline"
                >
                  Usar resultado
                </Button>
              )}
              
              <Button variant="outline" onClick={onClose}>
                Cancelar
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VoiceSearch;
