import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { BatchName, User } from '../../types';
import {
  Users2,
  Plus,
  Search,
  Trash2,
  Edit2,
  BookOpen,
} from 'lucide-react';

export const TeacherManagement: React.FC = () => {
  const { users, subjects, addTeacher, updateTeacher, deleteTeacher } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeacherId, setEditingTeacherId] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [employeeCode, setEmployeeCode] = useState('');
  const [designation, setDesignation] = useState('Assistant Professor');
  const [department, setDepartment] = useState('Computer Science & Engineering');

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
    setEmployeeCode(`TCH-CSE-${Math.floor(100 + Math.random() * 900)}`);
    setDesignation('Assistant Professor');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (t: User) => {
    setEditingTeacherId(t.id);
    setName(t.name);
    setEmail(t.email);
    setEmployeeCode(t.employeeCode || '');
    setDesignation(t.designation || 'Assistant Professor');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTeacherId) {
      updateTeacher(editingTeacherId, {
        name,
        email,
        employeeCode,
        designation,
        department,
      });
    } else {
      addTeacher({
        name,
        email,
        employeeCode,
        designation,
        department,
      });
    }
    setIsModalOpen(false);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Faculty & Teacher Staff Management</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Register laboratory in-charges, assign course workloads, and manage faculty credentials
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="py-2 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-md shadow-indigo-600/20 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Faculty Member</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="bg-[#0e1738] border border-slate-800 rounded-xl p-3">
        <div className="relative max-w-md">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search faculty by name, employee code, email..."
            className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-hidden focus:border-sky-500"
          />
        </div>
      </div>

      {/* Teachers Table */}
      <div className="bg-[#0e1738] border border-slate-800 rounded-xl overflow-hidden shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-[#090f22] border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10px] font-mono">
                <th className="py-3 px-4">Faculty Name</th>
                <th className="py-3 px-4">Employee Code</th>
                <th className="py-3 px-4">Designation</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 font-mono text-[11px]">
              {filtered.map((t) => (
                <tr key={t.id} className="hover:bg-slate-900/50 transition-colors">
                  <td className="py-3 px-4 font-sans font-bold text-slate-200 flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-indigo-300">
                      {t.name.charAt(0)}
                    </div>
                    <span>{t.name}</span>
                  </td>
                  <td className="py-3 px-4 font-bold text-indigo-400">{t.employeeCode}</td>
                  <td className="py-3 px-4 font-sans text-slate-300">{t.designation}</td>
                  <td className="py-3 px-4 text-slate-400">{t.email}</td>
                  <td className="py-3 px-4 font-sans text-slate-400">{t.department}</td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => handleOpenEdit(t)}
                        className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
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
                        className="p-1.5 rounded bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-[#0e1738] border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
            <div className="px-6 py-4 bg-[#090f22] border-b border-slate-800 flex items-center justify-between">
              <h2 className="text-base font-bold text-white">
                {editingTeacherId ? 'Edit Faculty Account' : 'Register Faculty Member'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-300 block mb-1">Full Name with Title</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-hidden focus:border-sky-500"
                  placeholder="e.g. Dr. Arvind Kulkarni"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Employee Code</label>
                  <input
                    type="text"
                    required
                    value={employeeCode}
                    onChange={(e) => setEmployeeCode(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 font-mono text-xs focus:outline-hidden focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-hidden focus:border-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Academic Designation</label>
                <input
                  type="text"
                  required
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-hidden focus:border-sky-500"
                  placeholder="e.g. Associate Professor & Lab In-Charge"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="py-1.5 px-4 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-1.5 px-5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20"
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
