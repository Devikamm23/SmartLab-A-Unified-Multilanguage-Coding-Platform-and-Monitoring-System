import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { COLLEGE_CONFIG } from '../../constants/college';
import { StudentNotificationItem } from '../../types';
import {
  Bell,
  CheckCircle2,
  Clock,
  BookOpen,
  Calendar,
  AlertCircle,
  Megaphone,
  CheckCheck,
  Filter,
  Trash2,
  ExternalLink,
  ShieldAlert,
  FlaskConical,
  X,
  Check,
  Info,
} from 'lucide-react';

export const NotificationCentre: React.FC = () => {
  const {
    setActiveNavTab,
    startLab,
    studentNotifications,
    markStudentNotificationAsRead,
    markAllStudentNotificationsAsRead,
    deleteStudentNotification,
    clearStudentNotifications,
    acknowledgeStudentIntegrityWarning,
  } = useApp();

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [filterUnreadOnly, setFilterUnreadOnly] = useState<boolean>(false);
  const [inspectWarning, setInspectWarning] = useState<StudentNotificationItem | null>(null);

  const unreadCount = studentNotifications.filter((n) => !n.isRead).length;

  const handleAcknowledge = (notifId: string) => {
    acknowledgeStudentIntegrityWarning(notifId);
    setInspectWarning(null);
  };

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'integrity':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-950 text-rose-300 border border-rose-500/40">
            <ShieldAlert className="w-3 h-3 text-rose-400" /> Academic Integrity
          </span>
        );
      case 'assignment':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-sky-950 text-sky-400 border border-sky-500/30">
            <BookOpen className="w-3 h-3" /> Assignment
          </span>
        );
      case 'lab':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-400 border border-emerald-500/30">
            <FlaskConical className="w-3 h-3" /> Lab Milestone
          </span>
        );
      case 'announcement':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-950 text-purple-400 border border-purple-500/30">
            <Megaphone className="w-3 h-3" /> Faculty Circular
          </span>
        );
    }
  };

  const filteredNotifications = studentNotifications.filter((n) => {
    if (activeCategory !== 'all' && n.category !== activeCategory) return false;
    if (filterUnreadOnly && n.isRead) return false;
    return true;
  });

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white tracking-tight">Student Notification Centre</h1>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold font-mono bg-rose-500/20 text-rose-400 border border-rose-500/30">
                    {unreadCount} unread
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                Real-time updates, faculty circulars, and laboratory alerts for {COLLEGE_CONFIG.name}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllStudentNotificationsAsRead}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <CheckCheck className="w-3.5 h-3.5 text-sky-400" />
              <span>Mark All as Read</span>
            </button>
          )}
          {studentNotifications.length > 0 && (
            <button
              onClick={clearStudentNotifications}
              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-rose-950/40 text-slate-400 hover:text-rose-300 text-xs font-medium border border-slate-800 hover:border-rose-500/30 transition-colors flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear All</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs matching exact requirements */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-2.5 rounded-xl bg-[#0e1738] border border-slate-800 text-xs">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeCategory === 'all'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            All Updates ({studentNotifications.length})
          </button>

          <button
            onClick={() => setActiveCategory('assignment')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 ${
              activeCategory === 'assignment'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-sky-400" />
            <span>Assignments ({studentNotifications.filter((n) => n.category === 'assignment').length})</span>
          </button>

          <button
            onClick={() => setActiveCategory('lab')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 ${
              activeCategory === 'lab'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <FlaskConical className="w-3.5 h-3.5 text-emerald-400" />
            <span>Lab Sessions ({studentNotifications.filter((n) => n.category === 'lab').length})</span>
          </button>

          <button
            onClick={() => setActiveCategory('announcement')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 ${
              activeCategory === 'announcement'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Megaphone className="w-3.5 h-3.5 text-purple-400" />
            <span>Faculty Announcements ({studentNotifications.filter((n) => n.category === 'announcement').length})</span>
          </button>

          <button
            onClick={() => setActiveCategory('integrity')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 ${
              activeCategory === 'integrity'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-rose-300 hover:bg-slate-800/60'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            <span>Integrity Warnings ({studentNotifications.filter((n) => n.category === 'integrity').length})</span>
          </button>
        </div>

        <button
          onClick={() => setFilterUnreadOnly(!filterUnreadOnly)}
          className={`px-2.5 py-1 rounded-md text-xs font-medium border flex items-center gap-1.5 transition-colors ${
            filterUnreadOnly
              ? 'bg-amber-950/80 border-amber-500/40 text-amber-300'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <Filter className="w-3 h-3" />
          <span>Unread Only</span>
        </button>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="bg-[#0e1738] border border-slate-800 rounded-xl p-12 text-center text-xs text-slate-500 space-y-2">
            <Bell className="w-8 h-8 text-slate-600 mx-auto" />
            <p>No notifications matching this category.</p>
          </div>
        ) : (
          filteredNotifications.map((notif) => (
            <div
              key={notif.id}
              className={`p-4 rounded-xl border transition-all space-y-3 ${
                notif.category === 'integrity'
                  ? 'bg-rose-950/20 border-rose-500/40 shadow-sm'
                  : !notif.isRead
                  ? 'bg-[#0f1b42] border-sky-500/40 shadow-sm'
                  : 'bg-[#0e1738] border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {getCategoryBadge(notif.category)}
                    <h3 className="text-sm font-bold text-white tracking-tight">{notif.title}</h3>
                    {!notif.isRead && (
                      <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
                    )}
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
                    {notif.description || (notif as any).message}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {notif.timestamp}
                  </span>
                  {!notif.isRead && (
                    <button
                      onClick={() => markStudentNotificationAsRead(notif.id)}
                      className="text-[11px] text-sky-400 hover:text-sky-300 font-medium ml-2"
                    >
                      Mark Read
                    </button>
                  )}
                  <button
                    onClick={() => deleteStudentNotification(notif.id)}
                    className="p-1 rounded text-slate-500 hover:text-rose-400 transition-colors"
                    title="Dismiss notification"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* If Academic Integrity Alert: Contextual details box & Acknowledge CTA */}
              {notif.category === 'integrity' && (
                <div className="p-3.5 rounded-lg bg-slate-900/90 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="space-y-1 font-mono text-[11px]">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400">Assignment:</span>
                      <strong className="text-slate-200">{notif.assignmentName || 'Laboratory Assignment'}</strong>
                    </div>
                    {notif.copyPasteDetails && (
                      <div className="text-amber-300">{notif.copyPasteDetails}</div>
                    )}
                    <div className="flex items-center gap-2 text-slate-400">
                      <span>Status:</span>
                      <span className={`font-bold ${notif.warningStatus === 'Acknowledged' ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {notif.warningStatus || 'Active Warning'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setInspectWarning(notif)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-300 text-xs font-semibold border border-slate-700 transition-colors"
                    >
                      View Warning Details
                    </button>
                    {notif.warningStatus !== 'Acknowledged' && (
                      <button
                        type="button"
                        onClick={() => handleAcknowledge(notif.id)}
                        className="px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-colors"
                      >
                        Acknowledge
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Warning Inspection Modal for Student */}
      {inspectWarning && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-[#0e1738] border border-amber-500/40 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 text-slate-200">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">Academic Integrity Record</h3>
                  <span className="text-xs text-slate-400 font-mono">{inspectWarning.timestamp}</span>
                </div>
              </div>
              <button
                onClick={() => setInspectWarning(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-500/20 text-xs text-amber-200/90 leading-relaxed">
              &quot;Unusual copy-paste activity has been detected in your coding session. Please ensure that your submitted code represents your own work.&quot;
            </div>

            <div className="space-y-2 p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono">
              <div>
                <span className="text-[10px] text-slate-500 uppercase block font-sans">Assignment</span>
                <span className="text-white font-semibold font-sans">{inspectWarning.assignmentName}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase block font-sans">Activity Details</span>
                <span className="text-slate-300">{inspectWarning.copyPasteDetails}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase block font-sans">Warning Status</span>
                <span className="text-amber-400 font-bold">{inspectWarning.warningStatus || 'Active Warning'}</span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 flex items-start gap-2 text-xs text-slate-400">
              <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                Academic integrity monitoring is transparent. Faculty review all code submissions manually. Similarity indicators are used to guide faculty assessment, not to automatically deduct marks.
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => handleAcknowledge(inspectWarning.id)}
                className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-colors shadow-md shadow-amber-600/20"
              >
                {inspectWarning.warningStatus === 'Acknowledged' ? 'Close' : 'Acknowledge Warning'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
