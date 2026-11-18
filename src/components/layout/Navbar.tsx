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
    <header className="h-16 bg-white dark:bg-white border-b border-blue-100 px-4 lg:px-6 flex items-center justify-between gap-4 select-none sticky top-0 z-40">
      {/* Brand & Academic Identity */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
          <Code2 className="w-5 h-5 text-white" />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold tracking-tight text-slate-900 font-mono">
              Smart<span className="text-blue-600">Lab</span>
            </span>
            <span
              className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded font-mono border ${
                currentRole === 'admin'
                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                  : currentRole === 'teacher'
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : 'bg-blue-50 text-blue-700 border-blue-200'
              }`}
            >
              {currentRole === 'admin'
                ? 'Admin Console'
                : currentRole === 'teacher'
                ? 'Faculty Portal'
                : 'Student Portal'}
            </span>
          </div>
          <span className="text-[11px] text-slate-700 font-medium hidden sm:inline truncate max-w-xs md:max-w-md lg:max-w-lg" title={COLLEGE_CONFIG.name}>
            {COLLEGE_CONFIG.name}
          </span>
        </div>
      </div>

      {/* Controls: Theme, Notifications, Judge0, Reset, User Menu */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Judge0 Settings */}
        <button
          onClick={onOpenJudge0Modal}
          className="p-2 rounded-lg bg-blue-50/60 hover:bg-blue-100 border border-blue-100 text-slate-600 hover:text-blue-700 transition-colors"
          title="Configure Judge0 API & Code Execution"
        >
          <Sliders className="w-4 h-4" />
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg bg-blue-50/60 hover:bg-blue-100 border border-blue-100 text-slate-600 hover:text-slate-800 transition-colors"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} theme`}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-600" /> : <Moon className="w-4 h-4 text-blue-600" />}
        </button>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-lg bg-blue-50/60 hover:bg-blue-100 border border-blue-100 text-slate-600 hover:text-slate-800 transition-colors relative"
            title="Lab & Academic Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-[10px] font-bold text-white flex items-center justify-center ring-2 ring-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div
              className="absolute right-0 mt-2 w-84 sm:w-96 bg-white border border-blue-200 rounded-xl shadow-2xl p-3.5 z-50 text-xs"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-blue-200">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">
                    {currentRole === 'student'
                      ? 'Student Notifications'
                      : currentRole === 'teacher'
                      ? 'Faculty Alert Feed'
                      : 'Lab Telemetry Alerts'}
                  </span>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-rose-100 text-rose-700 border border-rose-200">
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
                  className="text-[11px] text-blue-600 hover:text-blue-700 font-medium underline"
                >
                  View All
                </button>
              </div>

              {/* Feed Content */}
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {currentRole === 'student' && (
                  <>
                    {studentNotifications.length === 0 ? (
                      <p className="text-slate-600 text-center py-4">No notifications yet.</p>
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
                              ? 'bg-rose-50 border-rose-300 hover:bg-rose-50'
                              : !notif.isRead
                              ? 'bg-blue-50 border-blue-200 hover:bg-blue-50/50'
                              : 'bg-[#f4f8ff] border-blue-100 hover:bg-blue-50/60'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <span
                              className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded font-bold ${
                                notif.category === 'integrity'
                                  ? 'bg-rose-500 text-white'
                                  : notif.category === 'assignment'
                                  ? 'bg-blue-100 text-blue-700'
                                  : notif.category === 'lab'
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : 'bg-blue-100 text-blue-700'
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
                            <span className="text-[10px] text-slate-600 font-mono">
                              {notif.timestamp}
                            </span>
                          </div>
                          <p className="font-semibold text-slate-900 text-[11px] leading-tight">
                            {notif.title}
                          </p>
                          <p className="text-[10px] text-slate-700 line-clamp-2 mt-0.5">
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
                      <p className="text-slate-600 text-center py-4">No active faculty alerts.</p>
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
                              ? 'bg-rose-50 border-rose-300 hover:bg-rose-50'
                              : !notif.isRead
                              ? 'bg-blue-50 border-blue-200 hover:bg-blue-50/50'
                              : 'bg-[#f4f8ff] border-blue-100 hover:bg-blue-50/60'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <span
                              className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded font-bold ${
                                notif.category === 'integrity'
                                  ? 'bg-rose-500 text-white'
                                  : notif.category === 'submission'
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : 'bg-blue-100 text-blue-700'
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
                                    ? 'bg-rose-100 text-rose-700 border border-rose-300'
                                    : notif.riskLevel === 'Medium'
                                    ? 'bg-amber-100 text-amber-700 border border-amber-300'
                                    : 'bg-slate-700 text-slate-700'
                                }`}
                              >
                                {notif.riskLevel} Risk ({notif.similarityScore}%)
                              </span>
                            )}
                            <span className="text-[10px] text-slate-600 font-mono">
                              {notif.timestamp}
                            </span>
                          </div>
                          <p className="font-semibold text-slate-900 text-[11px] leading-tight">
                            {notif.title}
                          </p>
                          <p className="text-[10px] text-slate-700 line-clamp-2 mt-0.5">
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
                      <p className="text-slate-600 text-center py-4">No active security alerts.</p>
                    ) : (
                      clipboardEvents.slice(0, 4).map((evt) => (
                        <div
                          key={evt.id}
                          className="p-2 rounded bg-[#f4f8ff] border border-rose-200 text-rose-700 space-y-1"
                        >
                          <div className="flex items-center justify-between font-semibold text-[11px]">
                            <span>
                              {evt.studentName} ({evt.usn})
                            </span>
                            <span className="text-[10px] font-mono text-slate-600">
                              {new Date(evt.timestamp).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-700">{evt.details}</p>
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
          className="p-2 rounded-lg bg-blue-50/60 hover:bg-blue-100 border border-blue-100 text-slate-600 hover:text-slate-800 transition-colors"
          title={`Reset sample ${COLLEGE_CONFIG.shortAcronym} dataset`}
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* User Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            className="flex items-center gap-2 pl-2 pr-1.5 py-1 rounded-lg bg-blue-50/60 border border-blue-100 hover:border-blue-200 transition-colors text-left"
          >
            <div className="w-7 h-7 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center text-xs font-bold text-blue-700">
              {currentUser?.name?.charAt(0) || 'U'}
            </div>
            <div className="hidden md:flex flex-col text-xs leading-tight">
              <span className="font-semibold text-slate-800">{currentUser?.name}</span>
              <span className="text-[10px] text-slate-600 font-mono">
                {currentUser?.role === 'student'
                  ? `${currentUser.usn} · ${currentUser.batch}`
                  : currentUser?.role === 'teacher'
                  ? currentUser.employeeCode
                  : 'System Administrator'}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-600" />
          </button>

          {showUserDropdown && (
            <div
              className="absolute right-0 mt-2 w-64 bg-white border border-blue-200 rounded-xl shadow-2xl py-2 z-50 text-xs"
              onClick={() => setShowUserDropdown(false)}
            >
              <div className="px-3 py-2 border-b border-blue-100">
                <p className="font-semibold text-slate-900">{currentUser?.name}</p>
                <p className="text-slate-600 text-[11px]">{currentUser?.email}</p>
                {currentUser?.role === 'student' && (
                  <p className="text-[10px] text-blue-700 font-mono mt-0.5">
                    Semester {currentUser.semester} · {currentUser.batch} (Locked)
                  </p>
                )}
                <div className="mt-2 flex items-center gap-1.5 text-[10px] text-emerald-600 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <span>Authenticated Session Active</span>
                </div>
              </div>

              <div className="pt-1 mt-1">
                <button
                  onClick={logout}
                  className="w-full px-3 py-1.5 text-left flex items-center gap-2 text-rose-600 hover:bg-rose-50 transition-colors"
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
