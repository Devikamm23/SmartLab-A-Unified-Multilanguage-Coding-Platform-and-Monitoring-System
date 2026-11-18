import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { COLLEGE_CONFIG } from '../../constants/college';
import {
  AssignmentDeadline,
  INITIAL_DEADLINES,
} from '../../data/studentFeaturesData';
import {
  Clock,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Play,
  Filter,
  FileCode2,
  User,
  BookOpen,
} from 'lucide-react';

export const DeadlineTracker: React.FC = () => {
  const { startLab, setActiveNavTab } = useApp();
  const [deadlines, setDeadlines] = useState<AssignmentDeadline[]>(INITIAL_DEADLINES);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const pendingCount = deadlines.filter((d) => d.status === 'Pending').length;
  const overdueCount = deadlines.filter((d) => d.status === 'Overdue').length;
  const submittedCount = deadlines.filter((d) => d.status === 'Submitted').length;

  const getStatusBadge = (status: AssignmentDeadline['status']) => {
    switch (status) {
      case 'Submitted':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" /> Submitted
          </span>
        );
      case 'Overdue':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-rose-50 text-rose-600 border border-rose-200">
            <AlertTriangle className="w-3.5 h-3.5" /> Overdue
          </span>
        );
      case 'Pending':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-amber-50 text-amber-600 border border-amber-200">
            <Clock className="w-3.5 h-3.5" /> Pending
          </span>
        );
    }
  };

  const getUrgencyHighlight = (deadline: AssignmentDeadline) => {
    if (deadline.status === 'Submitted') {
      return 'border-emerald-200 bg-white';
    }
    if (deadline.status === 'Overdue') {
      return 'border-rose-300 bg-white ring-1 ring-rose-500/20';
    }
    if (deadline.priority === 'approaching') {
      return 'border-amber-300 bg-white ring-1 ring-amber-500/20';
    }
    return 'border-blue-100 bg-white';
  };

  const filteredDeadlines = deadlines.filter((d) => {
    if (filterStatus === 'all') return true;
    return d.status.toLowerCase() === filterStatus.toLowerCase();
  });

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Assignment Deadline Tracker</h1>
        <p className="text-xs text-slate-600 mt-0.5">
          Laboratory assignment timelines, submission schedules, and countdown timers for {COLLEGE_CONFIG.department}
        </p>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-blue-100 rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-600 font-medium">Pending Tasks</span>
            <div className="text-2xl font-bold text-amber-600 font-mono mt-1">{pendingCount}</div>
            <span className="text-[10px] text-slate-500">Awaiting code submission</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-blue-100 rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-600 font-medium">Overdue Deadlines</span>
            <div className="text-2xl font-bold text-rose-600 font-mono mt-1">{overdueCount}</div>
            <span className="text-[10px] text-slate-500">Penalty window active</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-blue-100 rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-600 font-medium">Completed & Verified</span>
            <div className="text-2xl font-bold text-emerald-600 font-mono mt-1">{submittedCount}</div>
            <span className="text-[10px] text-slate-500">Graded by faculty</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 p-1 rounded-xl bg-white border border-blue-100 text-xs w-fit">
        {['all', 'pending', 'submitted', 'overdue'].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-3 py-1.5 rounded-lg capitalize font-medium transition-all ${
              filterStatus === status
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-800 hover:bg-blue-50/60'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Deadlines List */}
      <div className="space-y-4">
        {filteredDeadlines.map((dl) => (
          <div
            key={dl.id}
            className={`rounded-2xl border p-5 shadow-lg space-y-4 transition-all ${getUrgencyHighlight(dl)}`}
          >
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-mono font-bold text-blue-600 px-2 py-0.5 rounded bg-blue-50 border border-blue-500/20">
                    {dl.subjectCode}
                  </span>
                  <span className="text-xs font-medium text-slate-700">
                    {dl.subjectName}
                  </span>
                  <span aria-hidden="true" className="text-slate-600">·</span>
                  <span className="text-xs text-slate-600 flex items-center gap-1">
                    <User className="w-3 h-3 text-slate-500" />
                    {dl.facultyName}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 tracking-tight">
                  {dl.assignmentName}
                </h3>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                {getStatusBadge(dl.status)}
              </div>
            </div>

            {/* Timelines and Countdown Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-blue-50/60 border border-blue-100 text-xs font-mono">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Assigned Date</span>
                <span className="text-slate-700 flex items-center gap-1.5 mt-0.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  {dl.assignedDate}
                </span>
              </div>

              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Submission Deadline</span>
                <span className="text-slate-800 font-semibold flex items-center gap-1.5 mt-0.5">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  {dl.submissionDeadline}
                </span>
              </div>

              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Remaining Time</span>
                <span
                  className={`font-bold flex items-center gap-1.5 mt-0.5 ${
                    dl.status === 'Submitted'
                      ? 'text-emerald-600'
                      : dl.status === 'Overdue'
                      ? 'text-rose-600'
                      : 'text-amber-600'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  {dl.remainingTime}
                </span>
              </div>
            </div>

            {/* Actions Bar */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-slate-600">
                Evaluation protocol: 50 Marks (Continuous Internal Evaluation)
              </span>

              {dl.status !== 'Submitted' ? (
                <button
                  onClick={() => {
                    if (dl.labSessionId) {
                      startLab(dl.labSessionId);
                    } else {
                      setActiveNavTab('editor');
                    }
                  }}
                  className="py-1.5 px-3.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Open in Online Editor</span>
                </button>
              ) : (
                <button
                  onClick={() => setActiveNavTab('lab_history')}
                  className="py-1.5 px-3.5 rounded-lg bg-blue-100 hover:bg-blue-100 text-slate-700 text-xs font-semibold transition-colors flex items-center gap-1.5"
                >
                  <FileCode2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>View Submission & Marks</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
