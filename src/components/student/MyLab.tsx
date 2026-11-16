import React from 'react';
import { useApp } from '../../context/AppContext';
import { COLLEGE_CONFIG } from '../../constants/college';
import {
  FlaskConical,
  Play,
  Calendar,
  Clock,
  Code2,
  ShieldAlert,
  CheckCircle2,
  ArrowRight,
  BookOpen,
} from 'lucide-react';

export const MyLab: React.FC = () => {
  const { currentUser, labSessions, experiments, startLab } = useApp();

  // Filter strictly for student's assigned semester and batch
  const myAssignedSessions = labSessions.filter(
    (ls) =>
      ls.semesterNumber === currentUser?.semester &&
      ls.batch === currentUser?.batch
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-500/30">
              Semester {currentUser?.semester} · {currentUser?.batch}
            </span>
            <span className="text-xs text-slate-400">Assigned Curriculum Labs</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">My Laboratory Sessions</h1>
        </div>

        <div className="text-xs text-slate-400 font-mono bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg">
          Student USN: <strong className="text-sky-400">{currentUser?.usn}</strong>
        </div>
      </div>

      {/* Lab Sessions Grid */}
      {myAssignedSessions.length === 0 ? (
        <div className="p-12 text-center bg-[#0e1738] border border-slate-800 rounded-2xl text-slate-400 text-xs space-y-2">
          <FlaskConical className="w-8 h-8 text-slate-600 mx-auto" />
          <p className="font-semibold text-slate-300">No laboratory sessions scheduled for {currentUser?.batch}.</p>
          <p className="text-slate-500 text-[11px]">
            Please check back during your scheduled {COLLEGE_CONFIG.shortAcronym} timetable slot or contact your faculty coordinator.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {myAssignedSessions.map((session) => {
            const exp = experiments.find((e) => e.id === session.experimentId);

            return (
              <div
                key={session.id}
                className="bg-[#0e1738] border border-slate-800 rounded-2xl p-6 space-y-5 shadow-lg flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {/* Top Bar with Subject & Language */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-0.5">
                      <span className="text-[11px] font-mono font-bold text-sky-400">
                        {session.subjectCode} · {session.subjectName}
                      </span>
                      <h2 className="text-base font-bold text-white tracking-tight">
                        {session.experimentName}
                      </h2>
                    </div>
                    <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-700 shrink-0">
                      {session.programmingLanguage}
                    </span>
                  </div>

                  {/* Metadata Chips */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 p-3 rounded-xl bg-slate-900 border border-slate-800 font-mono text-[11px]">
                    <div>
                      <span className="text-slate-500 block text-[10px]">Date</span>
                      <span className="text-slate-200">{session.startDate}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Lab Time</span>
                      <span className="text-slate-200">{session.startTime} - {session.endTime}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Status</span>
                      <span
                        className={`capitalize font-bold ${
                          session.status === 'ongoing'
                            ? 'text-emerald-400'
                            : 'text-sky-400'
                        }`}
                      >
                        {session.status}
                      </span>
                    </div>
                  </div>

                  {/* Experiment Description */}
                  {exp && (
                    <div className="space-y-1 text-xs">
                      <span className="font-semibold text-slate-300 block text-[11px]">
                        Experiment Overview:
                      </span>
                      <p className="text-slate-400 leading-relaxed text-[11px]">
                        {exp.description}
                      </p>
                    </div>
                  )}

                  {/* Teacher & Policy */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-800/80 text-xs">
                    <div className="flex items-center justify-between text-slate-400 text-[11px]">
                      <span>Faculty: <strong>{session.teacherName}</strong></span>
                      <span className="font-mono text-amber-400">
                        {session.isCopyPasteRestricted ? 'Copy/Paste: Restricted' : 'Copy/Paste: Allowed'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 italic">
                      Instructions: {session.instructions}
                    </p>
                  </div>
                </div>

                {/* Start Lab CTA */}
                <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] font-mono text-slate-400">
                    Allocated: {session.batch}
                  </span>
                  <button
                    onClick={() => startLab(session.id)}
                    className="py-2 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Start Lab</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
