import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import { COLLEGE_CONFIG } from '../../constants/college';
import {
  Code2,
  Lock,
  Mail,
  User,
  GraduationCap,
  Users,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Hash,
} from 'lucide-react';

export const AuthPage: React.FC = () => {
  const { login } = useApp();

  const [mode, setMode] = useState<'login' | 'forgot'>('login');
  const [selectedRole, setSelectedRole] = useState<UserRole>('student');

  // Form states
  const [email, setEmail] = useState('devika.24is010@gsss.edu.in');
  const [password, setPassword] = useState('smartlab2026');

  // Forgot password
  const [resetEmail, setResetEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [forgotStep, setForgotStep] = useState<1 | 2>(1);

  // Errors & feedback
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleRoleChange = (role: UserRole) => {
    setSelectedRole(role);
    setErrors({});
    if (role === 'student') {
      setEmail('devika.24is010@gsss.edu.in');
      setPassword('smartlab2026');
    } else if (role === 'teacher') {
      setEmail('arvind.kulkarni@gsss.edu.in');
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
    <div className="min-h-screen bg-[#070b19] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 shadow-lg shadow-sky-500/20 mb-3">
            <Code2 className="w-6 h-6 text-white" />
          </div>
          <div className="text-[11px] font-bold text-sky-400 uppercase tracking-wider font-mono mb-1">
            {COLLEGE_CONFIG.shortName}
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-mono">
            Smart<span className="text-sky-400">Lab</span>
          </h1>
          <p className="text-xs font-medium text-slate-200 mt-1.5 max-w-sm mx-auto leading-relaxed">
            {COLLEGE_CONFIG.name}
          </p>
          <p className="text-[11px] text-slate-400 mt-1 max-w-xs mx-auto">
            {COLLEGE_CONFIG.department} · {COLLEGE_CONFIG.labFacility}
          </p>
        </div>

        {/* Card Box */}
        <div className="bg-[#0e1738] border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8">
          {successMsg && (
            <div className="mb-4 p-3 rounded-lg bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {mode === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {/* Role Selection Tabs: Student, Teacher, Admin */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-2">
                  Select System Role
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleRoleChange('student')}
                    className={`py-2 px-2 rounded-lg border text-xs font-medium flex flex-col items-center justify-center gap-1 transition-all ${
                      selectedRole === 'student'
                        ? 'bg-sky-500/20 border-sky-500 text-sky-200'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
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
                        ? 'bg-indigo-500/25 border-indigo-500 text-indigo-200'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
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
                        ? 'bg-rose-500/25 border-rose-500 text-rose-200'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Admin</span>
                  </button>
                </div>
              </div>

              {/* Institutional Email */}
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Institutional Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-hidden focus:border-sky-500"
                    placeholder="name@gsss.edu.in"
                  />
                </div>
                {errors.email && (
                  <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium text-slate-300">Password</label>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot');
                      setErrors({});
                      setSuccessMsg(null);
                    }}
                    className="text-[11px] text-sky-400 hover:underline"
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
                    className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-hidden focus:border-sky-500"
                    placeholder="••••••••"
                  />
                </div>
                {errors.password && (
                  <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Fast Presets for Evaluator */}
              <div className="pt-1">
                <div className="text-[10px] text-slate-400 mb-1 font-mono uppercase">
                  1-Click Demo Credentials:
                </div>
                <div className="grid grid-cols-3 gap-1.5 text-[10px]">
                  <button
                    type="button"
                    onClick={() => handleRoleChange('student')}
                    className="py-1 px-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-sky-300 text-center truncate"
                  >
                    Devika (Sem 5)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRoleChange('teacher')}
                    className="py-1 px-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-indigo-300 text-center truncate"
                  >
                    Dr. Kulkarni
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRoleChange('admin')}
                    className="py-1 px-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-rose-300 text-center truncate"
                  >
                    Admin Rajesh
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full mt-2 py-2.5 px-4 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow-md shadow-sky-600/20"
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
          ) : (
            /* Forgot Password */
            <form onSubmit={handleForgotSubmit} className="space-y-4">
              <div className="text-left mb-2">
                <h3 className="text-sm font-semibold text-white">Reset Account Password</h3>
                <p className="text-[11px] text-slate-400">
                  {forgotStep === 1
                    ? 'Enter your institutional email to receive a security recovery token.'
                    : 'Enter the verification token and set a new password.'}
                </p>
              </div>

              {forgotStep === 1 ? (
                <div>
                  <label className="text-xs font-medium text-slate-300 block mb-1">
                    Institutional Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-hidden focus:border-sky-500"
                      placeholder="devika.24is010@gsss.edu.in"
                    />
                  </div>
                  {errors.resetEmail && (
                    <p className="text-[11px] text-rose-400 mt-1">{errors.resetEmail}</p>
                  )}
                </div>
              ) : (
                <>
                  <div>
                    <label className="text-xs font-medium text-slate-300 block mb-1">
                      Verification Token (e.g. 7492)
                    </label>
                    <input
                      type="text"
                      value={resetCode}
                      onChange={(e) => setResetCode(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs font-mono focus:outline-hidden focus:border-sky-500"
                      placeholder="7492"
                    />
                    {errors.resetCode && (
                      <p className="text-[11px] text-rose-400 mt-1">{errors.resetCode}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-300 block mb-1">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-hidden focus:border-sky-500"
                      placeholder="••••••••"
                    />
                    {errors.newPassword && (
                      <p className="text-[11px] text-rose-400 mt-1">{errors.newPassword}</p>
                    )}
                  </div>
                </>
              )}

              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs transition-colors"
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
                className="w-full text-center text-xs text-slate-400 hover:text-slate-200 mt-2 block"
              >
                Back to Sign In
              </button>
            </form>
          )}
        </div>

        {/* Academic Footer */}
        <div className="text-center mt-6 text-slate-400 text-[11px] space-y-1">
          <div className="font-semibold text-slate-300">{COLLEGE_CONFIG.name}</div>
          <div className="text-[10px] text-slate-500">
            {COLLEGE_CONFIG.department} · {COLLEGE_CONFIG.affiliation}
          </div>
        </div>
      </div>
    </div>
  );
};
