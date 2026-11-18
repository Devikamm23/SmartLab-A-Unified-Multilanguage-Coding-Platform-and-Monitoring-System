import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { COLLEGE_CONFIG } from '../../constants/college';
import { StudentNotificationItem } from '../../types';
import {
  Bell,
  Clock,
  BookOpen,
  Megaphone,
  CheckCheck,
  Filter,
  Trash2,
  ShieldAlert,
  FlaskConical,
  X,
  Info,
} from 'lucide-react';

export const NotificationCentre: React.FC = () => {
  const {
    studentNotifications,
    markStudentNotificationAsRead,
    markAllStudentNotificationsAsRead,
    deleteStudentNotification,
    clearStudentNotifications,
    acknowledgeStudentIntegrityWarning,
  } = useApp();

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
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-50 text-rose-700 border border-rose-300">
            <ShieldAlert className="w-3 h-3 text-rose-600" /> Academic Integrity
          </span>
        );
      case 'assignment':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-50 text-blue-600 border border-blue-200">
            <BookOpen className="w-3 h-3" /> Assignment
          </span>
        );
      case 'lab':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">
            <FlaskConical className="w-3 h-3" /> Lab Milestone
          </span>
        );
      case 'announcement':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-50 text-blue-600 border border-blue-200">
            <Megaphone className="w-3 h-3" /> Faculty Circular
          </span>
        );
    }
  };

  const filteredNotifications = studentNotifications.filter((n) => {
    if (filterUnreadOnly && n.isRead) return false;
    return true;
  });

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">Student Notification Centre</h1>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold font-mono bg-rose-100 text-rose-600 border border-rose-200">
                    {unreadCount} unread
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-600">
                Real-time updates, faculty circulars, and laboratory alerts for {COLLEGE_CONFIG.name}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllStudentNotificationsAsRead}
              className="px-3 py-1.5 rounded-lg bg-blue-100 hover:bg-blue-100 text-slate-800 text-xs font-medium border border-blue-200 transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <CheckCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>Mark All as Read</span>
            </button>
          )}
          {studentNotifications.length > 0 && (
            <button
              onClick={clearStudentNotifications}
              className="px-3 py-1.5 rounded-lg bg-blue-50/60 hover:bg-rose-50 text-slate-600 hover:text-rose-700 text-xs font-medium border border-blue-100 hover:border-rose-200 transition-colors flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear All</span>
            </button>
          )}
        </div>
      </div>

      {/* Unified Notifications Control Bar (All messages in one feed) */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-white border border-blue-100 text-xs">
        <span className="font-mono text-slate-700">
          All Notifications (<strong className="text-slate-900">{studentNotifications.length}</strong>)
        </span>

        <button
          onClick={() => setFilterUnreadOnly(!filterUnreadOnly)}
          className={`px-2.5 py-1 rounded-md text-xs font-medium border flex items-center gap-1.5 transition-colors cursor-pointer ${
            filterUnreadOnly
              ? 'bg-amber-50 border-amber-300 text-amber-700'
              : 'bg-blue-50/60 border-blue-100 text-slate-600 hover:text-slate-800'
          }`}
        >
          <Filter className="w-3 h-3" />
          <span>Unread Only</span>
        </button>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="bg-white border border-blue-100 rounded-xl p-12 text-center text-xs text-slate-500 space-y-2">
            <Bell className="w-8 h-8 text-slate-600 mx-auto" />
            <p>{filterUnreadOnly ? 'No unread notifications.' : 'No notifications yet.'}</p>
          </div>
        ) : (
          filteredNotifications.map((notif) => (
            <div
              key={notif.id}
              className={`p-4 rounded-xl border transition-all space-y-3 ${
                notif.category === 'integrity'
                  ? 'bg-rose-50 border-rose-300 shadow-sm'
                  : !notif.isRead
                  ? 'bg-[#0f1b42] border-blue-300 shadow-sm'
                  : 'bg-white border-blue-100 hover:border-blue-200'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {getCategoryBadge(notif.category)}
                    <h3 className="text-sm font-bold text-slate-900 tracking-tight">{notif.title}</h3>
                    {!notif.isRead && (
                      <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
                    )}
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed max-w-3xl">
                    {notif.description || (notif as any).message}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] text-slate-600 font-mono flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {notif.timestamp}
                  </span>
                  {!notif.isRead && (
                    <button
                      onClick={() => markStudentNotificationAsRead(notif.id)}
                      className="text-[11px] text-blue-600 hover:text-blue-700 font-medium ml-2"
                    >
                      Mark Read
                    </button>
                  )}
                  <button
                    onClick={() => deleteStudentNotification(notif.id)}
                    className="p-1 rounded text-slate-500 hover:text-rose-600 transition-colors"
                    title="Dismiss notification"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* If Academic Integrity Alert: Contextual details box & Acknowledge CTA */}
              {notif.category === 'integrity' && (
                <div className="p-3.5 rounded-lg bg-[#f4f8ff] border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="space-y-1 font-mono text-[11px]">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-600">Assignment:</span>
                      <strong className="text-slate-800">{notif.assignmentName || 'Laboratory Assignment'}</strong>
                    </div>
                    {notif.copyPasteDetails && (
                      <div className="text-amber-700">{notif.copyPasteDetails}</div>
                    )}
                    <div className="flex items-center gap-2 text-slate-600">
                      <span>Status:</span>
                      <span className={`font-bold ${notif.warningStatus === 'Acknowledged' ? 'text-emerald-600' : 'text-amber-600'}`}>
                        {notif.warningStatus || 'Active Warning'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setInspectWarning(notif)}
                      className="px-3 py-1.5 rounded-lg bg-blue-100 hover:bg-blue-100 text-blue-700 text-xs font-semibold border border-blue-200 transition-colors"
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
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white border border-amber-300 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 text-slate-800">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 tracking-tight">Academic Integrity Record</h3>
                  <span className="text-xs text-slate-600 font-mono">{inspectWarning.timestamp}</span>
                </div>
              </div>
              <button
                onClick={() => setInspectWarning(null)}
                className="text-slate-600 hover:text-slate-900 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 leading-relaxed">
              &quot;Unusual copy-paste activity has been detected in your coding session. Please ensure that your submitted code represents your own work.&quot;
            </div>

            <div className="space-y-2 p-3.5 rounded-xl bg-blue-50/60 border border-blue-100 text-xs font-mono">
              <div>
                <span className="text-[10px] text-slate-500 uppercase block font-sans">Assignment</span>
                <span className="text-slate-900 font-semibold font-sans">{inspectWarning.assignmentName}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase block font-sans">Activity Details</span>
                <span className="text-slate-700">{inspectWarning.copyPasteDetails}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase block font-sans">Warning Status</span>
                <span className="text-amber-600 font-bold">{inspectWarning.warningStatus || 'Active Warning'}</span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-[#f4f8ff] border border-blue-100 flex items-start gap-2 text-xs text-slate-600">
              <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
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
