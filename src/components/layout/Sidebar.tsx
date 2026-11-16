import React from 'react';
import { useApp } from '../../context/AppContext';
import { COLLEGE_CONFIG } from '../../constants/college';
import {
  LayoutDashboard,
  FlaskConical,
  Code2,
  History,
  User,
  LogOut,
  Users2,
  CalendarCheck2,
  Activity,
  FileSpreadsheet,
  GraduationCap,
  Layers,
  BookOpen,
  CalendarDays,
  FileCode2,
  ShieldCheck,
  ShieldAlert,
  Database,
  Sliders,
  Bell,
  Clock,
  Megaphone,
  Percent,
  HelpCircle,
  ClipboardList,
} from 'lucide-react';

interface SidebarProps {
  onOpenJudge0Modal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onOpenJudge0Modal }) => {
  const {
    currentRole,
    activeNavTab,
    setActiveNavTab,
    logout,
    studentLabSessions,
    currentUser,
    studentNotifications,
    facultyNotifications,
    integrityAlerts,
  } = useApp();

  const activeSession = studentLabSessions.find(
    (s) => s.studentId === currentUser?.id && s.status === 'active'
  );

  const studentUnreadCount = studentNotifications.filter((n) => !n.isRead).length;
  const hasActiveWarning = studentNotifications.some(
    (n) => n.category === 'integrity' && n.warningStatus === 'Active Warning'
  );

  const facultyUnreadCount = facultyNotifications.filter((n) => !n.isRead).length;
  const pendingIntegrityAlerts = integrityAlerts.filter(
    (a) => a.status === 'Pending Review'
  ).length;

  return (
    <aside className="w-64 bg-[#0e1738] border-r border-slate-800 flex flex-col shrink-0 select-none">
      {/* College Institution Header Badge */}
      <div className="px-3.5 py-3 border-b border-slate-800/80 bg-slate-950/40">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center shrink-0 shadow-xs">
            <GraduationCap className="w-4 h-4 text-white" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-bold text-slate-200 block truncate leading-tight" title={COLLEGE_CONFIG.name}>
              {COLLEGE_CONFIG.shortName}
            </span>
            <span className="text-[9px] text-sky-400/90 font-mono block truncate">
              {COLLEGE_CONFIG.department}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Scroll Area */}
      <div className="flex-1 py-4 px-3 space-y-6 overflow-y-auto">
        {/* STUDENT ROLE LINKS */}
        {currentRole === 'student' && (
          <div>
            <div className="px-3 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
              Student Laboratory Menu
            </div>
            <div className="space-y-1">
              <button
                onClick={() => setActiveNavTab('dashboard')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  activeNavTab === 'dashboard'
                    ? 'bg-sky-500/15 text-sky-300 border border-sky-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 text-sky-400" />
                <span>Dashboard</span>
              </button>

              <button
                onClick={() => setActiveNavTab('my_lab')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  activeNavTab === 'my_lab'
                    ? 'bg-sky-500/15 text-sky-300 border border-sky-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <FlaskConical className="w-4 h-4 text-indigo-400" />
                  <span>My Lab</span>
                </div>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-sky-300">
                  {currentUser?.batch}
                </span>
              </button>

              <button
                onClick={() => setActiveNavTab('editor')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  activeNavTab === 'editor'
                    ? 'bg-sky-500/15 text-sky-300 border border-sky-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Code2 className="w-4 h-4 text-emerald-400" />
                  <span>Code Editor</span>
                </div>
                {activeSession && (
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 animate-pulse">
                    Active
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveNavTab('lab_history')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  activeNavTab === 'lab_history'
                    ? 'bg-sky-500/15 text-sky-300 border border-sky-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <History className="w-4 h-4 text-amber-400" />
                <span>Lab History</span>
              </button>

              <button
                onClick={() => setActiveNavTab('notifications')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  activeNavTab === 'notifications'
                    ? 'bg-sky-500/15 text-sky-300 border border-sky-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Bell className="w-4 h-4 text-sky-400" />
                  <span>Notifications</span>
                </div>
                <div className="flex items-center gap-1">
                  {hasActiveWarning && (
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" title="Active Academic Integrity Warning" />
                  )}
                  {studentUnreadCount > 0 && (
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      {studentUnreadCount} New
                    </span>
                  )}
                </div>
              </button>

              <button
                onClick={() => setActiveNavTab('deadlines')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  activeNavTab === 'deadlines'
                    ? 'bg-sky-500/15 text-sky-300 border border-sky-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Clock className="w-4 h-4 text-amber-400" />
                <span>Deadlines</span>
              </button>

              <button
                onClick={() => setActiveNavTab('announcements')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  activeNavTab === 'announcements'
                    ? 'bg-sky-500/15 text-sky-300 border border-sky-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Megaphone className="w-4 h-4 text-purple-400" />
                <span>Announcements</span>
              </button>

              <button
                onClick={() => setActiveNavTab('attendance')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  activeNavTab === 'attendance'
                    ? 'bg-sky-500/15 text-sky-300 border border-sky-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Percent className="w-4 h-4 text-emerald-400" />
                <span>Lab Attendance</span>
              </button>

              <button
                onClick={() => setActiveNavTab('quizzes')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  activeNavTab === 'quizzes'
                    ? 'bg-sky-500/15 text-sky-300 border border-sky-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <ClipboardList className="w-4 h-4 text-indigo-400" />
                <span>Quizzes & Viva</span>
              </button>

              <button
                onClick={() => setActiveNavTab('support')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  activeNavTab === 'support'
                    ? 'bg-sky-500/15 text-sky-300 border border-sky-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <HelpCircle className="w-4 h-4 text-sky-300" />
                <span>Help & Support</span>
              </button>

              <button
                onClick={() => setActiveNavTab('profile')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  activeNavTab === 'profile'
                    ? 'bg-sky-500/15 text-sky-300 border border-sky-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <User className="w-4 h-4 text-slate-300" />
                <span>Student Profile</span>
              </button>
            </div>
          </div>
        )}

        {/* TEACHER ROLE LINKS */}
        {currentRole === 'teacher' && (
          <div>
            <div className="px-3 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
              Teacher Faculty Console
            </div>
            <div className="space-y-1">
              <button
                onClick={() => setActiveNavTab('dashboard')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  activeNavTab === 'dashboard'
                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 text-indigo-400" />
                <span>Dashboard</span>
              </button>

              <button
                onClick={() => setActiveNavTab('my_batches')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  activeNavTab === 'my_batches'
                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Users2 className="w-4 h-4 text-sky-400" />
                <span>My Batches (A / B / C)</span>
              </button>

              <button
                onClick={() => setActiveNavTab('lab_sessions')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  activeNavTab === 'lab_sessions'
                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <CalendarCheck2 className="w-4 h-4 text-emerald-400" />
                <span>Lab Sessions</span>
              </button>

              <button
                onClick={() => setActiveNavTab('student_monitoring')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  activeNavTab === 'student_monitoring'
                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Activity className="w-4 h-4 text-rose-400" />
                  <span>Student Monitoring</span>
                </div>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Live
                </span>
              </button>

              <button
                onClick={() => setActiveNavTab('quizzes')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  activeNavTab === 'quizzes'
                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <ClipboardList className="w-4 h-4 text-purple-400" />
                <span>Quiz Management</span>
              </button>

              <button
                onClick={() => setActiveNavTab('academic_integrity')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  activeNavTab === 'academic_integrity'
                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <ShieldAlert className="w-4 h-4 text-rose-400" />
                  <span>Academic Integrity</span>
                </div>
                {pendingIntegrityAlerts > 0 && (
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    {pendingIntegrityAlerts} Alert{pendingIntegrityAlerts > 1 ? 's' : ''}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveNavTab('faculty_notifications')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  activeNavTab === 'faculty_notifications'
                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Bell className="w-4 h-4 text-sky-400" />
                  <span>Notifications</span>
                </div>
                {facultyUnreadCount > 0 && (
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30">
                    {facultyUnreadCount} New
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveNavTab('teacher_reports')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  activeNavTab === 'teacher_reports'
                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <FileSpreadsheet className="w-4 h-4 text-amber-400" />
                <span>Reports & CSV Export</span>
              </button>

              <button
                onClick={() => setActiveNavTab('profile')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  activeNavTab === 'profile'
                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <User className="w-4 h-4 text-slate-300" />
                <span>Faculty Profile</span>
              </button>
            </div>
          </div>
        )}

        {/* ADMIN ROLE LINKS */}
        {currentRole === 'admin' && (
          <div>
            <div className="px-3 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
              Administrator Operations
            </div>
            <div className="space-y-1">
              <button
                onClick={() => setActiveNavTab('dashboard')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  activeNavTab === 'dashboard'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 text-rose-400" />
                <span>Admin Dashboard</span>
              </button>

              <button
                onClick={() => setActiveNavTab('admin_students')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  activeNavTab === 'admin_students'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <GraduationCap className="w-4 h-4 text-sky-400" />
                <span>Student Management</span>
              </button>

              <button
                onClick={() => setActiveNavTab('admin_teachers')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  activeNavTab === 'admin_teachers'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Users2 className="w-4 h-4 text-indigo-400" />
                <span>Teacher Management</span>
              </button>

              <button
                onClick={() => setActiveNavTab('admin_semesters')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  activeNavTab === 'admin_semesters'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Layers className="w-4 h-4 text-amber-400" />
                <span>Semester & Batches (A/B/C)</span>
              </button>

              <button
                onClick={() => setActiveNavTab('admin_curriculum')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  activeNavTab === 'admin_curriculum'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <BookOpen className="w-4 h-4 text-emerald-400" />
                <span>Subjects & Experiments</span>
              </button>

              <button
                onClick={() => setActiveNavTab('admin_schedules')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  activeNavTab === 'admin_schedules'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <CalendarDays className="w-4 h-4 text-purple-400" />
                <span>Lab Schedule Timetable</span>
              </button>
            </div>
          </div>
        )}

        {/* SYSTEM ARCHITECTURE & DATABASE SPECIFICATION */}
        <div>
          <div className="px-3 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
            System & Architecture
          </div>
          <div className="space-y-1">
            <button
              onClick={() => setActiveNavTab('architecture')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                activeNavTab === 'architecture'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Database className="w-4 h-4 text-amber-400" />
              <span>14-Table DB & Schema</span>
            </button>

            <button
              onClick={onOpenJudge0Modal}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-all text-left"
            >
              <Sliders className="w-4 h-4 text-sky-400" />
              <span>Judge0 API Config</span>
            </button>
          </div>
        </div>
      </div>

      {/* Sidebar Footer with Logout & Active Node */}
      <div className="p-3 border-t border-slate-800 bg-[#090f22] space-y-2 text-xs">
        <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
          <span>Role: {currentRole.toUpperCase()}</span>
          <span className="text-emerald-400">Online</span>
        </div>
        <button
          onClick={logout}
          className="w-full py-1.5 px-3 rounded-lg bg-slate-900 hover:bg-rose-950/40 text-slate-400 hover:text-rose-300 border border-slate-800 hover:border-rose-500/30 transition-colors flex items-center justify-center gap-1.5 text-xs font-semibold"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
