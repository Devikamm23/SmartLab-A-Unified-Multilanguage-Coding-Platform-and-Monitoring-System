import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { BatchName } from '../../types';
import {
  Users2,
  Search,
  Filter,
  GraduationCap,
  Layers,
  Clock,
  CheckCircle2,
  BookOpen,
} from 'lucide-react';

export const MyBatches: React.FC = () => {
  const { users, batches, studentLabSessions, currentUser } = useApp();

  const [selectedSemester, setSelectedSemester] = useState<number>(5);
  const [selectedBatch, setSelectedBatch] = useState<BatchName>('Batch A');
  const [searchQuery, setSearchQuery] = useState('');

  const students = users.filter((u) => u.role === 'student');

  const filteredStudents = students.filter((st) => {
    const sem = st.semester || st.currentSemester || 5;
    const matchesSem = sem === selectedSemester;
    const matchesBatch = st.batch === selectedBatch;
    const matchesSearch =
      st.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (st.usn && st.usn.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesSem && matchesBatch && matchesSearch;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Assigned Student Batches</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage and inspect enrolled students across Semesters 1–8 and Batches A, B, and C (20+ students per batch)
          </p>
        </div>

        {/* Semester selector (Semesters 1–8) */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-slate-400 font-mono">Semester:</span>
          <div className="flex flex-wrap rounded-lg bg-slate-900 border border-slate-800 p-1 gap-0.5">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
              <button
                key={sem}
                onClick={() => setSelectedSemester(sem)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                  selectedSemester === sem
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Sem {sem}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Batch A / B / C Selector Tabs */}
      <div className="flex rounded-xl bg-slate-900 border border-slate-800 p-1.5 gap-2">
        {(['Batch A', 'Batch B', 'Batch C'] as BatchName[]).map((batch) => {
          const count = students.filter(
            (s) => (s.semester || s.currentSemester || 5) === selectedSemester && s.batch === batch
          ).length;

          return (
            <button
              key={batch}
              onClick={() => setSelectedBatch(batch)}
              className={`flex-1 py-2.5 px-4 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                selectedBatch === batch
                  ? 'bg-sky-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <span>{batch}</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-black/30 text-sky-200">
                {count} Students
              </span>
            </button>
          );
        })}
      </div>

      {/* Search Input */}
      <div className="bg-[#0e1738] border border-slate-800 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative max-w-md w-full">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search students in Semester ${selectedSemester} ${selectedBatch}...`}
            className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-hidden focus:border-sky-500"
          />
        </div>
        <div className="text-[11px] font-mono text-slate-400">
          Showing <span className="text-sky-400 font-bold">{filteredStudents.length}</span> enrolled students · Semester {selectedSemester} {selectedBatch}
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-[#0e1738] border border-slate-800 rounded-xl overflow-hidden shadow-md">
        {filteredStudents.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            No students enrolled under Semester {selectedSemester} - {selectedBatch}.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-[#090f22] border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10px] font-mono">
                  <th className="py-3 px-4">#</th>
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4">USN</th>
                  <th className="py-3 px-4">Institutional Email</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4 text-center">Batch</th>
                  <th className="py-3 px-4 text-right">Lab Sessions</th>
                  <th className="py-3 px-4 text-center">Live Activity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 font-mono text-[11px]">
                {filteredStudents.map((st, idx) => {
                  const sessions = studentLabSessions.filter((s) => s.studentId === st.id);
                  const latestSession = sessions[0];
                  const actStatus = latestSession?.activityStatus;

                  const badgeStyle =
                    actStatus === 'Typing'
                      ? 'bg-emerald-950 text-emerald-400 border-emerald-500/30'
                      : actStatus === 'Compiling'
                      ? 'bg-orange-950 text-orange-400 border-orange-500/30'
                      : actStatus === 'Idle'
                      ? 'bg-amber-950 text-amber-400 border-amber-500/30'
                      : actStatus === 'Viewing'
                      ? 'bg-sky-950 text-sky-400 border-sky-500/30'
                      : actStatus === 'Submitted'
                      ? 'bg-purple-950 text-purple-400 border-purple-500/30'
                      : 'bg-slate-900 text-slate-500 border-slate-800';

                  return (
                    <tr key={st.id} className="hover:bg-slate-900/50 transition-colors">
                      <td className="py-3 px-4 text-slate-500 tabular-nums">{idx + 1}</td>
                      <td className="py-3 px-4 font-sans font-semibold text-slate-200 flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-sky-300 shrink-0">
                          {st.name.charAt(0)}
                        </div>
                        <span>{st.name}</span>
                      </td>
                      <td className="py-3 px-4 font-bold text-sky-400">{st.usn}</td>
                      <td className="py-3 px-4 text-slate-400">{st.email}</td>
                      <td className="py-3 px-4 font-sans text-slate-300">{st.department}</td>
                      <td className="py-3 px-4 text-center">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 font-bold border border-slate-700">
                          {st.batch}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right text-slate-300 tabular-nums">
                        {sessions.length} records
                      </td>
                      <td className="py-3 px-4 text-center">
                        {actStatus ? (
                          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded border font-bold text-[10px] ${badgeStyle}`}>
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                actStatus === 'Typing'
                                  ? 'bg-emerald-400 animate-ping'
                                  : actStatus === 'Compiling'
                                  ? 'bg-orange-400 animate-pulse'
                                  : actStatus === 'Idle'
                                  ? 'bg-amber-400'
                                  : actStatus === 'Viewing'
                                  ? 'bg-sky-400'
                                  : 'bg-purple-400'
                              }`}
                            />
                            <span>{actStatus}</span>
                          </span>
                        ) : (
                          <span className="text-slate-500 text-[10px]">Offline</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
