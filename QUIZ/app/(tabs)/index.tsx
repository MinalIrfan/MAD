import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/useAuthStore';
import { useThemeStore } from '@/store/useThemeStore';
import { supabase } from '@/lib/supabase';
import { Class } from '@/types/database';
import { LinearGradient } from 'expo-linear-gradient';
import { BookOpen, Users, ClipboardCheck, TrendingUp, ChevronRight } from 'lucide-react-native';

export default function DashboardScreen() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const teacher = useAuthStore((state) => state.teacher);
  const isDark = useThemeStore((state) => state.isDark);
  const router = useRouter();

  const bgColor = isDark ? '#0f172a' : '#f8fafc';
  const cardBg = isDark ? '#1e293b' : '#ffffff';
  const textColor = isDark ? '#f1f5f9' : '#1e293b';
  const subTextColor = isDark ? '#94a3b8' : '#64748b';

  const fetchClasses = async () => {
    try {
      if (!teacher) return;

      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .eq('teacher_id', teacher.id)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setClasses(data);
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, [teacher]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchClasses();
  };

  const quickActions = [
    {
      title: 'Take Attendance',
      icon: ClipboardCheck,
      color: ['#3b82f6', '#2563eb'],
      onPress: () => router.push('/attendance'),
    },
    {
      title: 'View Reports',
      icon: TrendingUp,
      color: ['#8b5cf6', '#7c3aed'],
      onPress: () => router.push('/reports'),
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <View>
            <Text style={[styles.greeting, { color: subTextColor }]}>Welcome back,</Text>
            <Text style={[styles.name, { color: textColor }]}>{teacher?.full_name}</Text>
          </View>
          {teacher?.avatar_url && (
            <Image source={{ uri: teacher.avatar_url }} style={styles.avatar} />
          )}
        </View>

        <View style={styles.quickActionsContainer}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>Quick Actions</Text>
          <View style={styles.quickActions}>
            {quickActions.map((action, index) => (
              <TouchableOpacity
                key={index}
                style={styles.quickActionCard}
                onPress={action.onPress}
              >
                <LinearGradient
                  colors={action.color as [string, string]}
                  style={styles.quickActionGradient}
                >
                  <action.icon size={28} color="#ffffff" />
                  <Text style={styles.quickActionText}>{action.title}</Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.classesContainer}>
          <View style={styles.classesTitleRow}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>My Classes</Text>
            <View style={[styles.badge, { backgroundColor: isDark ? '#334155' : '#e0e7ff' }]}>
              <Text style={[styles.badgeText, { color: isDark ? '#94a3b8' : '#3b82f6' }]}>
                {classes.length}
              </Text>
            </View>
          </View>

          {loading ? (
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: subTextColor }]}>Loading classes...</Text>
            </View>
          ) : classes.length === 0 ? (
            <View style={styles.emptyContainer}>
              <BookOpen size={48} color={subTextColor} />
              <Text style={[styles.emptyText, { color: subTextColor }]}>No classes yet</Text>
              <Text style={[styles.emptySubtext, { color: subTextColor }]}>
                Your classes will appear here
              </Text>
            </View>
          ) : (
            classes.map((classItem) => (
              <TouchableOpacity
                key={classItem.id}
                style={[styles.classCard, { backgroundColor: cardBg }]}
                onPress={() => router.push(`/attendance?classId=${classItem.id}`)}
              >
                <View style={styles.classCardContent}>
                  <View style={styles.classIconContainer}>
                    <LinearGradient
                      colors={['#3b82f6', '#8b5cf6']}
                      style={styles.classIcon}
                    >
                      <BookOpen size={24} color="#ffffff" />
                    </LinearGradient>
                  </View>
                  <View style={styles.classInfo}>
                    <Text style={[styles.className, { color: textColor }]}>
                      {classItem.name}
                    </Text>
                    <View style={styles.classMetaRow}>
                      {classItem.subject && (
                        <Text style={[styles.classMeta, { color: subTextColor }]}>
                          {classItem.subject}
                        </Text>
                      )}
                      {classItem.grade_level && (
                        <>
                          <Text style={[styles.classMeta, { color: subTextColor }]}> • </Text>
                          <Text style={[styles.classMeta, { color: subTextColor }]}>
                            {classItem.grade_level}
                          </Text>
                        </>
                      )}
                    </View>
                  </View>
                  <ChevronRight size={20} color={subTextColor} />
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    paddingTop: 60,
  },
  greeting: {
    fontSize: 14,
    marginBottom: 4,
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  quickActionsContainer: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 16,
  },
  quickActionCard: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  quickActionGradient: {
    padding: 20,
    alignItems: 'center',
    gap: 12,
  },
  quickActionText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  classesContainer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  classesTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 8,
  },
  classCard: {
    borderRadius: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  classCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  classIconContainer: {
    marginRight: 16,
  },
  classIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  classInfo: {
    flex: 1,
  },
  className: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  classMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  classMeta: {
    fontSize: 14,
  },
});
