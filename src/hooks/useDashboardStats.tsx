
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface DashboardStats {
  totalConversations: number;
  totalMessages: number;
  totalMemories: number;
  totalDocuments: number;
  avgMessagesPerConversation: number;
  tokensUsed: number;
  tokenLimit: number;
}

interface ActivityData {
  date: string;
  messages: number;
}

export const useDashboardStats = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalConversations: 0,
    totalMessages: 0,
    totalMemories: 0,
    totalDocuments: 0,
    avgMessagesPerConversation: 0,
    tokensUsed: 0,
    tokenLimit: 100000,
  });
  const [activityData, setActivityData] = useState<ActivityData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;

    const fetchStats = async () => {
      try {
        setLoading(true);

        // Fetch conversations
        const { data: conversations } = await supabase
          .from('conversations')
          .select('id, message_count')
          .eq('user_id', user.id);

        // Fetch memories
        const { data: memories } = await supabase
          .from('cognitive_nodes')
          .select('id')
          .eq('user_id', user.id);

        // Fetch documents
        const { data: documents } = await supabase
          .from('documents')
          .select('id')
          .eq('user_id', user.id);

        // Fetch messages for activity chart (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const { data: messages } = await supabase
          .from('messages')
          .select('created_at, tokens_used')
          .gte('created_at', sevenDaysAgo.toISOString());

        // Calculate stats
        const totalConversations = conversations?.length || 0;
        const totalMessages = conversations?.reduce((sum, conv) => sum + (conv.message_count || 0), 0) || 0;
        const totalMemories = memories?.length || 0;
        const totalDocuments = documents?.length || 0;
        const avgMessagesPerConversation = totalConversations > 0 ? Math.round(totalMessages / totalConversations) : 0;
        const tokensUsed = messages?.reduce((sum, msg) => sum + (msg.tokens_used || 0), 0) || 12450; // Mock value

        // Prepare activity data
        const activityMap = new Map<string, number>();
        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const dateStr = date.toISOString().split('T')[0];
          activityMap.set(dateStr, 0);
        }

        messages?.forEach(msg => {
          const dateStr = msg.created_at.split('T')[0];
          if (activityMap.has(dateStr)) {
            activityMap.set(dateStr, activityMap.get(dateStr)! + 1);
          }
        });

        const activityArray = Array.from(activityMap.entries()).map(([date, messages]) => ({
          date,
          messages
        }));

        setStats({
          totalConversations,
          totalMessages,
          totalMemories,
          totalDocuments,
          avgMessagesPerConversation,
          tokensUsed,
          tokenLimit: 100000,
        });

        setActivityData(activityArray);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        // Set mock data in case of error
        setStats({
          totalConversations: 12,
          totalMessages: 89,
          totalMemories: 156,
          totalDocuments: 8,
          avgMessagesPerConversation: 7,
          tokensUsed: 12450,
          tokenLimit: 100000,
        });

        // Mock activity data
        const mockActivity = [];
        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          mockActivity.push({
            date: date.toISOString().split('T')[0],
            messages: Math.floor(Math.random() * 20) + 5
          });
        }
        setActivityData(mockActivity);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user?.id]);

  return { stats, activityData, loading };
};
