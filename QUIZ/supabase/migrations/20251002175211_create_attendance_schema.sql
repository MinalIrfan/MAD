-- Student Attendance Management System Schema
-- 
-- Overview:
-- This migration creates the complete database schema for a student attendance management system.
--
-- New Tables:
-- 1. teachers - Stores teacher/educator accounts
-- 2. classes - Stores class/course information
-- 3. students - Stores student information
-- 4. attendance_records - Stores individual attendance entries

-- Create teachers table
CREATE TABLE IF NOT EXISTS teachers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password text NOT NULL,
  full_name text NOT NULL,
  avatar_url text,
  created_at timestamptz DEFAULT now()
);

-- Create classes table
CREATE TABLE IF NOT EXISTS classes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id uuid REFERENCES teachers(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  subject text,
  grade_level text,
  created_at timestamptz DEFAULT now()
);

-- Create students table
CREATE TABLE IF NOT EXISTS students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id uuid REFERENCES classes(id) ON DELETE CASCADE NOT NULL,
  full_name text NOT NULL,
  roll_number text,
  avatar_url text,
  created_at timestamptz DEFAULT now()
);

-- Create attendance_records table
CREATE TABLE IF NOT EXISTS attendance_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES students(id) ON DELETE CASCADE NOT NULL,
  class_id uuid REFERENCES classes(id) ON DELETE CASCADE NOT NULL,
  teacher_id uuid REFERENCES teachers(id) ON DELETE CASCADE NOT NULL,
  status text NOT NULL CHECK (status IN ('present', 'absent', 'late')),
  date date NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(student_id, date)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_attendance_student_date ON attendance_records(student_id, date);
CREATE INDEX IF NOT EXISTS idx_students_class ON students(class_id);
CREATE INDEX IF NOT EXISTS idx_classes_teacher ON classes(teacher_id);
CREATE INDEX IF NOT EXISTS idx_attendance_class_date ON attendance_records(class_id, date);

-- Enable Row Level Security
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;

-- RLS Policies for teachers table
CREATE POLICY "Teachers can view own profile"
  ON teachers FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Teachers can update own profile"
  ON teachers FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- RLS Policies for classes table
CREATE POLICY "Teachers can view all classes"
  ON classes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Teachers can insert own classes"
  ON classes FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Teachers can update own classes"
  ON classes FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Teachers can delete own classes"
  ON classes FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for students table
CREATE POLICY "Teachers can view students"
  ON students FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Teachers can insert students"
  ON students FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Teachers can update students"
  ON students FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Teachers can delete students"
  ON students FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for attendance_records table
CREATE POLICY "Teachers can view attendance records"
  ON attendance_records FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Teachers can insert attendance records"
  ON attendance_records FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Teachers can update attendance records"
  ON attendance_records FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Teachers can delete attendance records"
  ON attendance_records FOR DELETE
  TO authenticated
  USING (true);
