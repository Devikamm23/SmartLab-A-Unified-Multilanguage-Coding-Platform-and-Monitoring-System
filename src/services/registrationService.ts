import { supabase } from '../lib/supabase';
import { User } from '../types';

export interface RegistrationSyncResult {
  syncedToSupabase: boolean;
  table: 'students' | 'faculty';
  needsRlsPolicy?: boolean;
  errorCode?: string;
  errorMessage?: string;
  recordId?: string;
}

export const SUPABASE_RLS_FIX_SQL = `DROP POLICY IF EXISTS "Allow public insert on students" ON public.students;
CREATE POLICY "Allow public insert on students" ON public.students FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "Allow public select on students" ON public.students;
CREATE POLICY "Allow public select on students" ON public.students FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Allow public insert on faculty" ON public.faculty;
CREATE POLICY "Allow public insert on faculty" ON public.faculty FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "Allow public select on faculty" ON public.faculty;
CREATE POLICY "Allow public select on faculty" ON public.faculty FOR SELECT TO anon, authenticated USING (true);`;

const generateUuid = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export const saveStudentToSupabase = async (
  student: Pick<User, 'name' | 'email' | 'usn' | 'semester' | 'department'>
): Promise<RegistrationSyncResult> => {
  const payload = {
    name: student.name.trim(),
    email: student.email.trim().toLowerCase(),
    usn: (student.usn || '').trim().toUpperCase(),
    semester: Number(student.semester || 5),
    department: student.department || 'Information Science & Engineering',
  };

  let { data, error } = await supabase
    .from('students')
    .insert(payload)
    .select('id')
    .maybeSingle();

  // Retry with explicit UUID if the database column `id` does not have a default value
  if (error && error.code === '23502' && error.message.toLowerCase().includes('id')) {
    const retry = await supabase
      .from('students')
      .insert({ id: generateUuid(), ...payload })
      .select('id')
      .maybeSingle();
    data = retry.data;
    error = retry.error;
  }

  // Fallback if SELECT policy is missing after a successful INSERT (returns 42501 on `.select()`)
  if (error && error.code === '42501') {
    const insertOnly = await supabase.from('students').insert(payload);
    if (!insertOnly.error) {
      return {
        syncedToSupabase: true,
        table: 'students',
      };
    }
    return {
      syncedToSupabase: false,
      table: 'students',
      needsRlsPolicy: true,
      errorCode: insertOnly.error.code,
      errorMessage: insertOnly.error.message,
    };
  }

  if (error) {
    return {
      syncedToSupabase: false,
      table: 'students',
      needsRlsPolicy: error.code === '42501',
      errorCode: error.code,
      errorMessage: error.message,
    };
  }

  return {
    syncedToSupabase: true,
    table: 'students',
    recordId: data?.id ? String(data.id) : undefined,
  };
};

export const saveFacultyToSupabase = async (
  faculty: Pick<User, 'name' | 'email' | 'designation' | 'department'>
): Promise<RegistrationSyncResult> => {
  const payload = {
    name: faculty.name.trim(),
    email: faculty.email.trim().toLowerCase(),
    designation: faculty.designation || 'Assistant Professor',
    department: faculty.department || 'Information Science & Engineering',
  };

  let { data, error } = await supabase
    .from('faculty')
    .insert(payload)
    .select('id')
    .maybeSingle();

  if (error && error.code === '23502' && error.message.toLowerCase().includes('id')) {
    const retry = await supabase
      .from('faculty')
      .insert({ id: generateUuid(), ...payload })
      .select('id')
      .maybeSingle();
    data = retry.data;
    error = retry.error;
  }

  if (error && error.code === '42501') {
    const insertOnly = await supabase.from('faculty').insert(payload);
    if (!insertOnly.error) {
      return {
        syncedToSupabase: true,
        table: 'faculty',
      };
    }
    return {
      syncedToSupabase: false,
      table: 'faculty',
      needsRlsPolicy: true,
      errorCode: insertOnly.error.code,
      errorMessage: insertOnly.error.message,
    };
  }

  if (error) {
    return {
      syncedToSupabase: false,
      table: 'faculty',
      needsRlsPolicy: error.code === '42501',
      errorCode: error.code,
      errorMessage: error.message,
    };
  }

  return {
    syncedToSupabase: true,
    table: 'faculty',
    recordId: data?.id ? String(data.id) : undefined,
  };
};

