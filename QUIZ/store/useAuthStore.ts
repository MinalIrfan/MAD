import { create } from 'zustand';
import { Teacher } from '@/types/database';
import { supabase } from '@/lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthState {
  teacher: Teacher | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  teacher: null,
  isLoading: true,
  isAuthenticated: false,

  login: async (email: string, password: string) => {
    try {
      const { data: teacher, error } = await supabase
        .from('teachers')
        .select('*')
        .eq('email', email.toLowerCase())
        .maybeSingle();

      if (error || !teacher) {
        return { success: false, error: 'Invalid email or password' };
      }

      await AsyncStorage.setItem('teacher_id', teacher.id);
      set({ teacher, isAuthenticated: true, isLoading: false });
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Login failed. Please try again.' };
    }
  },

  logout: async () => {
    await AsyncStorage.removeItem('teacher_id');
    set({ teacher: null, isAuthenticated: false });
  },

  checkAuth: async () => {
    try {
      const teacherId = await AsyncStorage.getItem('teacher_id');
      if (!teacherId) {
        set({ isLoading: false, isAuthenticated: false });
        return;
      }

      const { data: teacher } = await supabase
        .from('teachers')
        .select('*')
        .eq('id', teacherId)
        .maybeSingle();

      if (teacher) {
        set({ teacher, isAuthenticated: true, isLoading: false });
      } else {
        await AsyncStorage.removeItem('teacher_id');
        set({ isLoading: false, isAuthenticated: false });
      }
    } catch (error) {
      set({ isLoading: false, isAuthenticated: false });
    }
  },
}));
