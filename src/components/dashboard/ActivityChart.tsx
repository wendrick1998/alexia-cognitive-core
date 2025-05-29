
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

interface ActivityData {
  date: string;
  messages: number;
}

interface ActivityChartProps {
  data: ActivityData[];
}

const ActivityChart = ({ data }: ActivityChartProps) => {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', { 
      weekday: 'short',
      day: 'numeric' 
    });
  };

  const formatTooltip = (value: number, name: string, props: any) => {
    const fullDate = new Date(props.label).toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    return [`${value} mensagens`, fullDate];
  };

  return (
    <div className="h-48">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
          <defs>
            <linearGradient id="activityGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366F1" stopOpacity={0.8} />
              <stop offset="50%" stopColor="#8B5CF6" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#EC4899" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          
          <XAxis 
            dataKey="date" 
            tickFormatter={formatDate}
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }}
          />
          
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }}
            domain={[0, 'dataMax + 5']}
          />
          
          <Tooltip
            formatter={formatTooltip}
            contentStyle={{
              backgroundColor: 'rgba(0,0,0,0.9)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
              color: 'white',
              fontSize: '14px'
            }}
            cursor={{ stroke: 'rgba(99,102,241,0.5)', strokeWidth: 2 }}
          />
          
          <Area
            type="monotone"
            dataKey="messages"
            stroke="#6366F1"
            strokeWidth={3}
            fill="url(#activityGradient)"
            dot={{ fill: '#6366F1', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: '#6366F1', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ActivityChart;
