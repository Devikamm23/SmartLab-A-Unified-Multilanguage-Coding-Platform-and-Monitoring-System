/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { AuthPage } from './components/auth/AuthPage';

// Student Components
import { StudentDashboard } from './components/student/StudentDashboard';
import { MyLab } from './components/student/MyLab';
import { LabHistory } from './components/student/LabHistory';
import { StudentProfile } from './components/student/StudentProfile';
import { NotificationCentre } from './components/student/NotificationCentre';
import { DeadlineTracker } from './components/student/DeadlineTracker';
import { FacultyAnnouncements } from './components/student/FacultyAnnouncements';
import { AttendanceOverview } from './components/student/AttendanceOverview';
import { StudentQuizzes } from './components/student/StudentQuizzes';
import { HelpAndSupport } from './components/student/HelpAndSupport';

// Editor Component
import { OnlineCodeEditor } from './components/editor/OnlineCodeEditor';

// Teacher Components
import { TeacherDashboard } from './components/teacher/TeacherDashboard';
import { MyBatches } from './components/teacher/MyBatches';
import { LabSessionManagement } from './components/teacher/LabSessionManagement';
import { StudentMonitoring } from './components/teacher/StudentMonitoring';
import { QuizManagement } from './components/teacher/QuizManagement';
import { TeacherReports } from './components/teacher/TeacherReports';
import { AcademicIntegrityMonitoring } from './components/teacher/AcademicIntegrityMonitoring';
import { FacultyNotificationCentre } from './components/teacher/FacultyNotificationCentre';

// Admin Components
import { AdminDashboard } from './components/admin/AdminDashboard';
import { StudentManagement } from './components/admin/StudentManagement';
import { TeacherManagement } from './components/admin/TeacherManagement';
import { SemesterBatchManagement } from './components/admin/SemesterBatchManagement';
import { SubjectExperimentManagement } from './components/admin/SubjectExperimentManagement';
import { LabScheduleManagement } from './components/admin/LabScheduleManagement';

// Architecture & Modal
import { DatabaseArchitecture } from './components/architecture/DatabaseArchitecture';
import { Judge0ConfigModal } from './components/modals/Judge0ConfigModal';
import { UserRole } from './types';

const ALLOWED_TABS: Record<UserRole, string[]> = {
  student: [
    'dashboard',
    'my_lab',
    'editor',
    'lab_history',
    'profile',
    'notifications',
    'deadlines',
    'announcements',
    'attendance',
    'quizzes',
    'support',
    'architecture',
  ],
  teacher: [
    'dashboard',
    'my_batches',
    'lab_sessions',
    'student_monitoring',
    'quizzes',
    'academic_integrity',
    'faculty_notifications',
    'teacher_reports',
    'profile',
    'architecture',
  ],
  admin: [
    'dashboard',
    'admin_students',
    'admin_teachers',
    'admin_semesters',
    'admin_curriculum',
    'admin_schedules',
    'architecture',
  ],
};

