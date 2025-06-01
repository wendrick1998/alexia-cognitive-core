
import { useCallback, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, FileUp, Sparkles } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { cn } from '@/lib/utils';
import { Project } from '@/types/project';

interface RevolutionaryUploadAreaProps {
  onUpload: (files: File[]) => Promise<void>;
  uploading: boolean;
  projects: Project[];
}

const RevolutionaryUploadArea = ({
  onUpload,
  uploading,
  projects
}: RevolutionaryUploadAreaProps) => {
  const [dragActive, setDragActive] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setDragActive(false);
    await onUpload(acceptedFiles);
  }, [onUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDragEnter: () => setDragActive(true),
    onDragLeave: () => setDragActive(false),
    accept: {
      'text/plain': ['.txt'],
      'text/markdown': ['.md'],
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg', '.gif']
    },
    multiple: true,
  });

  return (
    <Card className="mb-6 overflow-hidden">
      <CardContent className="p-0">
        <div
          {...getRootProps()}
          className={cn(
            "relative h-32 border-2 border-dashed transition-all duration-300 cursor-pointer",
            "flex flex-col items-center justify-center text-center p-6",
            isDragActive || dragActive 
              ? "border-blue-500 bg-blue-50 scale-105" 
              : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
          )}
        >
          <input {...getInputProps()} />
          
          {/* Background Animation */}
          {(isDragActive || dragActive) && (
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 animate-pulse" />
          )}

          {/* Upload Icon with Animation */}
          <div className={cn(
            "relative mb-3 transition-transform duration-300",
            (isDragActive || dragActive) && "scale-125"
          )}>
            {isDragActive || dragActive ? (
              <FileUp className="h-12 w-12 text-blue-500 animate-bounce" />
            ) : (
              <Upload className="h-12 w-12 text-gray-400" />
            )}
            
            {/* Sparkles Effect */}
            {(isDragActive || dragActive) && (
              <>
                <Sparkles className="absolute -top-2 -right-2 h-6 w-6 text-yellow-400 animate-ping" />
                <Sparkles className="absolute -bottom-1 -left-2 h-4 w-4 text-blue-400 animate-ping delay-300" />
              </>
            )}
          </div>

          {/* Text */}
          <div className="relative z-10">
            {isDragActive || dragActive ? (
              <p className="text-blue-600 font-semibold text-lg">
                ✨ Solte os arquivos aqui! ✨
              </p>
            ) : (
              <>
                <p className="text-gray-700 font-medium mb-2">
                  📁 Arraste arquivos ou toque para escolher
                </p>
                <p className="text-gray-500 text-sm mb-3">
                  PDF, TXT, MD, Imagens - Multi-seleção suportada
                </p>
                <Button 
                  variant="outline" 
                  disabled={uploading}
                  className="hover:scale-105 transition-transform"
                >
                  {uploading ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full mr-2" />
                      Enviando...
                    </>
                  ) : (
                    'Selecionar Arquivos'
                  )}
                </Button>
              </>
            )}
          </div>

          {/* Upload Progress */}
          {uploading && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200">
              <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 animate-pulse" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RevolutionaryUploadArea;
