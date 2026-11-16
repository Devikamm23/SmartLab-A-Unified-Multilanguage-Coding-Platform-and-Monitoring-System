import React from 'react';
import { useApp } from '../../context/AppContext';
import { COLLEGE_CONFIG } from '../../constants/college';
import {
  ShieldCheck,
  GraduationCap,
  Users2,
  Layers,
  BookOpen,
  CalendarDays,
  ShieldAlert,
  ArrowRight,
  Plus,
  Cpu,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

export const AdminDashboard: React.FC = () => {
  const {
    currentUser,
    users,
    semesters,
    batches,
    subjects,
    experiments,
    labSessions,
    clipboardEvents,
    setActiveNavTab,
  } = useApp();

  const students = users.filter((u) => u.role === 'student');
  const teachers = users.filter((u) => u.role === 'teacher');

  // Distribution by batch
  const batchCounts = [
    { name: 'Sem 5 A', count: students.filter((s) => s.semester === 5 && s.batch === 'Batch A').length },
    { name: 'Sem 5 B', count: students.filter((s) => s.semester === 5 && s.batch === 'Batch B').length },
    { name: 'Sem 5 C', count: students.filter((s) => s.semester === 5 && s.batch === 'Batch C').length },
    { name: 'Sem 3 C', count: students.filter((s) => s.semester === 3 && s.batch === 'Batch C').length },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Admin Profile Banner */}
      <div className="bg-[#0e1738] border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-tr from-rose-600 to-indigo-600 flex items-center justify-center font-bold text-xl text-white shadow-md shadow-rose-600/20 shrink-0">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-bold text-white tracking-tight">{currentUser?.name}</h1>
              <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-500/30">
                System Administrator
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
              <span className="text-slate-300 font-medium">{COLLEGE_CONFIG.name}</span>
              <span aria-hidden="true">·</span>
              <span>{currentUser?.designation || 'Head of Academic Computing'}</span>
              <span aria-hidden="true">·</span>
              <span>Central Computing Facility</span>
              <span aria-hidden="true">·</span>
              <span className="text-emerald-400">All System Invariants Operational</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveNavTab('admin_students')}
            className="py-2 px-3.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-md shadow-rose-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>Enroll Student</span>
          </button>
          <button
            onClick={() => setActiveNavTab('admin_curriculum')}
            className="py-2 px-3.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors border border-slate-700"
          >
            <span>Manage Curriculum</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="bg-[#0e1738] border border-slate-800 rounded-xl p-4 space-y-1 shadow-sm">
          <span className="text-xs text-slate-400 font-medium">Total Students</span>
          <div className="text-2xl font-bold text-white font-mono tabular-nums">{students.length}</div>
          <span className="text-[10px] text-sky-400">Enrolled Cohort</span>
        </div>

        <div className="bg-[#0e1738] border border-slate-800 rounded-xl p-4 space-y-1 shadow-sm">
          <span className="text-xs text-slate-400 font-medium">Lab Faculty</span>
          <div className="text-2xl font-bold text-indigo-400 font-mono tabular-nums">{teachers.length}</div>
          <span className="text-[10px] text-slate-400">Assigned In-Charge</span>
        </div>

        <div className="bg-[#0e1738] border border-slate-800 rounded-xl p-4 space-y-1 shadow-sm">
          <span className="text-xs text-slate-400 font-medium">Active Semesters</span>
          <div className="text-2xl font-bold text-white font-mono tabular-nums">{semesters.length}</div>
          <span className="text-[10px] text-slate-400">Semesters 3-6</span>
        </div>

        <div className="bg-[#0e1738] border border-slate-800 rounded-xl p-4 space-y-1 shadow-sm">
          <span className="text-xs text-slate-400 font-medium">Configured Batches</span>
          <div className="text-2xl font-bold text-amber-400 font-mono tabular-nums">{batches.length}</div>
          <span className="text-[10px] text-slate-400">Batches A, B, C</span>
        </div>

        <div className="bg-[#0e1738] border border-slate-800 rounded-xl p-4 space-y-1 shadow-sm">
          <span className="text-xs text-slate-400 font-medium">Active Lab Slots</span>
          <div className="text-2xl font-bold text-emerald-400 font-mono tabular-nums">{labSessions.length}</div>
          <span className="text-[10px] text-slate-400">Timetable Slots</span>
        </div>

        <div className="bg-[#0e1738] border border-slate-800 rounded-xl p-4 space-y-1 shadow-sm">
          <span className="text-xs text-slate-400 font-medium">Clipboard Flags</span>
          <div className="text-2xl font-bold text-rose-400 font-mono tabular-nums">{clipboardEvents.length}</div>
          <span className="text-[10px] text-rose-300">Violations Blocked</span>
        </div>
      </div>

      {/* Main Grid: Management Shortcuts & Batch Enrollment Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Cols: Quick Administrative Management Modules */}
        <div className="lg:col-span-7 bg-[#0e1738] border border-slate-800 rounded-xl p-5 space-y-4">
          <div>
            <h2 className="text-sm font-bold text-white">Administration Management Hub</h2>
            <p className="text-xs text-slate-400">Direct shortcuts to {COLLEGE_CONFIG.shortAcronym} academic configuration</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <button
              onClick={() => setActiveNavTab('admin_students')}
              className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-sky-500 transition-all text-left flex items-start gap-3 group"
            >
              <GraduationCap className="w-5 h-5 text-sky-400 shrink-0 group-hover:scale-110 transition-transform" />
              <div>
                <span className="font-bold text-slate-200 block">Student Roster Management</span>
                <span className="text-[11px] text-slate-400">
                  Assign semesters, Batches A/B/C, and configure student USNs.
                </span>
              </div>
            </button>

            <button
              onClick={() => setActiveNavTab('admin_teachers')}
              className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500 transition-all text-left flex items-start gap-3 group"
            >
              <Users2 className="w-5 h-5 text-indigo-400 shrink-0 group-hover:scale-110 transition-transform" />
              <div>
                <span className="font-bold text-slate-200 block">Teacher Staff Management</span>
                <span className="text-[11px] text-slate-400">
                  Assign lab instructors to specific subjects and batches.
                </span>
              </div>
            </button>

            <button
              onClick={() => setActiveNavTab('admin_semesters')}
              className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500 transition-all text-left flex items-start gap-3 group"
            >
              <Layers className="w-5 h-5 text-amber-400 shrink-0 group-hover:scale-110 transition-transform" />
              <div>
                <span className="font-bold text-slate-200 block">Semester & Batches (A/B/C)</span>
                <span className="text-[11px] text-slate-400">
                  Create semesters and regulate Batch A, B, C capacities.
                </span>
              </div>
            </button>

            <button
              onClick={() => setActiveNavTab('admin_curriculum')}
              className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500 transition-all text-left flex items-start gap-3 group"
            >
              <BookOpen className="w-5 h-5 text-emerald-400 shrink-0 group-hover:scale-110 transition-transform" />
              <div>
                <span className="font-bold text-slate-200 block">Subjects & Experiments</span>
                <span className="text-[11px] text-slate-400">
                  Author syllabus experiments in C, Python, Java with test cases.
                </span>
              </div>
            </button>

            <button
              onClick={() => setActiveNavTab('admin_schedules')}
              className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-purple-500 transition-all text-left flex items-start gap-3 group sm:col-span-2"
            >
              <CalendarDays className="w-5 h-5 text-purple-400 shrink-0 group-hover:scale-110 transition-transform" />
              <div>
                <span className="font-bold text-slate-200 block">Laboratory Timetable & Slot Schedules</span>
                <span className="text-[11px] text-slate-400">
                  Master laboratory timetable controlling weekly slot allocations for Batches A, B, and C.
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* Right 5 Cols: Batch Distribution Chart */}
        <div className="lg:col-span-5 bg-[#0e1738] border border-slate-800 rounded-xl p-5 space-y-3">
          <h2 className="text-sm font-bold text-white">Student Distribution by Batch</h2>
          <p className="text-xs text-slate-400">Verified enrollment counts per laboratory division</p>

          <div className="h-56 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={batchCounts} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={10} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#090f22', borderColor: '#334155', fontSize: '11px' }}
                />
                <Bar dataKey="count" name="Enrolled Students" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
