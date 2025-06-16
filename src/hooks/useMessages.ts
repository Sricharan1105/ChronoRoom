import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Message } from '../types';

export const useMessages = (roomId?: string, userId?: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (roomId && userId) {
      fetchMessages();
      
      // Subscribe to real-time updates
      const subscription = supabase
        .channel(`messages:${roomId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `room_id=eq.${roomId}`,
          },
          (payload) => {
            fetchMessages(); // Refetch to get author details
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [roomId, userId]);

  const fetchMessages = async () => {
    if (!roomId) return;

    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          author:profiles!messages_author_id_fkey(*)
        `)
        .eq('room_id', roomId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const transformedMessages: Message[] = data.map((message: any) => ({
        id: message.id,
        content: message.content,
        authorId: message.author_id,
        author: {
          id: message.author.id,
          name: message.author.name,
          email: message.author.email,
          timezone: message.author.timezone,
          workingHours: {
            start: message.author.working_hours_start,
            end: message.author.working_hours_end,
          },
          isOnline: message.author.is_online,
          lastSeen: new Date(message.author.last_seen),
        },
        timestamp: new Date(message.created_at),
        roomId: message.room_id,
      }));

      setMessages(transformedMessages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (content: string) => {
    if (!roomId || !userId) throw new Error('Missing required data');

    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          content,
          author_id: userId,
          room_id: roomId,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      throw err;
    }
  };

  return {
    messages,
    loading,
    error,
    sendMessage,
    refetch: fetchMessages,
  };
};