const MainLayout: React.FC = () => {
  const { currentUser, currentRole, activeNavTab, setActiveNavTab } = useApp();
  const [isJudge0ModalOpen, setIsJudge0ModalOpen] = useState(false);

  // Strict route protection guard: prevent cross-role URL/tab manipulation
  useEffect(() => {
    if (currentUser && currentRole) {
      const allowed = ALLOWED_TABS[currentRole] || [];
      if (!allowed.includes(activeNavTab)) {
        setActiveNavTab('dashboard');
      }
    }
  }, [currentUser, currentRole, activeNavTab, setActiveNavTab]);

  // If user is not authenticated, render Login/Auth module
  if (!currentUser) {
    return <AuthPage />;
  }

  const isTabAllowed = ALLOWED_TABS[currentRole]?.includes(activeNavTab);

  return (
    <div className="min-h-screen bg-[#070b19] text-slate-100 flex flex-col font-sans">
      {/* Top Navigation Bar without Role Switcher */}
      <Navbar onOpenJudge0Modal={() => setIsJudge0ModalOpen(true)} />

      {/* Main Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Role-Based Sidebar */}
        <Sidebar onOpenJudge0Modal={() => setIsJudge0ModalOpen(true)} />

        {/* Content Viewport */}
        <main className="flex-1 overflow-y-auto bg-[#070b19]">
          {/* Fallback to role-specific dashboard if unauthorized tab */}
          {(!isTabAllowed || activeNavTab === 'dashboard') && (
            <>
              {currentRole === 'student' && <StudentDashboard />}
              {currentRole === 'teacher' && <TeacherDashboard />}
              {currentRole === 'admin' && <AdminDashboard />}
            </>
          )}

          {/* Student Routes */}
          {currentRole === 'student' && (
            <>
              {activeNavTab === 'my_lab' && <MyLab />}
              {activeNavTab === 'editor' && (
                <OnlineCodeEditor onOpenJudge0Modal={() => setIsJudge0ModalOpen(true)} />
              )}
              {activeNavTab === 'lab_history' && <LabHistory />}
              {activeNavTab === 'profile' && <StudentProfile />}
              {activeNavTab === 'notifications' && <NotificationCentre />}
              {activeNavTab === 'deadlines' && <DeadlineTracker />}
              {activeNavTab === 'announcements' && <FacultyAnnouncements />}
              {activeNavTab === 'attendance' && <AttendanceOverview />}
              {activeNavTab === 'quizzes' && <StudentQuizzes />}
              {activeNavTab === 'support' && <HelpAndSupport />}
            </>
          )}

          {/* Teacher Routes */}
          {currentRole === 'teacher' && (
            <>
              {activeNavTab === 'my_batches' && <MyBatches />}
              {activeNavTab === 'lab_sessions' && <LabSessionManagement />}
              {activeNavTab === 'student_monitoring' && <StudentMonitoring />}
              {activeNavTab === 'quizzes' && <QuizManagement />}
              {activeNavTab === 'academic_integrity' && <AcademicIntegrityMonitoring />}
              {activeNavTab === 'faculty_notifications' && <FacultyNotificationCentre />}
              {activeNavTab === 'teacher_reports' && <TeacherReports />}
              {activeNavTab === 'profile' && (
                <div className="p-6 max-w-4xl mx-auto">
                  <div className="bg-[#0e1738] border border-slate-800 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center gap-5 shadow-lg">
                    {currentUser.avatar ? (
                      <img
                        src={currentUser.avatar}
                        alt={currentUser.name}
                        className="w-20 h-20 rounded-2xl object-cover border-2 border-indigo-500/40 shrink-0"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-2xl font-bold text-indigo-300 shrink-0">
                        {currentUser.name.charAt(0)}
                      </div>
                    )}
                    <div className="space-y-1.5">
                      <h2 className="text-lg font-bold text-white">{currentUser.name}</h2>
                      <p className="text-xs text-indigo-300 font-semibold">
                        {currentUser.designation || 'Faculty'} · {currentUser.department}
                      </p>
                      <div className="flex flex-wrap gap-3 text-xs font-mono text-slate-300 pt-1">
                        <span>Faculty ID: <strong className="text-sky-400">{currentUser.employeeCode || 'FAC-ISE-01'}</strong></span>
                        <span>Email: <strong className="text-slate-200">{currentUser.email}</strong></span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Admin Routes */}
          {currentRole === 'admin' && (
            <>
              {activeNavTab === 'admin_students' && <StudentManagement />}
              {activeNavTab === 'admin_teachers' && <TeacherManagement />}
              {activeNavTab === 'admin_semesters' && <SemesterBatchManagement />}
              {activeNavTab === 'admin_curriculum' && <SubjectExperimentManagement />}
              {activeNavTab === 'admin_schedules' && <LabScheduleManagement />}
            </>
          )}

          {/* Shared Architecture Route */}
          {activeNavTab === 'architecture' && <DatabaseArchitecture />}
        </main>
      </div>

      {/* Judge0 Configuration Modal */}
      <Judge0ConfigModal
        isOpen={isJudge0ModalOpen}
        onClose={() => setIsJudge0ModalOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
