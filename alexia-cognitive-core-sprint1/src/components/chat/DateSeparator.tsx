
import { memo } from 'react';
import { format, isToday, isYesterday } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface DateSeparatorProps {
  date: Date;
}

const DateSeparator = memo(({ date }: DateSeparatorProps) => {
  const formatDate = (date: Date) => {
    if (isToday(date)) {
      return 'Hoje';
    }
    if (isYesterday(date)) {
      return 'Ontem';
    }
    return format(date, 'EEEE, d MMMM', { locale: ptBR });
  };

  return (
    <div className="flex items-center justify-center my-6">
      <div className="flex items-center gap-3">
        <div className="h-px bg-gray-300 dark:bg-gray-600 flex-1 w-12" />
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-900 px-3 py-1 rounded-full border border-gray-200 dark:border-gray-700">
          {formatDate(date)}
        </span>
        <div className="h-px bg-gray-300 dark:bg-gray-600 flex-1 w-12" />
      </div>
    </div>
  );
});

DateSeparator.displayName = 'DateSeparator';

export default DateSeparator;
