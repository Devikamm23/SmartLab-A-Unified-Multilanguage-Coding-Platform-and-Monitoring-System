import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { COLLEGE_CONFIG } from '../../constants/college';
import { BatchName, StudentActivityStatus } from '../../types';
import {
  getProgressionDetails,
  getAdmissionYearForSemester,
} from '../../utils/usnHelper';
import {
  Users,
  Activity,
  CheckCircle2,
  CalendarCheck2,
  BookOpen,
  PlusCircle,
  ArrowRight,
  Clock,
  ShieldAlert,
  Layers,
  GraduationCap,
  Search,
  Check,
  Mail,
  BadgeCheck,
  Building2,
  Play,
  Square,
  Cpu,
  Terminal,
  PauseCircle,
  Lock,
  ClipboardList,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

export const TeacherDashboard: React.FC = () => {
  const {
    currentUser,
    users,
    labSessions,
    studentLabSessions,
    experiments,
    clipboardEvents,
    integrityAlerts,
    quizzes,
    activeBatchSession,
    sessionRemainingSeconds,
    startBatchLabSession,
    endBatchLabSession,
    setActiveNavTab,
  } = useApp();

  // Interactive Semester Selection: Semesters 1 through 8 (Default: active batch's semester or Semester 5)
  const [selectedSemester, setSelectedSemester] = useState<number>(
    activeBatchSession?.semesterNumber || 5
  );
  const [selectedBatch, setSelectedBatch] = useState<BatchName>(
    activeBatchSession?.batch || 'Batch A'
  );
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeStatusTab, setActiveStatusTab] = useState<'all' | StudentActivityStatus>('all');

  // Start Lab Session Form State (One Active Batch at a Time, default 120 mins)
  const [sessionDurationInput, setSessionDurationInput] = useState<number>(120);
  const [selectedExpId, setSelectedExpId] = useState<string>(experiments[0]?.id || 'exp-01');
  const [sessionFeedback, setSessionFeedback] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Academic progression calculation for selected semester
  const progression = getProgressionDetails(selectedSemester, 'IS', COLLEGE_CONFIG.department);

  // All student users in system
  const allStudents = users.filter((u) => u.role === 'student');

  // Filter students matching ONLY the selected semester
  const semesterStudents = allStudents.filter(
    (s) => (s.semester || s.currentSemester || 5) === selectedSemester
  );

  // Filter by selected batch (Batch A / B / C) and search
  const batchStudents = semesterStudents.filter((st) => st.batch === selectedBatch);
  const filteredRoster = batchStudents.filter((st) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        st.name.toLowerCase().includes(q) ||
        (st.usn || '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Live monitoring records matching selected semester & batch (or active session for that batch)
  const matchingBatchSessions = studentLabSessions.filter(
    (s) =>
      s.semesterNumber === selectedSemester &&
      s.batch === selectedBatch &&
      (!activeBatchSession ||
      (activeBatchSession.semesterNumber === selectedSemester &&
        activeBatchSession.batch === selectedBatch)
        ? !activeBatchSession || s.labSessionId === activeBatchSession.id
        : true)
  );

  // If no live session records exist yet for the selected non-active batch, derive preview telemetry from enrolled students
  const liveBatchMonitorList =
    matchingBatchSessions.length > 0
      ? matchingBatchSessions
      : batchStudents.map((st) => ({
          id: `preview-${st.id}`,
          studentId: st.id,
          studentName: st.name,
          usn: st.usn || '',
          semesterNumber: selectedSemester,
          batch: selectedBatch,
          labSessionId: '',
          experimentName: 'Awaiting Batch Lab Start',
          subjectName: COLLEGE_CONFIG.department,
          programmingLanguage: 'python' as const,
          sessionStartTime: '',
          loginTime: 'Not Started',
          totalDurationSeconds: 0,
          activeTimeSeconds: 0,
          idleTimeSeconds: 0,
          compilationAttempts: 0,
          successfulCompilations: 0,
          failedCompilations: 0,
          programExecutions: 0,
          executionErrors: 0,
          clipboardViolationCount: 0,
          lastInteractionTime: '',
          status: 'idle' as const,
          activityStatus: 'Absent' as StudentActivityStatus,
          sessionDurationMinutes: 120,
          remainingSeconds: 0,
          testCasesPassed: 0,
          totalTestCases: 5,
          submissionCount: 0,
          assignmentStatus: 'Not Started' as const,
          currentCode: '',
        }));

  // Group students by exact live activity status
  const typingStudents = liveBatchMonitorList.filter((s) => s.activityStatus === 'Typing');
  const compilingStudents = liveBatchMonitorList.filter((s) => s.activityStatus === 'Compiling');
  const idleStudents = liveBatchMonitorList.filter((s) => s.activityStatus === 'Idle');
  const viewingStudents = liveBatchMonitorList.filter((s) => s.activityStatus === 'Viewing');
  const submittedStudents = liveBatchMonitorList.filter((s) => s.activityStatus === 'Submitted');
  const absentStudents = liveBatchMonitorList.filter((s) => s.activityStatus === 'Absent');

  const tabFilteredMonitor =
    activeStatusTab === 'all'
      ? liveBatchMonitorList
      : liveBatchMonitorList.filter((s) => s.activityStatus === activeStatusTab);

  const activeStudentsCount = studentLabSessions.filter((s) => s.status === 'active').length;
  const completedSessionsCount = studentLabSessions.filter((s) => s.status === 'completed').length;
  const pendingIntegrityCount = integrityAlerts.filter((a) => a.status === 'Pending Review').length;

  // Chart data: Active time vs idle time for selected batch
  const chartData = liveBatchMonitorList.slice(0, 8).map((s) => ({
    name: s.studentName.split(' ')[0],
    active: Math.round(s.activeTimeSeconds / 60),
    idle: Math.round(s.idleTimeSeconds / 60),
  }));

  const formatCountdown = (totalSec: number) => {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleStartBatchSession = () => {
    const result = startBatchLabSession({
      semesterNumber: selectedSemester,
      batch: selectedBatch,
      durationMinutes: sessionDurationInput || 120,
      experimentId: selectedExpId,
    });
    setSessionFeedback({
      type: result.success ? 'success' : 'error',
      text: result.message,
    });
    setTimeout(() => setSessionFeedback(null), 6000);
  };

  const handleEndActiveSession = () => {
    endBatchLabSession();
    setSessionFeedback({
      type: 'success',
      text: 'Active batch lab session ended. You may now start a session for any semester and batch.',
    });
    setTimeout(() => setSessionFeedback(null), 5000);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* 1. FACULTY PROFILE CARD (Top of Faculty Dashboard) */}
      <div className="bg-[#0e1738] border border-slate-800 rounded-2xl p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center gap-5">
          {/* Faculty Profile Photo */}
          <div className="relative shrink-0">
            {currentUser?.avatar ? (
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-20 h-20 rounded-2xl object-cover border-2 border-indigo-500/50 shadow-lg shadow-indigo-500/20"
              />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-indigo-600 to-sky-600 flex items-center justify-center font-bold text-2xl text-white shadow-lg shadow-indigo-600/20">
                {currentUser?.name?.charAt(0) || 'F'}
              </div>
            )}
            <span
              className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-[#0e1738] flex items-center justify-center"
              title="Verified Faculty Supervisor"
            >
              <Check className="w-3 h-3 text-white" />
            </span>
          </div>

          {/* Faculty Details Grid */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-xl font-bold text-white tracking-tight">
                {currentUser?.name || 'Dr. Arvind Kulkarni'}
              </h1>
              <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-500/30 inline-flex items-center gap-1">
                <BadgeCheck className="w-3.5 h-3.5 text-sky-400" />
                Faculty ID: {currentUser?.employeeCode || 'TCH-ISE-012'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-xs text-slate-300">
              <div className="flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                <span>
                  <strong className="text-slate-400 font-normal">Designation:</strong>{' '}
                  {currentUser?.designation || 'Associate Professor & Lab In-Charge'}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span>
                  <strong className="text-slate-400 font-normal">Department:</strong>{' '}
                  {currentUser?.department || COLLEGE_CONFIG.department}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="font-mono text-[11px] text-sky-300">
                  {currentUser?.email || 'arvind.kulkarni@gsss.edu.in'}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-400">
                <span className="truncate">{COLLEGE_CONFIG.name}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Navigation Actions */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={() => setActiveNavTab('student_monitoring')}
            className="py-2 px-3.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Activity className="w-4 h-4" />
            <span>Full Live Monitor</span>
          </button>
          <button
            onClick={() => setActiveNavTab('quizzes')}
            className="py-2 px-3.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors flex items-center gap-1.5 border border-slate-700"
          >
            <ClipboardList className="w-4 h-4 text-sky-400" />
            <span>Quizzes ({quizzes.length})</span>
          </button>
          <button
            onClick={() => setActiveNavTab('academic_integrity')}
            className="py-2 px-3.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors flex items-center gap-1.5 border border-slate-700"
          >
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            <span>Integrity ({pendingIntegrityCount})</span>
          </button>
        </div>
      </div>

      {/* 2. ONE ACTIVE BATCH AT A TIME — LIVE LAB SESSION CONTROLLER */}
      <div className="bg-[#0e1738] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                Lab Session Control (One Active Batch at a Time)
              </h2>
              <p className="text-xs text-slate-400">
                Only one semester &amp; batch can execute programs concurrently (supports 20+ simultaneous students). Default duration: 120 minutes.
              </p>
            </div>
          </div>

          {activeBatchSession ? (
            <div className="flex items-center gap-3 bg-emerald-950/60 border border-emerald-500/40 px-4 py-2 rounded-xl">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <div className="font-mono text-xs">
                <div className="font-bold text-emerald-300">
                  ACTIVE: Semester {activeBatchSession.semesterNumber} · {activeBatchSession.batch}
                </div>
                <div className="text-[11px] text-slate-300">
                  Remaining: <strong className="text-white">{formatCountdown(sessionRemainingSeconds)}</strong> / {activeBatchSession.durationMinutes || 120}m
                </div>
              </div>
              <button
                onClick={handleEndActiveSession}
                className="ml-2 py-1.5 px-3 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <Square className="w-3 h-3 fill-current" />
                <span>End Session</span>
              </button>
            </div>
          ) : (
            <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono text-amber-300 flex items-center gap-2">
              <Lock className="w-3.5 h-3.5" />
              <span>No Batch Active — All Student Execution Paused</span>
            </div>
          )}
        </div>

        {sessionFeedback && (
          <div
            className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
              sessionFeedback.type === 'success'
                ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                : 'bg-rose-950/60 border-rose-500/40 text-rose-300'
            }`}
          >
            {sessionFeedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <Lock className="w-4 h-4 shrink-0" />
            )}
            <span>{sessionFeedback.text}</span>
          </div>
        )}

        {/* Start Lab Session Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end bg-slate-950/60 border border-slate-800 rounded-xl p-4">
          <div>
            <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
              Target Semester
            </label>
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs font-mono text-slate-100 focus:outline-hidden focus:border-sky-500"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                <option key={sem} value={sem}>
                  Semester {sem}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
              Target Batch
            </label>
            <select
              value={selectedBatch}
              onChange={(e) => setSelectedBatch(e.target.value as BatchName)}
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs font-mono text-slate-100 focus:outline-hidden focus:border-sky-500"
            >
              <option value="Batch A">Batch A (20 Students)</option>
              <option value="Batch B">Batch B (20 Students)</option>
              <option value="Batch C">Batch C (20 Students)</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
              Duration (Minutes)
            </label>
            <input
              type="number"
              min={15}
              max={240}
              value={sessionDurationInput}
              onChange={(e) => setSessionDurationInput(Math.max(15, Number(e.target.value)))}
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs font-mono text-slate-100 focus:outline-hidden focus:border-sky-500"
            />
          </div>

          <div>
            <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
              Lab Experiment
            </label>
            <select
              value={selectedExpId}
              onChange={(e) => setSelectedExpId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:outline-hidden focus:border-sky-500"
            >
              {experiments.map((exp) => (
                <option key={exp.id} value={exp.id}>
                  {exp.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <button
              type="button"
              onClick={handleStartBatchSession}
              disabled={Boolean(activeBatchSession)}
              title={
                activeBatchSession
                  ? `End active Semester ${activeBatchSession.semesterNumber} ${activeBatchSession.batch} session first`
                  : 'Start concurrent 120-minute lab session for selected semester & batch'
              }
              className={`w-full py-2 px-4 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                activeBatchSession
                  ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20'
              }`}
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>
                {activeBatchSession
                  ? `Locked (${activeBatchSession.batch} Active)`
                  : 'Start Lab Session'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. SEMESTER SELECTION (1-8) & BATCH MANAGEMENT (A / B / C, >= 20 STUDENTS EACH) */}
      <div className="bg-[#0e1738] border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-sky-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              Semester Selection &amp; Batch Roster ({semesterStudents.length} Students in Sem {selectedSemester})
            </h2>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {progression.yearOfStudy} · <strong className="text-sky-300">{progression.admissionBatchLabel}</strong> · USN Prefix:{' '}
            <strong className="text-emerald-400">{progression.usnPrefix}XXX</strong>
          </span>
        </div>

        {/* 8 Semester Selection Buttons */}
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => {
            const isSelected = selectedSemester === sem;
            const semAdmYear = getAdmissionYearForSemester(sem);
            const isActiveSem = activeBatchSession?.semesterNumber === sem;
            return (
              <button
                key={sem}
                type="button"
                onClick={() => setSelectedSemester(sem)}
                className={`py-2 px-2 rounded-xl text-xs font-semibold flex flex-col items-center justify-center transition-all border relative ${
                  isSelected
                    ? 'bg-sky-600 text-white border-sky-400 shadow-md shadow-sky-600/30 ring-2 ring-sky-400/20'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                {isActiveSem && (
                  <span
                    className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-400 animate-pulse"
                    title="Active Lab Execution Running"
                  />
                )}
                <span className="font-bold text-sm">Sem {sem}</span>
                <span className={`text-[10px] font-mono mt-0.5 ${isSelected ? 'text-sky-100' : 'text-slate-500'}`}>
                  &apos;{String(semAdmYear).slice(-2)} Batch
                </span>
              </button>
            );
          })}
        </div>

        {/* Batch A / B / C Cards + Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-1">
          <div className="grid grid-cols-3 gap-2 flex-1">
            {(['Batch A', 'Batch B', 'Batch C'] as BatchName[]).map((batch) => {
              const count = semesterStudents.filter((s) => s.batch === batch).length;
              const isSelected = selectedBatch === batch;
              const isBatchLive =
                activeBatchSession?.semesterNumber === selectedSemester &&
                activeBatchSession?.batch === batch;

              return (
                <button
                  key={batch}
                  type="button"
                  onClick={() => setSelectedBatch(batch)}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all border flex items-center justify-between ${
                    isSelected
                      ? 'bg-indigo-600/25 text-white border-indigo-400 shadow-sm'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {isBatchLive && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />}
                    <span>{batch}</span>
                  </div>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                      isSelected ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {count} Students
                  </span>
                </button>
              );
            })}
          </div>

          <div className="relative w-full md:w-64">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search Sem ${selectedSemester} ${selectedBatch}...`}
              className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-hidden focus:border-sky-500 font-mono"
            />
          </div>
        </div>

        {/* Batch Student Roster Table (Names & USNs for Selected Semester & Batch) */}
        <div className="overflow-x-auto max-h-72 overflow-y-auto rounded-xl border border-slate-800 bg-slate-950/60">
          <table className="w-full text-xs text-left">
            <thead className="sticky top-0 z-10">
              <tr className="border-b border-slate-800 text-slate-400 font-semibold text-[10px] uppercase font-mono bg-[#090f22]">
                <th className="py-2.5 px-4">#</th>
                <th className="py-2.5 px-4">Student Name</th>
                <th className="py-2.5 px-4">Permanent USN</th>
                <th className="py-2.5 px-4">Institutional Email</th>
                <th className="py-2.5 px-4">Batch</th>
                <th className="py-2.5 px-4 text-right">Enrollment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
              {filteredRoster.map((student, idx) => (
                <tr key={student.id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="py-2 px-4 text-slate-500">{idx + 1}</td>
                  <td className="py-2 px-4 font-sans font-semibold text-slate-200 flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] font-bold text-sky-400">
                      {student.name.charAt(0)}
                    </div>
                    <span>{student.name}</span>
                  </td>
                  <td className="py-2 px-4 text-emerald-400 font-bold">{student.usn}</td>
                  <td className="py-2 px-4 text-slate-400">{student.email}</td>
                  <td className="py-2 px-4 text-sky-400 font-bold">
                    Sem {selectedSemester} · {student.batch}
                  </td>
                  <td className="py-2 px-4 text-right">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-400 border border-emerald-500/30">
                      <Check className="w-3 h-3" /> Enrolled
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. INDIVIDUAL STUDENT LIVE ACTIVITY MONITORING (EXACT STUDENTS BY STATUS CARD & TABS) */}
      <div className="bg-[#0e1738] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-400 animate-pulse" />
              <h2 className="text-base font-bold text-white">
                Individual Student Live Activity — Semester {selectedSemester} {selectedBatch}
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Showing exact student names and USNs performing each live activity ({liveBatchMonitorList.length} students tracked)
            </p>
          </div>
          <button
            onClick={() => setActiveNavTab('student_monitoring')}
            className="text-xs text-sky-400 hover:text-sky-300 font-medium flex items-center gap-1 self-start sm:self-auto"
          >
            <span>Open Full Evaluation &amp; Grading Console</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Separate Status Cards Showing Exact Students in Typing (Green), Compiling (Orange), Idle (Yellow) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* TYPING – GREEN */}
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/15 p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-emerald-300 uppercase font-mono">
                  Typing – Green
                </span>
              </div>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                {typingStudents.length} Students
              </span>
            </div>
            <p className="text-[11px] text-emerald-200/70">
              Actively writing or editing code in the Monaco editor
            </p>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {typingStudents.length === 0 ? (
                <p className="text-xs text-slate-500 italic py-2">No students typing right now.</p>
              ) : (
                typingStudents.map((st) => (
                  <div
                    key={st.id}
                    className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-slate-900/80 border border-emerald-500/20 text-xs"
                  >
                    <span className="font-semibold text-slate-100 truncate">{st.studentName}</span>
                    <span className="font-mono text-[10px] text-emerald-400 shrink-0 ml-2">
                      {st.usn}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* COMPILING – ORANGE */}
          <div className="rounded-xl border border-orange-500/30 bg-orange-950/15 p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-orange-500/20 pb-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-400 animate-ping" />
                <Cpu className="w-4 h-4 text-orange-400" />
                <span className="text-xs font-bold text-orange-300 uppercase font-mono">
                  Compiling – Orange
                </span>
              </div>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-orange-500/20 text-orange-300">
                {compilingStudents.length} Students
              </span>
            </div>
            <p className="text-[11px] text-orange-200/70">
              Currently executing or compiling programs concurrently
            </p>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {compilingStudents.length === 0 ? (
                <p className="text-xs text-slate-500 italic py-2">No students compiling right now.</p>
              ) : (
                compilingStudents.map((st) => (
                  <div
                    key={st.id}
                    className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-slate-900/80 border border-orange-500/20 text-xs"
                  >
                    <span className="font-semibold text-slate-100 truncate">{st.studentName}</span>
                    <span className="font-mono text-[10px] text-orange-400 shrink-0 ml-2">
                      {st.usn}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* IDLE – YELLOW */}
          <div className="rounded-xl border border-amber-500/30 bg-amber-950/15 p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-amber-500/20 pb-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <PauseCircle className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-amber-300 uppercase font-mono">
                  Idle – Yellow
                </span>
              </div>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">
                {idleStudents.length} Students
              </span>
            </div>
            <p className="text-[11px] text-amber-200/70">
              Logged in with no editor interaction for 2+ minutes
            </p>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {idleStudents.length === 0 ? (
                <p className="text-xs text-slate-500 italic py-2">No idle students in this batch.</p>
              ) : (
                idleStudents.map((st) => (
                  <div
                    key={st.id}
                    className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-slate-900/80 border border-amber-500/20 text-xs"
                  >
                    <span className="font-semibold text-slate-100 truncate">{st.studentName}</span>
                    <span className="font-mono text-[10px] text-amber-400 shrink-0 ml-2">
                      {st.usn}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Status Filter Tabs + Detailed Per-Student Activity Table */}
        <div className="space-y-3 pt-2">
          <div className="flex flex-wrap items-center gap-2">
            {(
              [
                { id: 'all', label: `All Batch Students (${liveBatchMonitorList.length})`, color: 'bg-sky-600 text-white' },
                { id: 'Typing', label: `Typing – Green (${typingStudents.length})`, color: 'bg-emerald-600 text-white' },
                { id: 'Compiling', label: `Compiling – Orange (${compilingStudents.length})`, color: 'bg-orange-600 text-white' },
                { id: 'Idle', label: `Idle – Yellow (${idleStudents.length})`, color: 'bg-amber-600 text-white' },
                { id: 'Viewing', label: `Viewing (${viewingStudents.length})`, color: 'bg-sky-600 text-white' },
                { id: 'Submitted', label: `Submitted (${submittedStudents.length})`, color: 'bg-purple-600 text-white' },
                ...(absentStudents.length > 0
                  ? [{ id: 'Absent', label: `Offline (${absentStudents.length})`, color: 'bg-rose-600 text-white' }]
                  : []),
              ] as Array<{ id: 'all' | StudentActivityStatus; label: string; color: string }>
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveStatusTab(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all border ${
                  activeStatusTab === tab.id
                    ? `${tab.color} border-transparent shadow-sm`
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="overflow-x-auto max-h-80 overflow-y-auto rounded-xl border border-slate-800 bg-slate-950/60">
            <table className="w-full text-xs text-left">
              <thead className="sticky top-0 bg-[#090f22] z-10">
                <tr className="border-b border-slate-800 text-slate-400 font-semibold text-[10px] uppercase font-mono">
                  <th className="py-2.5 px-4">Student Name</th>
                  <th className="py-2.5 px-4">USN</th>
                  <th className="py-2.5 px-4">Batch</th>
                  <th className="py-2.5 px-4">Live Status</th>
                  <th className="py-2.5 px-4 text-right">Active Time</th>
                  <th className="py-2.5 px-4 text-right">Idle Time</th>
                  <th className="py-2.5 px-4 text-right">Compiles</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                {tabFilteredMonitor.map((ses) => (
                  <tr key={ses.id} className="hover:bg-slate-900/50">
                    <td className="py-2.5 px-4 font-sans font-semibold text-slate-200">
                      {ses.studentName}
                    </td>
                    <td className="py-2.5 px-4 text-slate-400">{ses.usn}</td>
                    <td className="py-2.5 px-4 text-sky-400 font-bold">
                      Sem {ses.semesterNumber} · {ses.batch}
                    </td>
                    <td className="py-2.5 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded font-mono text-[10px] uppercase font-bold border ${
                          ses.activityStatus === 'Typing'
                            ? 'bg-emerald-950 text-emerald-400 border-emerald-500/30'
                            : ses.activityStatus === 'Compiling'
                            ? 'bg-orange-950 text-orange-400 border-orange-500/30'
                            : ses.activityStatus === 'Idle'
                            ? 'bg-amber-950 text-amber-400 border-amber-500/30'
                            : ses.activityStatus === 'Viewing'
                            ? 'bg-sky-950 text-sky-400 border-sky-500/30'
                            : ses.activityStatus === 'Absent'
                            ? 'bg-rose-950 text-rose-400 border-rose-500/30'
                            : 'bg-purple-950 text-purple-300 border-purple-500/30'
                        }`}
                      >
                        {ses.activityStatus}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-right font-semibold text-emerald-400 tabular-nums">
                      {Math.floor(ses.activeTimeSeconds / 60)}m {ses.activeTimeSeconds % 60}s
                    </td>
                    <td className="py-2.5 px-4 text-right text-amber-400 tabular-nums">
                      {Math.floor(ses.idleTimeSeconds / 60)}m
                    </td>
                    <td className="py-2.5 px-4 text-right text-slate-300 tabular-nums">
                      {ses.compilationAttempts}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 5 Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-[#0e1738] border border-slate-800 rounded-xl p-5 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Total Enrolled</span>
            <Users className="w-4 h-4 text-sky-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-bold text-white font-mono tabular-nums">
              {allStudents.length}
            </span>
            <span className="text-xs text-slate-400">20 / Batch</span>
          </div>
        </div>

        <div className="bg-[#0e1738] border border-slate-800 rounded-xl p-5 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Active Terminals</span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-bold text-emerald-400 font-mono tabular-nums">
              {activeStudentsCount}
            </span>
            <span className="text-xs text-slate-400">Live Now</span>
          </div>
        </div>

        <div className="bg-[#0e1738] border border-slate-800 rounded-xl p-5 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Active Batch</span>
            <CalendarCheck2 className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-bold text-white font-mono">
              {activeBatchSession
                ? `S${activeBatchSession.semesterNumber} ${activeBatchSession.batch.replace('Batch ', '')}`
                : 'None'}
            </span>
            <span className="text-xs text-slate-400">1 Max</span>
          </div>
        </div>

        <div className="bg-[#0e1738] border border-slate-800 rounded-xl p-5 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Completed Labs</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-bold text-white font-mono tabular-nums">
              {completedSessionsCount}
            </span>
            <span className="text-xs text-slate-400">Evaluated</span>
          </div>
        </div>

        <div className="bg-[#0e1738] border border-slate-800 rounded-xl p-5 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Curriculum Labs</span>
            <BookOpen className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-bold text-white font-mono tabular-nums">
              {experiments.length}
            </span>
            <span className="text-xs text-slate-400">Experiments</span>
          </div>
        </div>
      </div>

      {/* Bottom Analytics Grid: Typing Focus Chart + Security/Integrity Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-[#0e1738] border border-slate-800 rounded-xl p-5 space-y-3">
          <h2 className="text-sm font-bold text-white">
            Student Typing Focus (Minutes) — Sem {selectedSemester} {selectedBatch}
          </h2>
          <p className="text-xs text-slate-400">Comparing active editor typing against idle intervals</p>

          <div className="h-56 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={10} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#090f22', borderColor: '#334155', fontSize: '11px' }}
                />
                <Bar dataKey="active" name="Active (min)" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="idle" name="Idle (min)" fill="#64748b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-5 bg-[#0e1738] border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-400">
              <ShieldAlert className="w-4 h-4" />
              <h3 className="text-sm font-bold text-white">Security &amp; Academic Integrity Alerts</h3>
            </div>
            <button
              onClick={() => setActiveNavTab('academic_integrity')}
              className="font-mono text-xs text-sky-400 hover:underline"
            >
              {integrityAlerts.length} flags
            </button>
          </div>

          <div className="space-y-2">
            {integrityAlerts.slice(0, 2).map((alert) => (
              <div
                key={alert.id}
                onClick={() => setActiveNavTab('academic_integrity')}
                className="p-2.5 rounded-lg bg-slate-900 border border-rose-500/30 hover:border-rose-400/60 cursor-pointer text-xs space-y-1 transition-colors"
              >
                <div className="flex items-center justify-between font-semibold text-slate-200">
                  <span>{alert.studentName} ({alert.usn})</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-500/30">
                    {alert.riskLevel} Risk · {alert.similarityScore}%
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  {alert.linesPasted} lines pasted in {alert.assignmentName}
                </p>
              </div>
            ))}
            {clipboardEvents.slice(0, 1).map((evt) => (
              <div
                key={evt.id}
                className="p-2.5 rounded-lg bg-slate-900 border border-amber-500/30 text-xs space-y-1"
              >
                <div className="flex items-center justify-between font-semibold text-slate-200">
                  <span>{evt.studentName} ({evt.usn})</span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {new Date(evt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">{evt.details}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
