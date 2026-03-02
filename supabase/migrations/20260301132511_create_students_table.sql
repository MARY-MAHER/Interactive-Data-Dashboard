/*
  # Create Students Table for Student Management Portal

  1. New Tables
    - `students`
      - `id` (uuid, primary key) - Unique identifier for each student
      - `name` (text) - Student's full name
      - `stage` (text) - Current grade/stage of the student
      - `father` (text) - Father's name
      - `address` (text) - Student's residential address
      - `school` (text) - Name of the school
      - `status` (text) - Student status (e.g., Active, Inactive, Graduated)
      - `user_id` (uuid) - Reference to the user who created this record
      - `created_at` (timestamptz) - Timestamp of record creation
      - `updated_at` (timestamptz) - Timestamp of last update

  2. Security
    - Enable RLS on `students` table
    - Add policy for authenticated users to view all students
    - Add policy for authenticated users to insert their own students
    - Add policy for authenticated users to update all students
    - Add policy for authenticated users to delete all students

  3. Notes
    - All authenticated users can manage all students in the system
    - This allows teachers/admins to collaborate on student management
    - Status field can be used for filtering active/inactive students
*/

CREATE TABLE IF NOT EXISTS students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  stage text NOT NULL,
  father text DEFAULT '',
  address text DEFAULT '',
  school text NOT NULL,
  status text DEFAULT 'Active',
  user_id uuid REFERENCES auth.users(id) DEFAULT auth.uid(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE students ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view all students"
  ON students
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert students"
  ON students
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can update all students"
  ON students
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete all students"
  ON students
  FOR DELETE
  TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_students_user_id ON students(user_id);
CREATE INDEX IF NOT EXISTS idx_students_status ON students(status);
CREATE INDEX IF NOT EXISTS idx_students_created_at ON students(created_at DESC);