import React, { useState } from 'react';
import {
  Database,
  Table,
  Layers,
  Copy,
  Check,
  Server,
  ShieldCheck,
  Cpu,
} from 'lucide-react';

interface EntityDefinition {
  name: string;
  tableName: string;
  description: string;
  columns: Array<{
    name: string;
    type: string;
    isPrimary?: boolean;
    isForeign?: boolean;
    references?: string;
    isNullable?: boolean;
    description: string;
  }>;
}

const ALL_14_ENTITIES: EntityDefinition[] = [
  {
    name: '1. Users',
    tableName: 'users',
    description: 'Central user authentication and base role classification (student, teacher, admin).',
    columns: [
      { name: 'id', type: 'UUID', isPrimary: true, description: 'Primary key identity' },
      { name: 'email', type: 'VARCHAR(255)', isNullable: false, description: 'Institutional email address (unique)' },
      { name: 'password_hash', type: 'VARCHAR(255)', isNullable: false, description: 'Bcrypt hashed password' },
      { name: 'role', type: "VARCHAR(20) CHECK (role IN ('student', 'teacher', 'admin'))", isNullable: false, description: 'Role-based authorization' },
      { name: 'full_name', type: 'VARCHAR(150)', isNullable: false, description: 'Legal name of user' },
      { name: 'department', type: 'VARCHAR(100)', isNullable: false, description: 'Academic department' },
      { name: 'created_at', type: 'TIMESTAMPTZ', description: 'Account creation time' },
    ],
  },
  {
    name: '2. Student Profiles',
    tableName: 'student_profiles',
    description: 'Extended academic profile storing admission-year-based USN, progression, and batch.',
    columns: [
      { name: 'id', type: 'UUID', isPrimary: true, description: 'Primary key identity' },
      { name: 'user_id', type: 'UUID', isForeign: true, references: 'users(id)', description: 'Foreign key to users table' },
      { name: 'student_name', type: 'VARCHAR(150)', isNullable: false, description: 'Full legal name of the student' },
      { name: 'usn', type: 'VARCHAR(20)', isNullable: false, description: 'Permanent University Seat Number (e.g. 4GW24IS010)' },
      { name: 'admission_year', type: 'INT', isNullable: false, description: 'Permanent calendar admission year (e.g. 2024)' },
      { name: 'department', type: 'VARCHAR(100)', isNullable: false, description: 'Department (Information Science and Engineering)' },
      { name: 'current_semester', type: 'INT', isNullable: false, description: 'Current active semester (1-8)' },
      { name: 'academic_year', type: 'VARCHAR(20)', isNullable: false, description: 'Academic calendar term (e.g. 2026-2027)' },
      { name: 'batch', type: "VARCHAR(10) CHECK (batch IN ('Batch A', 'Batch B', 'Batch C'))", isNullable: false, description: 'Assigned lab section' },
      { name: 'is_active', type: 'BOOLEAN', description: 'Active enrollment flag' },
    ],
  },
  {
    name: '3. Teacher Profiles',
    tableName: 'teacher_profiles',
    description: 'Faculty credentials, employee code, designation, and lab coordinator status.',
    columns: [
      { name: 'id', type: 'UUID', isPrimary: true, description: 'Primary key' },
      { name: 'user_id', type: 'UUID', isForeign: true, references: 'users(id)', description: 'FK to users' },
      { name: 'employee_code', type: 'VARCHAR(30)', isNullable: false, description: 'Faculty employee identifier' },
      { name: 'designation', type: 'VARCHAR(100)', description: 'Academic title (Associate Professor)' },
      { name: 'assigned_workload', type: 'JSONB', description: 'Assigned courses and laboratory slots' },
    ],
  },
  {
    name: '4. Semesters',
    tableName: 'semesters',
    description: 'Academic terms 1 through 8 with academic year periods.',
    columns: [
      { name: 'id', type: 'VARCHAR(20)', isPrimary: true, description: 'Semester code (e.g. sem-5)' },
      { name: 'number', type: 'INT', isNullable: false, description: 'Semester numeral 1 to 8' },
      { name: 'academic_year', type: 'VARCHAR(20)', isNullable: false, description: 'Academic year (e.g. 2026-2027)' },
      { name: 'is_active', type: 'BOOLEAN', description: 'Active academic flag' },
    ],
  },
  {
    name: '5. Batches',
    tableName: 'batches',
    description: 'Laboratory sections A, B, and C tied to semesters and capacities.',
    columns: [
      { name: 'id', type: 'VARCHAR(30)', isPrimary: true, description: 'Batch code (e.g. batch-5a)' },
      { name: 'semester_id', type: 'VARCHAR(20)', isForeign: true, references: 'semesters(id)', description: 'Parent semester' },
      { name: 'name', type: "VARCHAR(10) CHECK (name IN ('Batch A', 'Batch B', 'Batch C'))", isNullable: false, description: 'Batch label' },
      { name: 'capacity', type: 'INT', description: 'Maximum student limit (default 30)' },
    ],
  },
  {
    name: '6. Subjects',
    tableName: 'subjects',
    description: 'Curriculum courses with primary runtime compilers.',
    columns: [
      { name: 'id', type: 'VARCHAR(30)', isPrimary: true, description: 'Subject ID' },
      { name: 'code', type: 'VARCHAR(20)', isNullable: false, description: 'Course code (CS504, CS302)' },
      { name: 'name', type: 'VARCHAR(150)', isNullable: false, description: 'Full course title' },
      { name: 'semester_number', type: 'INT', isNullable: false, description: 'Target semester' },
      { name: 'primary_language', type: "VARCHAR(10) CHECK (primary_language IN ('c', 'python', 'java'))", description: 'C, Python, Java' },
      { name: 'credits', type: 'INT', description: 'Academic credits' },
    ],
  },
  {
    name: '7. Experiments',
    tableName: 'experiments',
    description: 'Laboratory problem statements, starter codes, and constraints.',
    columns: [
      { name: 'id', type: 'VARCHAR(36)', isPrimary: true, description: 'Experiment ID' },
      { name: 'subject_id', type: 'VARCHAR(30)', isForeign: true, references: 'subjects(id)', description: 'Course FK' },
      { name: 'experiment_number', type: 'INT', isNullable: false, description: 'Syllabus number' },
      { name: 'title', type: 'VARCHAR(200)', isNullable: false, description: 'Experiment name' },
      { name: 'problem_statement', type: 'TEXT', isNullable: false, description: 'Markdown problem text' },
      { name: 'programming_language', type: "VARCHAR(10) CHECK (programming_language IN ('c', 'python', 'java'))", isNullable: false, description: 'Target compiler' },
      { name: 'starter_code', type: 'TEXT', description: 'Boilerplate source' },
      { name: 'max_marks', type: 'INT', description: 'Grading scale' },
    ],
  },
  {
    name: '8. Lab Sessions',
    tableName: 'lab_sessions',
    description: 'Teacher-scheduled laboratory timetable sessions tied to semester and batch.',
    columns: [
      { name: 'id', type: 'VARCHAR(36)', isPrimary: true, description: 'Session ID' },
      { name: 'subject_id', type: 'VARCHAR(30)', isForeign: true, references: 'subjects(id)', description: 'Target course' },
      { name: 'experiment_id', type: 'VARCHAR(36)', isForeign: true, references: 'experiments(id)', description: 'Target experiment' },
      { name: 'semester_number', type: 'INT', isNullable: false, description: 'Enrolled semester' },
      { name: 'batch', type: 'VARCHAR(10)', isNullable: false, description: 'Batch A, B, or C' },
      { name: 'teacher_id', type: 'UUID', isForeign: true, references: 'users(id)', description: 'Assigned teacher' },
      { name: 'start_time', type: 'TIMESTAMPTZ', description: 'Session start slot' },
      { name: 'end_time', type: 'TIMESTAMPTZ', description: 'Session cutoff slot' },
      { name: 'is_copy_paste_restricted', type: 'BOOLEAN', description: 'Clipboard policy toggle' },
      { name: 'status', type: 'VARCHAR(20)', description: 'scheduled, ongoing, completed' },
    ],
  },
  {
    name: '9. Lab Assignments',
    tableName: 'lab_assignments',
    description: 'Bridge mapping student cohorts to specific laboratory sessions.',
    columns: [
      { name: 'id', type: 'VARCHAR(36)', isPrimary: true, description: 'Assignment ID' },
      { name: 'lab_session_id', type: 'VARCHAR(36)', isForeign: true, references: 'lab_sessions(id)', description: 'FK to lab_sessions' },
      { name: 'semester_number', type: 'INT', description: 'Semester' },
      { name: 'batch', type: 'VARCHAR(10)', description: 'Batch' },
      { name: 'assigned_at', type: 'TIMESTAMPTZ', description: 'Timestamp' },
    ],
  },
  {
    name: '10. Student Lab Sessions',
    tableName: 'student_lab_sessions',
    description: 'Live telemetry tracking active time, idle time, and interaction states.',
    columns: [
      { name: 'id', type: 'VARCHAR(36)', isPrimary: true, description: 'Record ID' },
      { name: 'student_id', type: 'UUID', isForeign: true, references: 'users(id)', description: 'Student FK' },
      { name: 'lab_session_id', type: 'VARCHAR(36)', isForeign: true, references: 'lab_sessions(id)', description: 'Session FK' },
      { name: 'total_duration_seconds', type: 'INT', description: 'Elapsed duration' },
      { name: 'active_time_seconds', type: 'INT', description: 'Actual typing and interaction duration' },
      { name: 'idle_time_seconds', type: 'INT', description: 'Idle timeout duration (>60s)' },
      { name: 'compilation_attempts', type: 'INT', description: 'Total compilation attempts' },
      { name: 'successful_compilations', type: 'INT', description: 'Successful builds' },
      { name: 'failed_compilations', type: 'INT', description: 'Failed compilation diagnostics' },
      { name: 'program_executions', type: 'INT', description: 'Total execution runs' },
      { name: 'clipboard_violations', type: 'INT', description: 'Blocked copy/paste attempts' },
      { name: 'status', type: 'VARCHAR(20)', description: 'active, idle, completed' },
    ],
  },
  {
    name: '11. Code Submissions',
    tableName: 'code_submissions',
    description: 'Permanent log of submitted student programs and test outcomes.',
    columns: [
      { name: 'id', type: 'VARCHAR(36)', isPrimary: true, description: 'Submission ID' },
      { name: 'student_id', type: 'UUID', isForeign: true, references: 'users(id)', description: 'Student' },
      { name: 'lab_session_id', type: 'VARCHAR(36)', isForeign: true, references: 'lab_sessions(id)', description: 'Lab Session' },
      { name: 'source_code', type: 'TEXT', isNullable: false, description: 'Source code text' },
      { name: 'programming_language', type: 'VARCHAR(10)', description: 'c, python, java' },
      { name: 'status', type: 'VARCHAR(30)', description: 'Accepted, Wrong Answer, etc.' },
      { name: 'score', type: 'INT', description: 'Assigned marks' },
      { name: 'submitted_at', type: 'TIMESTAMPTZ', description: 'Timestamp' },
    ],
  },
  {
    name: '12. Execution Records',
    tableName: 'execution_records',
    description: 'Judge0 execution log with CPU time, peak memory, and exit code.',
    columns: [
      { name: 'id', type: 'VARCHAR(36)', isPrimary: true, description: 'Execution ID' },
      { name: 'submission_id', type: 'VARCHAR(36)', isForeign: true, references: 'code_submissions(id)', description: 'FK submission' },
      { name: 'judge0_token', type: 'VARCHAR(64)', description: 'Sandbox token' },
      { name: 'execution_time_sec', type: 'FLOAT', description: 'Time in seconds' },
      { name: 'memory_kb', type: 'INT', description: 'Peak memory KB' },
      { name: 'stdout_output', type: 'TEXT', description: 'Stdout capture' },
      { name: 'stderr_output', type: 'TEXT', description: 'Stderr capture' },
      { name: 'exit_code', type: 'INT', description: 'Exit status code' },
    ],
  },
  {
    name: '13. Activity Logs',
    tableName: 'activity_logs',
    description: 'Academic audit trail tracking logins, compiles, and session events.',
    columns: [
      { name: 'id', type: 'VARCHAR(36)', isPrimary: true, description: 'Log ID' },
      { name: 'user_id', type: 'UUID', isForeign: true, references: 'users(id)', description: 'User' },
      { name: 'action', type: 'VARCHAR(100)', description: 'Action classifier' },
      { name: 'details', type: 'TEXT', description: 'Event detail payload' },
      { name: 'severity', type: 'VARCHAR(20)', description: 'info, success, warning, alert' },
      { name: 'timestamp', type: 'TIMESTAMPTZ', description: 'Event time' },
    ],
  },
  {
    name: '14. Clipboard Events',
    tableName: 'clipboard_events',
    description: 'Dedicated table tracking copy/paste/cut restriction violations.',
    columns: [
      { name: 'id', type: 'VARCHAR(36)', isPrimary: true, description: 'Event ID' },
      { name: 'student_id', type: 'UUID', isForeign: true, references: 'users(id)', description: 'Student' },
      { name: 'lab_session_id', type: 'VARCHAR(36)', isForeign: true, references: 'lab_sessions(id)', description: 'Session' },
      { name: 'action', type: "VARCHAR(10) CHECK (action IN ('copy', 'paste', 'cut'))", description: 'Action blocked' },
      { name: 'blocked', type: 'BOOLEAN', description: 'True if blocked' },
      { name: 'timestamp', type: 'TIMESTAMPTZ', description: 'Violation timestamp' },
      { name: 'details', type: 'TEXT', description: 'Incident metadata' },
    ],
  },
];

