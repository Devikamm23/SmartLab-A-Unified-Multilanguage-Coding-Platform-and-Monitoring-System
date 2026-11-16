import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AcademicIntegrityAlert, IntegrityRiskLevel } from '../../types';
import { COLLEGE_CONFIG } from '../../constants/college';
import { CodeSimilarityModal } from './CodeSimilarityModal';
import {
  ShieldAlert,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  GitCompare,
  FileCode2,
  Download,
  Info,
  Calendar,
  Sparkles,
  Check,
} from 'lucide-react';

export const AcademicIntegrityMonitoring: React.FC = () => {
  const {
    integrityAlerts,
    reviewIntegrityAlert,
    dismissIntegrityAlert,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRisk, setSelectedRisk] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [inspectAlert, setInspectAlert] = useState<AcademicIntegrityAlert | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Summary Metrics
  const totalAlerts = integrityAlerts.length;
  const uniqueStudents = new Set(integrityAlerts.map((a) => a.studentId)).size;
  const highRiskCount = integrityAlerts.filter((a) => a.riskLevel === 'High').length;
  const mediumRiskCount = integrityAlerts.filter((a) => a.riskLevel === 'Medium').length;
  const reviewedCount = integrityAlerts.filter((a) => a.status === 'Reviewed').length;
  const dismissedCount = integrityAlerts.filter((a) => a.status === 'Dismissed False Positive').length;

  const handleOpenInspect = (alert: AcademicIntegrityAlert) => {
    setInspectAlert(alert);
    setIsModalOpen(true);
  };

  const handleReviewDecision = (alertId: string, decision: string, remarks: string) => {
    reviewIntegrityAlert(alertId, decision, remarks);
    // keep inspectAlert in sync
    if (inspectAlert && inspectAlert.id === alertId) {
      setInspectAlert({
        ...inspectAlert,
        status: decision.toLowerCase().includes('false positive') ? 'Dismissed False Positive' : 'Reviewed',
        facultyDecision: decision,
        facultyRemarks: remarks,
      });
    }
  };

  const handleDismiss = (alertId: string, reason: string) => {
    dismissIntegrityAlert(alertId, reason);
    if (inspectAlert && inspectAlert.id === alertId) {
      setInspectAlert({
        ...inspectAlert,
        status: 'Dismissed False Positive',
        facultyRemarks: reason,
      });
    }
  };

  const filteredAlerts = integrityAlerts.filter((alert) => {
    if (selectedRisk !== 'all' && alert.riskLevel !== selectedRisk) return false;
    if (selectedStatus !== 'all' && alert.status !== selectedStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = alert.studentName.toLowerCase().includes(q);
      const matchUsn = alert.usn.toLowerCase().includes(q);
      const matchAsg = alert.assignmentName.toLowerCase().includes(q);
      if (!matchName && !matchUsn && !matchAsg) return false;
    }
    return true;
  });

  const exportAlertsCSV = () => {
    const headers = [
      'Alert ID',
      'Student Name',
      'USN',
      'Semester',
      'Batch',
      'Assignment',
      'Lines Pasted',
      'Chars Pasted',
      'Similarity Score (%)',
      'Risk Level',
      'Status',
      'Timestamp',
      'Faculty Remarks',
      'Faculty Decision',
    ];

    const rows = integrityAlerts.map((a) => [
      a.id,
      `"${a.studentName}"`,
      a.usn,
      a.semesterNumber,
      a.batch,
      `"${a.assignmentName}"`,
      a.linesPasted,
      a.charactersPasted,
      `${a.similarityScore}%`,
      a.riskLevel,
      a.status,
      `"${a.timestamp}"`,
      `"${a.facultyRemarks || 'N/A'}"`,
      `"${a.facultyDecision || 'Pending'}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `GSSS_Academic_Integrity_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white tracking-tight">
                  Academic Integrity & Copy-Paste Detection
                </h1>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-500/30">
                  AST & Structure Engine
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {COLLEGE_CONFIG.name} · Department of {COLLEGE_CONFIG.department}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={exportAlertsCSV}
            className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors flex items-center gap-2 shadow-xs"
          >
            <Download className="w-4 h-4 text-sky-400" />
            <span>Download CSV Audit Log</span>
          </button>
        </div>
      </div>

      {/* 5 KPI Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="p-4 rounded-xl bg-[#0e1738] border border-slate-800 space-y-1">
          <span className="text-slate-400 text-xs block font-medium">Total Flagged Events</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-white tabular-nums">
              {totalAlerts}
            </span>
            <span className="text-[10px] font-mono text-slate-400">Events</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#0e1738] border border-slate-800 space-y-1">
          <span className="text-slate-400 text-xs block font-medium">Students Flagged</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-sky-400 tabular-nums">
              {uniqueStudents}
            </span>
            <span className="text-[10px] font-mono text-slate-400">Distinct USNs</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#0e1738] border border-slate-800 space-y-1">
          <span className="text-slate-400 text-xs block font-medium">High Risk (&gt;75%)</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-rose-400 tabular-nums">
              {highRiskCount}
            </span>
            <span className="text-[10px] font-mono text-rose-400">Attention Req.</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#0e1738] border border-slate-800 space-y-1">
          <span className="text-slate-400 text-xs block font-medium">Medium Risk (40-75%)</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-amber-400 tabular-nums">
              {mediumRiskCount}
            </span>
            <span className="text-[10px] font-mono text-slate-400">Moderate Overlap</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#0e1738] border border-slate-800 space-y-1">
          <span className="text-slate-400 text-xs block font-medium">Reviewed / Dismissed</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-emerald-400 tabular-nums">
              {reviewedCount + dismissedCount}
            </span>
            <span className="text-[10px] font-mono text-emerald-400">Resolved</span>
          </div>
        </div>
      </div>

      {/* Educational Constitution Callout */}
      <div className="p-4 rounded-xl bg-[#0e1738] border border-slate-800/80 flex items-start gap-3 text-xs text-slate-300">
        <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Faculty Advisory:</strong> Code similarity analysis is an educational diagnostic tool. A copy-paste event or high similarity score alone is not automatic proof of plagiarism. Faculty inspection of structural evidence and human decision-making are required before any academic decision or penalty is recorded.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#0e1738] border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by student, USN, or assignment..."
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 placeholder-slate-500 focus:outline-hidden focus:border-sky-500 font-sans"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
            <span>Risk:</span>
            <select
              value={selectedRisk}
              onChange={(e) => setSelectedRisk(e.target.value)}
              className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-hidden focus:border-sky-500"
            >
              <option value="all">All Risks</option>
              <option value="High">High Risk</option>
              <option value="Medium">Medium Risk</option>
              <option value="Low">Low Risk</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
            <span>Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-hidden focus:border-sky-500"
            >
              <option value="all">All Statuses</option>
              <option value="Pending Review">Pending Review</option>
              <option value="Reviewed">Reviewed</option>
              <option value="Dismissed False Positive">Dismissed False Positive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Flagged Incidents Table */}
      <div className="bg-[#0e1738] border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="px-5 py-3 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-white tracking-tight">Flagged Copy-Paste Incidents</h2>
            <span className="text-[10px] font-mono text-slate-400">
              ({filteredAlerts.length} entries matching filter)
            </span>
          </div>
        </div>

        {filteredAlerts.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500">
            No integrity alerts matching your filter criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] font-mono bg-slate-900/60">
                  <th className="py-3 px-4">Student Name & USN</th>
                  <th className="py-3 px-4">Assignment Name</th>
                  <th className="py-3 px-3">Paste Size</th>
                  <th className="py-3 px-3">Similarity</th>
                  <th className="py-3 px-3">Risk Level</th>
                  <th className="py-3 px-3">Timestamp</th>
                  <th className="py-3 px-3">Review Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans text-xs">
                {filteredAlerts.map((alert) => (
                  <tr key={alert.id} className="hover:bg-slate-900/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-200">{alert.studentName}</div>
                      <div className="font-mono text-[11px] text-emerald-400 font-bold">
                        {alert.usn}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Sem {alert.semesterNumber} · {alert.batch}
                      </div>
                    </td>

                    <td className="py-3 px-4 max-w-xs">
                      <span className="text-slate-200 font-medium truncate block" title={alert.assignmentName}>
                        {alert.assignmentName}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 block truncate">
                        {alert.matchedSourceDescription}
                      </span>
                    </td>

                    <td className="py-3 px-3 font-mono">
                      <span className="text-white font-bold">{alert.linesPasted} lines</span>
                      <span className="text-[10px] text-slate-400 block">{alert.charactersPasted} chars</span>
                    </td>

                    <td className="py-3 px-3 font-mono">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`font-bold tabular-nums ${
                            alert.similarityScore >= 75
                              ? 'text-rose-400'
                              : alert.similarityScore >= 40
                              ? 'text-amber-400'
                              : 'text-sky-400'
                          }`}
                        >
                          {alert.similarityScore}%
                        </span>
                      </div>
                      <div className="w-16 bg-slate-800 rounded-full h-1 mt-1 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            alert.similarityScore >= 75
                              ? 'bg-rose-500'
                              : alert.similarityScore >= 40
                              ? 'bg-amber-500'
                              : 'bg-sky-500'
                          }`}
                          style={{ width: `${alert.similarityScore}%` }}
                        />
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                          alert.riskLevel === 'High'
                            ? 'bg-rose-950 text-rose-300 border-rose-500/40'
                            : alert.riskLevel === 'Medium'
                            ? 'bg-amber-950 text-amber-300 border-amber-500/40'
                            : 'bg-sky-950 text-sky-300 border-sky-500/40'
                        }`}
                      >
                        {alert.riskLevel}
                      </span>
                    </td>

                    <td className="py-3 px-3 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                      {alert.timestamp}
                    </td>

                    <td className="py-3 px-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                          alert.status === 'Reviewed'
                            ? 'bg-emerald-950 text-emerald-400 border-emerald-500/30'
                            : alert.status === 'Dismissed False Positive'
                            ? 'bg-slate-900 text-slate-400 border-slate-700'
                            : 'bg-amber-950 text-amber-300 border-amber-500/30'
                        }`}
                      >
                        {alert.status}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleOpenInspect(alert)}
                        className="px-3 py-1.5 rounded-lg bg-sky-600/20 hover:bg-sky-600 text-sky-300 hover:text-white border border-sky-500/30 text-xs font-semibold transition-all inline-flex items-center gap-1.5"
                      >
                        <GitCompare className="w-3.5 h-3.5" />
                        <span>Inspect & Compare</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Code Similarity Modal */}
      <CodeSimilarityModal
        isOpen={isModalOpen}
        alert={inspectAlert}
        onClose={() => setIsModalOpen(false)}
        onReviewDecision={handleReviewDecision}
        onDismissAlert={handleDismiss}
      />
    </div>
  );
};
