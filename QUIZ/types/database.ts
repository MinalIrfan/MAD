export interface Teacher {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  created_at: string;
}

export interface Class {
  id: string;
  teacher_id: string;
  name: string;
  subject: string | null;
  grade_level: string | null;
  created_at: string;
}

export interface Student {
  id: string;
  class_id: string;
  full_name: string;
  roll_number: string | null;
  avatar_url: string | null;
  created_at: string;
}

export interface AttendanceRecord {
  id: string;
  student_id: string;
  class_id: string;
  teacher_id: string;
  status: 'present' | 'absent' | 'late';
  date: string;
  notes: string | null;
  created_at: string;
}

export interface AttendanceWithStudent extends AttendanceRecord {
  student: Student;
}

export interface StudentAttendanceStats {
  student: Student;
  totalDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  attendancePercentage: number;
}
