import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { BatchName, User } from '../../types';
import {
  Plus,
  Search,
  Trash2,
  Edit2,
  CheckCircle2,
  Database,
  Copy,
  Check,
} from 'lucide-react';
import { SUPABASE_RLS_FIX_SQL } from '../../services/registrationService';

export const StudentManagement: React.FC = () => {
  const { users, addStudent, updateStudent, deleteStudent } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSemesterFilter, setSelectedSemesterFilter] = useState<string>('all');
  const [selectedBatchFilter, setSelectedBatchFilter] = useState<string>('all');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);

  // Sync feedback
  const [syncBanner, setSyncBanner] = useState<{
    type: 'success' | 'warning';
    text: string;
    needsSql?: boolean;
  } | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);

  // Form inputs
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [usn, setUsn] = useState('');
  const [semester, setSemester] = useState<number>(5);
  const [batch, setBatch] = useState<BatchName>('Batch A');
  const [department, setDepartment] = useState('Information Science & Engineering');

  const students = users.filter((u) => u.role === 'student');

  const filtered = students.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.usn && s.usn.toLowerCase().includes(searchQuery.toLowerCase())) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSem = selectedSemesterFilter === 'all' || s.semester === Number(selectedSemesterFilter);
    const matchesBatch = selectedBatchFilter === 'all' || s.batch === selectedBatchFilter;

    return matchesSearch && matchesSem && matchesBatch;
  });

  const handleOpenAdd = () => {
    setEditingStudentId(null);
    setFullName('');
    setEmail('');
    setUsn('');
    setSemester(5);
    setBatch('Batch A');
    setDepartment('Information Science & Engineering');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (student: User) => {
    setEditingStudentId(student.id);
    setFullName(student.name);
    setEmail(student.email);
    setUsn(student.usn || '');
    setSemester(student.semester || 5);
    setBatch(student.batch || 'Batch A');
    setDepartment(student.department);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingStudentId) {
      updateStudent(editingStudentId, {
        name: fullName,
        email,
        usn: usn.toUpperCase(),
        semester,
        batch,
        department,
      });
      setIsModalOpen(false);
    } else {
      const res = await addStudent({
        name: fullName,
        email,
        usn: usn.toUpperCase(),
        semester,
        batch,
        department,
      });
      setIsModalOpen(false);
      if (res.syncedToSupabase) {
        setSyncBanner({
          type: 'success',
          text: `${fullName} (${usn.toUpperCase()}) enrolled and saved to Supabase "students" table.`,
        });
      } else {
        setSyncBanner({
          type: 'warning',
          text: `${fullName} enrolled locally, but Supabase returned: ${res.errorMessage || 'RLS policy required'}.`,
          needsSql: res.needsRlsPolicy,
        });
      }
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Student Account Management</h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Enroll students, assign mandatory semesters, and allocate Batch A, B, or C
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="py-2 px-4 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-md shadow-sky-600/20 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Enroll New Student</span>
        </button>
      </div>

      {syncBanner && (
        <div
          className={`p-3.5 rounded-xl border text-xs space-y-2 ${
            syncBanner.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-amber-50 border-amber-200 text-amber-900'
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 font-medium">
              {syncBanner.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <Database className="w-4 h-4 text-amber-700 shrink-0" />
              )}
              <span>{syncBanner.text}</span>
            </div>
            <button
              onClick={() => setSyncBanner(null)}
              className="text-slate-500 hover:text-slate-800 font-bold"
            >
              ✕
            </button>
          </div>
          {syncBanner.needsSql && (
            <div className="bg-white border border-amber-200 rounded-lg p-2.5">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-mono text-slate-600">
                  Run once in Supabase SQL Editor to enable writes:
                </span>
                <button
                  type="button"
                  onClick={async () => {
                    await navigator.clipboard.writeText(SUPABASE_RLS_FIX_SQL);
                    setCopiedSql(true);
                    setTimeout(() => setCopiedSql(false), 2000);
                  }}
                  className="text-[10px] font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  {copiedSql ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedSql ? 'Copied' : 'Copy SQL'}</span>
                </button>
              </div>
              <pre className="text-[10px] font-mono text-slate-700 whitespace-pre-wrap">
                {SUPABASE_RLS_FIX_SQL}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3 bg-white border border-blue-100 rounded-xl p-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search student by name, USN, institutional email..."
            className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-blue-50/60 border border-blue-200 text-slate-800 text-xs focus:outline-hidden focus:border-blue-500"
          />
        </div>

        <select
          value={selectedSemesterFilter}
          onChange={(e) => setSelectedSemesterFilter(e.target.value)}
          className="px-3 py-1.5 rounded-lg bg-blue-50/60 border border-blue-200 text-slate-800 text-xs font-mono focus:outline-hidden focus:border-blue-500"
        >
          <option value="all">All Semesters</option>
          <option value="3">Semester 3</option>
          <option value="4">Semester 4</option>
          <option value="5">Semester 5</option>
          <option value="6">Semester 6</option>
        </select>

        <select
          value={selectedBatchFilter}
          onChange={(e) => setSelectedBatchFilter(e.target.value)}
          className="px-3 py-1.5 rounded-lg bg-blue-50/60 border border-blue-200 text-slate-800 text-xs font-mono focus:outline-hidden focus:border-blue-500"
        >
          <option value="all">All Batches</option>
          <option value="Batch A">Batch A</option>
          <option value="Batch B">Batch B</option>
          <option value="Batch C">Batch C</option>
        </select>
      </div>

      {/* Students Table */}
      <div className="bg-white border border-blue-100 rounded-xl overflow-hidden shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-[#f4f8ff] border-b border-blue-100 text-slate-600 font-semibold uppercase tracking-wider text-[10px] font-mono">
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4">USN</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4 text-center">Semester</th>
                <th className="py-3 px-4 text-center">Allocated Batch</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-100 font-mono text-[11px]">
              {filtered.map((st) => (
                <tr key={st.id} className="hover:bg-[#f4f8ff] transition-colors">
                  <td className="py-3 px-4 font-sans font-bold text-slate-800">
                    {st.name}
                  </td>
                  <td className="py-3 px-4 font-bold text-blue-600">{st.usn}</td>
                  <td className="py-3 px-4 text-slate-600">{st.email}</td>
                  <td className="py-3 px-4 text-center text-slate-700">Sem {st.semester}</td>
                  <td className="py-3 px-4 text-center">
                    <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700 border border-blue-200 font-bold">
                      {st.batch}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-sans text-slate-600">{st.department}</td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => handleOpenEdit(st)}
                        className="p-1.5 rounded bg-blue-100 hover:bg-blue-100 text-slate-700 hover:text-slate-900"
                        title="Edit student profile"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Remove student ${st.name} (${st.usn})?`)) {
                            deleteStudent(st.id);
                          }
                        }}
                        className="p-1.5 rounded bg-blue-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600"
                        title="Delete student"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Student Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white border border-blue-200 rounded-2xl shadow-2xl overflow-hidden">
            <div className="px-6 py-4 bg-[#f4f8ff] border-b border-blue-100 flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">
                {editingStudentId ? 'Edit Student Profile' : 'Enroll New Student'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-600 hover:text-slate-900">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Full Legal Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-blue-50/60 border border-blue-200 text-slate-800 text-xs focus:outline-hidden focus:border-blue-500"
                  placeholder="e.g. Priya Patel"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">University USN</label>
                  <input
                    type="text"
                    required
                    value={usn}
                    onChange={(e) => setUsn(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-blue-50/60 border border-blue-200 text-slate-800 font-mono text-xs focus:outline-hidden focus:border-blue-500"
                    placeholder="4GW21CS099"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Institutional Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-blue-50/60 border border-blue-200 text-slate-800 text-xs focus:outline-hidden focus:border-blue-500"
                    placeholder="priya@gsss.edu.in"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Assigned Semester</label>
                  <select
                    value={semester}
                    onChange={(e) => setSemester(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-blue-50/60 border border-blue-200 text-slate-800 text-xs focus:outline-hidden focus:border-blue-500 font-mono"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                      <option key={s} value={s}>Semester {s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Assigned Batch</label>
                  <select
                    value={batch}
                    onChange={(e) => setBatch(e.target.value as BatchName)}
                    className="w-full px-3 py-2 rounded-lg bg-blue-50/60 border border-blue-200 text-slate-800 text-xs focus:outline-hidden focus:border-blue-500 font-mono font-bold"
                  >
                    <option value="Batch A">Batch A</option>
                    <option value="Batch B">Batch B</option>
                    <option value="Batch C">Batch C</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Department</label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-blue-50/60 border border-blue-200 text-slate-800 text-xs focus:outline-hidden focus:border-blue-500"
                >
                  <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                  <option value="Information Science & Engineering">Information Science & Engineering</option>
                  <option value="Artificial Intelligence & Data Science">AI & Data Science</option>
                </select>
              </div>

              <div className="pt-3 border-t border-blue-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="py-1.5 px-4 rounded-lg bg-blue-100 text-slate-700 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-1.5 px-5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-sky-600/20"
                >
                  {editingStudentId ? 'Save Changes' : 'Enroll Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
