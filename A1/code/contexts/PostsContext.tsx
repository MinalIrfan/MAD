import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Post {
  id: string;
  title: string;
  description: string;
  category: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  createdAt: string;
  images: string[];
  videos: string[];
  likes: number;
  comments: number;
}

interface PostsContextType {
  posts: Post[];
  addPost: (post: Omit<Post, 'id' | 'createdAt' | 'likes' | 'comments'>) => Promise<void>;
  likePost: (postId: string) => void;
  isLoading: boolean;
}

const PostsContext = createContext<PostsContextType | undefined>(undefined);

const initialPosts: Post[] = [
  {
    id: '1',
    title: 'Learn JavaScript Programming',
    description: 'Complete beginner-friendly JavaScript course with hands-on projects.',
    category: 'Programming',
    authorId: '2',
    authorName: 'Sarah Johnson',
    authorAvatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg',
    createdAt: '2024-01-15T10:30:00Z',
    images: ['https://images.pexels.com/photos/11035380/pexels-photo-11035380.jpeg'],
    videos: [],
    likes: 24,
    comments: 8,
  },
  {
    id: '2',
    title: 'Guitar Lessons for Beginners',
    description: 'Learn acoustic guitar from scratch with personalized lessons.',
    category: 'Music',
    authorId: '3',
    authorName: 'Mike Rodriguez',
    authorAvatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg',
    createdAt: '2024-01-14T15:45:00Z',
    images: ['https://images.pexels.com/photos/1407322/pexels-photo-1407322.jpeg'],
    videos: [],
    likes: 18,
    comments: 5,
  },
  {
    id: '3',
    title: 'Digital Marketing Strategy',
    description: 'Master social media marketing and content creation strategies.',
    category: 'Marketing',
    authorId: '4',
    authorName: 'Emma Chen',
    authorAvatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg',
    createdAt: '2024-01-13T09:20:00Z',
    images: ['https://images.pexels.com/photos/265087/pexels-photo-265087.jpeg'],
    videos: [],
    likes: 31,
    comments: 12,
  },
];

export function PostsProvider({ children }: { children: React.ReactNode }) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      const storedPosts = await AsyncStorage.getItem('posts');
      if (storedPosts) {
        setPosts(JSON.parse(storedPosts));
      } else {
        setPosts(initialPosts);
        await AsyncStorage.setItem('posts', JSON.stringify(initialPosts));
      }
    } catch (error) {
      console.error('Error loading posts:', error);
      setPosts(initialPosts);
    } finally {
      setIsLoading(false);
    }
  };

  const addPost = async (newPost: Omit<Post, 'id' | 'createdAt' | 'likes' | 'comments'>) => {
    const post: Post = {
      ...newPost,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      likes: 0,
      comments: 0,
    };

    const updatedPosts = [post, ...posts];
    setPosts(updatedPosts);
    await AsyncStorage.setItem('posts', JSON.stringify(updatedPosts));
  };

  const likePost = async (postId: string) => {
    const updatedPosts = posts.map(post =>
      post.id === postId ? { ...post, likes: post.likes + 1 } : post
    );
    setPosts(updatedPosts);
    await AsyncStorage.setItem('posts', JSON.stringify(updatedPosts));
  };

  return (
    <PostsContext.Provider value={{
      posts,
      addPost,
      likePost,
      isLoading,
    }}>
      {children}
    </PostsContext.Provider>
  );
}

export function usePosts() {
  const context = useContext(PostsContext);
  if (context === undefined) {
    throw new Error('usePosts must be used within a PostsProvider');
  }
  return context;
}