import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { COLLEGE_CONFIG } from '../../constants/college';
import {
  User,
  GraduationCap,
  Lock,
  Mail,
  Building,
  Calendar,
  Layers,
  ShieldCheck,
  Award,
  Phone,
  Edit3,
  Save,
  CheckCircle2,
  Camera,
  Info,
} from 'lucide-react';

export const StudentProfile: React.FC = () => {
  const { currentUser, studentLabSessions } = useApp();

  const mySessions = studentLabSessions.filter((s) => s.studentId === currentUser?.id);
  const totalActiveMinutes = Math.round(
    mySessions.reduce((acc, s) => acc + s.activeTimeSeconds, 0) / 60
  );

  // Editable permitted personal fields
  const [isEditing, setIsEditing] = useState(false);
  const [personalEmail, setPersonalEmail] = useState('devika.personal@gmail.com');
  const [phone, setPhone] = useState('+91 98450 12345');
  const [bio, setBio] = useState('Information Science & Engineering undergraduate passionate about algorithms, Python programming, and systems design.');
  const [avatarIndex, setAvatarIndex] = useState(0);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const avatars = ['👩‍💻', '👩‍🎓', '💻', '🚀', '🔬'];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditing(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Student Profile & Academic Identity</h1>
          <p className="text-xs text-slate-600 mt-0.5">
            Verified {COLLEGE_CONFIG.shortAcronym} enrollment records and student profile settings
          </p>
        </div>

        <button
          onClick={() => setIsEditing(!isEditing)}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors border ${
            isEditing
              ? 'bg-rose-100 text-rose-700 border-rose-200'
              : 'bg-blue-600 hover:bg-blue-500 text-white border-transparent shadow-sm'
          }`}
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>{isEditing ? 'Cancel Editing' : 'Edit Personal Details'}</span>
        </button>
      </div>

      {saveSuccess && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Personal details successfully updated and saved to student profile!</span>
        </div>
      )}

      {/* Main Profile Card */}
      <div className="bg-white border border-blue-100 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-start gap-5 border-b border-blue-100 pb-6">
          {/* Profile Photo / Avatar */}
          <div className="relative group shrink-0">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-blue-600 to-blue-500 flex items-center justify-center font-bold text-3xl text-white shadow-lg shadow-blue-500/20">
              {avatars[avatarIndex]}
            </div>
            {isEditing && (
              <button
                type="button"
                onClick={() => setAvatarIndex((prev) => (prev + 1) % avatars.length)}
                className="absolute -bottom-1 -right-1 p-1 rounded-full bg-blue-50/60 border border-blue-500 text-blue-700 text-xs shadow-md"
                title="Cycle Avatar"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">{currentUser?.name}</h2>
              <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                USN: {currentUser?.usn || '4GW24IS010'}
              </span>
            </div>

            <p className="text-xs font-medium text-slate-700">{COLLEGE_CONFIG.name}</p>
            <p className="text-xs text-slate-600">{COLLEGE_CONFIG.department}</p>

            <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
              <div className="text-[11px] text-emerald-600 font-mono flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Official Enrolled Student · Identity Verified</span>
              </div>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span className="text-[11px] font-mono text-blue-600">
                Admission Year: {currentUser?.admissionYear || 2024}
              </span>
            </div>
          </div>
        </div>

        {/* Academic Details Strip - Read-Only & Institutional */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider font-mono">
              Academic Cohort & Institution Records (Read-Only)
            </span>
            <div className="text-[11px] text-amber-600 flex items-center gap-1 font-mono">
              <Lock className="w-3.5 h-3.5" />
              <span>Locked by GSSSIETW Administration</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100 space-y-1">
              <span className="text-[11px] text-slate-500 uppercase font-mono block">Enrolled Semester</span>
              <div className="text-base font-bold text-slate-900 font-mono">
                Semester {currentUser?.semester || 5}
              </div>
              <p className="text-[10px] text-slate-500">
                Academic Year {currentUser?.academicYear || '2026-2027'}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100 space-y-1">
              <span className="text-[11px] text-slate-500 uppercase font-mono block">Assigned Laboratory Batch</span>
              <div className="text-base font-bold text-blue-600 font-mono">
                {currentUser?.batch || 'Batch A'}
              </div>
              <p className="text-[10px] text-slate-500">
                Section: Information Science & Engineering
              </p>
            </div>

            <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100 space-y-1">
              <span className="text-[11px] text-slate-500 uppercase font-mono block">Permanent USN</span>
              <div className="text-base font-bold text-emerald-600 font-mono">
                {currentUser?.usn || '4GW24IS010'}
              </div>
              <p className="text-[10px] text-slate-500">
                Immutable across all 8 academic semesters
              </p>
            </div>
          </div>
        </div>

        {/* Permitted Editable Details Section */}
        <form onSubmit={handleSave} className="space-y-4 pt-2 border-t border-blue-100">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider font-mono">
              Personal Information {isEditing ? '(Editing Enabled)' : '(Permitted Details)'}
            </span>
            {!isEditing && (
              <span className="text-[11px] text-slate-500 font-mono">
                Click &quot;Edit Personal Details&quot; to update
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-600 block mb-1">
                Institutional Email (Official, Locked)
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="email"
                  value={currentUser?.email || ''}
                  disabled
                  className="w-full pl-9 pr-3 py-2 rounded-lg bg-blue-50/60 border border-blue-100 text-slate-600 text-xs font-mono cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-600 block mb-1">
                Alternative Personal Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="email"
                  value={personalEmail}
                  onChange={(e) => setPersonalEmail(e.target.value)}
                  disabled={!isEditing}
                  className={`w-full pl-9 pr-3 py-2 rounded-lg text-xs font-mono transition-colors ${
                    isEditing
                      ? 'bg-blue-50/60 border border-blue-500 text-slate-800'
                      : 'bg-[#f4f8ff] border border-blue-100 text-slate-700'
                  }`}
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-600 block mb-1">
                Contact Phone Number
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={!isEditing}
                  className={`w-full pl-9 pr-3 py-2 rounded-lg text-xs font-mono transition-colors ${
                    isEditing
                      ? 'bg-blue-50/60 border border-blue-500 text-slate-800'
                      : 'bg-[#f4f8ff] border border-blue-100 text-slate-700'
                  }`}
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-600 block mb-1">
                Cumulative Lab Focus Time
              </label>
              <div className="p-2 rounded-lg bg-[#f4f8ff] border border-blue-100 text-xs font-mono text-emerald-600 flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-600" />
                <span>{totalActiveMinutes} minutes active coding</span>
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-600 block mb-1">
              Student Bio & Technical Specialization
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              disabled={!isEditing}
              className={`w-full px-3 py-2 rounded-lg text-xs font-sans transition-colors ${
                isEditing
                  ? 'bg-blue-50/60 border border-blue-500 text-slate-800'
                  : 'bg-[#f4f8ff] border border-blue-100 text-slate-700'
              }`}
            />
          </div>

          {isEditing && (
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="py-1.5 px-3 rounded-lg bg-blue-100 hover:bg-blue-100 text-slate-700 text-xs font-medium border border-blue-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="py-1.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Profile Changes</span>
              </button>
            </div>
          )}
        </form>

        {/* Security Policy Reminder */}
        <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100 text-xs text-slate-600 space-y-1.5">
          <span className="font-semibold text-slate-800 block">{COLLEGE_CONFIG.name} Regulations:</span>
          <p className="leading-relaxed text-[11px]">
            In compliance with college academic integrity guidelines, university seat numbers (USN), admission years, department affiliations, and laboratory batch assignments cannot be edited by students. For official corrections, please consult the Department Office.
          </p>
        </div>
      </div>
    </div>
  );
};
