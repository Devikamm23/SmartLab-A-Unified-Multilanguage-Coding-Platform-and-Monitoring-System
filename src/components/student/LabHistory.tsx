import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StudentLabSession } from '../../types';
import {
  History,
  Search,
  Filter,
  Eye,
  X,
  Clock,
  Cpu,
  CheckCircle2,
  XCircle,
  FileCode2,
} from 'lucide-react';

export const LabHistory: React.FC = () => {
  const { currentUser, studentLabSessions } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  const [selectedSessionModal, setSelectedSessionModal] = useState<StudentLabSession | null>(null);

  const mySessions = studentLabSessions.filter((s) => s.studentId === currentUser?.id);

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
    return `${m}m ${s}s`;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Student Lab History & Telemetry</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Audit log of all laboratory sessions, active editing times, and execution counts
          </p>
        </div>

        {/* Filter controls */}
        <div className="flex items-center gap-2">
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-hidden focus:border-sky-500 font-mono"
          >
            <option value="all">All Languages</option>
            <option value="c">C</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
          </select>
        </div>
      </div>

      {/* Search Input */}
      <div className="bg-[#0e1738] border border-slate-800 rounded-xl p-3">
        <div className="relative max-w-md">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by experiment or subject title..."
            className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-hidden focus:border-sky-500"
          />
        </div>
      </div>

      {/* Lab History Table */}
      <div className="bg-[#0e1738] border border-slate-800 rounded-xl overflow-hidden shadow-md">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            No lab history records found for the applied criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-[#090f22] border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10px] font-mono">
                  <th className="py-3 px-4">Experiment Name</th>
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4">Language</th>
                  <th className="py-3 px-4 text-right">Total Duration</th>
                  <th className="py-3 px-4 text-right">Active Time</th>
                  <th className="py-3 px-4 text-right">Idle Time</th>
                  <th className="py-3 px-4 text-right">Compilations</th>
                  <th className="py-3 px-4 text-right">Executions</th>
                  <th className="py-3 px-4 text-center">Score</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 font-mono text-[11px]">
                {filtered.map((ses) => (
                  <tr key={ses.id} className="hover:bg-slate-900/50 transition-colors">
                    <td className="py-3 px-4 font-sans font-semibold text-slate-200 max-w-[180px] truncate">
                      {ses.experimentName}
                    </td>
                    <td className="py-3 px-4 font-sans text-slate-400 max-w-[180px] truncate">
                      {ses.subjectName}
                    </td>
                    <td className="py-3 px-4 uppercase text-sky-400 font-bold">
                      {ses.programmingLanguage}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-300 tabular-nums">
                      {formatDuration(ses.totalDurationSeconds)}
                    </td>
                    <td className="py-3 px-4 text-right text-emerald-400 font-semibold tabular-nums">
                      {formatDuration(ses.activeTimeSeconds)}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-400 tabular-nums">
                      {formatDuration(ses.idleTimeSeconds)}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-300 tabular-nums">
                      {ses.compilationAttempts} ({ses.successfulCompilations} OK / {ses.failedCompilations} ERR)
                    </td>
                    <td className="py-3 px-4 text-right text-slate-300 tabular-nums">
                      {ses.programExecutions}
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-slate-200 tabular-nums">
                      {ses.score !== undefined ? `${ses.score} / 50` : 'Pending'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => setSelectedSessionModal(ses)}
                        className="py-1 px-2.5 rounded bg-slate-800 hover:bg-slate-700 text-sky-300 text-xs font-medium transition-colors inline-flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Session Details Modal */}
      {selectedSessionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
          <div className="w-full max-w-2xl bg-[#0e1738] border border-slate-700 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 bg-[#090f22] border-b border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase text-sky-400">
                  {selectedSessionModal.programmingLanguage} · Semester {selectedSessionModal.semesterNumber} {selectedSessionModal.batch}
                </span>
                <h3 className="text-sm font-bold text-white mt-0.5">
                  {selectedSessionModal.experimentName}
                </h3>
              </div>
              <button
                onClick={() => setSelectedSessionModal(null)}
                className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 rounded-lg bg-slate-900 border border-slate-800 font-mono text-[11px]">
                <div>
                  <span className="text-slate-500 block">Total Duration:</span>
                  <span className="text-slate-200">{formatDuration(selectedSessionModal.totalDurationSeconds)}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Active Typing:</span>
                  <span className="text-emerald-400 font-semibold">{formatDuration(selectedSessionModal.activeTimeSeconds)}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Idle Periods:</span>
                  <span className="text-slate-400">{formatDuration(selectedSessionModal.idleTimeSeconds)}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Clipboard Alerts:</span>
                  <span className="text-amber-400 font-semibold">{selectedSessionModal.clipboardViolationCount}</span>
                </div>
              </div>

              {selectedSessionModal.feedback && (
                <div className="p-3 rounded-lg bg-sky-950/30 border border-sky-500/30 text-sky-200">
                  <span className="font-semibold block mb-0.5">Teacher Feedback:</span>
                  <p className="text-slate-300">{selectedSessionModal.feedback}</p>
                </div>
              )}

              <div>
                <span className="font-semibold uppercase tracking-wider text-[10px] text-slate-400 block mb-1.5 font-mono">
                  Saved Laboratory Program Code
                </span>
                <pre className="p-4 rounded-lg bg-[#070b19] border border-slate-800 font-mono text-[11px] text-slate-200 overflow-x-auto whitespace-pre leading-relaxed max-h-72">
                  {selectedSessionModal.currentCode}
                </pre>
              </div>
            </div>

            <div className="px-6 py-3 bg-[#090f22] border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedSessionModal(null)}
                className="py-1.5 px-4 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
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
