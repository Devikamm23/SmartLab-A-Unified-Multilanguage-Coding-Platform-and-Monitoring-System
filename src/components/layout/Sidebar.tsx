import React from 'react';
import { useApp } from '../../context/AppContext';
import { COLLEGE_CONFIG } from '../../constants/college';
import {
  LayoutDashboard,
  FlaskConical,
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
    currentUser,
    studentNotifications,
    facultyNotifications,
    integrityAlerts,
  } = useApp();

  const studentUnreadCount = studentNotifications.filter((n) => !n.isRead).length;
  const hasActiveWarning = studentNotifications.some(
    (n) => n.category === 'integrity' && n.warningStatus === 'Active Warning'
  );

  const facultyUnreadCount = facultyNotifications.filter((n) => !n.isRead).length;
  const pendingIntegrityAlerts = integrityAlerts.filter(
    (a) => a.status === 'Pending Review'
  ).length;

  return (
    <aside className="w-64 bg-white border-r border-blue-100 flex flex-col shrink-0 select-none">
      {/* College Institution Header Badge */}
      <div className="px-3.5 py-3 border-b border-blue-100 bg-blue-50/50">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-gradient-to-tr from-blue-600 to-blue-700 flex items-center justify-center shrink-0 shadow-xs">
            <GraduationCap className="w-4 h-4 text-white" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-bold text-slate-800 block truncate leading-tight" title={COLLEGE_CONFIG.name}>
              {COLLEGE_CONFIG.shortName}
            </span>
            <span className="text-[9px] text-blue-600 font-mono block truncate">
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
            <div className="px-3 mb-2 text-[10px] font-bold text-slate-600 uppercase tracking-wider font-mono">
              Student Laboratory Menu
            </div>
            <div className="space-y-1">
              <button
                onClick={() => setActiveNavTab('dashboard')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  activeNavTab === 'dashboard'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-slate-600 hover:text-slate-800 hover:bg-blue-50/60'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 text-blue-600" />
                <span>Dashboard</span>
              </button>

              <button
                onClick={() => setActiveNavTab('my_lab')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  activeNavTab === 'my_lab'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-slate-600 hover:text-slate-800 hover:bg-blue-50/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <FlaskConical className="w-4 h-4 text-blue-600" />
                  <span>My Lab</span>
                </div>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">
                  {currentUser?.batch}
                </span>
              </button>

              <button
                onClick={() => setActiveNavTab('lab_history')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  activeNavTab === 'lab_history'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-slate-600 hover:text-slate-800 hover:bg-blue-50/60'
                }`}
              >
                <History className="w-4 h-4 text-amber-600" />
                <span>Lab History</span>
              </button>

              <button
                onClick={() => setActiveNavTab('notifications')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  activeNavTab === 'notifications'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-slate-600 hover:text-slate-800 hover:bg-blue-50/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Bell className="w-4 h-4 text-blue-600" />
                  <span>Notifications</span>
                </div>
                <div className="flex items-center gap-1">
                  {hasActiveWarning && (
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" title="Active Academic Integrity Warning" />
                  )}
                  {studentUnreadCount > 0 && (
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-200">
                      {studentUnreadCount} New
                    </span>
                  )}
                </div>
              </button>

              <button
                onClick={() => setActiveNavTab('attendance')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  activeNavTab === 'attendance'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-slate-600 hover:text-slate-800 hover:bg-blue-50/60'
                }`}
              >
                <Percent className="w-4 h-4 text-emerald-600" />
                <span>Lab Attendance</span>
              </button>

              <button
                onClick={() => setActiveNavTab('quizzes')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  activeNavTab === 'quizzes'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-slate-600 hover:text-slate-800 hover:bg-blue-50/60'
                }`}
              >
                <ClipboardList className="w-4 h-4 text-blue-600" />
                <span>Quizzes & Viva</span>
              </button>

              <button
                onClick={() => setActiveNavTab('support')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  activeNavTab === 'support'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-slate-600 hover:text-slate-800 hover:bg-blue-50/60'
                }`}
              >
                <HelpCircle className="w-4 h-4 text-blue-700" />
                <span>Help & Support</span>
              </button>

              <button
                onClick={() => setActiveNavTab('profile')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  activeNavTab === 'profile'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-slate-600 hover:text-slate-800 hover:bg-blue-50/60'
                }`}
              >
                <User className="w-4 h-4 text-slate-700" />
                <span>Student Profile</span>
              </button>
            </div>
          </div>
        )}

        {/* TEACHER ROLE LINKS */}
        {currentRole === 'teacher' && (
          <div>
            <div className="px-3 mb-2 text-[10px] font-bold text-slate-600 uppercase tracking-wider font-mono">
              Teacher Faculty Console
            </div>
            <div className="space-y-1">
              <button
                onClick={() => setActiveNavTab('dashboard')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  activeNavTab === 'dashboard'
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : 'text-slate-600 hover:text-slate-800 hover:bg-blue-50/60'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 text-blue-600" />
                <span>Dashboard</span>
              </button>

              <button
                onClick={() => setActiveNavTab('my_batches')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  activeNavTab === 'my_batches'
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : 'text-slate-600 hover:text-slate-800 hover:bg-blue-50/60'
                }`}
              >
                <Users2 className="w-4 h-4 text-blue-600" />
                <span>My Batches (A / B / C)</span>
              </button>

              <button
                onClick={() => setActiveNavTab('lab_sessions')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  activeNavTab === 'lab_sessions'
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : 'text-slate-600 hover:text-slate-800 hover:bg-blue-50/60'
                }`}
              >
                <CalendarCheck2 className="w-4 h-4 text-emerald-600" />
                <span>Lab Sessions</span>
              </button>

              <button
                onClick={() => setActiveNavTab('student_monitoring')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  activeNavTab === 'student_monitoring'
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : 'text-slate-600 hover:text-slate-800 hover:bg-blue-50/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Activity className="w-4 h-4 text-rose-600" />
                  <span>Student Monitoring</span>
                </div>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 border border-emerald-200">
                  Live
                </span>
              </button>

              <button
                onClick={() => setActiveNavTab('quizzes')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  activeNavTab === 'quizzes'
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : 'text-slate-600 hover:text-slate-800 hover:bg-blue-50/60'
                }`}
              >
                <ClipboardList className="w-4 h-4 text-blue-600" />
                <span>Quiz Management</span>
              </button>

              <button
                onClick={() => setActiveNavTab('academic_integrity')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  activeNavTab === 'academic_integrity'
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : 'text-slate-600 hover:text-slate-800 hover:bg-blue-50/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <ShieldAlert className="w-4 h-4 text-rose-600" />
                  <span>Academic Integrity</span>
                </div>
                {pendingIntegrityAlerts > 0 && (
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-200">
                    {pendingIntegrityAlerts} Alert{pendingIntegrityAlerts > 1 ? 's' : ''}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveNavTab('faculty_notifications')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  activeNavTab === 'faculty_notifications'
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : 'text-slate-600 hover:text-slate-800 hover:bg-blue-50/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Bell className="w-4 h-4 text-blue-600" />
                  <span>Notifications</span>
                </div>
                {facultyUnreadCount > 0 && (
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200">
                    {facultyUnreadCount} New
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveNavTab('teacher_reports')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  activeNavTab === 'teacher_reports'
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : 'text-slate-600 hover:text-slate-800 hover:bg-blue-50/60'
                }`}
              >
                <FileSpreadsheet className="w-4 h-4 text-amber-600" />
                <span>Reports & CSV Export</span>
              </button>

              <button
                onClick={() => setActiveNavTab('profile')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  activeNavTab === 'profile'
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : 'text-slate-600 hover:text-slate-800 hover:bg-blue-50/60'
                }`}
              >
                <User className="w-4 h-4 text-slate-700" />
                <span>Faculty Profile</span>
              </button>
            </div>
          </div>
        )}

        {/* ADMIN ROLE LINKS */}
        {currentRole === 'admin' && (
          <div>
            <div className="px-3 mb-2 text-[10px] font-bold text-slate-600 uppercase tracking-wider font-mono">
              Administrator Operations
            </div>
            <div className="space-y-1">
              <button
                onClick={() => setActiveNavTab('dashboard')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  activeNavTab === 'dashboard'
                    ? 'bg-rose-100 text-rose-700 border border-rose-200'
                    : 'text-slate-600 hover:text-slate-800 hover:bg-blue-50/60'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 text-rose-600" />
                <span>Admin Dashboard</span>
              </button>

              <button
                onClick={() => setActiveNavTab('admin_students')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  activeNavTab === 'admin_students'
                    ? 'bg-rose-100 text-rose-700 border border-rose-200'
                    : 'text-slate-600 hover:text-slate-800 hover:bg-blue-50/60'
                }`}
              >
                <GraduationCap className="w-4 h-4 text-blue-600" />
                <span>Student Management</span>
              </button>

              <button
                onClick={() => setActiveNavTab('admin_teachers')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  activeNavTab === 'admin_teachers'
                    ? 'bg-rose-100 text-rose-700 border border-rose-200'
                    : 'text-slate-600 hover:text-slate-800 hover:bg-blue-50/60'
                }`}
              >
                <Users2 className="w-4 h-4 text-blue-600" />
                <span>Teacher Management</span>
              </button>

              <button
                onClick={() => setActiveNavTab('admin_semesters')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  activeNavTab === 'admin_semesters'
                    ? 'bg-rose-100 text-rose-700 border border-rose-200'
                    : 'text-slate-600 hover:text-slate-800 hover:bg-blue-50/60'
                }`}
              >
                <Layers className="w-4 h-4 text-amber-600" />
                <span>Semester & Batches (A/B/C)</span>
              </button>

              <button
                onClick={() => setActiveNavTab('admin_curriculum')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  activeNavTab === 'admin_curriculum'
                    ? 'bg-rose-100 text-rose-700 border border-rose-200'
                    : 'text-slate-600 hover:text-slate-800 hover:bg-blue-50/60'
                }`}
              >
                <BookOpen className="w-4 h-4 text-emerald-600" />
                <span>Subjects & Experiments</span>
              </button>

              <button
                onClick={() => setActiveNavTab('admin_schedules')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  activeNavTab === 'admin_schedules'
                    ? 'bg-rose-100 text-rose-700 border border-rose-200'
                    : 'text-slate-600 hover:text-slate-800 hover:bg-blue-50/60'
                }`}
              >
                <CalendarDays className="w-4 h-4 text-blue-600" />
                <span>Lab Schedule Timetable</span>
              </button>
            </div>
          </div>
        )}

        {/* SYSTEM ARCHITECTURE & DATABASE SPECIFICATION */}
        <div>
          <div className="px-3 mb-2 text-[10px] font-bold text-slate-600 uppercase tracking-wider font-mono">
            System & Architecture
          </div>
          <div className="space-y-1">
            <button
              onClick={() => setActiveNavTab('architecture')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                activeNavTab === 'architecture'
                  ? 'bg-amber-100 text-amber-700 border border-amber-200'
                  : 'text-slate-600 hover:text-slate-800 hover:bg-blue-50/60'
              }`}
            >
              <Database className="w-4 h-4 text-amber-600" />
              <span>14-Table DB & Schema</span>
            </button>

            <button
              onClick={onOpenJudge0Modal}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-blue-50/60 transition-all text-left"
            >
              <Sliders className="w-4 h-4 text-blue-600" />
              <span>Judge0 API Config</span>
            </button>
          </div>
        </div>
      </div>

      {/* Sidebar Footer with Logout & Active Node */}
      <div className="p-3 border-t border-blue-100 bg-[#f4f8ff] space-y-2 text-xs">
        <div className="flex items-center justify-between text-[11px] text-slate-600 font-mono">
          <span>Role: {currentRole.toUpperCase()}</span>
          <span className="text-emerald-600">Online</span>
        </div>
        <button
          onClick={logout}
          className="w-full py-1.5 px-3 rounded-lg bg-blue-50/60 hover:bg-rose-50 text-slate-600 hover:text-rose-700 border border-blue-100 hover:border-rose-200 transition-colors flex items-center justify-center gap-1.5 text-xs font-semibold"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
