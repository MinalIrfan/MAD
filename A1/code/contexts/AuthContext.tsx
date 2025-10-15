import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  id: string;
  name: string;
  email: string;
  bio: string;
  skills: string[];
  avatar: string;
  postsCreated: number;
  studentsHelped: number;
  rating: number;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const dummyUsers = [
  {
    id: '1',
    name: 'John Doe',
    email: 'user@skillswap.com',
    password: 'password123',
    bio: 'Passionate educator and lifelong learner. I love sharing knowledge and helping others grow their skills.',
    skills: ['JavaScript', 'React Native', 'Digital Marketing', 'Photography'],
    avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg',
    postsCreated: 12,
    studentsHelped: 45,
    rating: 4.8,
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah@skillswap.com',
    password: 'password123',
    bio: 'Full-stack developer with 5 years of experience.',
    skills: ['Python', 'JavaScript', 'Machine Learning'],
    avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg',
    postsCreated: 8,
    studentsHelped: 32,
    rating: 4.9,
  },
];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Error checking auth state:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const foundUser = dummyUsers.find(u => u.email === email && u.password === password);
    
    if (foundUser) {
      const { password: _, ...userWithoutPassword } = foundUser;
      await AsyncStorage.setItem('user', JSON.stringify(userWithoutPassword));
      setUser(userWithoutPassword);
      setIsLoading(false);
      return true;
    }
    
    setIsLoading(false);
    return false;
  };

  const signup = async (name: string, email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check if user already exists
    const existingUser = dummyUsers.find(u => u.email === email);
    if (existingUser) {
      setIsLoading(false);
      return false;
    }
    
    const newUser = {
      id: Date.now().toString(),
      name,
      email,
      bio: 'New to SkillSwap! Excited to learn and share knowledge.',
      skills: [],
      avatar: 'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg',
      postsCreated: 0,
      studentsHelped: 0,
      rating: 5.0,
    };
    
    await AsyncStorage.setItem('user', JSON.stringify(newUser));
    setUser(newUser);
    setIsLoading(false);
    return true;
  };

  const logout = async () => {
    await AsyncStorage.removeItem('user');
    setUser(null);
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) return;
    
    const updatedUser = { ...user, ...updates };
    await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      signup,
      logout,
      updateProfile,
      isLoading,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}