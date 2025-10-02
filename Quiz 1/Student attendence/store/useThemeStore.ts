import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';

type Theme = 'light' | 'dark';

interface ThemeState {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => Promise<void>;
  loadTheme: () => Promise<void>;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: 'light',
  isDark: false,

  toggleTheme: async () => {
    const newTheme = get().theme === 'light' ? 'dark' : 'light';
    await AsyncStorage.setItem('theme', newTheme);
    set({ theme: newTheme, isDark: newTheme === 'dark' });
  },

  loadTheme: async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('theme');
      if (savedTheme === 'light' || savedTheme === 'dark') {
        set({ theme: savedTheme, isDark: savedTheme === 'dark' });
      }
    } catch (error) {
      console.error('Failed to load theme:', error);
    }
  },
}));