const POSTGRESQL_DDL = `-- ========================================================
-- SMARTLAB: 14-TABLE RELATIONAL POSTGRESQL / SUPABASE SCHEMA
-- ========================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('student', 'teacher', 'admin')),
    full_name VARCHAR(150) NOT NULL,
    department VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. STUDENT_PROFILES
CREATE TABLE student_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    usn VARCHAR(20) NOT NULL UNIQUE,
    semester INT NOT NULL CHECK (semester BETWEEN 1 AND 8),
    batch VARCHAR(10) NOT NULL CHECK (batch IN ('Batch A', 'Batch B', 'Batch C')),
    is_active BOOLEAN DEFAULT TRUE
);

-- 3. TEACHER_PROFILES
CREATE TABLE teacher_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    employee_code VARCHAR(30) NOT NULL UNIQUE,
    designation VARCHAR(100),
    assigned_workload JSONB DEFAULT '[]'::jsonb
);

-- 4. SEMESTERS
CREATE TABLE semesters (
    id VARCHAR(20) PRIMARY KEY,
    number INT NOT NULL CHECK (number BETWEEN 1 AND 8),
    academic_year VARCHAR(20) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE
);

-- 5. BATCHES
CREATE TABLE batches (
    id VARCHAR(30) PRIMARY KEY,
    semester_id VARCHAR(20) NOT NULL REFERENCES semesters(id) ON DELETE CASCADE,
    name VARCHAR(10) NOT NULL CHECK (name IN ('Batch A', 'Batch B', 'Batch C')),
    capacity INT DEFAULT 30
);

-- 6. SUBJECTS
CREATE TABLE subjects (
    id VARCHAR(30) PRIMARY KEY,
    code VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    semester_number INT NOT NULL,
    primary_language VARCHAR(10) CHECK (primary_language IN ('c', 'python', 'java')),
    credits INT DEFAULT 2
);

-- 7. EXPERIMENTS
CREATE TABLE experiments (
    id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    subject_id VARCHAR(30) NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    experiment_number INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    problem_statement TEXT NOT NULL,
    programming_language VARCHAR(10) NOT NULL CHECK (programming_language IN ('c', 'python', 'java')),
    starter_code TEXT,
    max_marks INT DEFAULT 50
);

-- 8. LAB_SESSIONS
CREATE TABLE lab_sessions (
    id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    subject_id VARCHAR(30) NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    experiment_id VARCHAR(36) NOT NULL REFERENCES experiments(id) ON DELETE CASCADE,
    semester_number INT NOT NULL,
    batch VARCHAR(10) NOT NULL CHECK (batch IN ('Batch A', 'Batch B', 'Batch C')),
    teacher_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    is_copy_paste_restricted BOOLEAN DEFAULT TRUE,
    status VARCHAR(20) DEFAULT 'scheduled'
);

-- 9. LAB_ASSIGNMENTS
CREATE TABLE lab_assignments (
    id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    lab_session_id VARCHAR(36) NOT NULL REFERENCES lab_sessions(id) ON DELETE CASCADE,
    semester_number INT NOT NULL,
    batch VARCHAR(10) NOT NULL,
    assigned_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. STUDENT_LAB_SESSIONS
CREATE TABLE student_lab_sessions (
    id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    lab_session_id VARCHAR(36) NOT NULL REFERENCES lab_sessions(id) ON DELETE CASCADE,
    total_duration_seconds INT DEFAULT 0,
    active_time_seconds INT DEFAULT 0,
    idle_time_seconds INT DEFAULT 0,
    compilation_attempts INT DEFAULT 0,
    successful_compilations INT DEFAULT 0,
    failed_compilations INT DEFAULT 0,
    program_executions INT DEFAULT 0,
    clipboard_violations INT DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active'
);

-- 11. CODE_SUBMISSIONS
CREATE TABLE code_submissions (
    id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    lab_session_id VARCHAR(36) NOT NULL REFERENCES lab_sessions(id) ON DELETE CASCADE,
    source_code TEXT NOT NULL,
    programming_language VARCHAR(10) NOT NULL,
    status VARCHAR(30) NOT NULL,
    score INT DEFAULT 0,
    submitted_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. EXECUTION_RECORDS
CREATE TABLE execution_records (
    id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    submission_id VARCHAR(36) REFERENCES code_submissions(id) ON DELETE CASCADE,
    judge0_token VARCHAR(64),
    execution_time_sec FLOAT,
    memory_kb INT,
    stdout_output TEXT,
    stderr_output TEXT,
    exit_code INT
);

-- 13. ACTIVITY_LOGS
CREATE TABLE activity_logs (
    id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    action VARCHAR(100) NOT NULL,
    details TEXT,
    severity VARCHAR(20) DEFAULT 'info',
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 14. CLIPBOARD_EVENTS
CREATE TABLE clipboard_events (
    id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    lab_session_id VARCHAR(36) NOT NULL REFERENCES lab_sessions(id) ON DELETE CASCADE,
    action VARCHAR(10) NOT NULL CHECK (action IN ('copy', 'paste', 'cut')),
    blocked BOOLEAN DEFAULT TRUE,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    details TEXT
);
`;

