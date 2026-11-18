import React, { useState } from 'react';
import { StudentLabSession } from '../../types';
import { COLLEGE_CONFIG } from '../../constants/college';
import {
  X,
  User,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileCode2,
  Sparkles,
  Award,
  Edit3,
  Save,
  Check,
  RotateCw,
  Printer,
  ShieldAlert,
  Cpu,
  Layers,
  Calendar,
} from 'lucide-react';

interface StudentDetailModalProps {
  session: StudentLabSession | null;
  isOpen: boolean;
  onClose: () => void;
  onApproveMarks: (sessionId: string, score: number, feedback: string) => void;
  onRunAiEvaluation: (sessionId: string) => void;
}

export const StudentDetailModal: React.FC<StudentDetailModalProps> = ({
  session,
  isOpen,
  onClose,
  onApproveMarks,
  onRunAiEvaluation,
}) => {
  if (!isOpen || !session) return null;

  const [isEditingMarks, setIsEditingMarks] = useState(false);
  const [approvedScore, setApprovedScore] = useState<number>(
    session.facultyApprovedScore ?? session.score ?? 45
  );
  const [facultyFeedback, setFacultyFeedback] = useState<string>(
    session.facultyFeedback || 'Satisfactory lab execution. Approved by faculty.'
  );
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Status color helper matching exact requirements
  const getStatusBadge = (status: StudentLabSession['activityStatus']) => {
    switch (status) {
      case 'Typing':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-50 text-emerald-600 border border-emerald-300 shadow-sm shadow-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            1. Typing (Green)
          </span>
        );
      case 'Idle':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-50 text-amber-600 border border-amber-300 shadow-sm shadow-amber-500/20">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            2. Idle (Yellow)
          </span>
        );
      case 'Viewing':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-blue-50 text-blue-600 border border-blue-300 shadow-sm shadow-blue-500/20">
            <span className="w-2 h-2 rounded-full bg-sky-400" />
            3. Viewing (Blue)
          </span>
        );
      case 'Absent':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-rose-50 text-rose-600 border border-rose-300 shadow-sm shadow-rose-500/20">
            <span className="w-2 h-2 rounded-full bg-rose-400" />
            4. Absent (Red)
          </span>
        );
      case 'Submitted':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-blue-50 text-blue-700 border border-blue-300 shadow-sm shadow-purple-500/20">
            <span className="w-2 h-2 rounded-full bg-purple-400" />
            5. Submitted (Purple)
          </span>
        );
    }
  };

  const formatMinutesSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}m ${s}s`;
  };

  const handleSaveApproval = (e: React.FormEvent) => {
    e.preventDefault();
    onApproveMarks(session.id, Number(approvedScore), facultyFeedback);
    setSaveSuccess(true);
    setIsEditingMarks(false);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const activePercent =
    session.totalDurationSeconds > 0
      ? Math.round((session.activeTimeSeconds / session.totalDurationSeconds) * 100)
      : 0;

  const aiEval = session.aiEvaluation;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-blue-200 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Modal Top Header */}
        <div className="p-5 border-b border-blue-100 flex items-center justify-between bg-blue-50/60 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-blue-500 flex items-center justify-center font-bold text-lg text-white shadow-md shadow-blue-500/20">
              {session.studentName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 tracking-tight">
                  {session.studentName}
                </h2>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                  {session.usn}
                </span>
                {getStatusBadge(session.activityStatus)}
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                {COLLEGE_CONFIG.department} · Semester {session.semesterNumber} ({session.batch}) · {COLLEGE_CONFIG.shortAcronym}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-blue-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {saveSuccess && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Faculty evaluation successfully finalized and approved in the student academic ledger.</span>
            </div>
          )}

          {/* Section 1: Session Duration, Login/Logout, and Telemetry Summary */}
          <div className="bg-[#f4f8ff] border border-blue-100 rounded-xl p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-blue-100 pb-2">
              <div className="flex items-center gap-2 text-slate-900 font-bold">
                <Clock className="w-4 h-4 text-blue-600" />
                <span>120-Minute Lab Session Telemetry & Timestamps</span>
              </div>
              <span className="font-mono text-slate-600">
                Session Target: 120 Minutes (2.0 Hours)
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
              <div className="p-3 rounded-lg bg-blue-50/60 border border-blue-100">
                <span className="text-[10px] text-slate-500 uppercase block">Login Time</span>
                <span className="text-slate-800 font-bold block mt-0.5">
                  {session.loginTime || '09:02:15 AM'}
                </span>
              </div>

              <div className="p-3 rounded-lg bg-blue-50/60 border border-blue-100">
                <span className="text-[10px] text-slate-500 uppercase block">Logout Time</span>
                <span className="text-slate-800 font-bold block mt-0.5">
                  {session.logoutTime || 'Active In Terminal'}
                </span>
              </div>

              <div className="p-3 rounded-lg bg-blue-50/60 border border-blue-100">
                <span className="text-[10px] text-slate-500 uppercase block">Total Time Spent</span>
                <span className="text-blue-600 font-bold block mt-0.5">
                  {formatMinutesSeconds(session.totalDurationSeconds)}
                </span>
              </div>

              <div className="p-3 rounded-lg bg-blue-50/60 border border-blue-100">
                <span className="text-[10px] text-slate-500 uppercase block">Remaining Lab Window</span>
                <span className="text-amber-600 font-bold block mt-0.5">
                  {Math.floor(session.remainingSeconds / 60)} mins remaining
                </span>
              </div>
            </div>

            {/* Active Working Time vs Idle Time breakdown */}
            <div className="p-3.5 rounded-lg bg-[#f4f8ff] border border-blue-100 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-emerald-600 flex items-center gap-1.5 font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  Active Working Time: {formatMinutesSeconds(session.activeTimeSeconds)} ({activePercent}%)
                </span>
                <span className="text-amber-600 flex items-center gap-1.5 font-bold">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  Idle Time (&gt;2m threshold): {formatMinutesSeconds(session.idleTimeSeconds)} ({100 - activePercent}%)
                </span>
              </div>

              {/* Stacked Progress Bar */}
              <div className="w-full h-2.5 rounded-full bg-blue-50/60 overflow-hidden flex border border-blue-100">
                <div
                  className="bg-emerald-500 h-full transition-all"
                  style={{ width: `${activePercent}%` }}
                  title={`Active Time: ${activePercent}%`}
                />
                <div
                  className="bg-amber-500 h-full transition-all"
                  style={{ width: `${100 - activePercent}%` }}
                  title={`Idle Time: ${100 - activePercent}%`}
                />
              </div>
              <p className="text-[10px] text-slate-500 italic">
                *Note: Active time measures genuine editor typing and meaningful interactions. Time spent alone does not influence final marks.
              </p>
            </div>
          </div>

          {/* Section 2: Code Submission & Execution Details */}
          <div className="bg-[#f4f8ff] border border-blue-100 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-blue-100 pb-2">
              <div className="flex items-center gap-2 text-slate-900 font-bold">
                <FileCode2 className="w-4 h-4 text-emerald-600" />
                <span>Code Submission & Execution Metrics</span>
              </div>
              <div className="flex items-center gap-3 font-mono text-[11px]">
                <span className="text-slate-600">
                  Submissions: <strong className="text-slate-800">{session.submissionCount || 1}</strong>
                </span>
                <span className="text-slate-600">
                  Compiles: <strong className="text-slate-800">{session.compilationAttempts}</strong>
                </span>
                <span className="text-emerald-600 font-bold">
                  Test Cases: {session.testCasesPassed} / {session.totalTestCases} Passed
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-[11px]">
              <div>
                <span className="text-slate-500 block text-[10px]">Assignment Task</span>
                <span className="text-slate-800 font-semibold truncate block">
                  {session.experimentName}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Compiler Language</span>
                <span className="text-blue-600 uppercase font-bold">
                  {session.programmingLanguage}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Execution Time</span>
                <span className="text-slate-800">0.038 seconds</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Memory Allocated</span>
                <span className="text-slate-800">8,412 KB</span>
              </div>
            </div>

            {/* Code Snippet Box */}
            <div>
              <span className="text-[10px] font-mono text-slate-600 block mb-1">
                Submitted Code Buffer ({session.programmingLanguage}):
              </span>
              <pre className="p-3 rounded-lg bg-blue-50/60 border border-blue-100 font-mono text-[11px] text-slate-700 overflow-x-auto max-h-48 leading-relaxed">
                {session.currentCode || '// No code submitted yet.'}
              </pre>
            </div>
          </div>

          {/* Section 3: AI-Based Automatic Marks Evaluation (5 Criteria / 50 Marks) */}
          <div className="bg-[#f4f8ff] border border-blue-200 rounded-xl p-5 space-y-4 shadow-lg shadow-indigo-950/20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-blue-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded-md bg-blue-100 text-blue-600">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">AI-Based Automatic Marks Evaluation</h3>
                  <p className="text-[11px] text-slate-600">
                    Comprehensive multi-dimensional rubric analysis for 120-minute laboratory session
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => onRunAiEvaluation(session.id)}
                  className="px-2.5 py-1 rounded-lg bg-blue-100 hover:bg-blue-100 text-blue-600 text-xs font-medium border border-blue-200 flex items-center gap-1.5 transition-colors"
                  title="Re-run AI evaluation on submitted code"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Re-Evaluate Code</span>
                </button>

                <div className="px-3 py-1 rounded-lg bg-blue-50 border border-blue-300 text-center">
                  <span className="text-[10px] uppercase font-mono text-blue-700 block">AI Suggested Score</span>
                  <span className="text-base font-bold text-slate-900 font-mono">
                    {aiEval?.totalSuggestedScore ?? session.score ?? 45} / 50
                  </span>
                </div>
              </div>
            </div>

            {/* 5 Criteria Evaluation Breakdown Table */}
            {aiEval ? (
              <div className="overflow-x-auto rounded-lg border border-blue-100">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-blue-100 text-slate-600 uppercase text-[10px] font-mono bg-[#f4f8ff]">
                      <th className="py-2.5 px-3">Evaluation Criteria</th>
                      <th className="py-2.5 px-3 text-right">Max</th>
                      <th className="py-2.5 px-3 text-right">Awarded</th>
                      <th className="py-2.5 px-4">AI Analysis & Reasoning</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-blue-100 font-sans text-[11px]">
                    <tr className="hover:bg-[#f4f8ff]">
                      <td className="py-2.5 px-3 font-semibold text-slate-800">
                        1. Active Lab Participation
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-600">10</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-600">
                        {aiEval.activeParticipation.marksAwarded}
                      </td>
                      <td className="py-2.5 px-4 text-slate-700 leading-relaxed">
                        {aiEval.activeParticipation.explanation}
                      </td>
                    </tr>

                    <tr className="hover:bg-[#f4f8ff]">
                      <td className="py-2.5 px-3 font-semibold text-slate-800">
                        2. Problem Understanding & Approach
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-600">10</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-600">
                        {aiEval.problemUnderstanding.marksAwarded}
                      </td>
                      <td className="py-2.5 px-4 text-slate-700 leading-relaxed">
                        {aiEval.problemUnderstanding.explanation}
                      </td>
                    </tr>

                    <tr className="hover:bg-[#f4f8ff]">
                      <td className="py-2.5 px-3 font-semibold text-slate-800">
                        3. Code Implementation & Correctness
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-600">15</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-600">
                        {aiEval.codeImplementation.marksAwarded}
                      </td>
                      <td className="py-2.5 px-4 text-slate-700 leading-relaxed">
                        {aiEval.codeImplementation.explanation}
                      </td>
                    </tr>

                    <tr className="hover:bg-[#f4f8ff]">
                      <td className="py-2.5 px-3 font-semibold text-slate-800">
                        4. Test Case Results
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-600">10</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-600">
                        {aiEval.testCaseResults.marksAwarded}
                      </td>
                      <td className="py-2.5 px-4 text-slate-700 leading-relaxed">
                        {aiEval.testCaseResults.explanation}
                      </td>
                    </tr>

                    <tr className="hover:bg-[#f4f8ff]">
                      <td className="py-2.5 px-3 font-semibold text-slate-800">
                        5. Assignment Completion & Submission
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-600">5</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-600">
                        {aiEval.assignmentCompletion.marksAwarded}
                      </td>
                      <td className="py-2.5 px-4 text-slate-700 leading-relaxed">
                        {aiEval.assignmentCompletion.explanation}
                      </td>
                    </tr>

                    <tr className="bg-[#f4f8ff] font-bold border-t border-blue-200">
                      <td className="py-2.5 px-3 text-slate-900">Total Marks</td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-700">50</td>
                      <td className="py-2.5 px-3 text-right font-mono text-blue-600 text-sm">
                        {aiEval.totalSuggestedScore}
                      </td>
                      <td className="py-2.5 px-4 text-slate-600 text-[10px] font-mono">
                        {aiEval.codeQualitySummary}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-slate-600 italic">No AI rubric generated yet.</p>
            )}

            <div className="p-3 rounded-lg bg-blue-50/60 border border-blue-100 text-xs text-slate-700 leading-relaxed">
              <span className="font-bold text-slate-800 block mb-0.5">AI Synthesis Verdict:</span>
              {aiEval?.overallExplanation || session.feedback || 'Code meets performance specifications.'}
            </div>
          </div>

          {/* Section 4: Faculty Review, Editing & Final Approval Panel */}
          <form onSubmit={handleSaveApproval} className="bg-[#f4f8ff] border border-blue-100 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-blue-100 pb-2">
              <div className="flex items-center gap-2 text-slate-900 font-bold">
                <Award className="w-4 h-4 text-amber-600" />
                <span>Faculty Review & Final Approval Authority</span>
              </div>
              <div className="flex items-center gap-2">
                {session.isFacultyApproved ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-mono font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">
                    <Check className="w-3.5 h-3.5" /> Faculty Approved ({session.facultyApprovedScore}/50)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-mono font-bold bg-amber-50 text-amber-600 border border-amber-200">
                    <Clock className="w-3.5 h-3.5" /> Pending Faculty Sign-Off
                  </span>
                )}
              </div>
            </div>

            <p className="text-slate-600 text-[11px]">
              Faculty members hold complete administrative authority to override, calibrate, or approve AI-suggested marks.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1">
                  Final Approved Score (out of 50)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={0}
                    max={50}
                    value={approvedScore}
                    onChange={(e) => setApprovedScore(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-blue-50/60 border border-blue-200 text-sm font-bold text-emerald-600 font-mono focus:outline-hidden focus:border-blue-500"
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-slate-500 font-mono">/ 50</span>
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-medium text-slate-700 block mb-1">
                  Faculty Remarks & Performance Comments
                </label>
                <input
                  type="text"
                  value={facultyFeedback}
                  onChange={(e) => setFacultyFeedback(e.target.value)}
                  placeholder="e.g. Solution verified; good optimization logic."
                  className="w-full px-3 py-2 rounded-lg bg-blue-50/60 border border-blue-200 text-xs text-slate-800 focus:outline-hidden focus:border-blue-500 font-sans"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-blue-100">
              <span className="text-[10px] text-slate-500 font-mono">
                Audited by {COLLEGE_CONFIG.shortAcronym} Laboratory Authority
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3.5 py-2 rounded-lg bg-slate-850 hover:bg-blue-100 text-slate-700 text-xs font-medium transition-colors border border-blue-200"
                >
                  Close
                </button>

                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-md shadow-blue-600/20"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Approve & Finalize Marks</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
