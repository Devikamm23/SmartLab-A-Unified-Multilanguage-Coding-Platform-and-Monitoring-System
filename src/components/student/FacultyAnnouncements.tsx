import React, { useState } from 'react';
import { COLLEGE_CONFIG } from '../../constants/college';
import {
  FacultyAnnouncement,
  INITIAL_FACULTY_ANNOUNCEMENTS,
} from '../../data/studentFeaturesData';
import {
  Megaphone,
  User,
  Calendar,
  AlertCircle,
  FileText,
  X,
  ChevronRight,
  Building,
  GraduationCap,
} from 'lucide-react';

export const FacultyAnnouncements: React.FC = () => {
  const [announcements] = useState<FacultyAnnouncement[]>(INITIAL_FACULTY_ANNOUNCEMENTS);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<FacultyAnnouncement | null>(null);

  const getPriorityBadge = (priority: FacultyAnnouncement['priority']) => {
    switch (priority) {
      case 'Urgent':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-mono font-bold bg-rose-950 text-rose-400 border border-rose-500/30">
            <AlertCircle className="w-3.5 h-3.5" /> Urgent
          </span>
        );
      case 'Important':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-mono font-bold bg-amber-950 text-amber-400 border border-amber-500/30">
            <Megaphone className="w-3.5 h-3.5" /> Important
          </span>
        );
      case 'Normal':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
            Circular
          </span>
        );
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">Faculty Announcements</h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Official laboratory circulars, test schedules, and practical instructions from faculty of {COLLEGE_CONFIG.department}
        </p>
      </div>

      {/* Announcements List */}
      <div className="space-y-4">
        {announcements.map((item) => (
          <div
            key={item.id}
            className="bg-[#0e1738] border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all space-y-4 shadow-lg"
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  {getPriorityBadge(item.priority)}
                  <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    {item.dateTime}
                  </span>
                  <span aria-hidden="true" className="text-slate-600">·</span>
                  <span className="text-xs font-mono text-sky-400">
                    Semester {item.targetSemester} · {item.targetBatch}
                  </span>
                </div>

                <h2 className="text-base font-bold text-white tracking-tight">
                  {item.title}
                </h2>
              </div>

              <button
                onClick={() => setSelectedAnnouncement(item)}
                className="py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-400 hover:text-sky-300 text-xs font-medium border border-slate-700 transition-colors flex items-center gap-1 shrink-0"
              >
                <span>Read Full Circular</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-300 leading-relaxed font-sans line-clamp-3">
              {item.content}
            </div>

            <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 pt-1 border-t border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-bold text-xs">
                  {item.facultyName.charAt(0)}
                </div>
                <div>
                  <span className="font-semibold text-slate-200">{item.facultyName}</span>
                  <span className="text-[11px] text-slate-500 block">{item.facultyDesignation}</span>
                </div>
              </div>

              <span className="text-[11px] font-mono text-slate-500">
                {COLLEGE_CONFIG.shortAcronym} · Verified Faculty Broadcast
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Reader Modal */}
      {selectedAnnouncement && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-[#0e1738] border border-slate-700 rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl relative">
            <button
              onClick={() => setSelectedAnnouncement(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                {getPriorityBadge(selectedAnnouncement.priority)}
                <span className="text-xs text-slate-400 font-mono">
                  {selectedAnnouncement.dateTime}
                </span>
                <span aria-hidden="true" className="text-slate-600">·</span>
                <span className="text-xs font-mono text-sky-400">
                  Target: Semester {selectedAnnouncement.targetSemester} ({selectedAnnouncement.targetBatch})
                </span>
              </div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                {selectedAnnouncement.title}
              </h2>
            </div>

            {/* Author Meta */}
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-sky-600 flex items-center justify-center font-bold text-sm text-white">
                {selectedAnnouncement.facultyName.charAt(0)}
              </div>
              <div className="text-xs">
                <span className="font-bold text-slate-200 block">{selectedAnnouncement.facultyName}</span>
                <span className="text-slate-400 block">{selectedAnnouncement.facultyDesignation}</span>
                <span className="text-sky-400 text-[11px] block">{selectedAnnouncement.department}</span>
              </div>
            </div>

            {/* Content Body */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 leading-relaxed font-sans whitespace-pre-line max-h-72 overflow-y-auto">
              {selectedAnnouncement.content}
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
              <div className="flex items-center gap-1.5 text-slate-400">
                <Building className="w-3.5 h-3.5 text-slate-500" />
                <span>{COLLEGE_CONFIG.name}</span>
              </div>
              <button
                onClick={() => setSelectedAnnouncement(null)}
                className="py-1.5 px-4 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold transition-colors"
              >
                Close Circular
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
