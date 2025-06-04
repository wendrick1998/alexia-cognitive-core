
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Construction, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface DevelopmentPageProps {
  title?: string;
  description?: string;
}

export default function DevelopmentPage({ 
  title = "Página em Desenvolvimento", 
  description = "Esta funcionalidade está sendo desenvolvida e estará disponível em breve." 
}: DevelopmentPageProps) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
      <Card className="max-w-md w-full">
        <CardHeader>
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Construction className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-xl">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="px-4 py-2 bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-lg text-sm font-medium">
              Em desenvolvimento
            </div>
            <Button 
              variant="outline" 
              onClick={() => navigate("/")}
              className="w-full"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
