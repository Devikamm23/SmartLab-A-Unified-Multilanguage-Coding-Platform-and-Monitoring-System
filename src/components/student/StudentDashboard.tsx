import React from 'react';
import { useApp } from '../../context/AppContext';
import { COLLEGE_CONFIG } from '../../constants/college';
import {
  Clock,
  Cpu,
  CheckCircle2,
  AlertTriangle,
  Play,
  ArrowRight,
  FlaskConical,
  Code2,
  Calendar,
  Layers,
  Award,
  Bell,
  Megaphone,
  HelpCircle,
  Percent,
  User,
  ShieldCheck,
  ChevronRight,
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
import {
  INITIAL_NOTIFICATIONS,
  INITIAL_DEADLINES,
  INITIAL_FACULTY_ANNOUNCEMENTS,
  INITIAL_ATTENDANCE,
} from '../../data/studentFeaturesData';

export const StudentDashboard: React.FC = () => {
  const {
    currentUser,
    labSessions,
    studentLabSessions,
    startLab,
    setActiveNavTab,
    sessionRemainingSeconds,
    sessionStartTime,
    sessionEndTime,
    totalSessionMinutes,
    canStudentExecute,
    activeBatchSession,
  } = useApp();

  const executionGate = canStudentExecute(currentUser);

  // Filter lab sessions assigned strictly to student's semester and batch
  const assignedSessions = labSessions.filter(
    (ls) =>
      ls.semesterNumber === currentUser?.semester &&
      ls.batch === currentUser?.batch
  );

  // My session records
  const mySessions = studentLabSessions.filter((s) => s.studentId === currentUser?.id);

  // Current or upcoming session
  const currentSession =
    assignedSessions.find((ls) => ls.status === 'ongoing') || assignedSessions[0];

  // Active student lab session record for currently logged-in student
  const activeStudentSession = mySessions.find((s) => s.labSessionId === currentSession?.id) || mySessions[0];

  // Aggregate statistics
  const totalSessionsCount = mySessions.length;
  const totalActiveSeconds = mySessions.reduce((acc, s) => acc + s.activeTimeSeconds, 0);
  const totalExecutions = mySessions.reduce((acc, s) => acc + s.programExecutions, 0);
  const totalCompilations = mySessions.reduce((acc, s) => acc + s.compilationAttempts, 0);

  const formatHoursMinutes = (sec: number) => {
    const hrs = Math.floor(sec / 3600);
    const mins = Math.floor((sec % 3600) / 60);
    return `${hrs}h ${mins}m`;
  };

  const formatCountdown = (totalSec: number) => {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Activity status badge configuration
  const getActivityStatusBadge = (status?: string) => {
    switch (status) {
      case 'Typing':
        return {
          label: 'Typing (Active Editor)',
          bg: 'bg-emerald-950/80',
          text: 'text-emerald-400',
          border: 'border-emerald-500/40',
          dot: 'bg-emerald-400',
        };
      case 'Compiling':
        return {
          label: 'Compiling (Running Code)',
          bg: 'bg-orange-950/80',
          text: 'text-orange-400',
          border: 'border-orange-500/40',
          dot: 'bg-orange-400',
        };
      case 'Idle':
        return {
          label: 'Idle (>2m Inactive)',
          bg: 'bg-amber-950/80',
          text: 'text-amber-400',
          border: 'border-amber-500/40',
          dot: 'bg-amber-400',
        };
      case 'Viewing':
        return {
          label: 'Viewing (Reading Specs)',
          bg: 'bg-sky-950/80',
          text: 'text-sky-400',
          border: 'border-sky-500/40',
          dot: 'bg-sky-400',
        };
      case 'Absent':
        return {
          label: 'Absent',
          bg: 'bg-rose-950/80',
          text: 'text-rose-400',
          border: 'border-rose-500/40',
          dot: 'bg-rose-400',
        };
      case 'Submitted':
        return {
          label: 'Submitted (Task Complete)',
          bg: 'bg-purple-950/80',
          text: 'text-purple-400',
          border: 'border-purple-500/40',
          dot: 'bg-purple-400',
        };
      default:
        return {
          label: 'Viewing',
          bg: 'bg-sky-950/80',
          text: 'text-sky-400',
          border: 'border-sky-500/40',
          dot: 'bg-sky-400',
        };
    }
  };

  const statusBadge = getActivityStatusBadge(activeStudentSession?.activityStatus || 'Viewing');

  // Activity breakdown for chart
  const chartData = mySessions.map((s, idx) => ({
    name: s.experimentName.split(' ')[0] + ' ' + (idx + 1),
    activeMin: Math.round(s.activeTimeSeconds / 60),
    idleMin: Math.round(s.idleTimeSeconds / 60),
  }));

  const unreadNotifications = INITIAL_NOTIFICATIONS.filter((n) => !n.isRead);
  const pendingDeadlines = INITIAL_DEADLINES.filter((d) => d.status === 'Pending').slice(0, 2);
  const latestAnnouncement = INITIAL_FACULTY_ANNOUNCEMENTS[0];

  // Most recent AI evaluation or submitted evaluation
  const latestEvaluatedSession = mySessions.find((s) => s.aiEvaluation) || mySessions[0];
  const aiEval = latestEvaluatedSession?.aiEvaluation;

  const criteriaList = aiEval
    ? [
        aiEval.activeParticipation,
        aiEval.problemUnderstanding,
        aiEval.codeImplementation,
        aiEval.testCaseResults,
        aiEval.assignmentCompletion,
      ]
    : [
        {
          criteriaName: '1. Active Lab Participation',
          marksAwarded: 9,
          maxMarks: 10,
          explanation: 'Consistent keystroke progression with minimal idle deviations.',
        },
        {
          criteriaName: '2. Problem Understanding & Approach',
          marksAwarded: 9,
          maxMarks: 10,
          explanation: 'Optimal structure with clean function boundaries and variable naming.',
        },
        {
          criteriaName: '3. Code Implementation & Correctness',
          marksAwarded: 13,
          maxMarks: 15,
          explanation: 'Algorithm handles linear and boundary cases correctly with O(N) complexity.',
        },
        {
          criteriaName: '4. Test Case Results',
          marksAwarded: 9,
          maxMarks: 10,
          explanation: 'Passed 5 out of 5 unit test cases including edge case assertions.',
        },
        {
          criteriaName: '5. Assignment Completion',
          marksAwarded: 5,
          maxMarks: 5,
          explanation: 'Fully submitted within allotted 120-minute laboratory window.',
        },
      ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Student Academic Profile Header Card */}
      <div className="bg-[#0e1738] border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center font-bold text-2xl text-white shadow-md shadow-sky-500/20 shrink-0">
            👩‍💻
          </div>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-bold text-white tracking-tight">{currentUser?.name}</h1>
              <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-500/30">
                USN: {currentUser?.usn || '4GW24IS010'}
              </span>
            </div>
            {/* Clean unboxed metadata with College name */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
              <span className="text-slate-300 font-medium">{COLLEGE_CONFIG.name}</span>
              <span aria-hidden="true">·</span>
              <span>{COLLEGE_CONFIG.department}</span>
              <span aria-hidden="true">·</span>
              <span className="font-semibold text-slate-300">Semester {currentUser?.semester || 5}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono font-semibold text-sky-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                {currentUser?.batch || 'Batch A'}
              </span>
              <span aria-hidden="true">·</span>
              <span className="text-emerald-400">Admission: {currentUser?.admissionYear || 2024}</span>
            </div>
          </div>
        </div>

        {/* Quick Launch CTA to Start Lab */}
        {currentSession && (
          <div className="flex items-center gap-3 bg-slate-900/90 border border-slate-800 rounded-xl p-3.5">
            <div className="space-y-0.5">
              <span className="text-[10px] uppercase font-mono text-slate-400 block">
                Assigned Lab Slot ({currentSession.batch})
              </span>
              <span className="text-xs font-bold text-slate-200 block truncate max-w-[200px]">
                {currentSession.experimentName}
              </span>
              <span className="text-[11px] text-sky-400 uppercase font-mono">
                {currentSession.programmingLanguage}
              </span>
            </div>
            <button
              onClick={() => startLab(currentSession.id)}
              className="py-2 px-4 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-md shadow-sky-600/20 shrink-0"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Start Lab</span>
            </button>
          </div>
        )}
      </div>

      {/* Active Batch Execution Gate Status Banner */}
      <div
        className={`rounded-xl px-4 py-3 border text-xs flex flex-wrap items-center justify-between gap-2 ${
          executionGate.allowed
            ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300'
            : 'bg-amber-950/30 border-amber-500/30 text-amber-200'
        }`}
      >
        <div className="flex items-center gap-2">
          {executionGate.allowed ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          )}
          <span>
            {executionGate.allowed
              ? `Live Lab Execution Unlocked for Semester ${activeBatchSession?.semesterNumber} ${activeBatchSession?.batch} (${formatCountdown(sessionRemainingSeconds)} remaining).`
              : executionGate.reason}
          </span>
        </div>
        {activeBatchSession && (
          <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-slate-900/80 border border-slate-700 text-slate-200">
            Active Batch: Sem {activeBatchSession.semesterNumber} · {activeBatchSession.batch}
          </span>
        )}
      </div>

      {/* 1. LAB SESSION DURATION MANAGEMENT & LIVE ACTIVITY STATUS WIDGET */}
      <div className="bg-[#0e1738] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  Lab Session Duration & Live Monitoring
                </h2>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-700">
                  {totalSessionMinutes} Minutes Default
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Official slot: {sessionStartTime} – {sessionEndTime} · Real-time activity telemetry & countdown
              </p>
            </div>
          </div>

          {/* Current Live Activity Status */}
          <div className="flex items-center gap-2 self-start md:self-auto">
            <span className="text-xs text-slate-400 font-medium">Your Current Status:</span>
            <div
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold font-mono border ${statusBadge.bg} ${statusBadge.text} ${statusBadge.border} shadow-sm`}
            >
              <span className={`w-2 h-2 rounded-full ${statusBadge.dot} animate-pulse`} />
              <span>{statusBadge.label}</span>
            </div>
          </div>
        </div>

        {/* 4 Telemetry Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
          {/* Remaining Countdown Timer */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span className="font-medium">Remaining Lab Time</span>
              <Clock className="w-4 h-4 text-sky-400" />
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl sm:text-3xl font-mono font-bold text-sky-400 tabular-nums tracking-tight">
                {formatCountdown(sessionRemainingSeconds)}
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                {Math.round(sessionRemainingSeconds / 60)}m left
              </span>
            </div>
            {/* Progress bar of 120 mins */}
            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-sky-500 h-full rounded-full transition-all duration-1000"
                style={{
                  width: `${Math.max(0, Math.min(100, (sessionRemainingSeconds / (totalSessionMinutes * 60)) * 100))}%`,
                }}
              />
            </div>
          </div>

          {/* Login Time & Logout Time */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-1.5">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span className="font-medium">Session Timestamps</span>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="space-y-1 font-mono text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Login Time:</span>
                <span className="font-bold text-emerald-400 tabular-nums">
                  {activeStudentSession?.loginTime || '09:02:15 AM'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Logout Time:</span>
                <span className="text-slate-300 tabular-nums">
                  {activeStudentSession?.logoutTime || 'In Session'}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] pt-0.5 border-t border-slate-800 text-slate-400">
                <span>Total Lab Dwell:</span>
                <span className="text-white font-bold tabular-nums">
                  {Math.floor((activeStudentSession?.totalDurationSeconds || 0) / 60)} mins
                </span>
              </div>
            </div>
          </div>

          {/* Active Working Time */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span className="font-medium">Active Working Time</span>
              <Code2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl sm:text-3xl font-mono font-bold text-emerald-400 tabular-nums">
                {Math.floor((activeStudentSession?.activeTimeSeconds || 0) / 60)}m{' '}
                <span className="text-base text-emerald-300">
                  {(activeStudentSession?.activeTimeSeconds || 0) % 60}s
                </span>
              </span>
              <span className="text-[11px] font-mono text-emerald-400 font-bold">
                Typing Focus
              </span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full"
                style={{
                  width: `${Math.min(
                    100,
                    Math.round(
                      ((activeStudentSession?.activeTimeSeconds || 0) /
                        Math.max(1, (activeStudentSession?.totalDurationSeconds || 1))) *
                        100
                    )
                  )}%`,
                }}
              />
            </div>
          </div>

          {/* Idle Time */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span className="font-medium">Idle / Reading Time</span>
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl sm:text-3xl font-mono font-bold text-amber-400 tabular-nums">
                {Math.floor((activeStudentSession?.idleTimeSeconds || 0) / 60)}m{' '}
                <span className="text-base text-amber-300">
                  {(activeStudentSession?.idleTimeSeconds || 0) % 60}s
                </span>
              </span>
              <span className="text-[11px] font-mono text-amber-400">
                &gt;2m Inactive
              </span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-amber-500 h-full rounded-full"
                style={{
                  width: `${Math.min(
                    100,
                    Math.round(
                      ((activeStudentSession?.idleTimeSeconds || 0) /
                        Math.max(1, (activeStudentSession?.totalDurationSeconds || 1))) *
                        100
                    )
                  )}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 4 Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#0e1738] border border-slate-800 rounded-xl p-5 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Total Lab Sessions</span>
            <FlaskConical className="w-4 h-4 text-sky-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-bold text-white font-mono tabular-nums">
              {totalSessionsCount}
            </span>
            <span className="text-xs text-slate-400 font-mono">Semester {currentUser?.semester}</span>
          </div>
        </div>

        <div className="bg-[#0e1738] border border-slate-800 rounded-xl p-5 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Total Active Time</span>
            <Clock className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-bold text-emerald-400 font-mono tabular-nums">
              {formatHoursMinutes(totalActiveSeconds)}
            </span>
            <span className="text-xs text-slate-400">Focused Typing</span>
          </div>
        </div>

        <div className="bg-[#0e1738] border border-slate-800 rounded-xl p-5 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Programs Executed</span>
            <Cpu className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-bold text-white font-mono tabular-nums">
              {totalExecutions}
            </span>
            <span className="text-xs text-slate-400">Runs</span>
          </div>
        </div>

        <div className="bg-[#0e1738] border border-slate-800 rounded-xl p-5 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Practical Attendance</span>
            <Percent className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-bold text-emerald-400 font-mono tabular-nums">
              {INITIAL_ATTENDANCE.overallPercentage}%
            </span>
            <span className="text-xs text-emerald-400 font-mono">Eligible</span>
          </div>
        </div>
      </div>

      {/* QUICK STUDENT ACTION HUBS: Notifications, Deadlines, Announcements, Attendance */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Notification Hub Card */}
        <div
          onClick={() => setActiveNavTab('notifications')}
          className="bg-[#0e1738] border border-slate-800 hover:border-sky-500/50 p-4 rounded-xl cursor-pointer transition-all space-y-2.5 group shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-white">
              <Bell className="w-4 h-4 text-sky-400" />
              <span>Notification Centre</span>
            </div>
            {unreadNotifications.length > 0 && (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                {unreadNotifications.length} New
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-400 line-clamp-2">
            {unreadNotifications[0]?.title || 'All notifications read and acknowledged.'}
          </p>
          <div className="text-[11px] text-sky-400 font-medium flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
            <span>Open Notification Centre</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Deadline Tracker Card */}
        <div
          onClick={() => setActiveNavTab('deadlines')}
          className="bg-[#0e1738] border border-slate-800 hover:border-amber-500/50 p-4 rounded-xl cursor-pointer transition-all space-y-2.5 group shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-white">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>Deadlines Tracker</span>
            </div>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
              {pendingDeadlines.length} Pending
            </span>
          </div>
          <p className="text-[11px] text-slate-400 line-clamp-2">
            Next: {pendingDeadlines[0]?.assignmentName || 'No pending deadlines.'}
          </p>
          <div className="text-[11px] text-amber-400 font-medium flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
            <span>View All Deadlines</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Announcements Card */}
        <div
          onClick={() => setActiveNavTab('announcements')}
          className="bg-[#0e1738] border border-slate-800 hover:border-purple-500/50 p-4 rounded-xl cursor-pointer transition-all space-y-2.5 group shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-white">
              <Megaphone className="w-4 h-4 text-purple-400" />
              <span>Faculty Circulars</span>
            </div>
            <span className="text-[10px] font-mono text-purple-400 font-bold">
              {INITIAL_FACULTY_ANNOUNCEMENTS.length} Active
            </span>
          </div>
          <p className="text-[11px] text-slate-400 line-clamp-2">
            {latestAnnouncement.title}
          </p>
          <div className="text-[11px] text-purple-400 font-medium flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
            <span>Read Announcements</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Attendance Card */}
        <div
          onClick={() => setActiveNavTab('attendance')}
          className="bg-[#0e1738] border border-slate-800 hover:border-emerald-500/50 p-4 rounded-xl cursor-pointer transition-all space-y-2.5 group shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-white">
              <Percent className="w-4 h-4 text-emerald-400" />
              <span>Lab Attendance</span>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 font-bold">
              {INITIAL_ATTENDANCE.classesAttended} / {INITIAL_ATTENDANCE.totalClasses} Attended
            </span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-slate-900 overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full"
              style={{ width: `${INITIAL_ATTENDANCE.overallPercentage}%` }}
            />
          </div>
          <div className="text-[11px] text-emerald-400 font-medium flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
            <span>View Attendance Ledger</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>

      {/* 2. AI-BASED AUTOMATIC PERFORMANCE EVALUATION & FACULTY MARKS CARD */}
      <div className="bg-[#0e1738] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  AI-Based Automatic Performance Evaluation & Faculty Marks
                </h2>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-500/30">
                  50 Marks Scheme
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Evaluation across 5 mandatory academic criteria · Evaluated based on code logic and test cases, not merely time spent
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[10px] text-slate-400 font-mono uppercase block">
                {activeStudentSession?.isFacultyApproved ? 'Faculty Approved Score' : 'AI Suggested Score'}
              </span>
              <span className="text-2xl font-bold font-mono text-emerald-400 tabular-nums">
                {activeStudentSession?.facultyApprovedScore ?? activeStudentSession?.score ?? 44}
                <span className="text-sm font-normal text-slate-400"> / 50</span>
              </span>
            </div>
            <span
              className={`px-2.5 py-1 rounded-md text-xs font-mono font-bold border ${
                activeStudentSession?.isFacultyApproved
                  ? 'bg-emerald-950 text-emerald-400 border-emerald-500/40'
                  : 'bg-purple-950 text-purple-300 border-purple-500/30'
              }`}
            >
              {activeStudentSession?.isFacultyApproved ? 'Faculty Approved' : 'AI Evaluated'}
            </span>
          </div>
        </div>

        {/* 5 Criteria Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 pt-1">
          {criteriaList.map((c, idx) => (
            <div key={idx} className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-200 line-clamp-1" title={c.criteriaName}>
                  {c.criteriaName}
                </span>
                <span className="font-mono font-bold text-emerald-400 shrink-0 tabular-nums">
                  {c.marksAwarded}/{c.maxMarks}
                </span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full"
                  style={{ width: `${Math.round((c.marksAwarded / c.maxMarks) * 100)}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-400 line-clamp-2 leading-tight">
                {c.explanation}
              </p>
            </div>
          ))}
        </div>

        {/* AI & Faculty Feedback Notes */}
        <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-start gap-2.5">
            <span className="text-purple-400 font-bold font-mono shrink-0">AI Remark:</span>
            <span className="text-slate-300">
              {aiEval?.overallExplanation ||
                'Excellent code structure with proper error handling and clean algorithmic flow. Note: evaluation measures algorithmic efficiency and correctness rather than pure time in editor.'}
            </span>
          </div>
          {activeStudentSession?.facultyFeedback && (
            <div className="flex items-center gap-2 border-t sm:border-t-0 sm:border-l border-slate-800 pt-2 sm:pt-0 sm:pl-3 shrink-0">
              <span className="text-emerald-400 font-bold font-mono">Faculty Note:</span>
              <span className="text-slate-200">{activeStudentSession.facultyFeedback}</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Grid: Current Lab Session Details + Activity Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Cols: Current / Assigned Lab Details */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-[#0e1738] border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-white">Current Laboratory Session</h2>
                <p className="text-xs text-slate-400">
                  Assigned strictly to Semester {currentUser?.semester} · {currentUser?.batch}
                </p>
              </div>
              <button
                onClick={() => setActiveNavTab('my_lab')}
                className="text-xs text-sky-400 hover:text-sky-300 font-medium flex items-center gap-1"
              >
                <span>View My Lab</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {currentSession ? (
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-sky-400">
                      {currentSession.subjectCode}
                    </span>
                    <span aria-hidden="true" className="text-slate-600">·</span>
                    <span className="text-xs font-semibold text-slate-200">
                      {currentSession.subjectName}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white tracking-tight">
                    {currentSession.experimentName}
                  </h3>
                </div>

                {/* Session specs */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 rounded-lg bg-[#070b19] border border-slate-800/80 font-mono text-[11px]">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Language</span>
                    <span className="text-slate-200 uppercase font-bold">
                      {currentSession.programmingLanguage}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Session Status</span>
                    <span
                      className={`font-semibold capitalize ${
                        currentSession.status === 'ongoing'
                          ? 'text-emerald-400'
                          : 'text-sky-400'
                      }`}
                    >
                      {currentSession.status}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Lab Slot</span>
                    <span className="text-slate-300">
                      {currentSession.startTime} - {currentSession.endTime}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Teacher</span>
                    <span className="text-slate-300 truncate block">
                      {currentSession.teacherName}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">
                  {currentSession.instructions}
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                  <div className="text-[11px] text-amber-400 flex items-center gap-1.5 font-mono">
                    <Award className="w-3.5 h-3.5" />
                    <span>Copy/Paste Restrictions: {currentSession.isCopyPasteRestricted ? 'Enforced' : 'Off'}</span>
                  </div>

                  <button
                    onClick={() => startLab(currentSession.id)}
                    className="py-2 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-sm"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Enter Code Editor</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-slate-500">
                No active laboratory sessions assigned for your batch today.
              </div>
            )}
          </div>

          {/* Previous Sessions Summary Table */}
          <div className="bg-[#0e1738] border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-white">Previous Laboratory Sessions</h2>
                <p className="text-xs text-slate-400">Completed experiments and active durations</p>
              </div>
              <button
                onClick={() => setActiveNavTab('lab_history')}
                className="text-xs text-sky-400 hover:text-sky-300 font-medium"
              >
                Full History
              </button>
            </div>

            {mySessions.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">
                No previous sessions recorded yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 font-medium text-[10px] uppercase font-mono">
                      <th className="pb-2">Experiment</th>
                      <th className="pb-2">Language</th>
                      <th className="pb-2 text-right">Active Time</th>
                      <th className="pb-2 text-right">Executions</th>
                      <th className="pb-2 text-right">Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                    {mySessions.map((ses) => (
                      <tr key={ses.id} className="hover:bg-slate-900/50">
                        <td className="py-2.5 font-sans font-semibold text-slate-200 max-w-[200px] truncate">
                          {ses.experimentName}
                        </td>
                        <td className="py-2.5 uppercase text-sky-400">{ses.programmingLanguage}</td>
                        <td className="py-2.5 text-right text-slate-300 tabular-nums">
                          {Math.floor(ses.activeTimeSeconds / 60)}m {ses.activeTimeSeconds % 60}s
                        </td>
                        <td className="py-2.5 text-right text-slate-300 tabular-nums">
                          {ses.programExecutions}
                        </td>
                        <td className="py-2.5 text-right font-bold text-emerald-400 tabular-nums">
                          {ses.score !== undefined ? `${ses.score} / 50` : 'Pending'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right 5 Cols: Active vs Idle Time Chart + Help CTA */}
        <div className="lg:col-span-5 space-y-6">
          {/* Active vs Idle Time Chart */}
          <div className="bg-[#0e1738] border border-slate-800 rounded-xl p-5 space-y-3">
            <h2 className="text-sm font-bold text-white">Active vs. Idle Time (Minutes)</h2>
            <p className="text-xs text-slate-400">
              Interactive typing time compared against idle threshold periods
            </p>

            <div className="h-56 w-full pt-2">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
                    <YAxis stroke="#64748b" fontSize={10} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#090f22', borderColor: '#334155', fontSize: '11px' }}
                    />
                    <Bar dataKey="activeMin" name="Active Time (min)" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="idleMin" name="Idle Time (min)" fill="#64748b" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-slate-500">
                  No session telemetry yet. Start a lab session to view analytics.
                </div>
              )}
            </div>
          </div>

          {/* Help & Support Prompt Card */}
          <div className="bg-[#0e1738] border border-slate-800 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sky-400 font-bold text-xs">
                <HelpCircle className="w-4 h-4" />
                <span>Technical Support & FAQs</span>
              </div>
              <button
                onClick={() => setActiveNavTab('support')}
                className="text-xs text-sky-400 hover:text-sky-300 font-medium"
              >
                Help Desk
              </button>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Encountering compiler timeouts, Monaco editor glitches, or need clarification on test case verdicts? Access platform documentation or submit a support inquiry.
            </p>
            <button
              onClick={() => setActiveNavTab('support')}
              className="w-full py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-850 text-slate-200 text-xs font-semibold border border-slate-800 transition-colors flex items-center justify-center gap-2"
            >
              <span>Explore Help & Support</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
