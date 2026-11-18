import React from 'react';
import {
  AttendanceSummary,
  INITIAL_ATTENDANCE,
} from '../../data/studentFeaturesData';
import {
  CalendarCheck2,
  CalendarX2,
  Percent,
  BookOpen,
  User,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';

export const AttendanceOverview: React.FC = () => {
  const attendance: AttendanceSummary = INITIAL_ATTENDANCE;
  const subject = attendance.subjects[0];
  const isEligible = subject.percentage >= 75;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Laboratory Attendance</h1>
          <p className="text-xs text-slate-600 mt-0.5">
            {subject.subjectCode} · {subject.subjectName}
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-blue-100 text-xs text-slate-700">
          <User className="w-3.5 h-3.5 text-blue-600" />
          <span>Faculty: <strong className="text-slate-900">{subject.facultyInCharge}</strong></span>
        </div>
      </div>

      {/* Simple 4-Metric Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-blue-100 rounded-xl p-5 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-slate-600">
            <span className="text-xs font-medium">Total Practical Labs</span>
            <BookOpen className="w-4 h-4 text-blue-600" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-bold text-slate-900 font-mono tabular-nums">
              {subject.totalClasses}
            </span>
            <span className="text-xs text-slate-600">Labs</span>
          </div>
        </div>

        <div className="bg-white border border-blue-100 rounded-xl p-5 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-slate-600">
            <span className="text-xs font-medium">Attended</span>
            <CalendarCheck2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-bold text-emerald-600 font-mono tabular-nums">
              {subject.attended}
            </span>
            <span className="text-xs text-slate-600 font-mono">Present</span>
          </div>
        </div>

        <div className="bg-white border border-blue-100 rounded-xl p-5 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-slate-600">
            <span className="text-xs font-medium">Missed</span>
            <CalendarX2 className="w-4 h-4 text-rose-600" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-bold text-rose-600 font-mono tabular-nums">
              {subject.missed}
            </span>
            <span className="text-xs text-slate-600 font-mono">Absent</span>
          </div>
        </div>

        <div className="bg-white border border-blue-100 rounded-xl p-5 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-slate-600">
            <span className="text-xs font-medium">Attendance</span>
            <Percent className="w-4 h-4 text-amber-600" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className={`text-3xl font-bold font-mono tabular-nums ${isEligible ? 'text-emerald-600' : 'text-rose-600'}`}>
              {subject.percentage.toFixed(1)}%
            </span>
            <span className={`text-xs font-mono ${isEligible ? 'text-emerald-600' : 'text-rose-600'}`}>
              {isEligible ? 'Eligible' : 'Low'}
            </span>
          </div>
        </div>
      </div>

      {/* Single Subject Progress Card */}
      <div className="bg-white border border-blue-100 rounded-2xl p-6 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-mono font-bold text-blue-600 px-2.5 py-0.5 rounded bg-blue-50 border border-blue-200">
              {subject.subjectCode}
            </span>
            <span className="text-sm font-semibold text-slate-900">
              {subject.subjectName}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            {isEligible ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                Eligible ({subject.attended}/{subject.totalClasses} Labs)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-50 text-rose-600 border border-rose-200 font-semibold">
                <AlertTriangle className="w-3.5 h-3.5" />
                Below 75% ({subject.attended}/{subject.totalClasses} Labs)
              </span>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <div className="w-full h-3 rounded-full bg-blue-50/60 border border-blue-100 overflow-hidden relative">
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-amber-400 z-10"
              style={{ left: '75%' }}
              title="Minimum Required: 75%"
            />
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                subject.percentage >= 85
                  ? 'bg-emerald-500'
                  : subject.percentage >= 75
                  ? 'bg-blue-500'
                  : 'bg-rose-500'
              }`}
              style={{ width: `${Math.min(100, subject.percentage)}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-600 font-mono">
            <span>0%</span>
            <span className="text-amber-600 font-semibold">Minimum Required: 75%</span>
            <span>100%</span>
          </div>
        </div>

        <p className="text-xs text-slate-600 pt-1">
          A minimum of 75% attendance across the 12 practical lab sessions is required to appear for the final practical exam.
        </p>
      </div>
    </div>
  );
};

