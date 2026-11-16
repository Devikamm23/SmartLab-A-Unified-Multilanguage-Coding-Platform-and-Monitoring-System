import React from 'react';
import { COLLEGE_CONFIG } from '../../constants/college';
import {
  AttendanceSummary,
  INITIAL_ATTENDANCE,
} from '../../data/studentFeaturesData';
import {
  CalendarCheck2,
  CalendarX2,
  Percent,
  CheckCircle2,
  AlertTriangle,
  Info,
  BookOpen,
  User,
  ShieldCheck,
} from 'lucide-react';

export const AttendanceOverview: React.FC = () => {
  const attendance: AttendanceSummary = INITIAL_ATTENDANCE;

  const getAttendanceColor = (pct: number) => {
    if (pct >= 85) return 'text-emerald-400 bg-emerald-500';
    if (pct >= 75) return 'text-sky-400 bg-sky-500';
    return 'text-rose-400 bg-rose-500';
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Laboratory Attendance Overview</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Practical laboratory attendance ledger and VTU mandatory threshold monitoring
          </p>
        </div>

        {/* Demo indicator tag */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono">
          <Info className="w-3.5 h-3.5" />
          <span>Demo Data · Department Ledger</span>
        </div>
      </div>

      {/* Aggregate Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#0e1738] border border-slate-800 rounded-xl p-5 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Total Practical Labs</span>
            <BookOpen className="w-4 h-4 text-sky-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-bold text-white font-mono tabular-nums">
              {attendance.totalClasses}
            </span>
            <span className="text-xs text-slate-400">Sessions</span>
          </div>
        </div>

        <div className="bg-[#0e1738] border border-slate-800 rounded-xl p-5 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Labs Attended</span>
            <CalendarCheck2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-bold text-emerald-400 font-mono tabular-nums">
              {attendance.classesAttended}
            </span>
            <span className="text-xs text-slate-400 font-mono">Present</span>
          </div>
        </div>

        <div className="bg-[#0e1738] border border-slate-800 rounded-xl p-5 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Labs Missed</span>
            <CalendarX2 className="w-4 h-4 text-rose-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-bold text-rose-400 font-mono tabular-nums">
              {attendance.classesMissed}
            </span>
            <span className="text-xs text-slate-400 font-mono">Absent</span>
          </div>
        </div>

        <div className="bg-[#0e1738] border border-slate-800 rounded-xl p-5 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Overall Attendance</span>
            <Percent className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-bold text-emerald-400 font-mono tabular-nums">
              {attendance.overallPercentage}%
            </span>
            <span className="text-xs text-emerald-400 font-mono">Above 75%</span>
          </div>
        </div>
      </div>

      {/* VTU Threshold Progress Banner */}
      <div className="p-4 rounded-2xl bg-[#0e1738] border border-slate-800 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="font-bold text-white">Cumulative Attendance Eligibility</span>
          </div>
          <span className="font-mono text-emerald-400 font-bold">
            {attendance.overallPercentage}% (Eligible for Final VTU Practical Exam)
          </span>
        </div>

        <div className="w-full h-3 rounded-full bg-slate-900 border border-slate-800 overflow-hidden relative">
          {/* 75% Threshold indicator */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-amber-400 z-10"
            style={{ left: '75%' }}
            title="VTU Minimum Requirement: 75%"
          />
          <div
            className="h-full bg-gradient-to-r from-sky-500 via-indigo-500 to-emerald-500 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, attendance.overallPercentage)}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
          <span>0%</span>
          <span className="text-amber-400 font-semibold">VTU Cut-off: 75%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Subject-Wise Attendance Breakdown */}
      <div className="bg-[#0e1738] border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
        <div>
          <h2 className="text-sm font-bold text-white">Subject-Wise Laboratory Attendance Breakdown</h2>
          <p className="text-xs text-slate-400">
            Current semester laboratory course metrics and faculty-in-charge
          </p>
        </div>

        <div className="space-y-4">
          {attendance.subjects.map((sub) => {
            const isEligible = sub.percentage >= 75;
            return (
              <div
                key={sub.subjectCode}
                className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-sky-400 px-2 py-0.5 rounded bg-sky-950 border border-sky-500/30">
                        {sub.subjectCode}
                      </span>
                      <span className="text-xs font-semibold text-slate-200">
                        {sub.subjectName}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1 font-sans">
                      <User className="w-3 h-3 text-slate-500" />
                      Faculty: {sub.facultyInCharge}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-mono">
                    <span className="text-slate-400">
                      Attended: <strong className="text-slate-200">{sub.attended}</strong> / {sub.totalClasses}
                    </span>
                    <span
                      className={`font-bold px-2 py-0.5 rounded ${
                        isEligible
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                          : 'bg-rose-950 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {sub.percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      sub.percentage >= 85
                        ? 'bg-emerald-500'
                        : sub.percentage >= 75
                        ? 'bg-sky-500'
                        : 'bg-rose-500'
                    }`}
                    style={{ width: `${sub.percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Academic Regulations Note */}
        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 text-[11px] text-slate-400 leading-relaxed space-y-1">
          <span className="font-semibold text-slate-300 block">{COLLEGE_CONFIG.name} Practical Regulations:</span>
          <p>
            As per VTU regulations, a minimum of 75% attendance in each laboratory course is mandatory to be eligible to appear for the semester-end practical examinations. Medical exemptions must be validated by the Head of Department.
          </p>
        </div>
      </div>
    </div>
  );
};
