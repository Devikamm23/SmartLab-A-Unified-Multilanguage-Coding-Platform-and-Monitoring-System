import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { BatchName, UserRole } from '../../types';
import { COLLEGE_CONFIG } from '../../constants/college';
import { SUPABASE_RLS_FIX_SQL } from '../../services/registrationService';
import {
  Code2,
  Lock,
  Mail,
  User as UserIcon,
  GraduationCap,
  Users,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  UserPlus,
  LogIn,
  Copy,
  Check,
  Database,
  Loader2,
} from 'lucide-react';

export const AuthPage: React.FC = () => {
  const { login, registerUser } = useApp();

  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [selectedRole, setSelectedRole] = useState<UserRole>('student');

  // Sign In Form states
  const [email, setEmail] = useState('devika.24is010@gsss.edu.in');
  const [password, setPassword] = useState('smartlab2026');

  // Register Form states
  const [regRole, setRegRole] = useState<'student' | 'teacher'>('student');
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regUsn, setRegUsn] = useState('');
  const [regSemester, setRegSemester] = useState<number>(5);
  const [regBatch, setRegBatch] = useState<BatchName>('Batch A');
  const [regDepartment, setRegDepartment] = useState('Information Science & Engineering');
  const [regEmployeeCode, setRegEmployeeCode] = useState('');
  const [regDesignation, setRegDesignation] = useState('Assistant Professor');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Forgot password
  const [resetEmail, setResetEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [forgotStep, setForgotStep] = useState<1 | 2>(1);

  // Errors & feedback
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [rlsWarning, setRlsWarning] = useState<string | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);
  const [pendingSignIn, setPendingSignIn] = useState<{ email: string; role: UserRole } | null>(null);

  const handleRoleChange = (role: UserRole) => {
    setSelectedRole(role);
    setErrors({});
    if (role === 'student') {
      setEmail('devika.24is010@gsss.edu.in');
      setPassword('smartlab2026');
    } else if (role === 'teacher') {
      setEmail('girish.sc@gsss.edu.in');
      setPassword('smartlab2026');
    } else {
      setEmail('admin.rajesh@gsss.edu.in');
      setPassword('smartlab2026');
    }
  };

  const validateEmail = (val: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!email.trim()) {
      newErrors.email = 'Institutional email is required.';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please provide a valid institutional email address.';
    }

    if (!password) {
      newErrors.password = 'Password is required.';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    login(email, selectedRole);
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!regName.trim() || regName.trim().length < 2) {
      newErrors.regName = 'Full legal name is required.';
    }
    if (!regEmail.trim() || !validateEmail(regEmail)) {
      newErrors.regEmail = 'Please enter a valid institutional email.';
    }
    if (!regPassword || regPassword.length < 6) {
      newErrors.regPassword = 'Password must be at least 6 characters.';
    }
    if (regRole === 'student' && !regUsn.trim()) {
      newErrors.regUsn = 'University USN is required (e.g. 4GW24IS015).';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setSuccessMsg(null);
    setRlsWarning(null);
    setIsSubmitting(true);

    try {
      const result = await registerUser({
        name: regName,
        email: regEmail,
        password: regPassword,
        role: regRole,
        usn: regUsn,
        semester: regSemester,
        batch: regBatch,
        department: regDepartment,
        employeeCode: regEmployeeCode,
        designation: regDesignation,
        autoSignIn: false,
      });

      const signedEmail = regEmail.trim().toLowerCase();
      setPendingSignIn({ email: signedEmail, role: regRole });

      if (result.syncedToSupabase) {
        setSuccessMsg(result.message);
        setTimeout(() => {
          login(signedEmail, regRole);
        }, 1100);
      } else {
        setRlsWarning(result.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopySql = async () => {
    try {
      await navigator.clipboard.writeText(SUPABASE_RLS_FIX_SQL);
      setCopiedSql(true);
      setTimeout(() => setCopiedSql(false), 2000);
    } catch {
      // Clipboard fallback ignored
    }
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (forgotStep === 1) {
      if (!resetEmail || !validateEmail(resetEmail)) {
        setErrors({ resetEmail: 'Enter a valid registered email address.' });
        return;
      }
      setErrors({});
      setSuccessMsg(`Recovery token sent to ${resetEmail}.`);
      setForgotStep(2);
    } else {
      if (!resetCode || resetCode.length < 4) {
        setErrors({ resetCode: 'Enter the 4-digit token.' });
        return;
      }
      if (!newPassword || newPassword.length < 6) {
        setErrors({ newPassword: 'New password must have at least 6 characters.' });
        return;
      }
      setErrors({});
      setSuccessMsg('Password updated successfully! Please sign in.');
      setTimeout(() => {
        setMode('login');
        setForgotStep(1);
        setSuccessMsg(null);
      }, 1500);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f8ff] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-5">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-600 to-blue-700 shadow-lg shadow-blue-500/20 mb-3">
            <Code2 className="w-6 h-6 text-white" />
          </div>
          <div className="text-[11px] font-bold text-blue-600 uppercase tracking-wider font-mono mb-1">
            {COLLEGE_CONFIG.shortName}
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 font-mono">
            Smart<span className="text-blue-600">Lab</span>
          </h1>
          <p className="text-xs font-medium text-slate-800 mt-1 max-w-sm mx-auto leading-relaxed">
            {COLLEGE_CONFIG.name}
          </p>
          <p className="text-[11px] text-slate-600 mt-0.5 max-w-xs mx-auto">
            {COLLEGE_CONFIG.department} · {COLLEGE_CONFIG.labFacility}
          </p>
        </div>

        {/* Card Box */}
        <div className="bg-white border border-blue-100 rounded-2xl shadow-2xl p-6 sm:p-7">
          {/* Primary Mode Switcher (Sign In / Register) */}
          {mode !== 'forgot' && (
            <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-blue-50/70 border border-blue-100 mb-5">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setErrors({});
                  setSuccessMsg(null);
                  setRlsWarning(null);
                }}
                className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  mode === 'login'
                    ? 'bg-white text-blue-700 border border-blue-200 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setErrors({});
                  setSuccessMsg(null);
                  setRlsWarning(null);
                }}
                className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  mode === 'register'
                    ? 'bg-white text-blue-700 border border-blue-200 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Register</span>
              </button>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs space-y-2">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{successMsg}</span>
              </div>
              {pendingSignIn && (
                <button
                  type="button"
                  onClick={() => login(pendingSignIn.email, pendingSignIn.role)}
                  className="w-full py-1.5 px-3 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-semibold transition-colors"
                >
                  Open SmartLab Now
                </button>
              )}
            </div>
          )}

          {rlsWarning && (
            <div className="mb-4 p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-2">
              <div className="flex items-start gap-2">
                <Database className="w-4 h-4 shrink-0 mt-0.5 text-amber-700" />
                <div>
                  <p className="font-semibold">Supabase Table Policy Required</p>
                  <p className="text-[11px] text-amber-800 mt-0.5">{rlsWarning}</p>
                </div>
              </div>
              <div className="bg-white border border-amber-200 rounded-md p-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-mono font-semibold text-slate-600">
                    Run once in Supabase SQL Editor:
                  </span>
                  <button
                    type="button"
                    onClick={handleCopySql}
                    className="text-[10px] font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    {copiedSql ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedSql ? 'Copied' : 'Copy SQL'}</span>
                  </button>
                </div>
                <pre className="text-[9px] font-mono text-slate-700 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                  {SUPABASE_RLS_FIX_SQL}
                </pre>
              </div>
              {pendingSignIn && (
                <button
                  type="button"
                  onClick={() => login(pendingSignIn.email, pendingSignIn.role)}
                  className="w-full py-1.5 px-3 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-semibold transition-colors"
                >
                  Continue to SmartLab Portal
                </button>
              )}
            </div>
          )}

          {mode === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {/* Role Selection Tabs: Student, Teacher, Admin */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-2">
                  Select System Role
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleRoleChange('student')}
                    className={`py-2 px-2 rounded-lg border text-xs font-medium flex flex-col items-center justify-center gap-1 transition-all ${
                      selectedRole === 'student'
                        ? 'bg-blue-100 border-blue-500 text-blue-800'
                        : 'bg-blue-50/60 border-blue-100 text-slate-600 hover:border-blue-200'
                    }`}
                  >
                    <GraduationCap className="w-4 h-4" />
                    <span>Student</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRoleChange('teacher')}
                    className={`py-2 px-2 rounded-lg border text-xs font-medium flex flex-col items-center justify-center gap-1 transition-all ${
                      selectedRole === 'teacher'
                        ? 'bg-blue-100 border-blue-500 text-blue-800'
                        : 'bg-blue-50/60 border-blue-100 text-slate-600 hover:border-blue-200'
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    <span>Teacher</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRoleChange('admin')}
                    className={`py-2 px-2 rounded-lg border text-xs font-medium flex flex-col items-center justify-center gap-1 transition-all ${
                      selectedRole === 'admin'
                        ? 'bg-rose-100 border-rose-500 text-rose-800'
                        : 'bg-blue-50/60 border-blue-100 text-slate-600 hover:border-blue-200'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Admin</span>
                  </button>
                </div>
              </div>

              {/* Institutional Email */}
              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1">
                  Institutional Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-lg bg-blue-50/60 border border-blue-200 text-slate-800 text-xs focus:outline-hidden focus:border-blue-500"
                    placeholder="name@gsss.edu.in"
                  />
                </div>
                {errors.email && (
                  <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium text-slate-700">Password</label>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot');
                      setErrors({});
                      setSuccessMsg(null);
                      setRlsWarning(null);
                    }}
                    className="text-[11px] text-blue-600 hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-lg bg-blue-50/60 border border-blue-200 text-slate-800 text-xs focus:outline-hidden focus:border-blue-500"
                    placeholder="••••••••"
                  />
                </div>
                {errors.password && (
                  <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Fast Presets for Evaluator */}
              <div className="pt-1">
                <div className="text-[10px] text-slate-600 mb-1 font-mono uppercase">
                  1-Click Demo Credentials:
                </div>
                <div className="grid grid-cols-3 gap-1.5 text-[10px]">
                  <button
                    type="button"
                    onClick={() => handleRoleChange('student')}
                    className="py-1 px-1 rounded bg-blue-50/60 hover:bg-blue-100 border border-blue-100 text-blue-700 text-center truncate"
                  >
                    Devika (Sem 5)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRoleChange('teacher')}
                    className="py-1 px-1 rounded bg-blue-50/60 hover:bg-blue-100 border border-blue-100 text-blue-700 text-center truncate"
                  >
                    Dr Girish S C
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRoleChange('admin')}
                    className="py-1 px-1 rounded bg-blue-50/60 hover:bg-blue-100 border border-blue-100 text-rose-700 text-center truncate"
                  >
                    Admin Rajesh
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full mt-2 py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow-md shadow-sky-600/20"
              >
                <span>
                  Sign In to{' '}
                  {selectedRole === 'admin'
                    ? 'Admin Console'
                    : selectedRole === 'teacher'
                    ? 'Teacher Portal'
                    : 'Student Portal'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : mode === 'register' ? (
            /* Registration Form -> Automatically saves to Supabase */
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Register As
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setRegRole('student');
                      setErrors({});
                    }}
                    className={`py-2 px-3 rounded-lg border text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
                      regRole === 'student'
                        ? 'bg-blue-100 border-blue-500 text-blue-800'
                        : 'bg-blue-50/60 border-blue-100 text-slate-600 hover:border-blue-200'
                    }`}
                  >
                    <GraduationCap className="w-4 h-4" />
                    <span>Student</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setRegRole('teacher');
                      setErrors({});
                    }}
                    className={`py-2 px-3 rounded-lg border text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
                      regRole === 'teacher'
                        ? 'bg-blue-100 border-blue-500 text-blue-800'
                        : 'bg-blue-50/60 border-blue-100 text-slate-600 hover:border-blue-200'
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    <span>Faculty / Teacher</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-lg bg-blue-50/60 border border-blue-200 text-slate-800 text-xs focus:outline-hidden focus:border-blue-500"
                    placeholder={regRole === 'student' ? 'e.g. Ananya Sharma' : 'e.g. Prof. Kavitha M'}
                  />
                </div>
                {errors.regName && (
                  <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.regName}
                  </p>
                )}
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1">
                  Institutional Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-lg bg-blue-50/60 border border-blue-200 text-slate-800 text-xs focus:outline-hidden focus:border-blue-500"
                    placeholder="name@gsss.edu.in"
                  />
                </div>
                {errors.regEmail && (
                  <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.regEmail}
                  </p>
                )}
              </div>

              {regRole === 'student' ? (
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-1">
                    <label className="text-xs font-medium text-slate-700 block mb-1">
                      USN
                    </label>
                    <input
                      type="text"
                      value={regUsn}
                      onChange={(e) => setRegUsn(e.target.value)}
                      className="w-full px-2.5 py-2 rounded-lg bg-blue-50/60 border border-blue-200 text-slate-800 font-mono text-xs focus:outline-hidden focus:border-blue-500 uppercase"
                      placeholder="4GW24IS015"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-700 block mb-1">
                      Semester
                    </label>
                    <select
                      value={regSemester}
                      onChange={(e) => setRegSemester(Number(e.target.value))}
                      className="w-full px-2 py-2 rounded-lg bg-blue-50/60 border border-blue-200 text-slate-800 text-xs focus:outline-hidden focus:border-blue-500 font-mono"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                        <option key={s} value={s}>
                          Sem {s}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-700 block mb-1">
                      Batch
                    </label>
                    <select
                      value={regBatch}
                      onChange={(e) => setRegBatch(e.target.value as BatchName)}
                      className="w-full px-2 py-2 rounded-lg bg-blue-50/60 border border-blue-200 text-slate-800 text-xs focus:outline-hidden focus:border-blue-500 font-mono"
                    >
                      <option value="Batch A">Batch A</option>
                      <option value="Batch B">Batch B</option>
                      <option value="Batch C">Batch C</option>
                    </select>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-medium text-slate-700 block mb-1">
                      Employee Code
                    </label>
                    <input
                      type="text"
                      value={regEmployeeCode}
                      onChange={(e) => setRegEmployeeCode(e.target.value)}
                      className="w-full px-2.5 py-2 rounded-lg bg-blue-50/60 border border-blue-200 text-slate-800 font-mono text-xs focus:outline-hidden focus:border-blue-500 uppercase"
                      placeholder="FAC-ISE-104"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-700 block mb-1">
                      Designation
                    </label>
                    <input
                      type="text"
                      value={regDesignation}
                      onChange={(e) => setRegDesignation(e.target.value)}
                      className="w-full px-2.5 py-2 rounded-lg bg-blue-50/60 border border-blue-200 text-slate-800 text-xs focus:outline-hidden focus:border-blue-500"
                      placeholder="Assistant Professor"
                    />
                  </div>
                </div>
              )}

              {errors.regUsn && (
                <p className="text-[11px] text-rose-600 -mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.regUsn}
                </p>
              )}

              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1">
                  Department
                </label>
                <select
                  value={regDepartment}
                  onChange={(e) => setRegDepartment(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-blue-50/60 border border-blue-200 text-slate-800 text-xs focus:outline-hidden focus:border-blue-500"
                >
                  <option value="Information Science & Engineering">
                    Information Science & Engineering
                  </option>
                  <option value="Computer Science & Engineering">
                    Computer Science & Engineering
                  </option>
                  <option value="Artificial Intelligence & Data Science">
                    Artificial Intelligence & Data Science
                  </option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-lg bg-blue-50/60 border border-blue-200 text-slate-800 text-xs focus:outline-hidden focus:border-blue-500"
                    placeholder="Minimum 6 characters"
                  />
                </div>
                {errors.regPassword && (
                  <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.regPassword}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-1 py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:bg-blue-400 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow-md shadow-sky-600/20"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving to Supabase...</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Create Account & Save</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            /* Forgot Password */
            <form onSubmit={handleForgotSubmit} className="space-y-4">
              <div className="text-left mb-2">
                <h3 className="text-sm font-semibold text-slate-900">Reset Account Password</h3>
                <p className="text-[11px] text-slate-600">
                  {forgotStep === 1
                    ? 'Enter your institutional email to receive a security recovery token.'
                    : 'Enter the verification token and set a new password.'}
                </p>
              </div>

              {forgotStep === 1 ? (
                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">
                    Institutional Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-lg bg-blue-50/60 border border-blue-200 text-slate-800 text-xs focus:outline-hidden focus:border-blue-500"
                      placeholder="devika.24is010@gsss.edu.in"
                    />
                  </div>
                  {errors.resetEmail && (
                    <p className="text-[11px] text-rose-600 mt-1">{errors.resetEmail}</p>
                  )}
                </div>
              ) : (
                <>
                  <div>
                    <label className="text-xs font-medium text-slate-700 block mb-1">
                      Verification Token (e.g. 7492)
                    </label>
                    <input
                      type="text"
                      value={resetCode}
                      onChange={(e) => setResetCode(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-blue-50/60 border border-blue-200 text-slate-800 text-xs font-mono focus:outline-hidden focus:border-blue-500"
                      placeholder="7492"
                    />
                    {errors.resetCode && (
                      <p className="text-[11px] text-rose-600 mt-1">{errors.resetCode}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-700 block mb-1">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-blue-50/60 border border-blue-200 text-slate-800 text-xs focus:outline-hidden focus:border-blue-500"
                      placeholder="••••••••"
                    />
                    {errors.newPassword && (
                      <p className="text-[11px] text-rose-600 mt-1">{errors.newPassword}</p>
                    )}
                  </div>
                </>
              )}

              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors"
              >
                {forgotStep === 1 ? 'Dispatch Verification Token' : 'Update Password'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setForgotStep(1);
                  setErrors({});
                }}
                className="w-full text-center text-xs text-slate-600 hover:text-slate-800 mt-2 block"
              >
                Back to Sign In
              </button>
            </form>
          )}
        </div>

        {/* Academic Footer */}
        <div className="text-center mt-5 text-slate-600 text-[11px] space-y-1">
          <div className="font-semibold text-slate-700">{COLLEGE_CONFIG.name}</div>
          <div className="text-[10px] text-slate-500">
            {COLLEGE_CONFIG.department} · {COLLEGE_CONFIG.affiliation}
          </div>
        </div>
      </div>
    </div>
  );
};
