import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Task } from '../types';

export const useTasks = (roomId?: string, userId?: string) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (roomId && userId) {
      fetchTasks();
      
      // Subscribe to real-time updates
      const subscription = supabase
        .channel(`tasks:${roomId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'tasks',
            filter: `room_id=eq.${roomId}`,
          },
          () => {
            fetchTasks();
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [roomId, userId]);

  const fetchTasks = async () => {
    if (!roomId) return;

    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          assigned_to_profile:profiles!tasks_assigned_to_fkey(*),
          created_by_profile:profiles!tasks_created_by_fkey(*)
        `)
        .eq('room_id', roomId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const transformedTasks: Task[] = data.map((task: any) => ({
        id: task.id,
        title: task.title,
        description: task.description,
        priority: task.priority as Task['priority'],
        status: task.status as Task['status'],
        assignedTo: task.assigned_to_profile?.name,
        dueDate: task.due_date ? new Date(task.due_date) : undefined,
        createdAt: new Date(task.created_at),
        roomId: task.room_id,
      }));

      setTasks(transformedTasks);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const createTask = async (taskData: {
    title: string;
    description?: string;
    priority?: Task['priority'];
    status?: Task['status'];
    assignedTo?: string;
    dueDate?: Date;
  }) => {
    if (!roomId || !userId) throw new Error('Missing required data');

    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          title: taskData.title,
          description: taskData.description,
          priority: taskData.priority || 'medium',
          status: taskData.status || 'todo',
          assigned_to: taskData.assignedTo,
          due_date: taskData.dueDate?.toISOString(),
          room_id: roomId,
          created_by: userId,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      throw err;
    }
  };

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({
          title: updates.title,
          description: updates.description,
          priority: updates.priority,
          status: updates.status,
          assigned_to: updates.assignedTo,
          due_date: updates.dueDate?.toISOString(),
        })
        .eq('id', taskId);

      if (error) throw error;
    } catch (err) {
      throw err;
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;
    } catch (err) {
      throw err;
    }
  };

  return {
    tasks,
    loading,
    error,
    createTask,
    updateTask,
    deleteTask,
    refetch: fetchTasks,
  };
};