import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StudentLabSession } from '../../types';
import {
  Search,
  Eye,
  X,
  CheckCircle2,
  Award,
  ShieldCheck,
  Terminal,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export const LabHistory: React.FC = () => {
  const { currentUser, studentLabSessions } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  const [expandedReportId, setExpandedReportId] = useState<string | null>(null);
  const [selectedSessionModal, setSelectedSessionModal] = useState<StudentLabSession | null>(null);

  const mySessions = studentLabSessions
    .filter((s) => s.studentId === currentUser?.id)
    .sort((a, b) => b.sessionStartTime.localeCompare(a.sessionStartTime));

  const filtered = mySessions.filter((s) => {
    const matchesSearch =
      s.experimentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.subjectName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesLang = selectedLanguage === 'all' || s.programmingLanguage === selectedLanguage;

    return matchesSearch && matchesLang;
  });

  const formatDuration = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}m ${String(s).padStart(2, '0')}s`;
  };

  const formatDateLabel = (iso: string) => {
    if (!iso) return '—';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso.split('T')[0] || iso;
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const totalActiveSeconds = mySessions.reduce((sum, r) => sum + r.activeTimeSeconds, 0);
  const completedCount = mySessions.filter(
    (s) => s.status === 'completed' || s.activityStatus === 'Submitted'
  ).length;
  const averageMarks =
    mySessions.length > 0
      ? Math.round(
          mySessions.reduce(
            (sum, r) => sum + (r.facultyApprovedScore ?? r.score ?? 0),
            0
          ) / mySessions.length
        )
      : 0;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header & Summary */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Previous Lab Reports & History
          </h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Completed laboratory sessions, active coding time, allocated marks, and saved program code
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
          <span className="px-2.5 py-1.5 rounded-lg bg-white border border-blue-100 text-slate-700">
            Completed: <strong className="text-slate-900">{completedCount}</strong>
          </span>
          <span className="px-2.5 py-1.5 rounded-lg bg-white border border-blue-100 text-slate-700">
            Total Active:{' '}
            <strong className="text-emerald-600">{formatDuration(totalActiveSeconds)}</strong>
          </span>
          <span className="px-2.5 py-1.5 rounded-lg bg-white border border-blue-100 text-slate-700">
            Avg Marks: <strong className="text-blue-600">{averageMarks} / 50</strong>
          </span>
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-blue-50/60 border border-blue-200 text-slate-800 text-xs focus:outline-hidden focus:border-blue-500 font-mono"
          >
            <option value="all">All Languages</option>
            <option value="c">C</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
          </select>
        </div>
      </div>

      {/* Search Input */}
      <div className="bg-white border border-blue-100 rounded-xl p-3">
        <div className="relative max-w-md">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by experiment or subject title..."
            className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-blue-50/60 border border-blue-200 text-slate-800 text-xs focus:outline-hidden focus:border-blue-500"
          />
        </div>
      </div>

      {/* Detailed Previous Lab Reports List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white border border-blue-100 rounded-xl p-12 text-center text-xs text-slate-600">
            No previous lab reports found for the applied criteria.
          </div>
        ) : (
          filtered.map((report) => {
            const finalScore = report.facultyApprovedScore ?? report.score ?? 0;
            const isExpanded = expandedReportId === report.id;
            const evalData = report.aiEvaluation;

            return (
              <div
                key={report.id}
                className="bg-white border border-blue-100 rounded-xl overflow-hidden shadow-md hover:border-blue-200 transition-colors"
              >
                <div className="p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left: Program & Subject Info */}
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[11px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                        {report.programmingLanguage}
                      </span>
                      <span className="text-xs text-slate-600">{report.subjectName}</span>
                      <span className="text-[11px] font-mono text-slate-500">
                        · {formatDateLabel(report.sessionStartTime)}
                      </span>
                      <span
                        className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border ${
                          report.status === 'completed'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}
                      >
                        {report.status === 'completed' ? 'Completed' : 'In Session'}
                      </span>
                    </div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900">
                      {report.experimentName}
                    </h3>
                    {(report.facultyFeedback || report.feedback) && (
                      <p className="text-xs text-slate-600">
                        <span className="text-emerald-600 font-semibold">Faculty Remark: </span>
                        {report.facultyFeedback || report.feedback}
                      </p>
                    )}
                  </div>

                  {/* Right: Active Time, Test Cases, Allocated Marks, Breakdown & Inspect Code */}
                  <div className="flex flex-wrap items-center gap-4 sm:gap-5 shrink-0">
                    <div className="text-left sm:text-right">
                      <span className="text-[10px] font-mono uppercase text-slate-600 block">
                        Active Lab Time
                      </span>
                      <span className="text-sm font-mono font-bold text-emerald-600 tabular-nums">
                        {formatDuration(report.activeTimeSeconds)}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500 block">
                        Idle: {formatDuration(report.idleTimeSeconds)}
                      </span>
                    </div>

                    <div className="text-left sm:text-right">
                      <span className="text-[10px] font-mono uppercase text-slate-600 block">
                        Test Cases
                      </span>
                      <span className="text-sm font-mono font-bold text-blue-600 tabular-nums">
                        {report.testCasesPassed} / {report.totalTestCases} Passed
                      </span>
                      <span className="text-[10px] font-mono text-slate-500 block">
                        {report.programExecutions} runs
                      </span>
                    </div>

                    <div className="px-3.5 py-2 rounded-xl bg-[#f4f8ff] border border-blue-100 text-right min-w-[115px]">
                      <span className="text-[10px] font-mono uppercase text-slate-600 flex items-center justify-end gap-1">
                        {report.isFacultyApproved ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span className="text-emerald-600">Allocated Marks</span>
                          </>
                        ) : (
                          <>
                            <Award className="w-3 h-3 text-blue-600" />
                            <span className="text-blue-600">AI Suggested</span>
                          </>
                        )}
                      </span>
                      <span className="text-lg font-mono font-bold text-slate-900 tabular-nums">
                        {finalScore}
                        <span className="text-xs font-normal text-slate-600"> / 50</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedReportId(isExpanded ? null : report.id)
                        }
                        className="px-3 py-2 rounded-lg bg-blue-100 hover:bg-blue-100 text-xs font-semibold text-slate-800 border border-blue-200 flex items-center gap-1 cursor-pointer"
                      >
                        <span>{isExpanded ? 'Hide Breakdown' : 'Marks Breakdown'}</span>
                        {isExpanded ? (
                          <ChevronUp className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" />
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedSessionModal(report)}
                        className="px-3 py-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Code</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded Marks Breakdown */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-3 border-t border-blue-100 bg-[#f4f8ff]/60 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-slate-600">
                      <div className="flex flex-wrap items-center gap-4">
                        <span className="flex items-center gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                          Login: <strong className="text-slate-800">{report.loginTime}</strong>
                        </span>
                        <span>
                          Logout:{' '}
                          <strong className="text-slate-800">
                            {report.logoutTime || 'Completed'}
                          </strong>
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Terminal className="w-3.5 h-3.5 text-blue-600" />
                          Total Dwell:{' '}
                          <strong className="text-slate-800">
                            {formatDuration(report.totalDurationSeconds)}
                          </strong>
                        </span>
                      </div>
                      {evalData?.codeQualitySummary && (
                        <span className="text-[11px] text-blue-600">
                          {evalData.codeQualitySummary}
                        </span>
                      )}
                    </div>

                    {evalData && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
                        {[
                          evalData.activeParticipation,
                          evalData.problemUnderstanding,
                          evalData.codeImplementation,
                          evalData.testCaseResults,
                          evalData.assignmentCompletion,
                        ].map((criterion, idx) => (
                          <div
                            key={idx}
                            className="p-2.5 rounded-lg bg-blue-50/60 border border-blue-100 space-y-1.5"
                          >
                            <div className="flex items-center justify-between gap-1 text-[11px]">
                              <span
                                className="font-semibold text-slate-800 truncate"
                                title={criterion.criteriaName}
                              >
                                {criterion.criteriaName}
                              </span>
                              <span className="font-mono font-bold text-emerald-600 shrink-0 tabular-nums">
                                {criterion.marksAwarded}/{criterion.maxMarks}
                              </span>
                            </div>
                            <div className="w-full bg-blue-100 rounded-full h-1 overflow-hidden">
                              <div
                                className="bg-emerald-500 h-full rounded-full"
                                style={{
                                  width: `${Math.round(
                                    (criterion.marksAwarded / criterion.maxMarks) * 100
                                  )}%`,
                                }}
                              />
                            </div>
                            <p className="text-[10px] text-slate-600 leading-snug line-clamp-2">
                              {criterion.explanation}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Session Details Modal */}
      {selectedSessionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-2xl bg-white border border-blue-200 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 bg-[#f4f8ff] border-b border-blue-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase text-blue-600">
                  {selectedSessionModal.programmingLanguage} · Semester {selectedSessionModal.semesterNumber} {selectedSessionModal.batch}
                </span>
                <h3 className="text-sm font-bold text-slate-900 mt-0.5">
                  {selectedSessionModal.experimentName}
                </h3>
              </div>
              <button
                onClick={() => setSelectedSessionModal(null)}
                className="p-1 rounded-md text-slate-600 hover:text-slate-900 hover:bg-blue-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 rounded-lg bg-blue-50/60 border border-blue-100 font-mono text-[11px]">
                <div>
                  <span className="text-slate-500 block">Total Duration:</span>
                  <span className="text-slate-800">{formatDuration(selectedSessionModal.totalDurationSeconds)}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Active Typing:</span>
                  <span className="text-emerald-600 font-semibold">{formatDuration(selectedSessionModal.activeTimeSeconds)}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Idle Periods:</span>
                  <span className="text-slate-600">{formatDuration(selectedSessionModal.idleTimeSeconds)}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Allocated Marks:</span>
                  <span className="text-blue-600 font-semibold">
                    {selectedSessionModal.facultyApprovedScore ?? selectedSessionModal.score ?? 0} / 50
                  </span>
                </div>
              </div>

              {(selectedSessionModal.facultyFeedback || selectedSessionModal.feedback) && (
                <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 text-blue-800">
                  <span className="font-semibold block mb-0.5">Teacher Feedback:</span>
                  <p className="text-slate-700">
                    {selectedSessionModal.facultyFeedback || selectedSessionModal.feedback}
                  </p>
                </div>
              )}

              <div>
                <span className="font-semibold uppercase tracking-wider text-[10px] text-slate-600 block mb-1.5 font-mono">
                  Saved Laboratory Program Code
                </span>
                <pre className="p-4 rounded-lg bg-[#f4f8ff] border border-blue-100 font-mono text-[11px] text-slate-800 overflow-x-auto whitespace-pre leading-relaxed max-h-72">
                  {selectedSessionModal.currentCode}
                </pre>
              </div>
            </div>

            <div className="px-6 py-3 bg-[#f4f8ff] border-t border-blue-100 flex justify-end">
              <button
                onClick={() => setSelectedSessionModal(null)}
                className="py-1.5 px-4 rounded-lg bg-blue-100 hover:bg-blue-100 text-slate-700 text-xs font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
