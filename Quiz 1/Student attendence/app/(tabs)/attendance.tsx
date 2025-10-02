import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useAuthStore } from '@/store/useAuthStore';
import { useThemeStore } from '@/store/useThemeStore';
import { supabase } from '@/lib/supabase';
import { Class, Student, AttendanceRecord } from '@/types/database';
import { LinearGradient } from 'expo-linear-gradient';
import { Check, X, Clock, Users, Calendar, ChevronDown } from 'lucide-react-native';
import { sendAttendanceCompletedNotification } from '@/utils/notifications';

type AttendanceStatus = 'present' | 'absent' | 'late';

interface StudentAttendance {
  student: Student;
  status: AttendanceStatus | null;
}

export default function AttendanceScreen() {
  const { classId: urlClassId } = useLocalSearchParams();
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [students, setStudents] = useState<StudentAttendance[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showClassPicker, setShowClassPicker] = useState(false);
  const teacher = useAuthStore((state) => state.teacher);
  const isDark = useThemeStore((state) => state.isDark);

  const bgColor = isDark ? '#0f172a' : '#f8fafc';
  const cardBg = isDark ? '#1e293b' : '#ffffff';
  const textColor = isDark ? '#f1f5f9' : '#1e293b';
  const subTextColor = isDark ? '#94a3b8' : '#64748b';

  useEffect(() => {
    fetchClasses();
  }, [teacher]);

  useEffect(() => {
    if (urlClassId && typeof urlClassId === 'string') {
      setSelectedClassId(urlClassId);
    }
  }, [urlClassId]);

  useEffect(() => {
    if (selectedClassId) {
      fetchStudents();
    }
  }, [selectedClassId, selectedDate]);

  const fetchClasses = async () => {
    if (!teacher) return;

    const { data } = await supabase
      .from('classes')
      .select('*')
      .eq('teacher_id', teacher.id)
      .order('name');

    if (data) {
      setClasses(data);
      if (!selectedClassId && data.length > 0) {
        setSelectedClassId(data[0].id);
      }
    }
  };

  const fetchStudents = async () => {
    if (!selectedClassId) return;

    setLoading(true);
    const { data: studentsData } = await supabase
      .from('students')
      .select('*')
      .eq('class_id', selectedClassId)
      .order('full_name');

    if (studentsData) {
      const { data: attendanceData } = await supabase
        .from('attendance_records')
        .select('*')
        .eq('class_id', selectedClassId)
        .eq('date', selectedDate);

      const studentAttendance: StudentAttendance[] = studentsData.map((student) => {
        const record = attendanceData?.find((a) => a.student_id === student.id);
        return {
          student,
          status: record?.status || null,
        };
      });

      setStudents(studentAttendance);
    }
    setLoading(false);
  };

  const updateAttendance = (studentId: string, status: AttendanceStatus) => {
    setStudents((prev) =>
      prev.map((item) =>
        item.student.id === studentId ? { ...item, status } : item
      )
    );
  };

  const markAll = (status: AttendanceStatus) => {
    setStudents((prev) => prev.map((item) => ({ ...item, status })));
  };

  const saveAttendance = async () => {
    if (!teacher || !selectedClassId) return;

    setSaving(true);

    try {
      const records = students
        .filter((item) => item.status !== null)
        .map((item) => ({
          student_id: item.student.id,
          class_id: selectedClassId,
          teacher_id: teacher.id,
          status: item.status!,
          date: selectedDate,
        }));

      await supabase.from('attendance_records').delete().eq('class_id', selectedClassId).eq('date', selectedDate);

      if (records.length > 0) {
        const { error } = await supabase.from('attendance_records').insert(records);

        if (error) throw error;
      }

      const className = selectedClass?.name || 'Class';
      await sendAttendanceCompletedNotification(className);
      Alert.alert('Success', 'Attendance saved successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to save attendance');
    } finally {
      setSaving(false);
    }
  };

  const selectedClass = classes.find((c) => c.id === selectedClassId);
  const presentCount = students.filter((s) => s.status === 'present').length;
  const absentCount = students.filter((s) => s.status === 'absent').length;
  const lateCount = students.filter((s) => s.status === 'late').length;

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: textColor }]}>Take Attendance</Text>
        <View style={styles.dateContainer}>
          <Calendar size={16} color={subTextColor} />
          <Text style={[styles.dateText, { color: subTextColor }]}>
            {new Date(selectedDate).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </Text>
        </View>
      </View>

      <View style={styles.content}>
        <TouchableOpacity
          style={[styles.classSelector, { backgroundColor: cardBg }]}
          onPress={() => setShowClassPicker(!showClassPicker)}
        >
          <View style={styles.classSelectorContent}>
            <Users size={20} color={subTextColor} />
            <Text style={[styles.classSelectorText, { color: textColor }]}>
              {selectedClass?.name || 'Select a class'}
            </Text>
          </View>
          <ChevronDown size={20} color={subTextColor} />
        </TouchableOpacity>

        {showClassPicker && (
          <View style={[styles.classPicker, { backgroundColor: cardBg }]}>
            {classes.map((classItem) => (
              <TouchableOpacity
                key={classItem.id}
                style={styles.classPickerItem}
                onPress={() => {
                  setSelectedClassId(classItem.id);
                  setShowClassPicker(false);
                }}
              >
                <Text
                  style={[
                    styles.classPickerText,
                    { color: classItem.id === selectedClassId ? '#3b82f6' : textColor },
                  ]}
                >
                  {classItem.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={[styles.statsContainer, { backgroundColor: cardBg }]}>
          <View style={styles.statItem}>
            <View style={[styles.statBadge, { backgroundColor: '#dcfce7' }]}>
              <Check size={16} color="#16a34a" />
            </View>
            <Text style={[styles.statValue, { color: textColor }]}>{presentCount}</Text>
            <Text style={[styles.statLabel, { color: subTextColor }]}>Present</Text>
          </View>
          <View style={styles.statItem}>
            <View style={[styles.statBadge, { backgroundColor: '#fee2e2' }]}>
              <X size={16} color="#dc2626" />
            </View>
            <Text style={[styles.statValue, { color: textColor }]}>{absentCount}</Text>
            <Text style={[styles.statLabel, { color: subTextColor }]}>Absent</Text>
          </View>
          <View style={styles.statItem}>
            <View style={[styles.statBadge, { backgroundColor: '#fef3c7' }]}>
              <Clock size={16} color="#ca8a04" />
            </View>
            <Text style={[styles.statValue, { color: textColor }]}>{lateCount}</Text>
            <Text style={[styles.statLabel, { color: subTextColor }]}>Late</Text>
          </View>
        </View>

        <View style={styles.bulkActions}>
          <TouchableOpacity
            style={[styles.bulkButton, { backgroundColor: cardBg }]}
            onPress={() => markAll('present')}
          >
            <Text style={[styles.bulkButtonText, { color: '#16a34a' }]}>Mark All Present</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.bulkButton, { backgroundColor: cardBg }]}
            onPress={() => markAll('absent')}
          >
            <Text style={[styles.bulkButtonText, { color: '#dc2626' }]}>Mark All Absent</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.studentList} showsVerticalScrollIndicator={false}>
          {loading ? (
            <Text style={[styles.emptyText, { color: subTextColor }]}>Loading students...</Text>
          ) : students.length === 0 ? (
            <Text style={[styles.emptyText, { color: subTextColor }]}>No students in this class</Text>
          ) : (
            students.map((item) => (
              <View key={item.student.id} style={[styles.studentCard, { backgroundColor: cardBg }]}>
                <View style={styles.studentInfo}>
                  {item.student.avatar_url ? (
                    <Image source={{ uri: item.student.avatar_url }} style={styles.studentAvatar} />
                  ) : (
                    <View style={[styles.studentAvatarPlaceholder, { backgroundColor: isDark ? '#334155' : '#e2e8f0' }]}>
                      <Text style={[styles.avatarPlaceholderText, { color: subTextColor }]}>
                        {item.student.full_name.charAt(0)}
                      </Text>
                    </View>
                  )}
                  <View style={styles.studentDetails}>
                    <Text style={[styles.studentName, { color: textColor }]}>{item.student.full_name}</Text>
                    {item.student.roll_number && (
                      <Text style={[styles.studentRoll, { color: subTextColor }]}>
                        Roll: {item.student.roll_number}
                      </Text>
                    )}
                  </View>
                </View>
                <View style={styles.attendanceButtons}>
                  <TouchableOpacity
                    style={[
                      styles.statusButton,
                      item.status === 'present' && styles.statusButtonActive,
                      { backgroundColor: item.status === 'present' ? '#dcfce7' : isDark ? '#334155' : '#f1f5f9' },
                    ]}
                    onPress={() => updateAttendance(item.student.id, 'present')}
                  >
                    <Check size={18} color={item.status === 'present' ? '#16a34a' : subTextColor} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.statusButton,
                      item.status === 'late' && styles.statusButtonActive,
                      { backgroundColor: item.status === 'late' ? '#fef3c7' : isDark ? '#334155' : '#f1f5f9' },
                    ]}
                    onPress={() => updateAttendance(item.student.id, 'late')}
                  >
                    <Clock size={18} color={item.status === 'late' ? '#ca8a04' : subTextColor} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.statusButton,
                      item.status === 'absent' && styles.statusButtonActive,
                      { backgroundColor: item.status === 'absent' ? '#fee2e2' : isDark ? '#334155' : '#f1f5f9' },
                    ]}
                    onPress={() => updateAttendance(item.student.id, 'absent')}
                  >
                    <X size={18} color={item.status === 'absent' ? '#dc2626' : subTextColor} />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </ScrollView>

        {students.length > 0 && (
          <TouchableOpacity
            style={[styles.saveButton, saving && styles.saveButtonDisabled]}
            onPress={saveAttendance}
            disabled={saving}
          >
            <LinearGradient colors={['#3b82f6', '#8b5cf6']} style={styles.saveButtonGradient}>
              <Text style={styles.saveButtonText}>{saving ? 'Saving...' : 'Save Attendance'}</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateText: {
    fontSize: 14,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  classSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  classSelectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  classSelectorText: {
    fontSize: 16,
    fontWeight: '600',
  },
  classPicker: {
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  classPickerItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  classPickerText: {
    fontSize: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    gap: 8,
  },
  statBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
  },
  bulkActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  bulkButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  bulkButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  studentList: {
    flex: 1,
    marginBottom: 16,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    marginTop: 24,
  },
  studentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  studentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  studentAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  studentAvatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarPlaceholderText: {
    fontSize: 20,
    fontWeight: '600',
  },
  studentDetails: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  studentRoll: {
    fontSize: 13,
  },
  attendanceButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  statusButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusButtonActive: {
    transform: [{ scale: 1.1 }],
  },
  saveButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 24,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
