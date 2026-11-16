import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { BatchName, LabSession, SupportedLanguage } from '../../types';
import {
  CalendarCheck2,
  Plus,
  Play,
  CheckCircle2,
  Clock,
  Lock,
  Search,
  Filter,
  ArrowRight,
  BookOpen,
  AlertTriangle,
  Radio,
} from 'lucide-react';

export const LabSessionManagement: React.FC = () => {
  const {
    labSessions,
    subjects,
    experiments,
    createLabSession,
    updateLabSessionStatus,
    activeBatchSession,
    sessionRemainingSeconds,
    endBatchLabSession,
  } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSemester, setSelectedSemester] = useState<number>(5);
  const [selectedBatch, setSelectedBatch] = useState<BatchName>('Batch A');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('sub-cs504');
  const [selectedExpId, setSelectedExpId] = useState<string>('exp-01');
  const [title, setTitle] = useState('');
  const [language, setLanguage] = useState<SupportedLanguage>('python');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('11:00');
  const [durationMinutes, setDurationMinutes] = useState<number>(120);
  const [instructions, setInstructions] = useState('Solve the experiment. Copy/paste is restricted.');
  const [isCopyPasteRestricted, setIsCopyPasteRestricted] = useState(true);
  const [statusFeedback, setStatusFeedback] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  const formatDurationTimer = (totalSec: number) => {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleToggleSessionStatus = (sessionId: string, nextStatus: 'ongoing' | 'completed') => {
    const res = updateLabSessionStatus(sessionId, nextStatus);
    if (!res.success && res.message) {
      setStatusFeedback({ type: 'error', text: res.message });
    } else {
      setStatusFeedback({
        type: 'success',
        text:
          nextStatus === 'ongoing'
            ? 'Lab session is now ACTIVE. Only students in this batch can execute code.'
            : 'Lab session ended. You can now start another batch session.',
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subj = subjects.find((s) => s.id === selectedSubjectId);
    const exp = experiments.find((e) => e.id === selectedExpId);

    createLabSession({
      title: title || `${subj?.code || 'LAB'}: ${exp?.title || 'Experiment'}`,
      subjectId: selectedSubjectId,
      subjectName: subj?.name || 'Programming Lab',
      subjectCode: subj?.code || `IS${selectedSemester}04`,
      semesterNumber: selectedSemester,
      batch: selectedBatch,
      experimentId: selectedExpId,
      experimentName: exp?.title || 'Programming Experiment',
      programmingLanguage: language,
      startDate,
      startTime,
      endTime,
      durationMinutes,
      instructions,
      isCopyPasteRestricted,
    });

    setIsModalOpen(false);
    setTitle('');
    setStatusFeedback({
      type: 'success',
      text: `Scheduled Semester ${selectedSemester} ${selectedBatch} (${durationMinutes} mins).`,
    });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Laboratory Session Management</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Schedule batch-wise lab slots (Semesters 1–8), enforce One Active Batch at a time, and configure 120-min timers
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="py-2 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-md shadow-indigo-600/20 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule New Session</span>
        </button>
      </div>

      {/* Active Batch Banner */}
      {activeBatchSession ? (
        <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Radio className="w-5 h-5 text-emerald-400 animate-pulse shrink-0" />
            <div>
              <div className="text-xs font-bold text-emerald-300">
                Active Execution Batch: Semester {activeBatchSession.semesterNumber} · {activeBatchSession.batch}
              </div>
              <div className="text-[11px] text-slate-300">
                {activeBatchSession.experimentName} · Only {activeBatchSession.batch} students can execute programs right now.
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 rounded-lg bg-slate-950 border border-emerald-500/30 font-mono text-xs text-emerald-300 font-bold tabular-nums">
              {formatDurationTimer(sessionRemainingSeconds)} left
            </div>
            <button
              onClick={() => endBatchLabSession(activeBatchSession.id)}
              className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors"
            >
              End Active Session
            </button>
          </div>
        </div>
      ) : (
        <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center gap-2.5 text-xs text-slate-400">
          <Lock className="w-4 h-4 text-amber-400 shrink-0" />
          <span>No batch is currently active. Start any scheduled session below to unlock code execution for that batch.</span>
        </div>
      )}

      {/* Feedback Banner */}
      {statusFeedback && (
        <div
          className={`p-3 rounded-xl border text-xs flex items-center justify-between gap-2 ${
            statusFeedback.type === 'error'
              ? 'bg-rose-950/40 border-rose-500/30 text-rose-300'
              : 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {statusFeedback.type === 'error' ? (
              <AlertTriangle className="w-4 h-4 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            )}
            <span>{statusFeedback.text}</span>
          </div>
          <button onClick={() => setStatusFeedback(null)} className="text-[11px] underline opacity-80 hover:opacity-100">
            Dismiss
          </button>
        </div>
      )}

      {/* Lab Sessions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {labSessions.map((session) => (
          <div
            key={session.id}
            className="bg-[#0e1738] border border-slate-800 rounded-xl p-5 space-y-4 shadow-md flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-500/30">
                  Semester {session.semesterNumber} · {session.batch}
                </span>
                <span
                  className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded border ${
                    session.status === 'ongoing'
                      ? 'bg-emerald-950 text-emerald-400 border-emerald-500/30'
                      : session.status === 'completed'
                      ? 'bg-slate-800 text-slate-400 border-slate-700'
                      : 'bg-sky-950 text-sky-300 border-sky-500/30'
                  }`}
                >
                  {session.status}
                </span>
              </div>

              <div>
                <span className="text-[11px] font-mono text-slate-400 block">{session.subjectCode}</span>
                <h3 className="text-sm font-bold text-white tracking-tight">{session.experimentName}</h3>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800/80 font-mono text-[11px] space-y-1">
                <div className="flex justify-between text-slate-400">
                  <span>Language:</span>
                  <span className="text-sky-400 uppercase font-bold">{session.programmingLanguage}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Duration:</span>
                  <span className="text-emerald-400 font-bold">{session.durationMinutes || 120} Minutes</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Date & Slot:</span>
                  <span className="text-slate-200">{session.startDate} ({session.startTime}-{session.endTime})</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Copy/Paste:</span>
                  <span className={session.isCopyPasteRestricted ? 'text-amber-400' : 'text-slate-400'}>
                    {session.isCopyPasteRestricted ? 'Restricted' : 'Allowed'}
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 line-clamp-2">
                {session.instructions}
              </p>
            </div>

            {/* Quick Status Toggles */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
              <span className="text-[10px] text-slate-500 font-mono">By {session.teacherName}</span>
              <div className="flex items-center gap-1.5">
                {session.status === 'scheduled' && (
                  <button
                    onClick={() => handleToggleSessionStatus(session.id, 'ongoing')}
                    className="py-1 px-2.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-semibold"
                  >
                    Start Session
                  </button>
                )}
                {session.status === 'ongoing' && (
                  <button
                    onClick={() => handleToggleSessionStatus(session.id, 'completed')}
                    className="py-1 px-2.5 rounded bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-semibold"
                  >
                    End Session
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Schedule Lab Session Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
          <div className="w-full max-w-xl bg-[#0e1738] border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 bg-[#090f22] border-b border-slate-800 flex items-center justify-between">
              <h2 className="text-base font-bold text-white">Schedule New Laboratory Session</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto text-xs">
              <div>
                <label className="font-semibold text-slate-300 block mb-1">Session Title (Optional)</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Weekly Lab Slot 1: Dynamic Arrays"
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-hidden focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Semester</label>
                  <select
                    value={selectedSemester}
                    onChange={(e) => setSelectedSemester(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-hidden focus:border-sky-500"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                      <option key={sem} value={sem}>Semester {sem}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Batch</label>
                  <select
                    value={selectedBatch}
                    onChange={(e) => setSelectedBatch(e.target.value as BatchName)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-hidden focus:border-sky-500"
                  >
                    <option value="Batch A">Batch A</option>
                    <option value="Batch B">Batch B</option>
                    <option value="Batch C">Batch C</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Duration (Mins)</label>
                  <input
                    type="number"
                    min={15}
                    max={240}
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Math.max(15, Number(e.target.value)))}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-hidden focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Subject</label>
                  <select
                    value={selectedSubjectId}
                    onChange={(e) => setSelectedSubjectId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-hidden focus:border-sky-500"
                  >
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>{s.code}: {s.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Experiment</label>
                  <select
                    value={selectedExpId}
                    onChange={(e) => setSelectedExpId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-hidden focus:border-sky-500"
                  >
                    {experiments.map((exp) => (
                      <option key={exp.id} value={exp.id}>{exp.subjectCode} - {exp.title}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Language</label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs font-mono focus:outline-hidden focus:border-sky-500"
                  >
                    <option value="c">C</option>
                    <option value="python">Python</option>
                    <option value="java">Java</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Start Time</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-hidden focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-300 block mb-1">End Time</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-hidden focus:border-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Instructions for Students</label>
                <textarea
                  rows={2}
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-hidden focus:border-sky-500"
                />
              </div>

              {/* Copy/Paste restriction checkbox */}
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-200 block">Enforce Copy & Paste Restrictions</span>
                  <span className="text-[11px] text-slate-400">
                    Blocks Ctrl+C, Ctrl+V, right-click, and logs clipboard violations.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={isCopyPasteRestricted}
                  onChange={(e) => setIsCopyPasteRestricted(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-0"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="py-1.5 px-4 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-1.5 px-5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20"
                >
                  Create & Schedule Session
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
