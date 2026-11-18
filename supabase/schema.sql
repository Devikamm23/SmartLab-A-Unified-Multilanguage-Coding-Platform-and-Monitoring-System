-- SmartLab Supabase Schema & Row-Level Security (RLS) Setup
-- Run this in your Supabase Dashboard -> SQL Editor if RLS blocks inserts from the website.

-- 1. Ensure tables exist (matches your existing students & faculty schema)
CREATE TABLE IF NOT EXISTS public.students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  usn text,
  semester integer DEFAULT 5,
  department text DEFAULT 'Information Science & Engineering',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.faculty (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  designation text DEFAULT 'Assistant Professor',
  department text DEFAULT 'Information Science & Engineering'
);

-- 2. Enable RLS and allow SmartLab client registration inserts & reads
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faculty ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public select on students" ON public.students;
CREATE POLICY "Allow public select on students"
  ON public.students FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Allow public insert on students" ON public.students;
CREATE POLICY "Allow public insert on students"
  ON public.students FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update on students" ON public.students;
CREATE POLICY "Allow public update on students"
  ON public.students FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public delete on students" ON public.students;
CREATE POLICY "Allow public delete on students"
  ON public.students FOR DELETE
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Allow public select on faculty" ON public.faculty;
CREATE POLICY "Allow public select on faculty"
  ON public.faculty FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Allow public insert on faculty" ON public.faculty;
CREATE POLICY "Allow public insert on faculty"
  ON public.faculty FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update on faculty" ON public.faculty;
CREATE POLICY "Allow public update on faculty"
  ON public.faculty FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public delete on faculty" ON public.faculty;
CREATE POLICY "Allow public delete on faculty"
  ON public.faculty FOR DELETE
  TO anon, authenticated
  USING (true);
