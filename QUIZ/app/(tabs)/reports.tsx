import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useAuthStore } from '@/store/useAuthStore';
import { useThemeStore } from '@/store/useThemeStore';
import { supabase } from '@/lib/supabase';
import { Class, Student, AttendanceRecord, StudentAttendanceStats } from '@/types/database';
import { VictoryBar, VictoryChart, VictoryTheme, VictoryAxis, VictoryPie } from 'victory';
import { Calendar as RNCalendar } from 'react-native-calendars';
import { Calendar, TrendingUp, Users, Download, ChevronDown } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function ReportsScreen() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [studentStats, setStudentStats] = useState<StudentAttendanceStats[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [showClassPicker, setShowClassPicker] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
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
    if (selectedClassId) {
      fetchReports();
    }
  }, [selectedClassId]);

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

  const fetchReports = async () => {
    if (!selectedClassId) return;

    const { data: students } = await supabase
      .from('students')
      .select('*')
      .eq('class_id', selectedClassId)
      .order('full_name');

    const { data: records } = await supabase
      .from('attendance_records')
      .select('*')
      .eq('class_id', selectedClassId);

    if (students && records) {
      setAttendanceRecords(records);

      const stats: StudentAttendanceStats[] = students.map((student) => {
        const studentRecords = records.filter((r) => r.student_id === student.id);
        const totalDays = studentRecords.length;
        const presentDays = studentRecords.filter((r) => r.status === 'present').length;
        const absentDays = studentRecords.filter((r) => r.status === 'absent').length;
        const lateDays = studentRecords.filter((r) => r.status === 'late').length;
        const attendancePercentage = totalDays > 0 ? (presentDays / totalDays) * 100 : 0;

        return {
          student,
          totalDays,
          presentDays,
          absentDays,
          lateDays,
          attendancePercentage,
        };
      });

      setStudentStats(stats.sort((a, b) => b.attendancePercentage - a.attendancePercentage));
    }
  };

  const selectedClass = classes.find((c) => c.id === selectedClassId);

  const totalPresent = studentStats.reduce((sum, s) => sum + s.presentDays, 0);
  const totalAbsent = studentStats.reduce((sum, s) => sum + s.absentDays, 0);
  const totalLate = studentStats.reduce((sum, s) => sum + s.lateDays, 0);

  const pieData = [
    { x: 'Present', y: totalPresent, color: '#16a34a' },
    { x: 'Absent', y: totalAbsent, color: '#dc2626' },
    { x: 'Late', y: totalLate, color: '#ca8a04' },
  ].filter((d) => d.y > 0);

  const barData = studentStats.slice(0, 5).map((stat) => ({
    x: stat.student.full_name.split(' ')[0],
    y: stat.attendancePercentage,
  }));

  const markedDates = attendanceRecords.reduce((acc, record) => {
    const dateKey = record.date;
    if (!acc[dateKey]) {
      acc[dateKey] = { marked: true, dotColor: '#3b82f6' };
    }
    return acc;
  }, {} as any);

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: textColor }]}>Reports & Analytics</Text>
        <TouchableOpacity>
          <Download size={24} color={subTextColor} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
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

        {pieData.length > 0 && (
          <View style={[styles.card, { backgroundColor: cardBg }]}>
            <Text style={[styles.cardTitle, { color: textColor }]}>Overall Statistics</Text>
            <View style={styles.chartContainer}>
              <VictoryPie
                data={pieData}
                width={width - 80}
                height={220}
                colorScale={pieData.map((d) => d.color)}
                style={{
                  labels: { fontSize: 14, fill: textColor },
                }}
                innerRadius={60}
              />
            </View>
            <View style={styles.legendContainer}>
              {pieData.map((item, index) => (
                <View key={index} style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                  <Text style={[styles.legendText, { color: subTextColor }]}>
                    {item.x}: {item.y}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {barData.length > 0 && (
          <View style={[styles.card, { backgroundColor: cardBg }]}>
            <Text style={[styles.cardTitle, { color: textColor }]}>Top 5 Students</Text>
            <VictoryChart
              width={width - 80}
              height={250}
              theme={VictoryTheme.material}
              domainPadding={{ x: 20 }}
            >
              <VictoryAxis
                style={{
                  axis: { stroke: subTextColor },
                  tickLabels: { fontSize: 12, fill: textColor },
                }}
              />
              <VictoryAxis
                dependentAxis
                style={{
                  axis: { stroke: subTextColor },
                  tickLabels: { fontSize: 12, fill: textColor },
                  grid: { stroke: isDark ? '#334155' : '#e2e8f0' },
                }}
              />
              <VictoryBar
                data={barData}
                style={{ data: { fill: '#3b82f6' } }}
                cornerRadius={{ top: 8 }}
              />
            </VictoryChart>
          </View>
        )}

        <View style={[styles.card, { backgroundColor: cardBg }]}>
          <TouchableOpacity
            style={styles.cardHeader}
            onPress={() => setShowCalendar(!showCalendar)}
          >
            <Text style={[styles.cardTitle, { color: textColor }]}>Attendance Calendar</Text>
            <Calendar size={20} color={subTextColor} />
          </TouchableOpacity>
          {showCalendar && (
            <RNCalendar
              markedDates={markedDates}
              theme={{
                backgroundColor: cardBg,
                calendarBackground: cardBg,
                textSectionTitleColor: subTextColor,
                dayTextColor: textColor,
                todayTextColor: '#3b82f6',
                monthTextColor: textColor,
                arrowColor: '#3b82f6',
              }}
            />
          )}
        </View>

        <View style={[styles.card, { backgroundColor: cardBg }]}>
          <Text style={[styles.cardTitle, { color: textColor }]}>Student Performance</Text>
          {studentStats.length === 0 ? (
            <Text style={[styles.emptyText, { color: subTextColor }]}>No attendance data yet</Text>
          ) : (
            studentStats.map((stat, index) => (
              <View key={stat.student.id} style={styles.studentStatRow}>
                <View style={styles.studentStatInfo}>
                  <Text style={[styles.studentStatName, { color: textColor }]}>
                    {index + 1}. {stat.student.full_name}
                  </Text>
                  <Text style={[styles.studentStatDetails, { color: subTextColor }]}>
                    {stat.presentDays}P · {stat.absentDays}A · {stat.lateDays}L
                  </Text>
                </View>
                <View style={styles.progressContainer}>
                  <View style={[styles.progressBar, { backgroundColor: isDark ? '#334155' : '#e2e8f0' }]}>
                    <View
                      style={[
                        styles.progressFill,
                        {
                          width: `${stat.attendancePercentage}%`,
                          backgroundColor:
                            stat.attendancePercentage >= 75
                              ? '#16a34a'
                              : stat.attendancePercentage >= 50
                              ? '#ca8a04'
                              : '#dc2626',
                        },
                      ]}
                    />
                  </View>
                  <Text style={[styles.progressText, { color: textColor }]}>
                    {stat.attendancePercentage.toFixed(0)}%
                  </Text>
                </View>
              </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
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
  card: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  chartContainer: {
    alignItems: 'center',
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginTop: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 14,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 14,
    marginVertical: 20,
  },
  studentStatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  studentStatInfo: {
    flex: 1,
  },
  studentStatName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  studentStatDetails: {
    fontSize: 12,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  progressBar: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    width: 40,
    textAlign: 'right',
  },
});
