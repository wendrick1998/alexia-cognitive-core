
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Construction, Clock } from 'lucide-react';

interface DevelopmentPageProps {
  title: string;
  description: string;
}

const DevelopmentPage = ({ title, description }: DevelopmentPageProps) => {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Card>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Construction className="w-16 h-16 text-orange-500" />
          </div>
          <CardTitle className="text-2xl">{title}</CardTitle>
          <CardDescription className="text-lg">
            {description}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <div className="flex items-center justify-center gap-2 text-orange-600 dark:text-orange-400">
            <Clock className="w-5 h-5" />
            <span>Em desenvolvimento</span>
          </div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Esta funcionalidade está sendo desenvolvida e estará disponível em breve.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default DevelopmentPage;
