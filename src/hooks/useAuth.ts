import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { getUserTimezone } from '../utils/timezone';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  timezone: string;
  workingHours: {
    start: string;
    end: string;
  };
  avatar?: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        loadUserProfile(session.user);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        if (session?.user) {
          await loadUserProfile(session.user);
        } else {
          setUser(null);
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (authUser: User) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (error && error.code === 'PGRST116') {
        // Profile doesn't exist, create it
        const newProfile = {
          id: authUser.id,
          name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User',
          email: authUser.email!,
          timezone: getUserTimezone(),
          working_hours_start: '09:00:00',
          working_hours_end: '17:00:00',
        };

        const { data: createdProfile, error: createError } = await supabase
          .from('profiles')
          .insert(newProfile)
          .select()
          .single();

        if (createError) throw createError;
        
        setUser({
          id: createdProfile.id,
          name: createdProfile.name,
          email: createdProfile.email,
          timezone: createdProfile.timezone,
          workingHours: {
            start: createdProfile.working_hours_start,
            end: createdProfile.working_hours_end,
          },
          avatar: createdProfile.avatar_url || undefined,
        });
      } else if (error) {
        throw error;
      } else {
        setUser({
          id: profile.id,
          name: profile.name,
          email: profile.email,
          timezone: profile.timezone,
          workingHours: {
            start: profile.working_hours_start,
            end: profile.working_hours_end,
          },
          avatar: profile.avatar_url || undefined,
        });
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
      },
    });

    if (error) throw error;
    return data;
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const updateProfile = async (updates: Partial<AuthUser>) => {
    if (!user) return;

    const profileUpdates = {
      name: updates.name,
      timezone: updates.timezone,
      working_hours_start: updates.workingHours?.start,
      working_hours_end: updates.workingHours?.end,
      avatar_url: updates.avatar,
    };

    const { error } = await supabase
      .from('profiles')
      .update(profileUpdates)
      .eq('id', user.id);

    if (error) throw error;

    setUser({ ...user, ...updates });
  };

  return {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
  };
};