export const DatabaseArchitecture: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'erd' | 'ddl'>('erd');
  const [selectedEntity, setSelectedEntity] = useState<EntityDefinition>(ALL_14_ENTITIES[0]);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(POSTGRESQL_DDL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            SmartLab Relational Database Architecture (14 Tables)
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            PostgreSQL / Supabase & MySQL normalized schema with strict relational integrity
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 bg-blue-50/60 border border-blue-100 rounded-lg self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('erd')}
            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${
              activeTab === 'erd' ? 'bg-amber-600 text-white' : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            14 Entities Schema Viewer
          </button>
          <button
            onClick={() => setActiveTab('ddl')}
            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${
              activeTab === 'ddl' ? 'bg-amber-600 text-white' : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            SQL DDL Generator
          </button>
        </div>
      </div>

      {activeTab === 'erd' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* List of 14 entities */}
          <div className="lg:col-span-4 space-y-1.5 max-h-[600px] overflow-y-auto pr-1">
            {ALL_14_ENTITIES.map((ent) => (
              <button
                key={ent.tableName}
                onClick={() => setSelectedEntity(ent)}
                className={`w-full p-2.5 rounded-xl border text-left transition-all ${
                  selectedEntity.tableName === ent.tableName
                    ? 'bg-blue-50/60 border-amber-500 text-slate-900 shadow-md'
                    : 'bg-white border-blue-100 text-slate-700 hover:border-blue-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs">{ent.name}</span>
                  <span className="font-mono text-[10px] text-amber-600">{ent.tableName}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Table specification */}
          <div className="lg:col-span-8 bg-white border border-blue-100 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-blue-100 pb-3">
              <div>
                <h2 className="text-base font-bold text-slate-900 font-mono">{selectedEntity.tableName}</h2>
                <p className="text-xs text-slate-600 mt-0.5">{selectedEntity.description}</p>
              </div>
              <span className="text-xs font-mono text-slate-600 bg-blue-50/60 px-2 py-1 rounded border border-blue-100">
                {selectedEntity.columns.length} Columns
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="bg-[#f4f8ff] border-b border-blue-100 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
                    <th className="py-2.5 px-3">Column</th>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3">Constraints</th>
                    <th className="py-2.5 px-3">Purpose</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-blue-100 font-mono text-[11px]">
                  {selectedEntity.columns.map((col) => (
                    <tr key={col.name} className="hover:bg-[#f4f8ff]">
                      <td className="py-2 px-3 font-bold text-slate-800">{col.name}</td>
                      <td className="py-2 px-3 text-blue-600">{col.type}</td>
                      <td className="py-2 px-3">
                        {col.isPrimary && (
                          <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 border border-amber-200 text-[10px] mr-1">
                            PK
                          </span>
                        )}
                        {col.isForeign && (
                          <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 border border-blue-200 text-[10px]">
                            FK &rarr; {col.references}
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-3 text-slate-600 font-sans text-xs">{col.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-blue-100 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">PostgreSQL / Supabase 14-Table DDL</h2>
              <p className="text-xs text-slate-600">Production-ready script with UUIDs, foreign keys, and check constraints</p>
            </div>
            <button
              onClick={handleCopy}
              className="py-1.5 px-3.5 rounded-lg bg-blue-100 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-colors flex items-center gap-1.5 border border-blue-200"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Script'}</span>
            </button>
          </div>
          <pre className="p-4 rounded-xl bg-[#f4f8ff] border border-blue-100 font-mono text-[11px] text-slate-700 leading-relaxed overflow-x-auto max-h-[500px]">
            {POSTGRESQL_DDL}
          </pre>
        </div>
      )}
    </div>
  );
};
