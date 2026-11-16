import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { COLLEGE_CONFIG } from '../../constants/college';
import {
  Code2,
  Moon,
  Sun,
  Bell,
  Sliders,
  RotateCcw,
  ChevronDown,
  LogOut,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

interface NavbarProps {
  onOpenJudge0Modal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenJudge0Modal }) => {
  const {
    currentUser,
    currentRole,
    theme,
    toggleTheme,
    logout,
    resetAllData,
    clipboardEvents,
    studentNotifications,
    facultyNotifications,
    setActiveNavTab,
    markStudentNotificationAsRead,
    markFacultyNotificationAsRead,
  } = useApp();

  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Dynamic notification counts
  const studentUnread = studentNotifications.filter((n) => !n.isRead).length;
  const facultyUnread = facultyNotifications.filter((n) => !n.isRead).length;
  const unreadCount =
    currentRole === 'student'
      ? studentUnread
      : currentRole === 'teacher'
      ? facultyUnread
      : clipboardEvents.length;

  return (
    <header className="h-16 bg-[#0b132b] dark:bg-[#0b132b] border-b border-slate-800 px-4 lg:px-6 flex items-center justify-between gap-4 select-none sticky top-0 z-40">
      {/* Brand & Academic Identity */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-sky-500 flex items-center justify-center shadow-md shadow-indigo-500/20 shrink-0">
          <Code2 className="w-5 h-5 text-white" />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold tracking-tight text-white font-mono">
              Smart<span className="text-sky-400">Lab</span>
            </span>
            <span
              className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded font-mono border ${
                currentRole === 'admin'
                  ? 'bg-rose-950 text-rose-300 border-rose-500/30'
                  : currentRole === 'teacher'
                  ? 'bg-indigo-950 text-indigo-300 border-indigo-500/30'
                  : 'bg-sky-950 text-sky-300 border-sky-500/30'
              }`}
            >
              {currentRole === 'admin'
                ? 'Admin Console'
                : currentRole === 'teacher'
                ? 'Faculty Portal'
                : 'Student Portal'}
            </span>
          </div>
          <span className="text-[11px] text-slate-300 font-medium hidden sm:inline truncate max-w-xs md:max-w-md lg:max-w-lg" title={COLLEGE_CONFIG.name}>
            {COLLEGE_CONFIG.name}
          </span>
        </div>
      </div>

      {/* Controls: Theme, Notifications, Judge0, Reset, User Menu */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Judge0 Settings */}
        <button
          onClick={onOpenJudge0Modal}
          className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-sky-300 transition-colors"
          title="Configure Judge0 API & Code Execution"
        >
          <Sliders className="w-4 h-4" />
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} theme`}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-sky-400" />}
        </button>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors relative"
            title="Lab & Academic Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-[10px] font-bold text-white flex items-center justify-center ring-2 ring-[#0b132b]">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div
              className="absolute right-0 mt-2 w-84 sm:w-96 bg-[#141d38] border border-slate-700 rounded-xl shadow-2xl p-3.5 z-50 text-xs"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-700/80">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-100">
                    {currentRole === 'student'
                      ? 'Student Notifications'
                      : currentRole === 'teacher'
                      ? 'Faculty Alert Feed'
                      : 'Lab Telemetry Alerts'}
                  </span>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      {unreadCount} unread
                    </span>
                  )}
                </div>
                <button
                  onClick={() => {
                    setShowNotifications(false);
                    if (currentRole === 'student') setActiveNavTab('notifications');
                    if (currentRole === 'teacher') setActiveNavTab('faculty_notifications');
                  }}
                  className="text-[11px] text-sky-400 hover:text-sky-300 font-medium underline"
                >
                  View All
                </button>
              </div>

              {/* Feed Content */}
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {currentRole === 'student' && (
                  <>
                    {studentNotifications.length === 0 ? (
                      <p className="text-slate-400 text-center py-4">No notifications yet.</p>
                    ) : (
                      studentNotifications.slice(0, 4).map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => {
                            markStudentNotificationAsRead(notif.id);
                            setShowNotifications(false);
                            setActiveNavTab('notifications');
                          }}
                          className={`p-2.5 rounded-lg border cursor-pointer transition-all ${
                            notif.category === 'integrity'
                              ? 'bg-rose-950/40 border-rose-500/40 hover:bg-rose-950/60'
                              : !notif.isRead
                              ? 'bg-sky-950/30 border-sky-500/30 hover:bg-sky-950/50'
                              : 'bg-slate-900/60 border-slate-800 hover:bg-slate-800/60'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <span
                              className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded font-bold ${
                                notif.category === 'integrity'
                                  ? 'bg-rose-500 text-white'
                                  : notif.category === 'assignment'
                                  ? 'bg-indigo-500/20 text-indigo-300'
                                  : notif.category === 'lab'
                                  ? 'bg-emerald-500/20 text-emerald-300'
                                  : 'bg-purple-500/20 text-purple-300'
                              }`}
                            >
                              {notif.category === 'integrity'
                                ? 'Academic Integrity'
                                : notif.category === 'assignment'
                                ? 'Assignment'
                                : notif.category === 'lab'
                                ? 'Lab Session'
                                : 'Announcement'}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {notif.timestamp}
                            </span>
                          </div>
                          <p className="font-semibold text-slate-100 text-[11px] leading-tight">
                            {notif.title}
                          </p>
                          <p className="text-[10px] text-slate-300 line-clamp-2 mt-0.5">
                            {notif.description}
                          </p>
                        </div>
                      ))
                    )}
                  </>
                )}

                {currentRole === 'teacher' && (
                  <>
                    {facultyNotifications.length === 0 ? (
                      <p className="text-slate-400 text-center py-4">No active faculty alerts.</p>
                    ) : (
                      facultyNotifications.slice(0, 4).map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => {
                            markFacultyNotificationAsRead(notif.id);
                            setShowNotifications(false);
                            if (notif.category === 'integrity') {
                              setActiveNavTab('academic_integrity');
                            } else {
                              setActiveNavTab('faculty_notifications');
                            }
                          }}
                          className={`p-2.5 rounded-lg border cursor-pointer transition-all ${
                            notif.category === 'integrity'
                              ? 'bg-rose-950/40 border-rose-500/40 hover:bg-rose-950/60'
                              : !notif.isRead
                              ? 'bg-indigo-950/30 border-indigo-500/30 hover:bg-indigo-950/50'
                              : 'bg-slate-900/60 border-slate-800 hover:bg-slate-800/60'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <span
                              className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded font-bold ${
                                notif.category === 'integrity'
                                  ? 'bg-rose-500 text-white'
                                  : notif.category === 'submission'
                                  ? 'bg-emerald-500/20 text-emerald-300'
                                  : 'bg-sky-500/20 text-sky-300'
                              }`}
                            >
                              {notif.category === 'integrity'
                                ? 'Academic Integrity'
                                : notif.category === 'submission'
                                ? 'Submission'
                                : notif.category === 'session'
                                ? 'Lab Session'
                                : 'Announcement'}
                            </span>
                            {notif.riskLevel && (
                              <span
                                className={`text-[9px] font-mono font-bold px-1 rounded ${
                                  notif.riskLevel === 'High'
                                    ? 'bg-rose-600/30 text-rose-300 border border-rose-500/40'
                                    : notif.riskLevel === 'Medium'
                                    ? 'bg-amber-600/30 text-amber-300 border border-amber-500/40'
                                    : 'bg-slate-700 text-slate-300'
                                }`}
                              >
                                {notif.riskLevel} Risk ({notif.similarityScore}%)
                              </span>
                            )}
                            <span className="text-[10px] text-slate-400 font-mono">
                              {notif.timestamp}
                            </span>
                          </div>
                          <p className="font-semibold text-slate-100 text-[11px] leading-tight">
                            {notif.title}
                          </p>
                          <p className="text-[10px] text-slate-300 line-clamp-2 mt-0.5">
                            {notif.description}
                          </p>
                        </div>
                      ))
                    )}
                  </>
                )}

                {currentRole === 'admin' && (
                  <>
                    {clipboardEvents.length === 0 ? (
                      <p className="text-slate-400 text-center py-4">No active security alerts.</p>
                    ) : (
                      clipboardEvents.slice(0, 4).map((evt) => (
                        <div
                          key={evt.id}
                          className="p-2 rounded bg-slate-900/90 border border-rose-500/30 text-rose-300 space-y-1"
                        >
                          <div className="flex items-center justify-between font-semibold text-[11px]">
                            <span>
                              {evt.studentName} ({evt.usn})
                            </span>
                            <span className="text-[10px] font-mono text-slate-400">
                              {new Date(evt.timestamp).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-300">{evt.details}</p>
                        </div>
                      ))
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Reset Demo Data */}
        <button
          onClick={() => {
            if (confirm(`Reset SmartLab data to initial ${COLLEGE_CONFIG.shortAcronym} laboratory state?`)) {
              resetAllData();
            }
          }}
          className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
          title={`Reset sample ${COLLEGE_CONFIG.shortAcronym} dataset`}
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* User Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            className="flex items-center gap-2 pl-2 pr-1.5 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors text-left"
          >
            <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-sky-300">
              {currentUser?.name?.charAt(0) || 'U'}
            </div>
            <div className="hidden md:flex flex-col text-xs leading-tight">
              <span className="font-semibold text-slate-200">{currentUser?.name}</span>
              <span className="text-[10px] text-slate-400 font-mono">
                {currentUser?.role === 'student'
                  ? `${currentUser.usn} · ${currentUser.batch}`
                  : currentUser?.role === 'teacher'
                  ? currentUser.employeeCode
                  : 'System Administrator'}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showUserDropdown && (
            <div
              className="absolute right-0 mt-2 w-64 bg-[#141d38] border border-slate-700 rounded-xl shadow-2xl py-2 z-50 text-xs"
              onClick={() => setShowUserDropdown(false)}
            >
              <div className="px-3 py-2 border-b border-slate-700/60">
                <p className="font-semibold text-slate-100">{currentUser?.name}</p>
                <p className="text-slate-400 text-[11px]">{currentUser?.email}</p>
                {currentUser?.role === 'student' && (
                  <p className="text-[10px] text-sky-300 font-mono mt-0.5">
                    Semester {currentUser.semester} · {currentUser.batch} (Locked)
                  </p>
                )}
                <div className="mt-2 flex items-center gap-1.5 text-[10px] text-emerald-400 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <span>Authenticated Session Active</span>
                </div>
              </div>

              <div className="pt-1 mt-1">
                <button
                  onClick={logout}
                  className="w-full px-3 py-1.5 text-left flex items-center gap-2 text-rose-400 hover:bg-rose-500/10 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log Out of Session</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
