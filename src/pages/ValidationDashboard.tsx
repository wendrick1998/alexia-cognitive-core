
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MemoryValidationDashboard from '@/components/validation/MemoryValidationDashboard';
import ContextThreadViewer from '@/components/context/ContextThreadViewer';

export default function ValidationDashboard() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">FASE 5 - Prevenção de Alucinações</h1>
        <p className="text-muted-foreground mt-2">
          Sistema de verificação multi-camadas e recuperação profunda de contexto
        </p>
      </div>

      <Tabs defaultValue="validation" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="validation">Validação de Memórias</TabsTrigger>
          <TabsTrigger value="context">Thread de Contexto</TabsTrigger>
        </TabsList>

        <TabsContent value="validation">
          <MemoryValidationDashboard />
        </TabsContent>

        <TabsContent value="context">
          <ContextThreadViewer />
        </TabsContent>
      </Tabs>
    </div>
  );
}
