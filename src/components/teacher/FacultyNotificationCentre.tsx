import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { FacultyNotificationItem, AcademicIntegrityAlert } from '../../types';
import { COLLEGE_CONFIG } from '../../constants/college';
import { CodeSimilarityModal } from './CodeSimilarityModal';
import {
  Bell,
  ShieldAlert,
  CheckCircle2,
  Clock,
  CheckCheck,
  Trash2,
  GitCompare,
  Filter,
  CalendarCheck2,
  Sparkles,
} from 'lucide-react';

export const FacultyNotificationCentre: React.FC = () => {
  const {
    facultyNotifications,
    markFacultyNotificationAsRead,
    markAllFacultyNotificationsAsRead,
    clearFacultyNotifications,
    integrityAlerts,
    reviewIntegrityAlert,
    dismissIntegrityAlert,
  } = useApp();

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [filterUnreadOnly, setFilterUnreadOnly] = useState<boolean>(false);
  const [selectedAlertForModal, setSelectedAlertForModal] = useState<AcademicIntegrityAlert | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const unreadCount = facultyNotifications.filter((n) => !n.isRead).length;

  const handleOpenAlertFromNotification = (notif: FacultyNotificationItem) => {
    markFacultyNotificationAsRead(notif.id);
    if (notif.integrityAlertId) {
      const target = integrityAlerts.find((a) => a.id === notif.integrityAlertId);
      if (target) {
        setSelectedAlertForModal(target);
        setIsModalOpen(true);
      }
    }
  };

  const filtered = facultyNotifications.filter((n) => {
    if (activeCategory !== 'all' && n.category !== activeCategory) return false;
    if (filterUnreadOnly && n.isRead) return false;
    return true;
  });

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'integrity':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-950 text-rose-400 border border-rose-500/30">
            <ShieldAlert className="w-3 h-3" /> Integrity Alert
          </span>
        );
      case 'submission':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3" /> Submission Milestone
          </span>
        );
      case 'session':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-950 text-indigo-400 border border-indigo-500/30">
            <CalendarCheck2 className="w-3 h-3" /> Lab Milestone
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-300">
            <Bell className="w-3 h-3" /> Announcement
          </span>
        );
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white tracking-tight">Faculty Notification Centre</h1>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold font-mono bg-rose-500/20 text-rose-400 border border-rose-500/30">
                    {unreadCount} unread
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                Real-time security warnings, copy-paste triggers, and laboratory milestones for {COLLEGE_CONFIG.name}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllFacultyNotificationsAsRead}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors flex items-center gap-1.5"
            >
              <CheckCheck className="w-3.5 h-3.5 text-sky-400" />
              <span>Mark All as Read</span>
            </button>
          )}
          {facultyNotifications.length > 0 && (
            <button
              onClick={clearFacultyNotifications}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-rose-400 text-xs font-medium border border-slate-700 transition-colors flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          )}
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0e1738] border border-slate-800 p-2.5 rounded-xl">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeCategory === 'all'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            All Notifications ({facultyNotifications.length})
          </button>
          <button
            onClick={() => setActiveCategory('integrity')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
              activeCategory === 'integrity'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-rose-300 hover:bg-slate-800/60'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            <span>Academic Integrity ({facultyNotifications.filter((n) => n.category === 'integrity').length})</span>
          </button>
          <button
            onClick={() => setActiveCategory('submission')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeCategory === 'submission'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            Submissions ({facultyNotifications.filter((n) => n.category === 'submission').length})
          </button>
          <button
            onClick={() => setActiveCategory('session')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeCategory === 'session'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            Lab Sessions ({facultyNotifications.filter((n) => n.category === 'session').length})
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
        {filtered.length === 0 ? (
          <div className="bg-[#0e1738] border border-slate-800 rounded-xl p-12 text-center text-xs text-slate-500 space-y-2">
            <Bell className="w-8 h-8 text-slate-600 mx-auto" />
            <p>No notifications matching your category filter.</p>
          </div>
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              className={`p-4 rounded-xl border transition-all space-y-3 ${
                !item.isRead
                  ? 'bg-[#0f1b42] border-indigo-500/40 shadow-sm'
                  : 'bg-[#0e1738] border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {getCategoryBadge(item.category)}
                    <h3 className="text-sm font-bold text-white tracking-tight">{item.title}</h3>
                    {!item.isRead && (
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                    )}
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
                    {item.description}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {item.timestamp}
                  </span>
                  {!item.isRead && (
                    <button
                      onClick={() => markFacultyNotificationAsRead(item.id)}
                      className="text-[11px] text-sky-400 hover:text-sky-300 font-medium ml-2"
                    >
                      Mark Read
                    </button>
                  )}
                </div>
              </div>

              {/* If Integrity Alert: Display contextual details and inspection action */}
              {item.category === 'integrity' && item.integrityAlertId && (
                <div className="p-3 rounded-lg bg-slate-900 border border-rose-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3 font-mono">
                    <span className="text-slate-400">
                      Student: <strong className="text-white">{item.studentName}</strong>
                    </span>
                    <span className="text-slate-500">·</span>
                    <span className="text-emerald-400 font-bold">{item.usn}</span>
                    <span className="text-slate-500">·</span>
                    <span className="text-rose-400 font-bold">{item.riskLevel} Risk</span>
                    {item.similarityScore && (
                      <>
                        <span className="text-slate-500">·</span>
                        <span className="text-sky-400">{item.similarityScore}% Similarity</span>
                      </>
                    )}
                  </div>

                  <button
                    onClick={() => handleOpenAlertFromNotification(item)}
                    className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
                  >
                    <GitCompare className="w-3.5 h-3.5" />
                    <span>Inspect Code Comparison</span>
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Code Similarity Modal */}
      <CodeSimilarityModal
        isOpen={isModalOpen}
        alert={selectedAlertForModal}
        onClose={() => setIsModalOpen(false)}
        onReviewDecision={reviewIntegrityAlert}
        onDismissAlert={dismissIntegrityAlert}
      />
    </div>
  );
};
