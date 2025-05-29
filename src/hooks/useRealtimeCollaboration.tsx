import { useState, useCallback, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export interface CollaborativeUser {
  id: string;
  name: string;
  avatar?: string;
  cursor?: { x: number; y: number };
  selection?: { start: number; end: number };
  status: 'active' | 'idle' | 'away';
  lastSeen: Date;
  cognitiveState: {
    currentThought: string;
    focusLevel: number;
    workingMemory: string[];
  };
}

export interface ThoughtStream {
  id: string;
  userId: string;
  content: string;
  type: 'insight' | 'question' | 'decision' | 'observation';
  timestamp: Date;
  connections: string[];
  ephemeral: boolean;
}

export interface SharedContext {
  id: string;
  name: string;
  type: 'temporary' | 'persistent' | 'project_based';
  participants: string[];
  knowledgeNodes: string[];
  createdAt: Date;
  expiresAt?: Date;
  permissions: {
    read: string[];
    write: string[];
    admin: string[];
  };
}

export function useRealtimeCollaboration() {
  const { user } = useAuth();
  const [collaborators, setCollaborators] = useState<CollaborativeUser[]>([]);
  const [thoughtStreams, setThoughtStreams] = useState<ThoughtStream[]>([]);
  const [sharedContexts, setSharedContexts] = useState<SharedContext[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  
  const presenceChannel = useRef<any>(null);
  const thoughtChannel = useRef<any>(null);
  const myPresence = useRef<CollaborativeUser | null>(null);

  // Initialize real-time presence tracking
  const initializePresence = useCallback(async () => {
    if (!user) return;

    const roomId = `cognitive_space_${user.id}`;
    
    presenceChannel.current = supabase.channel(roomId, {
      config: {
        presence: {
          key: user.id,
        },
      },
    });

    // Track presence events
    presenceChannel.current
      .on('presence', { event: 'sync' }, () => {
        const newState = presenceChannel.current.presenceState();
        const users: CollaborativeUser[] = [];
        
        Object.keys(newState).forEach((userId) => {
          const presence = newState[userId][0];
          if (presence) {
            users.push({
              id: userId,
              name: presence.name || 'Anonymous',
              avatar: presence.avatar,
              status: presence.status || 'active',
              lastSeen: new Date(presence.lastSeen || Date.now()),
              cognitiveState: presence.cognitiveState || {
                currentThought: '',
                focusLevel: 0.5,
                workingMemory: []
              }
            });
          }
        });
        
        setCollaborators(users);
        console.log('🤝 Presence sync:', users.length, 'collaborators');
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('👋 User joined:', key, newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('👋 User left:', key, leftPresences);
      });

    // Subscribe and start tracking
    await presenceChannel.current.subscribe(async (status: string) => {
      if (status === 'SUBSCRIBED') {
        const userPresence: Partial<CollaborativeUser> = {
          name: user.email || 'Anonymous',
          status: 'active',
          lastSeen: new Date(),
          cognitiveState: {
            currentThought: '',
            focusLevel: 0.8,
            workingMemory: []
          }
        };

        await presenceChannel.current.track(userPresence);
        myPresence.current = userPresence as CollaborativeUser;
        setIsConnected(true);
      }
    });
  }, [user]);

  // Initialize thought streaming
  const initializeThoughtStreaming = useCallback(() => {
    if (!user) return;

    thoughtChannel.current = supabase.channel('thought_stream', {
      config: {
        broadcast: { self: true },
      },
    });

    thoughtChannel.current
      .on('broadcast', { event: 'thought_shared' }, (payload: any) => {
        const thoughtStream: ThoughtStream = {
          id: payload.id,
          userId: payload.userId,
          content: payload.content,
          type: payload.type,
          timestamp: new Date(payload.timestamp),
          connections: payload.connections || [],
          ephemeral: payload.ephemeral || false
        };

        setThoughtStreams(prev => {
          // Keep only last 50 thoughts
          const updated = [thoughtStream, ...prev].slice(0, 50);
          
          // Remove ephemeral thoughts after 30 seconds
          if (thoughtStream.ephemeral) {
            setTimeout(() => {
              setThoughtStreams(current => 
                current.filter(t => t.id !== thoughtStream.id)
              );
            }, 30000);
          }
          
          return updated;
        });
      });

    thoughtChannel.current.subscribe();
  }, [user]);

  // Share thought in real-time
  const shareThought = useCallback(async (
    content: string,
    type: ThoughtStream['type'] = 'insight',
    ephemeral: boolean = false,
    connections: string[] = []
  ) => {
    if (!thoughtChannel.current || !user) return;

    const thoughtStream: Omit<ThoughtStream, 'timestamp'> & { timestamp: string } = {
      id: crypto.randomUUID(),
      userId: user.id,
      content,
      type,
      timestamp: new Date().toISOString(),
      connections,
      ephemeral
    };

    await thoughtChannel.current.send({
      type: 'broadcast',
      event: 'thought_shared',
      payload: thoughtStream
    });

    console.log('💭 Thought shared:', content.substring(0, 50));
  }, [user]);

  // Update cognitive state
  const updateCognitiveState = useCallback(async (
    state: Partial<CollaborativeUser['cognitiveState']>
  ) => {
    if (!presenceChannel.current || !myPresence.current) return;

    const updatedPresence = {
      ...myPresence.current,
      cognitiveState: {
        ...myPresence.current.cognitiveState,
        ...state
      },
      lastSeen: new Date()
    };

    await presenceChannel.current.track(updatedPresence);
    myPresence.current = updatedPresence;
  }, []);

  // Create shared context
  const createSharedContext = useCallback(async (
    name: string,
    type: SharedContext['type'] = 'temporary',
    participants: string[] = [],
    knowledgeNodes: string[] = []
  ): Promise<SharedContext | null> => {
    if (!user) return null;

    try {
      const sharedContext: Omit<SharedContext, 'id'> = {
        name,
        type,
        participants: [user.id, ...participants],
        knowledgeNodes,
        createdAt: new Date(),
        expiresAt: type === 'temporary' ? new Date(Date.now() + 24 * 60 * 60 * 1000) : undefined,
        permissions: {
          read: [user.id, ...participants],
          write: [user.id, ...participants],
          admin: [user.id]
        }
      };

      // Since we don't have a shared_contexts table, we'll store this in memory only
      const newContext: SharedContext = {
        ...sharedContext,
        id: crypto.randomUUID()
      };

      setSharedContexts(prev => [newContext, ...prev]);
      console.log('🌐 Shared context created:', name);
      
      return newContext;
    } catch (error) {
      console.error('❌ Error creating shared context:', error);
      return null;
    }
  }, [user]);

  // Load shared contexts
  const loadSharedContexts = useCallback(async () => {
    if (!user) return;

    try {
      // Since we don't have a shared_contexts table, we'll just use what's in memory
      console.log('Loading shared contexts from memory');
    } catch (error) {
      console.error('❌ Error loading shared contexts:', error);
    }
  }, [user]);

  // Disconnect and cleanup
  const disconnect = useCallback(() => {
    if (presenceChannel.current) {
      presenceChannel.current.unsubscribe();
      presenceChannel.current = null;
    }
    
    if (thoughtChannel.current) {
      thoughtChannel.current.unsubscribe();
      thoughtChannel.current = null;
    }
    
    setIsConnected(false);
    setCollaborators([]);
    setThoughtStreams([]);
  }, []);

  // Auto-update presence status
  useEffect(() => {
    if (!isConnected) return;

    const interval = setInterval(() => {
      updateCognitiveState({ lastSeen: new Date() });
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [isConnected, updateCognitiveState]);

  // Initialize on mount
  useEffect(() => {
    if (user) {
      initializePresence();
      initializeThoughtStreaming();
      loadSharedContexts();
    }

    return disconnect;
  }, [user, initializePresence, initializeThoughtStreaming, loadSharedContexts, disconnect]);

  return {
    // State
    collaborators,
    thoughtStreams,
    sharedContexts,
    isConnected,
    
    // Actions
    shareThought,
    updateCognitiveState,
    createSharedContext,
    loadSharedContexts,
    disconnect,
    
    // Current user
    myPresence: myPresence.current
  };
}
