import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Clock,
  AlertTriangle,
  Play,
  Code2,
  CalendarPlus,
  Lock,
} from 'lucide-react';

export const StudentDashboard: React.FC = () => {
  const {
    currentUser,
    labSessions,
    experiments,
    studentLabSessions,
    startLab,
    activeLabSessionId,
    sessionStartTime,
    sessionEndTime,
    isLabTimerRunning,
    studentLabTimerSeconds,
    canStudentExecute,
    activeBatchSession,
    makeupRequests,
    requestMakeupLab,
  } = useApp();

  const [showMakeupForm, setShowMakeupForm] = useState<boolean>(false);
  const [makeupExpId, setMakeupExpId] = useState<string>(experiments[0]?.id || 'exp-01');
  const [missedDate, setMissedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [preferredSlot, setPreferredSlot] = useState<string>(
    'Afternoon Makeup Slot (02:00 PM – 04:00 PM)'
  );
  const [makeupReason, setMakeupReason] = useState<string>('');
  const [makeupFeedback, setMakeupFeedback] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const executionGate = canStudentExecute(currentUser);

  // Regular assigned lab programs for this student's semester and batch
  const assignedSessions = labSessions.filter(
    (ls) =>
      !ls.isMakeup &&
      ls.semesterNumber === (currentUser?.semester || currentUser?.currentSemester) &&
      ls.batch === currentUser?.batch
  );

  // My Makeup Lab Requests & Unlocked Sessions
  const myMakeupRequests = makeupRequests.filter(
    (r) => r.studentId === currentUser?.id
  );

  // Primary assigned lab program (ongoing preferred, otherwise first scheduled)
  const currentSession =
    assignedSessions.find((ls) => ls.status === 'ongoing') || assignedSessions[0];

  // Student's own lab session records
  const mySessions = studentLabSessions.filter((s) => s.studentId === currentUser?.id);

  // Active telemetry record for the currently assigned lab program
  const activeStudentSession = mySessions.find(
    (s) => s.labSessionId === currentSession?.id
  );

  const formatCountdown = (totalSec: number) => {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const getActivityStatusBadge = (status?: string) => {
    switch (status) {
      case 'Typing':
        return {
          label: 'Typing (Active Editor)',
          bg: 'bg-emerald-50',
          text: 'text-emerald-600',
          border: 'border-emerald-300',
          dot: 'bg-emerald-400',
        };
      case 'Compiling':
        return {
          label: 'Compiling (Running Code)',
          bg: 'bg-orange-50',
          text: 'text-orange-600',
          border: 'border-orange-300',
          dot: 'bg-orange-400',
        };
      case 'Idle':
        return {
          label: 'Idle (>3s Inactive)',
          bg: 'bg-amber-50',
          text: 'text-amber-600',
          border: 'border-amber-300',
          dot: 'bg-amber-400',
        };
      case 'Submitted':
        return {
          label: 'Submitted',
          bg: 'bg-blue-50',
          text: 'text-blue-600',
          border: 'border-blue-300',
          dot: 'bg-purple-400',
        };
      default:
        return {
          label: 'Viewing',
          bg: 'bg-blue-50',
          text: 'text-blue-600',
          border: 'border-blue-300',
          dot: 'bg-sky-400',
        };
    }
  };

  const statusBadge = getActivityStatusBadge(activeStudentSession?.activityStatus || 'Viewing');

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Compact Batch Execution Lock Alert (shown only when another batch holds active lock) */}
      {!executionGate.allowed && (
        <div className="rounded-xl px-4 py-3 border bg-amber-50 border-amber-200 text-amber-900 text-xs flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{executionGate.reason}</span>
          </div>
          {activeBatchSession && (
            <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-[#f4f8ff] border border-blue-200 text-slate-800">
              Active Batch: Sem {activeBatchSession.semesterNumber} · {activeBatchSession.batch}
            </span>
          )}
        </div>
      )}

      {/* 1. ASSIGNED LAB PROGRAM & START BUTTON */}
      <section className="bg-white border border-blue-100 rounded-2xl p-6 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-blue-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                Assigned Lab Program
              </h1>
              <p className="text-xs text-slate-600">
                Semester {currentUser?.semester || currentUser?.currentSemester || 5} · {currentUser?.batch || 'Batch A'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Lab Timer: shown only after student clicks Start Lab */}
            {isLabTimerRunning && activeLabSessionId === currentSession?.id && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50/60 border border-blue-100 font-mono text-xs">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                <span className="text-slate-600">Lab Timer:</span>
                <span className="font-bold text-blue-600 tabular-nums">
                  {formatCountdown(studentLabTimerSeconds)}
                </span>
              </div>
            )}

            {/* Live Activity Status */}
            <div
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold font-mono border ${statusBadge.bg} ${statusBadge.text} ${statusBadge.border}`}
            >
              <span className={`w-2 h-2 rounded-full ${statusBadge.dot} animate-pulse`} />
              <span>{statusBadge.label}</span>
            </div>

            <button
              type="button"
              onClick={() => {
                setShowMakeupForm((prev) => !prev);
                setMakeupFeedback(null);
              }}
              className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-300 text-xs font-semibold text-blue-800 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <CalendarPlus className="w-3.5 h-3.5 text-blue-700" />
              <span>{showMakeupForm ? 'Close Makeup Form' : 'Request Makeup Lab'}</span>
            </button>
          </div>
        </div>

        {currentSession ? (
          <div className="p-5 rounded-xl bg-[#f4f8ff] border border-blue-100 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                    {currentSession.subjectCode}
                  </span>
                  <span className="text-xs font-medium text-slate-700">
                    {currentSession.subjectName}
                  </span>
                  <span
                    className={`text-[11px] font-mono font-semibold px-2 py-0.5 rounded border capitalize ${
                      currentSession.status === 'ongoing'
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                        : 'bg-blue-50 text-blue-600 border-blue-200'
                    }`}
                  >
                    {currentSession.status}
                  </span>
                </div>

                <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                  {currentSession.experimentName}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => startLab(currentSession.id)}
                className="py-3 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 shrink-0 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Start Lab</span>
              </button>
            </div>

            {/* Program Metadata */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-lg bg-[#f4f8ff] border border-blue-100 font-mono text-xs">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Language</span>
                <span className="text-blue-600 uppercase font-bold">
                  {currentSession.programmingLanguage}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Lab Slot Timing</span>
                <span className="text-slate-800 font-semibold">
                  {currentSession.startTime || sessionStartTime} – {currentSession.endTime || sessionEndTime}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Faculty In-Charge</span>
                <span className="text-slate-800 truncate block">{currentSession.teacherName}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Copy / Paste Policy</span>
                <span
                  className={
                    currentSession.isCopyPasteRestricted ? 'text-amber-600 font-semibold' : 'text-emerald-600'
                  }
                >
                  {currentSession.isCopyPasteRestricted ? 'Restricted' : 'Allowed'}
                </span>
              </div>
            </div>

            {currentSession.instructions && (
              <p className="text-xs text-slate-700 leading-relaxed">
                <span className="font-semibold text-slate-600 mr-1.5">Instructions:</span>
                {currentSession.instructions}
              </p>
            )}

            {/* Additional assigned programs if more than one exists */}
            {assignedSessions.length > 1 && (
              <div className="pt-3 border-t border-blue-100 space-y-2">
                <span className="text-[11px] font-mono uppercase text-slate-600 block">
                  Other Assigned Programs ({assignedSessions.length - 1})
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {assignedSessions
                    .filter((ls) => ls.id !== currentSession.id)
                    .map((ls) => (
                      <div
                        key={ls.id}
                        className="flex items-center justify-between gap-3 p-3 rounded-lg bg-[#f4f8ff] border border-blue-100"
                      >
                        <div className="min-w-0">
                          <span className="text-[11px] font-mono text-blue-600 block">
                            {ls.subjectCode} · {ls.programmingLanguage.toUpperCase()}
                          </span>
                          <span className="text-xs font-semibold text-slate-900 truncate block">
                            {ls.experimentName}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => startLab(ls.id)}
                          className="py-1.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 shrink-0 cursor-pointer"
                        >
                          <Play className="w-3 h-3 fill-current" />
                          <span>Start</span>
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="p-8 rounded-xl bg-[#f4f8ff] border border-blue-100 text-center space-y-1.5">
            <p className="text-sm font-semibold text-slate-700">
              No lab program is currently assigned to Semester {currentUser?.semester || 5} · {currentUser?.batch || 'Batch A'}.
            </p>
            <p className="text-xs text-slate-500">
              Once your faculty starts or schedules a lab slot, it will appear here with the Start Lab button.
            </p>
          </div>
        )}

        {/* Inline Request Makeup Lab Form (when student was unable to attend on that day) */}
        {showMakeupForm && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!makeupReason.trim()) {
                setMakeupFeedback({
                  type: 'error',
                  text: 'Please provide a brief reason for missing the scheduled lab.',
                });
                return;
              }
              const res = requestMakeupLab({
                experimentId: makeupExpId,
                missedLabDate: missedDate,
                reason: makeupReason.trim(),
                preferredSlot,
              });
              setMakeupFeedback({
                type: res.success ? 'success' : 'error',
                text: res.message,
              });
              if (res.success) {
                setMakeupReason('');
                setShowMakeupForm(false);
              }
            }}
            className="p-5 rounded-xl bg-blue-50 border border-blue-200 space-y-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Request Makeup Lab Access
                </h3>
                <p className="text-xs text-slate-600">
                  Submit a request if you were unable to attend an experiment on its scheduled day.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="text-slate-700 font-semibold block mb-1">
                  Missed Experiment / Program
                </label>
                <select
                  value={makeupExpId}
                  onChange={(e) => setMakeupExpId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-blue-50/60 border border-blue-200 text-slate-800 focus:outline-hidden focus:border-blue-600"
                >
                  {experiments.map((exp) => (
                    <option key={exp.id} value={exp.id}>
                      {exp.subjectCode}: {exp.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-700 font-semibold block mb-1">
                  Date Missed
                </label>
                <input
                  type="date"
                  value={missedDate}
                  onChange={(e) => setMissedDate(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-lg bg-blue-50/60 border border-blue-200 text-slate-800 focus:outline-hidden focus:border-blue-600"
                />
              </div>

              <div>
                <label className="text-slate-700 font-semibold block mb-1">
                  Preferred Makeup Slot
                </label>
                <select
                  value={preferredSlot}
                  onChange={(e) => setPreferredSlot(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-blue-50/60 border border-blue-200 text-slate-800 focus:outline-hidden focus:border-blue-600"
                >
                  <option value="Morning Makeup Slot (09:00 AM – 11:00 AM)">
                    Morning (09:00 AM – 11:00 AM)
                  </option>
                  <option value="Afternoon Makeup Slot (02:00 PM – 04:00 PM)">
                    Afternoon (02:00 PM – 04:00 PM)
                  </option>
                  <option value="Saturday Extra Lab (10:00 AM – 12:00 PM)">
                    Saturday Extra Lab (10:00 AM – 12:00 PM)
                  </option>
                </select>
              </div>
            </div>

            <div className="text-xs">
              <label className="text-slate-700 font-semibold block mb-1">
                Reason for Absence
              </label>
              <input
                type="text"
                value={makeupReason}
                onChange={(e) => setMakeupReason(e.target.value)}
                placeholder="e.g. Medical leave, college on-duty event, or technical emergency"
                className="w-full px-3 py-2 rounded-lg bg-blue-50/60 border border-blue-200 text-slate-800 focus:outline-hidden focus:border-blue-600"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowMakeupForm(false)}
                className="px-3.5 py-2 rounded-lg bg-blue-100 hover:bg-blue-100 text-slate-700 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold cursor-pointer"
              >
                Submit Makeup Request
              </button>
            </div>
          </form>
        )}

        {makeupFeedback && (
          <div
            className={`p-3 rounded-xl border text-xs flex items-center justify-between gap-2 ${
              makeupFeedback.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                : 'bg-rose-50 border-rose-200 text-rose-700'
            }`}
          >
            <span>{makeupFeedback.text}</span>
            <button
              type="button"
              onClick={() => setMakeupFeedback(null)}
              className="underline text-[11px] opacity-80 hover:opacity-100 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Makeup Lab Access Status (Disabled by default until Faculty Grants Permission) */}
        <div className="pt-2 space-y-2.5">
          <span className="text-[11px] font-mono uppercase tracking-wider text-blue-700 block">
            Makeup Lab Access ({myMakeupRequests.length})
          </span>

          {myMakeupRequests.length === 0 ? (
            <div className="p-4 rounded-xl bg-[#f4f8ff] border border-blue-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <span className="text-xs font-semibold text-slate-700 block">
                  Makeup Lab is currently disabled
                </span>
                <p className="text-[11px] text-slate-500">
                  Submit a request above; access is enabled only after your faculty grants permission.
                </p>
              </div>
              <button
                type="button"
                disabled
                className="py-2 px-4 rounded-xl bg-blue-50/60 border border-blue-200 text-slate-500 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-not-allowed shrink-0"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Makeup Lab Disabled</span>
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {myMakeupRequests.map((req) => {
                const isApproved = req.status === 'Approved' && Boolean(req.makeupLabSessionId);
                return (
                  <div
                    key={req.id}
                    className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                      isApproved
                        ? 'bg-[#f4f8ff] border-blue-300'
                        : 'bg-[#f4f8ff] border-blue-100'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                          MAKEUP LAB
                        </span>
                        <span className="text-xs font-mono text-blue-600 font-bold">
                          {req.subjectCode}
                        </span>
                        <span className="text-[11px] text-slate-600">
                          Missed on {req.missedLabDate}
                        </span>
                        <span
                          className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded border ${
                            req.status === 'Approved'
                              ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                              : req.status === 'Pending'
                              ? 'bg-amber-50 text-amber-600 border-amber-200'
                              : req.status === 'Completed'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : 'bg-rose-50 text-rose-600 border-rose-200'
                          }`}
                        >
                          {req.status === 'Approved'
                            ? 'Permission Granted'
                            : req.status === 'Pending'
                            ? 'Pending Faculty Permission'
                            : req.status}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-900">
                        {req.experimentName}
                      </h3>
                      <p className="text-xs text-slate-600">
                        {req.facultyRemarks || `Requested slot: ${req.preferredSlot}`}
                      </p>
                    </div>

                    {isApproved ? (
                      <button
                        type="button"
                        onClick={() => startLab(req.makeupLabSessionId!)}
                        className="py-2.5 px-5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 shrink-0 cursor-pointer"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Start Makeup Lab</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled
                        title="Makeup Lab is disabled until faculty grants permission"
                        className="py-2.5 px-5 rounded-xl bg-blue-50/60 border border-blue-200 text-slate-500 text-xs font-bold flex items-center justify-center gap-2 shrink-0 cursor-not-allowed"
                      >
                        <Lock className="w-3.5 h-3.5" />
                        <span>
                          {req.status === 'Completed'
                            ? 'Makeup Completed'
                            : req.status === 'Rejected'
                            ? 'Access Declined'
                            : 'Locked (Awaiting Faculty)'}
                        </span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
