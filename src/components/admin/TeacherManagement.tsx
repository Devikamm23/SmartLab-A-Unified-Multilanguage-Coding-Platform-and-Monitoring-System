import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { User } from '../../types';
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

export const TeacherManagement: React.FC = () => {
  const { users, addTeacher, updateTeacher, deleteTeacher } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeacherId, setEditingTeacherId] = useState<string | null>(null);
  const [syncBanner, setSyncBanner] = useState<{
    type: 'success' | 'warning';
    text: string;
    needsSql?: boolean;
  } | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [employeeCode, setEmployeeCode] = useState('');
  const [designation, setDesignation] = useState('Assistant Professor');
  const [department, setDepartment] = useState('Information Science & Engineering');

  const teachers = users.filter((u) => u.role === 'teacher');

  const filtered = teachers.filter(
    (t) =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.employeeCode && t.employeeCode.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleOpenAdd = () => {
    setEditingTeacherId(null);
    setName('');
    setEmail('');
    setEmployeeCode(`FAC-ISE-${Math.floor(100 + Math.random() * 900)}`);
    setDesignation('Assistant Professor');
    setDepartment('Information Science & Engineering');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (t: User) => {
    setEditingTeacherId(t.id);
    setName(t.name);
    setEmail(t.email);
    setEmployeeCode(t.employeeCode || '');
    setDesignation(t.designation || 'Assistant Professor');
    setDepartment(t.department || 'Information Science & Engineering');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTeacherId) {
      updateTeacher(editingTeacherId, {
        name,
        email,
        employeeCode,
        designation,
        department,
      });
      setIsModalOpen(false);
    } else {
      const res = await addTeacher({
        name,
        email,
        employeeCode,
        designation,
        department,
      });
      setIsModalOpen(false);
      if (res.syncedToSupabase) {
        setSyncBanner({
          type: 'success',
          text: `${name} registered and saved to Supabase "faculty" table.`,
        });
      } else {
        setSyncBanner({
          type: 'warning',
          text: `${name} added locally, but Supabase returned: ${res.errorMessage || 'RLS policy required'}.`,
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
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Faculty & Teacher Staff Management</h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Register laboratory in-charges, assign course workloads, and manage faculty credentials
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="py-2 px-4 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-md shadow-indigo-600/20 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Faculty Member</span>
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

      {/* Search Input */}
      <div className="bg-white border border-blue-100 rounded-xl p-3">
        <div className="relative max-w-md">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search faculty by name, employee code, email..."
            className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-blue-50/60 border border-blue-200 text-slate-800 text-xs focus:outline-hidden focus:border-blue-500"
          />
        </div>
      </div>

      {/* Teachers Table */}
      <div className="bg-white border border-blue-100 rounded-xl overflow-hidden shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-[#f4f8ff] border-b border-blue-100 text-slate-600 font-semibold uppercase tracking-wider text-[10px] font-mono">
                <th className="py-3 px-4">Faculty Name</th>
                <th className="py-3 px-4">Employee Code</th>
                <th className="py-3 px-4">Designation</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-100 font-mono text-[11px]">
              {filtered.map((t) => (
                <tr key={t.id} className="hover:bg-[#f4f8ff] transition-colors">
                  <td className="py-3 px-4 font-sans font-bold text-slate-800 flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center font-bold text-xs text-blue-700">
                      {t.name.charAt(0)}
                    </div>
                    <span>{t.name}</span>
                  </td>
                  <td className="py-3 px-4 font-bold text-blue-600">{t.employeeCode}</td>
                  <td className="py-3 px-4 font-sans text-slate-700">{t.designation}</td>
                  <td className="py-3 px-4 text-slate-600">{t.email}</td>
                  <td className="py-3 px-4 font-sans text-slate-600">{t.department}</td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => handleOpenEdit(t)}
                        className="p-1.5 rounded bg-blue-100 hover:bg-blue-100 text-slate-700 hover:text-slate-900"
                        title="Edit teacher"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Delete teacher ${t.name}?`)) {
                            deleteTeacher(t.id);
                          }
                        }}
                        className="p-1.5 rounded bg-blue-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600"
                        title="Delete teacher"
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

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white border border-blue-200 rounded-2xl shadow-2xl overflow-hidden">
            <div className="px-6 py-4 bg-[#f4f8ff] border-b border-blue-100 flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">
                {editingTeacherId ? 'Edit Faculty Account' : 'Register Faculty Member'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-600 hover:text-slate-900">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Full Name with Title</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-blue-50/60 border border-blue-200 text-slate-800 text-xs focus:outline-hidden focus:border-blue-500"
                  placeholder="e.g. Dr Girish S C"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Employee Code</label>
                  <input
                    type="text"
                    required
                    value={employeeCode}
                    onChange={(e) => setEmployeeCode(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-blue-50/60 border border-blue-200 text-slate-800 font-mono text-xs focus:outline-hidden focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-blue-50/60 border border-blue-200 text-slate-800 text-xs focus:outline-hidden focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Academic Designation</label>
                <input
                  type="text"
                  required
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-blue-50/60 border border-blue-200 text-slate-800 text-xs focus:outline-hidden focus:border-blue-500"
                  placeholder="e.g. Associate Professor & Lab In-Charge"
                />
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
                  className="py-1.5 px-5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20"
                >
                  Save Faculty Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
