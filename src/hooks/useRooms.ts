import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Room } from '../types';

export const useRooms = (userId?: string) => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userId) {
      fetchRooms();
    }
  }, [userId]);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      
      // Fetch rooms with members
      const { data: roomsData, error: roomsError } = await supabase
        .from('rooms')
        .select(`
          *,
          room_members!inner(
            user_id,
            profiles(*)
          ),
          created_by_profile:profiles!rooms_created_by_fkey(*)
        `)
        .eq('room_members.user_id', userId);

      if (roomsError) throw roomsError;

      // Transform data to match Room interface
      const transformedRooms: Room[] = roomsData.map((room: any) => ({
        id: room.id,
        name: room.name,
        description: room.description || '',
        color: room.color,
        isActive: room.is_active,
        createdAt: new Date(room.created_at),
        members: room.room_members.map((member: any) => ({
          id: member.profiles.id,
          name: member.profiles.name,
          email: member.profiles.email,
          timezone: member.profiles.timezone,
          workingHours: {
            start: member.profiles.working_hours_start,
            end: member.profiles.working_hours_end,
          },
          isOnline: member.profiles.is_online,
          lastSeen: new Date(member.profiles.last_seen),
        })),
      }));

      setRooms(transformedRooms);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const createRoom = async (roomData: {
    name: string;
    description?: string;
    color?: string;
  }) => {
    if (!userId) throw new Error('User not authenticated');

    try {
      // Create room
      const { data: room, error: roomError } = await supabase
        .from('rooms')
        .insert({
          name: roomData.name,
          description: roomData.description,
          color: roomData.color || 'blue',
          created_by: userId,
        })
        .select()
        .single();

      if (roomError) throw roomError;

      // Add creator as member
      const { error: memberError } = await supabase
        .from('room_members')
        .insert({
          room_id: room.id,
          user_id: userId,
        });

      if (memberError) throw memberError;

      // Refresh rooms
      await fetchRooms();
      
      return room;
    } catch (err) {
      throw err;
    }
  };

  const joinRoom = async (roomId: string) => {
    if (!userId) throw new Error('User not authenticated');

    try {
      const { error } = await supabase
        .from('room_members')
        .insert({
          room_id: roomId,
          user_id: userId,
        });

      if (error) throw error;

      await fetchRooms();
    } catch (err) {
      throw err;
    }
  };

  return {
    rooms,
    loading,
    error,
    createRoom,
    joinRoom,
    refetch: fetchRooms,
  };
};