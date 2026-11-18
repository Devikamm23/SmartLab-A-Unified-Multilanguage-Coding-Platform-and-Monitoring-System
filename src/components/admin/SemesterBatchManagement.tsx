import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { BatchName } from '../../types';
import {
  Layers,
  Plus,
  Users2,
  CheckCircle2,
  Calendar,
  Sparkles,
} from 'lucide-react';

export const SemesterBatchManagement: React.FC = () => {
  const { semesters, batches, users, addSemester } = useApp();

  const [newSemNumber, setNewSemNumber] = useState<number>(7);
  const [academicYear, setAcademicYear] = useState<string>('2026-2027');
  const [showAddModal, setShowAddModal] = useState(false);

  const students = users.filter((u) => u.role === 'student');

  const handleAddSemester = (e: React.FormEvent) => {
    e.preventDefault();
    addSemester(Number(newSemNumber), academicYear);
    setShowAddModal(false);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Semester & Batch Hierarchy Management</h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Configure academic semesters 1 through 8 with mandatory divisions: Batch A, Batch B, and Batch C
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="py-2 px-4 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-md shadow-amber-600/20 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Semester</span>
        </button>
      </div>

      {/* Semesters & Batches Grid */}
      <div className="space-y-6">
        {semesters.map((sem) => {
          const semBatches = batches.filter((b) => b.semesterNumber === sem.number);
          const semStudents = students.filter((s) => s.semester === sem.number);

          return (
            <div
              key={sem.id}
              className="bg-white border border-blue-100 rounded-2xl p-6 space-y-4 shadow-md"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-blue-100 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-amber-100 border border-amber-200 flex items-center justify-center font-bold text-amber-600">
                    S{sem.number}
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900 tracking-tight">
                      Semester {sem.number}
                    </h2>
                    <span className="text-[11px] text-slate-600 font-mono">
                      Academic Year {sem.academicYear} · Total Enrolled: {semStudents.length} Students
                    </span>
                  </div>
                </div>

                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Active Academic Term
                </span>
              </div>

              {/* Batches A, B, C Cards for this semester */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                {(['Batch A', 'Batch B', 'Batch C'] as BatchName[]).map((batchName) => {
                  const enrolledCount = semStudents.filter((s) => s.batch === batchName).length;
                  const capacity = 30;
                  const pct = Math.round((enrolledCount / capacity) * 100);

                  return (
                    <div
                      key={batchName}
                      className="p-4 rounded-xl bg-blue-50/60 border border-blue-100 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-blue-600 font-mono">{batchName}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-100 text-slate-700">
                          Capacity: {capacity}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-mono">
                          <span className="text-slate-600">Enrolled:</span>
                          <span className="text-slate-800 font-bold tabular-nums">
                            {enrolledCount} / {capacity}
                          </span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-[#f4f8ff] overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded-full transition-all"
                            style={{ width: `${Math.min(pct, 100)}%` }}
                          />
                        </div>
                      </div>

                      <div className="pt-2 border-t border-blue-100 flex items-center justify-between text-[11px] text-slate-600">
                        <span>Timetable Allocated</span>
                        <span className="text-emerald-600 font-mono">Verified</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Semester Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white border border-blue-200 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-blue-100 pb-2">
              <h3 className="font-bold text-slate-900 text-base">Configure New Semester</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-600 hover:text-slate-900">✕</button>
            </div>

            <form onSubmit={handleAddSemester} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Semester Number (1-8)</label>
                <input
                  type="number"
                  min="1"
                  max="8"
                  required
                  value={newSemNumber}
                  onChange={(e) => setNewSemNumber(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-blue-50/60 border border-blue-200 text-slate-800 font-mono text-xs focus:outline-hidden focus:border-amber-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Academic Year</label>
                <input
                  type="text"
                  required
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-blue-50/60 border border-blue-200 text-slate-800 font-mono text-xs focus:outline-hidden focus:border-amber-500"
                  placeholder="2026-2027"
                />
              </div>

              <div className="p-3 rounded-lg bg-blue-50/60 border border-blue-100 text-[11px] text-slate-600 space-y-1">
                <span className="font-bold text-slate-800 block">Automatic Provisioning:</span>
                <p>
                  Adding a semester will automatically provision <strong>Batch A, Batch B, and Batch C</strong> with default capacities.
                </p>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="py-1.5 px-3 rounded-lg bg-blue-100 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-1.5 px-4 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold"
                >
                  Provision Semester
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
