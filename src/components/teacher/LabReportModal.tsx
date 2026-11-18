import React from 'react';
import { StudentLabSession } from '../../types';
import { COLLEGE_CONFIG } from '../../constants/college';
import {
  X,
  Download,
  Printer,
  FileSpreadsheet,
  CheckCircle2,
  GraduationCap,
  Award,
  Layers,
  Calendar,
} from 'lucide-react';

interface LabReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: StudentLabSession[];
  semesterNumber: number;
  batchName: string;
}

export const LabReportModal: React.FC<LabReportModalProps> = ({
  isOpen,
  onClose,
  sessions,
  semesterNumber,
  batchName,
}) => {
  if (!isOpen) return null;

  const totalStudents = sessions.length;
  const submittedCount = sessions.filter((s) => s.activityStatus === 'Submitted').length;
  const absentCount = sessions.filter((s) => s.activityStatus === 'Absent').length;
  const presentCount = totalStudents - absentCount;

  const averageAiScore =
    sessions.length > 0
      ? Math.round(
          sessions.reduce((acc, s) => acc + (s.aiEvaluation?.totalSuggestedScore || s.score || 0), 0) /
            sessions.length
        )
      : 0;

  const averageApprovedScore =
    sessions.length > 0
      ? Math.round(
          sessions.reduce((acc, s) => acc + (s.facultyApprovedScore || s.score || 0), 0) /
            sessions.length
        )
      : 0;

  const downloadCSV = () => {
    const headers = [
      'Student Name',
      'USN',
      'Semester',
      'Batch',
      'Lab Date',
      'Session Duration (mins)',
      'Active Time (mins)',
      'Idle Time (mins)',
      'Activity Status',
      'Assignment Name',
      'Test Cases Passed',
      'AI Suggested Marks (50)',
      'Faculty Approved Marks (50)',
      'Performance Feedback',
    ];

    const rows = sessions.map((s) => [
      `"${s.studentName}"`,
      `"${s.usn}"`,
      s.semesterNumber,
      `"${s.batch}"`,
      `"2026-11-04"`,
      120,
      Math.round(s.activeTimeSeconds / 60),
      Math.round(s.idleTimeSeconds / 60),
      `"${s.activityStatus}"`,
      `"${s.experimentName}"`,
      `"${s.testCasesPassed || 0}/5"`,
      s.aiEvaluation?.totalSuggestedScore || s.score || 0,
      s.facultyApprovedScore || s.score || 0,
      `"${(s.facultyFeedback || s.aiEvaluation?.overallExplanation || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `SmartLab_GSSSIETW_Sem${semesterNumber}_${batchName.replace(/\s+/g, '_')}_Performance_Report.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-blue-200 rounded-2xl w-full max-w-5xl shadow-2xl overflow-hidden my-6 max-h-[92vh] flex flex-col">
        {/* Modal Top Bar */}
        <div className="p-4 border-b border-blue-100 flex items-center justify-between bg-blue-50/60 sticky top-0 z-10">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Academic Laboratory Performance & Evaluation Report</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={downloadCSV}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg bg-blue-100 hover:bg-blue-100 text-slate-800 text-xs font-semibold border border-blue-200 transition-colors flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Report</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-blue-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs" id="printable-report">
          {/* Institutional Header */}
          <div className="text-center space-y-1 border-b border-blue-100 pb-4">
            <div className="text-[11px] font-mono uppercase tracking-widest text-blue-600 font-bold">
              {COLLEGE_CONFIG.shortName}
            </div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              {COLLEGE_CONFIG.name}
            </h1>
            <p className="text-xs text-slate-700">
              {COLLEGE_CONFIG.department} · {COLLEGE_CONFIG.affiliation}
            </p>
            <div className="inline-block px-3 py-1 rounded bg-blue-50/60 border border-blue-100 text-[11px] font-mono text-slate-700 mt-2">
              Course Practical Evaluation Report · 120-Minute Session · Term 2026-2027
            </div>
          </div>

          {/* Session Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xl bg-blue-50/60 border border-blue-100 text-xs font-mono">
            <div>
              <span className="text-slate-500 block text-[10px] uppercase">Enrolled Cohort</span>
              <span className="text-slate-800 font-bold">
                Semester {semesterNumber} ({batchName})
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase">Total Students</span>
              <span className="text-slate-800 font-bold">{totalStudents} Enrolled</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase">Attendance Ratio</span>
              <span className="text-emerald-600 font-bold">
                {presentCount} Present · {absentCount} Absent
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase">Avg Approved Score</span>
              <span className="text-blue-600 font-bold">
                {averageApprovedScore} / 50 Marks
              </span>
            </div>
          </div>

          {/* Performance Report Table */}
          <div className="overflow-x-auto rounded-xl border border-blue-100">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-blue-50/60 border-b border-blue-100 text-slate-600 font-semibold text-[10px] uppercase font-mono">
                  <th className="py-2.5 px-3">Student Name</th>
                  <th className="py-2.5 px-3">Permanent USN</th>
                  <th className="py-2.5 px-2">Status</th>
                  <th className="py-2.5 px-2 text-right">Active</th>
                  <th className="py-2.5 px-2 text-right">Idle</th>
                  <th className="py-2.5 px-2 text-right">Tests</th>
                  <th className="py-2.5 px-3 text-right">AI Marks</th>
                  <th className="py-2.5 px-3 text-right">Approved</th>
                  <th className="py-2.5 px-3">Performance Feedback</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-100 font-mono text-[11px]">
                {sessions.map((ses) => (
                  <tr key={ses.id} className="hover:bg-[#f4f8ff]">
                    <td className="py-2.5 px-3 font-sans font-semibold text-slate-800">
                      {ses.studentName}
                    </td>
                    <td className="py-2.5 px-3 text-emerald-600 font-bold">
                      {ses.usn}
                    </td>
                    <td className="py-2.5 px-2">
                      <span
                        className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          ses.activityStatus === 'Typing'
                            ? 'text-emerald-600 bg-emerald-50 border border-emerald-200'
                            : ses.activityStatus === 'Idle'
                            ? 'text-amber-600 bg-amber-50 border border-amber-200'
                            : ses.activityStatus === 'Viewing'
                            ? 'text-blue-600 bg-blue-50 border border-blue-200'
                            : ses.activityStatus === 'Absent'
                            ? 'text-rose-600 bg-rose-50 border border-rose-200'
                            : 'text-blue-700 bg-blue-50 border border-blue-200'
                        }`}
                      >
                        {ses.activityStatus}
                      </span>
                    </td>
                    <td className="py-2.5 px-2 text-right text-slate-700">
                      {Math.round(ses.activeTimeSeconds / 60)}m
                    </td>
                    <td className="py-2.5 px-2 text-right text-slate-600">
                      {Math.round(ses.idleTimeSeconds / 60)}m
                    </td>
                    <td className="py-2.5 px-2 text-right text-slate-700">
                      {ses.testCasesPassed || 0}/5
                    </td>
                    <td className="py-2.5 px-3 text-right text-blue-700 font-bold">
                      {ses.aiEvaluation?.totalSuggestedScore ?? ses.score ?? 0}
                    </td>
                    <td className="py-2.5 px-3 text-right text-emerald-600 font-bold">
                      {ses.facultyApprovedScore ?? ses.score ?? 0}
                    </td>
                    <td className="py-2.5 px-3 font-sans text-slate-600 text-[10px] max-w-xs truncate">
                      {ses.facultyFeedback || ses.aiEvaluation?.overallExplanation || 'Satisfactory.'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Academic Signature Block */}
          <div className="grid grid-cols-2 pt-6 border-t border-blue-100 text-[11px] text-slate-600 font-sans">
            <div>
              <span className="block font-semibold text-slate-700">Course Coordinator / Faculty In-Charge</span>
              <span>Dr Girish S C, Associate Professor</span>
              <span className="block text-[10px] text-slate-500">Department of Information Science & Engineering</span>
            </div>

            <div className="text-right">
              <span className="block font-semibold text-slate-700">Head of Department</span>
              <span>Dr. M. S. Prema, Professor & HOD</span>
              <span className="block text-[10px] text-slate-500">{COLLEGE_CONFIG.name}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
