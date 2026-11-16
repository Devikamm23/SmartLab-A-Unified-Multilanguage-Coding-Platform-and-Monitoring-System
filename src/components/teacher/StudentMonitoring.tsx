import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StudentLabSession, StudentActivityStatus } from '../../types';
import { COLLEGE_CONFIG } from '../../constants/college';
import { StudentDetailModal } from './StudentDetailModal';
import { LabReportModal } from './LabReportModal';
import {
  Activity,
  Search,
  Eye,
  Clock,
  CheckCircle2,
  Sparkles,
  FileSpreadsheet,
  ToggleLeft,
  ToggleRight,
  User,
  Info,
  Cpu,
  Terminal,
  PauseCircle,
  Square,
  Lock,
} from 'lucide-react';

export const StudentMonitoring: React.FC = () => {
  const {
    studentLabSessions,
    approveStudentMarks,
    runAiEvaluationForSession,
    isSimulationActive,
    toggleSimulation,
    sessionRemainingSeconds,
    activeBatchSession,
    endBatchLabSession,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSemester, setSelectedSemester] = useState<string>(
    activeBatchSession ? String(activeBatchSession.semesterNumber) : '5'
  );
  const [selectedBatch, setSelectedBatch] = useState<string>(
    activeBatchSession ? activeBatchSession.batch : 'Batch A'
  );
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Modals state
  const [inspectSession, setInspectSession] = useState<StudentLabSession | null>(null);
  const [isInspectModalOpen, setIsInspectModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // Scope sessions by semester & batch first so status metrics match the selected cohort
  const cohortSessions = studentLabSessions.filter((s) => {
    const matchesSem = selectedSemester === 'all' || s.semesterNumber === Number(selectedSemester);
    const matchesBatch = selectedBatch === 'all' || s.batch === selectedBatch;
    if (
      activeBatchSession &&
      selectedSemester === String(activeBatchSession.semesterNumber) &&
      selectedBatch === activeBatchSession.batch
    ) {
      return matchesSem && matchesBatch && s.labSessionId === activeBatchSession.id;
    }
    return matchesSem && matchesBatch;
  });

  // Status Metrics Aggregation
  const totalStudents = cohortSessions.length;
  const typingStudents = cohortSessions.filter((s) => s.activityStatus === 'Typing');
  const compilingStudents = cohortSessions.filter((s) => s.activityStatus === 'Compiling');
  const idleStudents = cohortSessions.filter((s) => s.activityStatus === 'Idle');
  const viewingStudents = cohortSessions.filter((s) => s.activityStatus === 'Viewing');
  const absentStudents = cohortSessions.filter((s) => s.activityStatus === 'Absent');
  const submittedStudents = cohortSessions.filter((s) => s.activityStatus === 'Submitted');
  const presentStudents = totalStudents - absentStudents.length;

  const handleOpenInspect = (ses: StudentLabSession) => {
    setInspectSession(ses);
    setIsInspectModalOpen(true);
  };

  const handleApproveFromModal = (sessionId: string, score: number, feedback: string) => {
    approveStudentMarks(sessionId, score, feedback);
    if (inspectSession && inspectSession.id === sessionId) {
      setInspectSession({
        ...inspectSession,
        score,
        facultyApprovedScore: score,
        facultyFeedback: feedback,
        isFacultyApproved: true,
      });
    }
  };

  const handleRunAiFromModal = (sessionId: string) => {
    runAiEvaluationForSession(sessionId);
    const updated = studentLabSessions.find((s) => s.id === sessionId);
    if (updated) setInspectSession(updated);
  };

  const renderStatusBadge = (status: StudentActivityStatus) => {
    switch (status) {
      case 'Typing':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/40 shadow-xs shadow-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Typing (Green)
          </span>
        );
      case 'Compiling':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-orange-500/15 text-orange-400 border border-orange-500/40 shadow-xs shadow-orange-500/20">
            <span className="w-2 h-2 rounded-full bg-orange-400 animate-ping" />
            Compiling (Orange)
          </span>
        );
      case 'Idle':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-amber-500/15 text-amber-400 border border-amber-500/40">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            Idle (Yellow)
          </span>
        );
      case 'Viewing':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-sky-500/15 text-sky-400 border border-sky-500/40">
            <span className="w-2 h-2 rounded-full bg-sky-400" />
            Viewing (Blue)
          </span>
        );
      case 'Absent':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-rose-500/15 text-rose-400 border border-rose-500/40">
            <span className="w-2 h-2 rounded-full bg-rose-400" />
            Absent (Red)
          </span>
        );
      case 'Submitted':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-purple-500/15 text-purple-300 border border-purple-500/40">
            <span className="w-2 h-2 rounded-full bg-purple-400" />
            Submitted (Purple)
          </span>
        );
    }
  };

  const formatMinutes = (sec: number) => {
    const m = Math.floor(sec / 60);
    return `${m}m`;
  };

  const filteredSessions = cohortSessions.filter((s) => {
    const matchesSearch =
      s.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.usn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.experimentName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      selectedStatus === 'all' || s.activityStatus.toLowerCase() === selectedStatus.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Header with Active Batch Timer and Export actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-md bg-emerald-500/20 text-emerald-400">
              <Activity className="w-5 h-5 animate-pulse" />
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              Batch-Wise Live Student Activity Monitoring &amp; Evaluation
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {COLLEGE_CONFIG.name} · Concurrent batch execution tracking, individual activity states, and AI grading
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {activeBatchSession ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-xs font-mono">
              <Clock className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-200 font-bold">
                Sem {activeBatchSession.semesterNumber} {activeBatchSession.batch}:
              </span>
              <span className="text-white font-bold">
                {Math.floor(sessionRemainingSeconds / 60)}m {sessionRemainingSeconds % 60}s left
              </span>
              <button
                onClick={() => endBatchLabSession()}
                className="ml-1 px-2 py-0.5 rounded bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-bold flex items-center gap-1"
              >
                <Square className="w-2.5 h-2.5 fill-current" /> End
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-amber-300">
              <Lock className="w-3.5 h-3.5" />
              <span>No Active Batch Session</span>
            </div>
          )}

          <button
            onClick={() => setIsReportModalOpen(true)}
            className="py-1.5 px-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-md shadow-indigo-600/20 shrink-0"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Generate Lab Report</span>
          </button>

          <button
            onClick={toggleSimulation}
            className={`py-1.5 px-3 rounded-xl border text-xs font-mono flex items-center gap-1.5 transition-colors ${
              isSimulationActive
                ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                : 'bg-slate-900 border-slate-800 text-slate-400'
            }`}
          >
            {isSimulationActive ? (
              <ToggleRight className="w-4 h-4 text-emerald-400" />
            ) : (
              <ToggleLeft className="w-4 h-4 text-slate-500" />
            )}
            <span>Simulation: {isSimulationActive ? 'Active' : 'Off'}</span>
          </button>
        </div>
      </div>

      {isSimulationActive && (
        <div className="p-3 rounded-xl bg-sky-950/40 border border-sky-500/30 text-sky-300 text-xs flex items-center gap-2">
          <Info className="w-4 h-4 shrink-0 text-sky-400" />
          <span>
            <strong>Concurrent Batch Telemetry Active:</strong> Tracking {totalStudents} students in the selected view across Typing (Green), Compiling (Orange), Idle (Yellow), Viewing (Blue), and Submitted (Purple).
          </span>
        </div>
      )}

      {/* Activity Status Metric Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        <button
          onClick={() => setSelectedStatus('all')}
          className={`text-left bg-[#0e1738] border rounded-xl p-3.5 space-y-1 transition-all ${
            selectedStatus === 'all' ? 'border-sky-400 ring-1 ring-sky-400/30' : 'border-slate-800'
          }`}
        >
          <span className="text-[10px] uppercase font-mono text-slate-400 block">Tracked Cohort</span>
          <div className="text-2xl font-bold text-white font-mono">{totalStudents}</div>
          <span className="text-[10px] text-slate-500">{presentStudents} Logged In</span>
        </button>

        <button
          onClick={() => setSelectedStatus('typing')}
          className={`text-left border rounded-xl p-3.5 space-y-1 transition-all bg-emerald-950/20 ${
            selectedStatus === 'typing' ? 'border-emerald-400 ring-1 ring-emerald-400/40' : 'border-emerald-500/30'
          }`}
        >
          <span className="text-[10px] uppercase font-mono text-emerald-300 font-bold block">Typing – Green</span>
          <div className="text-2xl font-bold text-emerald-400 font-mono">{typingStudents.length}</div>
          <span className="text-[10px] text-emerald-400/80">Writing Code</span>
        </button>

        <button
          onClick={() => setSelectedStatus('compiling')}
          className={`text-left border rounded-xl p-3.5 space-y-1 transition-all bg-orange-950/20 ${
            selectedStatus === 'compiling' ? 'border-orange-400 ring-1 ring-orange-400/40' : 'border-orange-500/30'
          }`}
        >
          <span className="text-[10px] uppercase font-mono text-orange-300 font-bold block">Compiling – Orange</span>
          <div className="text-2xl font-bold text-orange-400 font-mono">{compilingStudents.length}</div>
          <span className="text-[10px] text-orange-400/80">Executing Now</span>
        </button>

        <button
          onClick={() => setSelectedStatus('idle')}
          className={`text-left border rounded-xl p-3.5 space-y-1 transition-all bg-amber-950/20 ${
            selectedStatus === 'idle' ? 'border-amber-400 ring-1 ring-amber-400/40' : 'border-amber-500/30'
          }`}
        >
          <span className="text-[10px] uppercase font-mono text-amber-300 font-bold block">Idle – Yellow</span>
          <div className="text-2xl font-bold text-amber-400 font-mono">{idleStudents.length}</div>
          <span className="text-[10px] text-amber-400/80">&gt;2 Min Inactive</span>
        </button>

        <button
          onClick={() => setSelectedStatus('viewing')}
          className={`text-left border rounded-xl p-3.5 space-y-1 transition-all bg-sky-950/20 ${
            selectedStatus === 'viewing' ? 'border-sky-400 ring-1 ring-sky-400/40' : 'border-sky-500/30'
          }`}
        >
          <span className="text-[10px] uppercase font-mono text-sky-300 font-bold block">Viewing – Blue</span>
          <div className="text-2xl font-bold text-sky-400 font-mono">{viewingStudents.length}</div>
          <span className="text-[10px] text-sky-400/80">Reading Specs</span>
        </button>

        <button
          onClick={() => setSelectedStatus('submitted')}
          className={`text-left border rounded-xl p-3.5 space-y-1 transition-all bg-purple-950/20 ${
            selectedStatus === 'submitted' ? 'border-purple-400 ring-1 ring-purple-400/40' : 'border-purple-500/30'
          }`}
        >
          <span className="text-[10px] uppercase font-mono text-purple-300 font-bold block">Submitted – Purple</span>
          <div className="text-2xl font-bold text-purple-300 font-mono">{submittedStudents.length}</div>
          <span className="text-[10px] text-purple-300/80">Finalized Code</span>
        </button>

        <button
          onClick={() => setSelectedStatus('absent')}
          className={`text-left border rounded-xl p-3.5 space-y-1 transition-all bg-rose-950/20 ${
            selectedStatus === 'absent' ? 'border-rose-400 ring-1 ring-rose-400/40' : 'border-rose-500/30'
          }`}
        >
          <span className="text-[10px] uppercase font-mono text-rose-300 font-bold block">Absent – Red</span>
          <div className="text-2xl font-bold text-rose-400 font-mono">{absentStudents.length}</div>
          <span className="text-[10px] text-rose-400/80">Not Logged In</span>
        </button>
      </div>

      {/* Exact Student Roster by Live Activity Cards (Typing / Compiling / Idle) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl border border-emerald-500/30 bg-[#0e1738] p-4 space-y-2.5">
          <div className="flex items-center justify-between text-xs font-bold text-emerald-300 border-b border-slate-800 pb-2">
            <span className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              Typing – Green ({typingStudents.length})
            </span>
            <span className="text-[10px] font-mono text-emerald-400">Active Editor</span>
          </div>
          <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
            {typingStudents.length === 0 ? (
              <p className="text-xs text-slate-500 italic">None currently typing.</p>
            ) : (
              typingStudents.map((s) => (
                <button
                  key={s.id}
                  onClick={() => handleOpenInspect(s)}
                  className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-emerald-500/20 text-xs transition-colors"
                >
                  <span className="font-semibold text-slate-100 truncate">{s.studentName}</span>
                  <span className="font-mono text-[10px] text-emerald-400 shrink-0 ml-2">{s.usn}</span>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="rounded-xl border border-orange-500/30 bg-[#0e1738] p-4 space-y-2.5">
          <div className="flex items-center justify-between text-xs font-bold text-orange-300 border-b border-slate-800 pb-2">
            <span className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-orange-400" />
              Compiling – Orange ({compilingStudents.length})
            </span>
            <span className="text-[10px] font-mono text-orange-400">Running Code</span>
          </div>
          <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
            {compilingStudents.length === 0 ? (
              <p className="text-xs text-slate-500 italic">None compiling right now.</p>
            ) : (
              compilingStudents.map((s) => (
                <button
                  key={s.id}
                  onClick={() => handleOpenInspect(s)}
                  className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-orange-500/20 text-xs transition-colors"
                >
                  <span className="font-semibold text-slate-100 truncate">{s.studentName}</span>
                  <span className="font-mono text-[10px] text-orange-400 shrink-0 ml-2">{s.usn}</span>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="rounded-xl border border-amber-500/30 bg-[#0e1738] p-4 space-y-2.5">
          <div className="flex items-center justify-between text-xs font-bold text-amber-300 border-b border-slate-800 pb-2">
            <span className="flex items-center gap-2">
              <PauseCircle className="w-4 h-4 text-amber-400" />
              Idle – Yellow ({idleStudents.length})
            </span>
            <span className="text-[10px] font-mono text-amber-400">&gt;2m Inactive</span>
          </div>
          <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
            {idleStudents.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No idle students.</p>
            ) : (
              idleStudents.map((s) => (
                <button
                  key={s.id}
                  onClick={() => handleOpenInspect(s)}
                  className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-amber-500/20 text-xs transition-colors"
                >
                  <span className="font-semibold text-slate-100 truncate">{s.studentName}</span>
                  <span className="font-mono text-[10px] text-amber-400 shrink-0 ml-2">{s.usn}</span>
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center gap-3 bg-[#0e1738] border border-slate-800 rounded-xl p-3 text-xs">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by student name or USN (e.g. 4GW24IS010)..."
            className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-hidden focus:border-sky-500 font-mono"
          />
        </div>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-hidden focus:border-sky-500 font-mono"
        >
          <option value="all">All Statuses</option>
          <option value="typing">Typing (Green)</option>
          <option value="compiling">Compiling (Orange)</option>
          <option value="idle">Idle (Yellow)</option>
          <option value="viewing">Viewing (Blue)</option>
          <option value="submitted">Submitted (Purple)</option>
          <option value="absent">Absent (Red)</option>
        </select>

        <select
          value={selectedSemester}
          onChange={(e) => setSelectedSemester(e.target.value)}
          className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-hidden focus:border-sky-500 font-mono"
        >
          <option value="all">All Semesters</option>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
            <option key={sem} value={String(sem)}>
              Semester {sem}
            </option>
          ))}
        </select>

        <select
          value={selectedBatch}
          onChange={(e) => setSelectedBatch(e.target.value)}
          className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-hidden focus:border-sky-500 font-mono"
        >
          <option value="all">All Batches (A, B, C)</option>
          <option value="Batch A">Batch A</option>
          <option value="Batch B">Batch B</option>
          <option value="Batch C">Batch C</option>
        </select>
      </div>

      {/* Live Student Monitoring & Evaluation Table */}
      <div className="bg-[#0e1738] border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 bg-slate-950/40 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-white">
            <User className="w-4 h-4 text-sky-400" />
            <span>
              Live Student Telemetry &amp; Marks Evaluation Roster ({filteredSessions.length} students)
            </span>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            Click any student row to inspect code &amp; approve AI marks
          </span>
        </div>

        {filteredSessions.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            No live session telemetry recorded yet for this semester/batch filter. Start a lab session for this batch on the Faculty Dashboard to populate live student telemetry.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-[#090f22] border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10px] font-mono">
                  <th className="py-3 px-4">Student Name &amp; USN</th>
                  <th className="py-3 px-3">Live Status</th>
                  <th className="py-3 px-3">Login Time</th>
                  <th className="py-3 px-2 text-right">Active Time</th>
                  <th className="py-3 px-2 text-right">Idle Time</th>
                  <th className="py-3 px-2 text-right">Tests Passed</th>
                  <th className="py-3 px-3 text-right">AI Marks (50)</th>
                  <th className="py-3 px-3 text-right">Approved (50)</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                {filteredSessions.map((ses) => (
                  <tr
                    key={ses.id}
                    className="hover:bg-slate-900/60 transition-colors group cursor-pointer"
                    onClick={() => handleOpenInspect(ses)}
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-sky-300 shrink-0">
                          {ses.studentName.charAt(0)}
                        </div>
                        <div>
                          <span className="font-sans font-bold text-slate-200 block group-hover:text-sky-300 transition-colors">
                            {ses.studentName}
                          </span>
                          <span className="text-[10px] text-emerald-400 font-mono block">
                            {ses.usn} · Sem {ses.semesterNumber} {ses.batch}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3">{renderStatusBadge(ses.activityStatus)}</td>

                    <td className="py-3 px-3 text-slate-300">{ses.loginTime || '09:02 AM'}</td>

                    <td className="py-3 px-2 text-right font-semibold text-emerald-400">
                      {formatMinutes(ses.activeTimeSeconds)}
                    </td>

                    <td className="py-3 px-2 text-right text-amber-400">
                      {formatMinutes(ses.idleTimeSeconds)}
                    </td>

                    <td className="py-3 px-2 text-right text-slate-200">
                      <span className="inline-block px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 font-bold">
                        {ses.testCasesPassed || 0}/5
                      </span>
                    </td>

                    <td className="py-3 px-3 text-right font-bold text-indigo-300">
                      <span className="inline-flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-indigo-400" />
                        {ses.aiEvaluation?.totalSuggestedScore ?? ses.score ?? 0}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-right font-bold text-emerald-400">
                      {ses.isFacultyApproved ? (
                        <span className="inline-flex items-center gap-1 text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {ses.facultyApprovedScore ?? ses.score}
                        </span>
                      ) : (
                        <span className="text-slate-500 font-normal">Pending</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenInspect(ses);
                        }}
                        className="py-1 px-2.5 rounded-lg bg-sky-600/20 hover:bg-sky-600/30 text-sky-300 border border-sky-500/30 text-xs font-semibold transition-colors inline-flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Inspect &amp; Grade</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <StudentDetailModal
        session={inspectSession}
        isOpen={isInspectModalOpen}
        onClose={() => {
          setIsInspectModalOpen(false);
          setInspectSession(null);
        }}
        onApproveMarks={handleApproveFromModal}
        onRunAiEvaluation={handleRunAiFromModal}
      />

      <LabReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        sessions={filteredSessions}
        semesterNumber={selectedSemester === 'all' ? 5 : Number(selectedSemester)}
        batchName={selectedBatch === 'all' ? 'All Batches' : selectedBatch}
      />
    </div>
  );
};