export const updateStudentInSupabase = async (
  email: string,
  updates: Partial<Pick<User, 'name' | 'email' | 'usn' | 'semester' | 'department'>>
) => {
  const payload: Record<string, unknown> = {};
  if (updates.name !== undefined) payload.name = updates.name.trim();
  if (updates.email !== undefined) payload.email = updates.email.trim().toLowerCase();
  if (updates.usn !== undefined) payload.usn = updates.usn.trim().toUpperCase();
  if (updates.semester !== undefined) payload.semester = Number(updates.semester);
  if (updates.department !== undefined) payload.department = updates.department;
  if (Object.keys(payload).length === 0) return;

  await supabase.from('students').update(payload).eq('email', email.trim().toLowerCase());
};

export const deleteStudentFromSupabase = async (email: string) => {
  await supabase.from('students').delete().eq('email', email.trim().toLowerCase());
};

export const updateFacultyInSupabase = async (
  email: string,
  updates: Partial<Pick<User, 'name' | 'email' | 'designation' | 'department'>>
) => {
  const payload: Record<string, unknown> = {};
  if (updates.name !== undefined) payload.name = updates.name.trim();
  if (updates.email !== undefined) payload.email = updates.email.trim().toLowerCase();
  if (updates.designation !== undefined) payload.designation = updates.designation;
  if (updates.department !== undefined) payload.department = updates.department;
  if (Object.keys(payload).length === 0) return;

  await supabase.from('faculty').update(payload).eq('email', email.trim().toLowerCase());
};

export const deleteFacultyFromSupabase = async (email: string) => {
  await supabase.from('faculty').delete().eq('email', email.trim().toLowerCase());
};

export const fetchRegisteredUsersFromSupabase = async (): Promise<User[]> => {
  const syncedUsers: User[] = [];

  try {
    const { data: studentRows, error: studentErr } = await supabase
      .from('students')
      .select('id, name, email, usn, semester, department, created_at');

    if (!studentErr && Array.isArray(studentRows)) {
      studentRows.forEach((row: any) => {
        if (!row?.email) return;
        const sem = Number(row.semester) || 5;
        syncedUsers.push({
          id: `sb-student-${row.id}`,
          name: row.name || row.email.split('@')[0],
          studentName: row.name || row.email.split('@')[0],
          email: row.email,
          role: 'student',
          usn: row.usn || undefined,
          semester: sem,
          currentSemester: sem,
          batch: 'Batch A',
          department: row.department || 'Information Science & Engineering',
          academicYear: '2026-2027',
          createdAt: row.created_at
            ? String(row.created_at).split('T')[0]
            : new Date().toISOString().split('T')[0],
        });
      });
    }
  } catch {
    // Keep app resilient if offline
  }

  try {
    const { data: facultyRows, error: facultyErr } = await supabase
      .from('faculty')
      .select('id, name, email, designation, department');

    if (!facultyErr && Array.isArray(facultyRows)) {
      facultyRows.forEach((row: any) => {
        if (!row?.email) return;
        syncedUsers.push({
          id: `sb-faculty-${row.id}`,
          name: row.name || row.email.split('@')[0],
          email: row.email,
          role: 'teacher',
          designation: row.designation || 'Assistant Professor',
          department: row.department || 'Information Science & Engineering',
          employeeCode: `FAC-ISE-${String(row.id).slice(0, 4).toUpperCase()}`,
          createdAt: new Date().toISOString().split('T')[0],
        });
      });
    }
  } catch {
    // Keep app resilient if offline
  }

  return syncedUsers;
};
