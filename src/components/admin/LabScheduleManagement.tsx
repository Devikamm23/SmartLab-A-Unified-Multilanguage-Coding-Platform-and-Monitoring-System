import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { BatchName } from '../../types';
import { COLLEGE_CONFIG } from '../../constants/college';
import {
  CalendarDays,
  Plus,
  Clock,
  CheckCircle2,
  Users2,
  Calendar,
  Layers,
} from 'lucide-react';

interface ScheduleSlot {
  id: string;
  day: string;
  timeSlot: string;
  semesterNumber: number;
  batch: BatchName;
  subjectCode: string;
  teacherName: string;
  room: string;
}

const DEFAULT_SCHEDULES: ScheduleSlot[] = [
  { id: 'sch-1', day: 'Monday', timeSlot: '09:00 - 12:00', semesterNumber: 5, batch: 'Batch A', subjectCode: 'CS504', teacherName: 'Dr Girish S C', room: 'Computing Lab 3' },
  { id: 'sch-2', day: 'Monday', timeSlot: '13:30 - 16:30', semesterNumber: 5, batch: 'Batch B', subjectCode: 'CS504', teacherName: 'Dr Girish S C', room: 'Computing Lab 3' },
  { id: 'sch-3', day: 'Tuesday', timeSlot: '10:00 - 13:00', semesterNumber: 3, batch: 'Batch C', subjectCode: 'CS302', teacherName: 'Prof. Sunita Menon', room: 'Systems Lab 1' },
  { id: 'sch-4', day: 'Wednesday', timeSlot: '09:00 - 12:00', semesterNumber: 5, batch: 'Batch C', subjectCode: 'CS504', teacherName: 'Prof. Sunita Menon', room: 'Computing Lab 3' },
  { id: 'sch-5', day: 'Thursday', timeSlot: '14:00 - 17:00', semesterNumber: 4, batch: 'Batch A', subjectCode: 'CS403', teacherName: 'Prof. Sunita Menon', room: 'Object Lab 2' },
];

export const LabScheduleManagement: React.FC = () => {
  const [schedules, setSchedules] = useState<ScheduleSlot[]>(DEFAULT_SCHEDULES);
  const [selectedDay, setSelectedDay] = useState<string>('All');

  const days = ['All', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  const filtered = schedules.filter((s) => selectedDay === 'All' || s.day === selectedDay);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Master Laboratory Timetable & Schedules</h1>
          <p className="text-xs text-slate-600 mt-0.5">
            {COLLEGE_CONFIG.name} · Weekly batch-wise lab timetables allocating Semesters, Batches A/B/C, and room terminals
          </p>
        </div>

        <div className="flex items-center gap-2">
          {days.map((d) => (
            <button
              key={d}
              onClick={() => setSelectedDay(d)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                selectedDay === d
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-blue-50/60 border border-blue-100 text-slate-600 hover:text-slate-900'
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Timetable Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((slot) => (
          <div
            key={slot.id}
            className="bg-white border border-blue-100 rounded-2xl p-5 space-y-4 shadow-md"
          >
            <div className="flex items-center justify-between border-b border-blue-100 pb-2">
              <span className="text-xs font-bold text-slate-900 font-mono">{slot.day}</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-bold">
                {slot.timeSlot}
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-blue-600">{slot.subjectCode}</span>
                <span aria-hidden="true" className="text-slate-600">·</span>
                <span className="text-xs font-bold text-slate-800">
                  Semester {slot.semesterNumber} ({slot.batch})
                </span>
              </div>
              <p className="text-xs text-slate-600">Terminal Facility: {slot.room}</p>
            </div>

            <div className="pt-2 border-t border-blue-100 flex items-center justify-between text-[11px] text-slate-500 font-mono">
              <span>Teacher: {slot.teacherName}</span>
              <span className="text-emerald-600 font-bold">Scheduled</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
