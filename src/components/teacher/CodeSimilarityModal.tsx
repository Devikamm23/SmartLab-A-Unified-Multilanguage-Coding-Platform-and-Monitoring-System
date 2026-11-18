import React, { useState } from 'react';
import { AcademicIntegrityAlert } from '../../types';
import { COLLEGE_CONFIG } from '../../constants/college';
import {
  X,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  FileCode2,
  GitCompare,
  User,
  Clock,
  Sparkles,
  Save,
  Check,
  Info,
} from 'lucide-react';

interface CodeSimilarityModalProps {
  isOpen: boolean;
  alert: AcademicIntegrityAlert | null;
  onClose: () => void;
  onReviewDecision: (alertId: string, decision: string, remarks: string) => void;
  onDismissAlert: (alertId: string, reason: string) => void;
}

export const CodeSimilarityModal: React.FC<CodeSimilarityModalProps> = ({
  isOpen,
  alert,
  onClose,
  onReviewDecision,
  onDismissAlert,
}) => {
  if (!isOpen || !alert) return null;

  const [decision, setDecision] = useState<string>(
    alert.facultyDecision || 'Legitimate Syntax / Common Algorithm'
  );
  const [remarks, setRemarks] = useState<string>(
    alert.facultyRemarks || ''
  );
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = () => {
    onReviewDecision(alert.id, decision, remarks);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 900);
  };

  const handleDismiss = () => {
    onDismissAlert(
      alert.id,
      remarks || 'Verified by faculty as standard syntactic boilerplate or coincidental algorithm structure.'
    );
    onClose();
  };

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'High':
        return 'bg-rose-50 text-rose-700 border-rose-300';
      case 'Medium':
        return 'bg-amber-50 text-amber-700 border-amber-300';
      case 'Low':
      default:
        return 'bg-blue-50 text-blue-700 border-blue-300';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white border border-blue-100 rounded-2xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl text-slate-900 overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-blue-100 flex items-center justify-between gap-4 bg-blue-50/50 shrink-0">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold border ${
                alert.riskLevel === 'High'
                  ? 'bg-rose-50 border-rose-200 text-rose-600'
                  : alert.riskLevel === 'Medium'
                  ? 'bg-amber-50 border-amber-200 text-amber-600'
                  : 'bg-blue-50 border-blue-200 text-blue-600'
              }`}
            >
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 tracking-tight">
                  Academic Integrity Inspection & Code Similarity Analysis
                </h2>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${getRiskBadge(
                    alert.riskLevel
                  )}`}
                >
                  {alert.riskLevel} Risk ({alert.similarityScore}% Similarity)
                </span>
              </div>
              <p className="text-xs text-slate-600">
                {COLLEGE_CONFIG.name} · Department of {COLLEGE_CONFIG.department}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-blue-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Student & Event Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs font-mono">
            <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-100 space-y-1">
              <span className="text-[10px] text-slate-500 uppercase block font-sans">Student Profile</span>
              <div className="font-sans font-bold text-slate-800 text-sm truncate">
                {alert.studentName}
              </div>
              <div className="text-emerald-600 font-bold">{alert.usn}</div>
              <div className="text-[11px] text-slate-600">Sem {alert.semesterNumber} · {alert.batch}</div>
            </div>

            <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-100 space-y-1">
              <span className="text-[10px] text-slate-500 uppercase block font-sans">Assignment Details</span>
              <div className="font-sans font-semibold text-slate-800 truncate">
                {alert.assignmentName}
              </div>
              <div className="text-slate-600 text-[11px]">Lab Slot #{alert.labSessionId}</div>
              <div className="text-blue-600 text-[11px]">Monaco Buffer Inspection</div>
            </div>

            <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-100 space-y-1">
              <span className="text-[10px] text-slate-500 uppercase block font-sans">Copy-Paste Metrics</span>
              <div className="text-slate-900 font-bold text-sm">
                {alert.linesPasted} Lines Pasted
              </div>
              <div className="text-slate-600 text-[11px]">{alert.charactersPasted} Characters</div>
              <div className="text-slate-600 text-[11px]">{alert.timestamp}</div>
            </div>

            <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-100 space-y-1">
              <span className="text-[10px] text-slate-500 uppercase block font-sans">Review Status</span>
              <div className="font-bold text-amber-600">{alert.status}</div>
              {alert.reviewedBy && (
                <div className="text-[11px] text-slate-600 truncate font-sans">
                  By: {alert.reviewedBy}
                </div>
              )}
              {alert.reviewedAt && (
                <div className="text-[10px] text-slate-500">{alert.reviewedAt}</div>
              )}
            </div>
          </div>

          {/* AI Structural Similarity Metrics Strip */}
          <div className="p-4 rounded-xl bg-blue-50/20 border border-blue-200 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-blue-700 font-semibold text-xs font-mono">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span>AI-Based Code Structural Correlation Breakdown</span>
              </div>
              <span className="text-xs font-mono font-bold text-slate-900">
                Composite Score: <strong className="text-emerald-600">{alert.similarityScore}%</strong>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1 font-mono">
              <div className="p-2.5 rounded-lg bg-[#f4f8ff] border border-blue-100 space-y-1">
                <div className="flex justify-between text-slate-600 text-[11px]">
                  <span>Token n-Gram Overlap</span>
                  <span className="font-bold text-slate-900">
                    {alert.structuralMetrics?.tokenOverlapPercentage ?? 85}%
                  </span>
                </div>
                <div className="w-full bg-blue-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-blue-500 h-full rounded-full"
                    style={{
                      width: `${alert.structuralMetrics?.tokenOverlapPercentage ?? 85}%`,
                    }}
                  />
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-[#f4f8ff] border border-blue-100 space-y-1">
                <div className="flex justify-between text-slate-600 text-[11px]">
                  <span>Control Flow Skeleton Match</span>
                  <span className="font-bold text-slate-900">
                    {alert.structuralMetrics?.controlFlowMatchPercentage ?? 80}%
                  </span>
                </div>
                <div className="w-full bg-blue-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-blue-500 h-full rounded-full"
                    style={{
                      width: `${alert.structuralMetrics?.controlFlowMatchPercentage ?? 80}%`,
                    }}
                  />
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-[#f4f8ff] border border-blue-100 space-y-1">
                <div className="flex justify-between text-slate-600 text-[11px]">
                  <span>Longest Contiguous Block</span>
                  <span className="font-bold text-slate-900">
                    {alert.structuralMetrics?.identicalBlockLength ?? 12} lines
                  </span>
                </div>
                <div className="w-full bg-blue-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-blue-500 h-full rounded-full"
                    style={{
                      width: `${Math.min(
                        100,
                        (alert.structuralMetrics?.identicalBlockLength ?? 12) * 8
                      )}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="text-[11px] text-slate-600 leading-normal pt-1 font-sans">
              Matched Source: <strong className="text-slate-800">{alert.matchedSourceDescription}</strong>
            </div>
          </div>

          {/* Side-by-Side Code Comparison */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 font-mono">
                <GitCompare className="w-4 h-4 text-blue-600" />
                <span>Side-by-Side Code Comparison</span>
              </div>
              <span className="text-[11px] text-slate-600 font-mono">
                Flagged Paste ({alert.linesPasted} lines) vs. Reference / Cohort Candidate
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Left Column: Student's Pasted Buffer */}
              <div className="rounded-xl border border-blue-100 bg-[#f4f8ff] overflow-hidden">
                <div className="px-3.5 py-2 border-b border-blue-100 bg-[#f4f8ff] flex items-center justify-between text-xs">
                  <span className="font-semibold text-rose-700 flex items-center gap-1.5">
                    <FileCode2 className="w-3.5 h-3.5 text-rose-600" />
                    <span>{alert.studentName}&apos;s Pasted Code</span>
                  </span>
                  <span className="font-mono text-[10px] text-slate-600">
                    USN: {alert.usn}
                  </span>
                </div>
                <pre className="p-4 font-mono text-[11px] text-slate-700 overflow-x-auto max-h-72 leading-relaxed selection:bg-rose-50">
                  {alert.pastedCode}
                </pre>
              </div>

              {/* Right Column: Matched Candidate / Peer Solution */}
              <div className="rounded-xl border border-blue-100 bg-[#f4f8ff] overflow-hidden">
                <div className="px-3.5 py-2 border-b border-blue-100 bg-[#f4f8ff] flex items-center justify-between text-xs">
                  <span className="font-semibold text-blue-700 flex items-center gap-1.5">
                    <FileCode2 className="w-3.5 h-3.5 text-blue-600" />
                    <span>
                      {alert.matchedStudentName
                        ? `Peer: ${alert.matchedStudentName} [${alert.matchedStudentUsn}]`
                        : 'Cohort Reference Solution'}
                    </span>
                  </span>
                  <span className="font-mono text-[10px] text-emerald-600 font-bold">
                    {alert.similarityScore}% Match
                  </span>
                </div>
                <pre className="p-4 font-mono text-[11px] text-slate-700 overflow-x-auto max-h-72 leading-relaxed selection:bg-blue-50">
                  {alert.matchedCode || `// Comparison against standard curriculum algorithmic pattern:
${alert.pastedCode}`}
                </pre>
              </div>
            </div>
          </div>

          {/* Academic Integrity Policy Reminder */}
          <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-100 flex items-start gap-2.5 text-xs text-slate-600">
            <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Academic Integrity Policy Notice:</strong> A similarity score or copy-paste detection alone is an indicator for faculty inspection, not automatic proof of plagiarism. Students may legitimately write similar solutions for common curriculum experiments. Faculty discretion determines the final evaluation.
            </p>
          </div>

          {/* Faculty Review & Final Decision Section */}
          <div className="p-5 rounded-xl bg-blue-50/60 border border-blue-100 space-y-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">
              Faculty Adjudication & Action Record
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs text-slate-700 font-medium block">
                  Final Decision:
                </label>
                <select
                  value={decision}
                  onChange={(e) => setDecision(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-blue-50/60 border border-blue-200 text-xs font-semibold text-slate-900 focus:outline-hidden focus:border-blue-500"
                >
                  <option value="Legitimate Syntax / Common Algorithm">
                    Legitimate Syntax / Common Algorithm (No Penalty)
                  </option>
                  <option value="Verbal Warning Issued to Student">
                    Verbal Warning Issued to Student
                  </option>
                  <option value="Marks Deduction Applied by Faculty">
                    Marks Deduction Applied by Faculty (Penalize 5-10 Marks)
                  </option>
                  <option value="Laboratory Re-attempt Scheduled">
                    Laboratory Re-attempt Scheduled (Supervised Re-test)
                  </option>
                  <option value="Dismissed as False Positive">
                    Dismissed as False Positive
                  </option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-slate-700 font-medium block">
                  Faculty Review Remarks:
                </label>
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Enter observation notes, code differentiation points, or counseling remarks..."
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg bg-blue-50/60 border border-blue-200 text-xs text-slate-800 placeholder-slate-500 focus:outline-hidden focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-blue-100">
              <button
                type="button"
                onClick={handleDismiss}
                className="px-4 py-2 rounded-lg bg-blue-100 hover:bg-blue-100 text-slate-700 text-xs font-semibold border border-blue-200 transition-colors"
              >
                Dismiss as False Positive
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg bg-blue-100 hover:bg-blue-100 text-slate-700 text-xs font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-md shadow-indigo-600/20"
                >
                  {saveSuccess ? <Check className="w-4 h-4 text-emerald-700" /> : <Save className="w-4 h-4" />}
                  <span>{saveSuccess ? 'Decision Saved' : 'Save Final Decision'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
