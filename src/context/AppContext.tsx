import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  AcademicIntegrityAlert,
  ActivityLog,
  Batch,
  BatchName,
  ClipboardEventRecord,
  Experiment,
  FacultyNotificationItem,
  LabSession,
  Quiz,
  QuizAttempt,
  Semester,
  StudentActivityStatus,
  StudentLabSession,
  StudentNotificationItem,
  Subject,
  Submission,
  SupportedLanguage,
  User,
  UserRole,
} from '../types';
import {
  INITIAL_ACTIVITY_LOGS,
  INITIAL_BATCHES,
  INITIAL_CLIPBOARD_EVENTS,
  INITIAL_EXPERIMENTS,
  INITIAL_FACULTY_NOTIFICATIONS,
  INITIAL_INTEGRITY_ALERTS,
  INITIAL_LAB_SESSIONS,
  INITIAL_SEMESTERS,
  INITIAL_STUDENT_LAB_SESSIONS,
  INITIAL_SUBJECTS,
  INITIAL_SUBMISSIONS,
  INITIAL_USERS,
} from '../data/mockData';
import { INITIAL_NOTIFICATIONS } from '../data/studentFeaturesData';
import {
  buildLiveBatchMonitoringSessions,
  INITIAL_QUIZ_ATTEMPTS,
  INITIAL_QUIZZES,
} from '../data/rosterData';
import { evaluateLabSubmission } from '../services/aiEvaluationService';
import { analyzePastedCode, CodeComparisonResult } from '../services/similarityService';

interface AppContextType {
  currentUser: User | null;
  currentRole: UserRole;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  users: User[];
  semesters: Semester[];
  batches: Batch[];
  subjects: Subject[];
  experiments: Experiment[];
  labSessions: LabSession[];
  studentLabSessions: StudentLabSession[];
  clipboardEvents: ClipboardEventRecord[];
  activityLogs: ActivityLog[];
  submissions: Submission[];
  activeNavTab: string;
  setActiveNavTab: (tab: string) => void;
  activeLabSessionId: string | null;
  setActiveLabSessionId: (id: string | null) => void;
  // Session Duration (120 Minutes Default) & One Active Batch Enforcement
  activeBatchSession: LabSession | null;
  sessionRemainingSeconds: number;
  sessionStartTime: string;
  sessionEndTime: string;
  totalSessionMinutes: number;
  isSimulationActive: boolean;
  toggleSimulation: () => void;
  canStudentExecute: (user?: User | null) => {
    allowed: boolean;
    reason?: string;
    activeBatchSession: LabSession | null;
  };
  startBatchLabSession: (params: {
    semesterNumber: number;
    batch: BatchName;
    durationMinutes?: number;
    subjectId?: string;
    experimentId?: string;
    programmingLanguage?: SupportedLanguage;
    title?: string;
    isCopyPasteRestricted?: boolean;
  }) => { success: boolean; message: string; session?: LabSession };
  endBatchLabSession: (sessionId?: string) => void;
  // Academic Integrity & Copy-Paste Detection
  integrityAlerts: AcademicIntegrityAlert[];
  handlePasteEvent: (pastedText: string, linesCount: number, charsCount: number) => CodeComparisonResult | null;
  reviewIntegrityAlert: (alertId: string, decision: string, remarks: string) => void;
  dismissIntegrityAlert: (alertId: string, reason: string) => void;
  // Smart Notifications (Student & Faculty separate)
  studentNotifications: StudentNotificationItem[];
  facultyNotifications: FacultyNotificationItem[];
  markStudentNotificationAsRead: (id: string) => void;
  markAllStudentNotificationsAsRead: () => void;
  deleteStudentNotification: (id: string) => void;
  clearStudentNotifications: () => void;
  acknowledgeStudentIntegrityWarning: (notificationId: string) => void;
  markFacultyNotificationAsRead: (id: string) => void;
  markAllFacultyNotificationsAsRead: () => void;
  clearFacultyNotifications: () => void;
  // Quiz Management
  quizzes: Quiz[];
  quizAttempts: QuizAttempt[];
  createQuiz: (quiz: Omit<Quiz, 'id' | 'createdAt' | 'createdBy'>) => void;
  toggleQuizStatus: (quizId: string, status: 'active' | 'draft' | 'closed') => void;
  submitQuizAttempt: (quizId: string, answers: Record<string, number>, timeTakenMinutes: number) => QuizAttempt | null;
  // Auth
  login: (email: string, role: UserRole) => boolean;
  logout: () => void;
  switchDemoUser: (userId: string) => void;
  // Student Actions
  startLab: (labSessionId: string) => void;
  trackEditorInteraction: (isMeaningfulAction?: boolean) => void;
  trackPageNavigation: (pageName: string) => void;
  setStudentCompiling: (isCompiling: boolean) => void;
  recordCodeRun: (success: boolean, isError: boolean) => void;
  recordClipboardAttempt: (action: 'copy' | 'paste' | 'cut') => void;
  updateActiveCode: (code: string) => void;
  submitLabProgram: (code: string, status: any, score: number, execTime: number, memoryKb: number) => void;
  // Teacher Actions & AI Evaluation
  createLabSession: (session: Partial<LabSession>) => void;
  updateLabSessionStatus: (sessionId: string, status: 'scheduled' | 'ongoing' | 'completed') => { success: boolean; message?: string };
  gradeLabSession: (sessionId: string, score: number, feedback: string) => void;
  approveStudentMarks: (sessionId: string, approvedScore: number, feedback: string) => void;
  runAiEvaluationForSession: (sessionId: string) => void;
  // Admin Actions
  addStudent: (data: Partial<User>) => void;
  updateStudent: (id: string, data: Partial<User>) => void;
  deleteStudent: (id: string) => void;
  addTeacher: (data: Partial<User>) => void;
  updateTeacher: (id: string, data: Partial<User>) => void;
  deleteTeacher: (id: string) => void;
  addSubject: (data: Partial<Subject>) => void;
  addExperiment: (data: Partial<Experiment>) => void;
  addSemester: (semNumber: number, academicYear: string) => void;
  // System
  logActivity: (action: string, details: string, severity?: 'info' | 'success' | 'warning' | 'alert') => void;
  resetAllData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  USER: 'smartlab_gsss_v2_user',
  THEME: 'smartlab_gsss_v2_theme',
  USERS: 'smartlab_gsss_v2_users',
  SEMESTERS: 'smartlab_gsss_v2_semesters',
  BATCHES: 'smartlab_gsss_v2_batches',
  SUBJECTS: 'smartlab_gsss_v2_subjects',
  EXPERIMENTS: 'smartlab_gsss_v2_experiments',
  LAB_SESSIONS: 'smartlab_gsss_v2_lab_sessions',
  STUDENT_SESSIONS: 'smartlab_gsss_v2_student_sessions',
  CLIPBOARD: 'smartlab_gsss_v2_clipboard',
  LOGS: 'smartlab_gsss_v2_logs',
  SUBMISSIONS: 'smartlab_gsss_v2_submissions',
  INTEGRITY_ALERTS: 'smartlab_gsss_v2_integrity_alerts',
  STUDENT_NOTIFICATIONS: 'smartlab_gsss_v2_student_notifications',
  FACULTY_NOTIFICATIONS: 'smartlab_gsss_v2_faculty_notifications',
  QUIZZES: 'smartlab_gsss_v2_quizzes',
  QUIZ_ATTEMPTS: 'smartlab_gsss_v2_quiz_attempts',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Theme state
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.THEME);
      if (stored === 'light' || stored === 'dark') return stored;
    } catch {}
    return 'dark';
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Current User (defaults to Student Devika Rao)
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.USER);
      if (stored) return JSON.parse(stored);
    } catch {}
    return INITIAL_USERS[0];
  });

  // State collections with localStorage persistence
  const [users, setUsers] = useState<User[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.USERS);
      if (stored) return JSON.parse(stored);
    } catch {}
    return INITIAL_USERS;
  });

  const [semesters, setSemesters] = useState<Semester[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SEMESTERS);
      if (stored) return JSON.parse(stored);
    } catch {}
    return INITIAL_SEMESTERS;
  });

  const [batches, setBatches] = useState<Batch[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.BATCHES);
      if (stored) return JSON.parse(stored);
    } catch {}
    return INITIAL_BATCHES;
  });

  const [subjects, setSubjects] = useState<Subject[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SUBJECTS);
      if (stored) return JSON.parse(stored);
    } catch {}
    return INITIAL_SUBJECTS;
  });

  const [experiments, setExperiments] = useState<Experiment[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.EXPERIMENTS);
      if (stored) return JSON.parse(stored);
    } catch {}
    return INITIAL_EXPERIMENTS;
  });

  const [labSessions, setLabSessions] = useState<LabSession[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.LAB_SESSIONS);
      if (stored) return JSON.parse(stored);
    } catch {}
    return INITIAL_LAB_SESSIONS;
  });

  const [studentLabSessions, setStudentLabSessions] = useState<StudentLabSession[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.STUDENT_SESSIONS);
      if (stored) return JSON.parse(stored);
    } catch {}
    return INITIAL_STUDENT_LAB_SESSIONS;
  });

  const [clipboardEvents, setClipboardEvents] = useState<ClipboardEventRecord[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CLIPBOARD);
      if (stored) return JSON.parse(stored);
    } catch {}
    return INITIAL_CLIPBOARD_EVENTS;
  });

  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.LOGS);
      if (stored) return JSON.parse(stored);
    } catch {}
    return INITIAL_ACTIVITY_LOGS;
  });

  const [submissions, setSubmissions] = useState<Submission[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SUBMISSIONS);
      if (stored) return JSON.parse(stored);
    } catch {}
    return INITIAL_SUBMISSIONS;
  });

  // Academic Integrity Alerts (Flagged copy-paste events)
  const [integrityAlerts, setIntegrityAlerts] = useState<AcademicIntegrityAlert[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.INTEGRITY_ALERTS);
      if (stored) return JSON.parse(stored);
    } catch {}
    return INITIAL_INTEGRITY_ALERTS;
  });

  // Smart Notifications: Student and Faculty separate
  const [studentNotifications, setStudentNotifications] = useState<StudentNotificationItem[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.STUDENT_NOTIFICATIONS);
      if (stored) return JSON.parse(stored);
    } catch {}
    return INITIAL_NOTIFICATIONS.map((n) => ({
      ...n,
      description: n.message,
      priority: n.priority || 'normal',
    }));
  });

  const [facultyNotifications, setFacultyNotifications] = useState<FacultyNotificationItem[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.FACULTY_NOTIFICATIONS);
      if (stored) return JSON.parse(stored);
    } catch {}
    return INITIAL_FACULTY_NOTIFICATIONS;
  });

  // Quiz Management State
  const [quizzes, setQuizzes] = useState<Quiz[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.QUIZZES);
      if (stored) return JSON.parse(stored);
    } catch {}
    return INITIAL_QUIZZES;
  });

  const [quizAttempts, setQuizAttempts] = useState<QuizAttempt[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.QUIZ_ATTEMPTS);
      if (stored) return JSON.parse(stored);
    } catch {}
    return INITIAL_QUIZ_ATTEMPTS;
  });

  // Navigation
  const [activeNavTab, setActiveNavTab] = useState<string>('dashboard');
  const [activeLabSessionId, setActiveLabSessionId] = useState<string | null>('ls-501');

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.INTEGRITY_ALERTS, JSON.stringify(integrityAlerts));
  }, [integrityAlerts]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.STUDENT_NOTIFICATIONS, JSON.stringify(studentNotifications));
  }, [studentNotifications]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.FACULTY_NOTIFICATIONS, JSON.stringify(facultyNotifications));
  }, [facultyNotifications]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.QUIZZES, JSON.stringify(quizzes));
  }, [quizzes]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.QUIZ_ATTEMPTS, JSON.stringify(quizAttempts));
  }, [quizAttempts]);

  // Sync to localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(STORAGE_KEYS.USER);
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LAB_SESSIONS, JSON.stringify(labSessions));
  }, [labSessions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.STUDENT_SESSIONS, JSON.stringify(studentLabSessions));
  }, [studentLabSessions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CLIPBOARD, JSON.stringify(clipboardEvents));
  }, [clipboardEvents]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(activityLogs));
  }, [activityLogs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(submissions));
  }, [submissions]);

  const currentRole: UserRole = currentUser?.role || 'student';

  // One Active Batch at a Time: single ongoing LabSession
  const activeBatchSession: LabSession | null =
    labSessions.find((ls) => ls.status === 'ongoing') || null;

  // Session Duration (Default: 120 Minutes = 7200s)
  const [sessionRemainingSeconds, setSessionRemainingSeconds] = useState<number>(4920); // 82 mins remaining
  const sessionStartTime = activeBatchSession?.startTime || '09:00 AM';
  const sessionEndTime = activeBatchSession?.endTime || '11:00 AM';
  const totalSessionMinutes = activeBatchSession?.durationMinutes || 120;
  const [isSimulationActive, setIsSimulationActive] = useState<boolean>(true);

  const toggleSimulation = () => {
    setIsSimulationActive((prev) => !prev);
  };

  // 1-Second Heartbeat to update countdown, active/idle time, and live activity statuses
  useEffect(() => {
    const interval = setInterval(() => {
      // 1. Decrement lab session countdown timer (stops at 0)
      if (activeBatchSession) {
        setSessionRemainingSeconds((prev) => Math.max(0, prev - 1));
      }

      // 2. Track current student's active vs idle status (2-minute idle threshold)
      if (currentRole === 'student' && currentUser && activeLabSessionId) {
        setStudentLabSessions((prev) => {
          const index = prev.findIndex(
            (s) => s.studentId === currentUser.id && s.labSessionId === activeLabSessionId
          );
          if (index === -1) return prev;

          const currentSession = prev[index];
          if (currentSession.activityStatus === 'Submitted' || currentSession.activityStatus === 'Compiling') {
            return prev; // Do not alter submitted or actively compiling status
          }

          const lastInteraction = new Date(currentSession.lastInteractionTime).getTime();
          const now = Date.now();
          const idleElapsedMs = now - lastInteraction;
          const isIdle = idleElapsedMs > 120000; // 2 minutes (120 seconds) idle threshold

          // Activity status logic
          let newActivityStatus: StudentActivityStatus = currentSession.activityStatus;
          if (isIdle) {
            newActivityStatus = 'Idle'; // Idle - Yellow
          } else if (currentSession.activityStatus === 'Typing') {
            // If active within last 20 seconds, stay Typing, else transition to Viewing
            if (idleElapsedMs > 20000) {
              newActivityStatus = 'Viewing'; // Viewing - Blue
            }
          }

          const updated: StudentLabSession = {
            ...currentSession,
            totalDurationSeconds: currentSession.totalDurationSeconds + 1,
            activeTimeSeconds: isIdle ? currentSession.activeTimeSeconds : currentSession.activeTimeSeconds + 1,
            idleTimeSeconds: isIdle ? currentSession.idleTimeSeconds + 1 : currentSession.idleTimeSeconds,
            remainingSeconds: Math.max(0, currentSession.remainingSeconds - 1),
            status: isIdle ? 'idle' : 'active',
            activityStatus: newActivityStatus,
          };

          const copy = [...prev];
          copy[index] = updated;
          return copy;
        });
      }

      // 3. Concurrent batch simulation across active cohort (Typing, Compiling, Idle, Viewing)
      if (isSimulationActive && activeBatchSession) {
        setStudentLabSessions((prev) => {
          if (sessionRemainingSeconds % 8 !== 0) return prev;

          return prev.map((s) => {
            if (
              s.labSessionId !== activeBatchSession.id ||
              s.studentId === currentUser?.id ||
              s.activityStatus === 'Submitted' ||
              s.activityStatus === 'Absent'
            ) {
              return s;
            }

            const rand = Math.random();
            let simulatedStatus: StudentActivityStatus = s.activityStatus;
            let extraCompiles = 0;

            if (s.activityStatus === 'Compiling') {
              // Finish compiling and return to Typing or Viewing
              simulatedStatus = rand > 0.35 ? 'Typing' : 'Viewing';
            } else if (s.activityStatus === 'Typing') {
              if (rand > 0.78) {
                simulatedStatus = 'Compiling';
                extraCompiles = 1;
              } else if (rand < 0.15) {
                simulatedStatus = 'Viewing';
              }
            } else if (s.activityStatus === 'Viewing') {
              if (rand > 0.6) {
                simulatedStatus = 'Typing';
              } else if (rand < 0.15) {
                simulatedStatus = 'Idle';
              }
            } else if (s.activityStatus === 'Idle' && rand > 0.85) {
              simulatedStatus = 'Typing';
            }

            return {
              ...s,
              activityStatus: simulatedStatus,
              compilationAttempts: s.compilationAttempts + extraCompiles,
              programExecutions: s.programExecutions + extraCompiles,
              successfulCompilations: s.successfulCompilations + extraCompiles,
              isSimulated: true,
            };
          });
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [currentRole, currentUser?.id, activeLabSessionId, isSimulationActive, sessionRemainingSeconds]);

  // Auth methods
  const login = (email: string, role: UserRole): boolean => {
    const user = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.role === role
    );
    if (user) {
      setCurrentUser(user);
      setActiveNavTab('dashboard');
      logActivity(
        'User Authentication',
        `${user.name} logged in as ${user.role.toUpperCase()}.`,
        'info'
      );
      return true;
    }
    // Fallback registration for custom email
    const fallback: User = {
      id: `usr-${Date.now()}`,
      name: email.split('@')[0],
      email,
      role,
      department: 'Information Science & Engineering',
      studentName: email.split('@')[0],
      usn: role === 'student' ? '4GW24IS' + Math.floor(100 + Math.random() * 900) : undefined,
      admissionYear: role === 'student' ? 2024 : undefined,
      currentSemester: role === 'student' ? 5 : undefined,
      semester: role === 'student' ? 5 : undefined,
      academicYear: '2026-2027',
      batch: role === 'student' ? 'Batch A' : undefined,
      createdAt: new Date().toISOString(),
    };
    setCurrentUser(fallback);
    setUsers((prev) => [...prev, fallback]);
    setActiveNavTab('dashboard');
    logActivity('User Authentication', `${fallback.name} session started.`, 'info');
    return true;
  };

  const logout = () => {
    if (currentUser) {
      logActivity('User Signout', `${currentUser.name} signed out.`, 'info');
    }
    setCurrentUser(null);
    setActiveNavTab('dashboard');
  };

  const switchDemoUser = (userId: string) => {
    const target = users.find((u) => u.id === userId);
    if (target) {
      setCurrentUser(target);
      setActiveNavTab('dashboard');
      logActivity('Role Switched', `Persona changed to ${target.name} (${target.role.toUpperCase()}).`, 'info');
    }
  };

  // Student Actions
  const startLab = (labSessionId: string) => {
    if (!currentUser) return;
    setActiveLabSessionId(labSessionId);
    setActiveNavTab('editor');

    const session = labSessions.find((ls) => ls.id === labSessionId);
    const existing = studentLabSessions.find(
      (s) => s.studentId === currentUser.id && s.labSessionId === labSessionId
    );

    const currentTimeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    if (!existing && session) {
      const exp = experiments.find((e) => e.id === session.experimentId);
      const newStudentSession: StudentLabSession = {
        id: `sls-${Date.now()}`,
        studentId: currentUser.id,
        studentName: currentUser.name,
        usn: currentUser.usn || '4GW24IS010',
        semesterNumber: currentUser.semester || 5,
        batch: currentUser.batch || 'Batch A',
        labSessionId,
        experimentName: session.experimentName,
        subjectName: session.subjectName,
        programmingLanguage: session.programmingLanguage,
        sessionStartTime: new Date().toISOString(),
        loginTime: currentTimeStr,
        totalDurationSeconds: 0,
        activeTimeSeconds: 0,
        idleTimeSeconds: 0,
        compilationAttempts: 0,
        successfulCompilations: 0,
        failedCompilations: 0,
        programExecutions: 0,
        executionErrors: 0,
        clipboardViolationCount: 0,
        lastInteractionTime: new Date().toISOString(),
        status: 'active',
        activityStatus: 'Viewing', // 3. Viewing - Blue
        sessionDurationMinutes: 120,
        remainingSeconds: sessionRemainingSeconds,
        testCasesPassed: 0,
        totalTestCases: 5,
        submissionCount: 0,
        assignmentStatus: 'In Progress',
        currentCode: exp?.starterCode || '',
      };
      setStudentLabSessions((prev) => [newStudentSession, ...prev]);
    } else if (existing && existing.activityStatus !== 'Submitted') {
      setStudentLabSessions((prev) =>
        prev.map((s) =>
          s.studentId === currentUser.id && s.labSessionId === labSessionId
            ? { ...s, activityStatus: 'Viewing', lastInteractionTime: new Date().toISOString() }
            : s
        )
      );
    }

    logActivity('Lab Entered', `${currentUser.name} opened lab session: ${session?.title || labSessionId}.`, 'info');
  };

  const trackEditorInteraction = (isMeaningfulAction = true) => {
    if (!currentUser || !activeLabSessionId) return;
    setStudentLabSessions((prev) =>
      prev.map((s) =>
        s.studentId === currentUser.id && s.labSessionId === activeLabSessionId
          ? {
              ...s,
              lastInteractionTime: new Date().toISOString(),
              status: 'active',
              activityStatus: s.activityStatus === 'Submitted' ? 'Submitted' : 'Typing', // 1. Typing - Green
            }
          : s
      )
    );
  };

  const trackPageNavigation = (pageName: string) => {
    if (!currentUser || currentRole !== 'student' || !activeLabSessionId) return;
    setStudentLabSessions((prev) =>
      prev.map((s) =>
        s.studentId === currentUser.id && s.labSessionId === activeLabSessionId && s.activityStatus !== 'Submitted'
          ? {
              ...s,
              lastInteractionTime: new Date().toISOString(),
              activityStatus: 'Viewing', // 3. Viewing - Blue
            }
          : s
      )
    );
  };

  const updateActiveCode = (code: string) => {
    trackEditorInteraction(true);
    if (!currentUser || !activeLabSessionId) return;
    setStudentLabSessions((prev) =>
      prev.map((s) =>
        s.studentId === currentUser.id && s.labSessionId === activeLabSessionId
          ? { ...s, currentCode: code, activityStatus: s.activityStatus === 'Submitted' ? 'Submitted' : 'Typing' }
          : s
      )
    );
  };

  const setStudentCompiling = (isCompiling: boolean) => {
    if (!currentUser || !activeLabSessionId) return;
    setStudentLabSessions((prev) =>
      prev.map((s) =>
        s.studentId === currentUser.id &&
        s.labSessionId === activeLabSessionId &&
        s.activityStatus !== 'Submitted'
          ? {
              ...s,
              lastInteractionTime: new Date().toISOString(),
              activityStatus: isCompiling ? 'Compiling' : 'Typing',
            }
          : s
      )
    );
  };

  const recordCodeRun = (success: boolean, isError: boolean) => {
    if (!currentUser || !activeLabSessionId) return;
    trackEditorInteraction(true);
    setStudentLabSessions((prev) =>
      prev.map((s) =>
        s.studentId === currentUser.id && s.labSessionId === activeLabSessionId
          ? {
              ...s,
              compilationAttempts: s.compilationAttempts + 1,
              successfulCompilations: success ? s.successfulCompilations + 1 : s.successfulCompilations,
              failedCompilations: !success ? s.failedCompilations + 1 : s.failedCompilations,
              programExecutions: s.programExecutions + 1,
              executionErrors: isError ? s.executionErrors + 1 : s.executionErrors,
              testCasesPassed: success ? 5 : 3,
            }
          : s
      )
    );
  };

  const recordClipboardAttempt = (action: 'copy' | 'paste' | 'cut') => {
    if (!currentUser || !activeLabSessionId) return;
    const session = labSessions.find((ls) => ls.id === activeLabSessionId);

    const newRecord: ClipboardEventRecord = {
      id: `cb-${Date.now()}`,
      studentId: currentUser.id,
      studentName: currentUser.name,
      usn: currentUser.usn || '4GW24IS010',
      labSessionId: activeLabSessionId,
      experimentName: session?.experimentName || 'Laboratory Assignment',
      action,
      blocked: true,
      timestamp: new Date().toISOString(),
      details: `Intercepted and blocked unauthorized clipboard ${action.toUpperCase()} action in Monaco editor buffer.`,
    };

    setClipboardEvents((prev) => [newRecord, ...prev]);

    setStudentLabSessions((prev) =>
      prev.map((s) =>
        s.studentId === currentUser.id && s.labSessionId === activeLabSessionId
          ? { ...s, clipboardViolationCount: s.clipboardViolationCount + 1 }
          : s
      )
    );

    logActivity(
      'Clipboard Security Violation',
      `${currentUser.name} [${currentUser.usn}] attempted ${action.toUpperCase()} in restricted lab session.`,
      'warning'
    );
  };

  // Academic Integrity & Copy-Paste Detection System
  const handlePasteEvent = (
    pastedText: string,
    linesCount: number,
    charsCount: number
  ): CodeComparisonResult | null => {
    if (!currentUser) return null;

    const currentSession = labSessions.find((ls) => ls.id === activeLabSessionId);
    const expName = currentSession?.experimentName || 'Laboratory Assignment';

    const comparison = analyzePastedCode(
      pastedText,
      currentUser.id,
      currentUser.name,
      expName,
      studentLabSessions,
      submissions
    );

    // If small paste, normal coding activity (e.g. variable name or <=2 lines) -> do not flag
    if (!comparison.isSuspicious) {
      return comparison;
    }

    const currentTimeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const alertId = `int-${Date.now()}`;

    const newAlert: AcademicIntegrityAlert = {
      id: alertId,
      studentId: currentUser.id,
      studentName: currentUser.name,
      usn: currentUser.usn || '4GW24IS010',
      semesterNumber: currentUser.semester || 5,
      batch: currentUser.batch || 'Batch A',
      labSessionId: activeLabSessionId || 'ls-501',
      assignmentName: expName,
      pastedCode: pastedText,
      linesPasted: linesCount,
      charactersPasted: charsCount,
      timestamp: `Today at ${currentTimeStr}`,
      similarityScore: comparison.similarityScore,
      riskLevel: comparison.riskLevel,
      matchedStudentName: comparison.matchedStudentName,
      matchedStudentUsn: comparison.matchedStudentUsn,
      matchedCode: comparison.matchedCode,
      matchedSourceDescription: comparison.matchedSourceDescription,
      structuralMetrics: comparison.structuralMetrics,
      status: 'Pending Review',
    };

    setIntegrityAlerts((prev) => [newAlert, ...prev]);

    // 1. Immediately send Warning Notification to Student Dashboard
    const studentWarning: StudentNotificationItem = {
      id: `notif-warn-${Date.now()}`,
      studentId: currentUser.id,
      title: 'Academic Integrity Alert',
      description: 'Unusual copy-paste activity has been detected in your coding session. Please ensure that your submitted code represents your own work.',
      category: 'integrity',
      subCategory: 'copy_paste_warning',
      timestamp: `Today at ${currentTimeStr}`,
      isRead: false,
      priority: 'urgent',
      assignmentName: expName,
      copyPasteDetails: `Pasted large code block (${linesCount} lines / ${charsCount} characters) into editor buffer.`,
      warningStatus: 'Active Warning',
      integrityAlertId: alertId,
    };
    setStudentNotifications((prev) => [studentWarning, ...prev]);

    // 2. Immediately send Alert to Faculty Dashboard
    const facultyAlert: FacultyNotificationItem = {
      id: `fac-warn-${Date.now()}`,
      title: 'Suspicious Copy-Paste Activity Detected',
      description: `${currentUser.name} [${currentUser.usn}] pasted a large code block (${linesCount} lines / ${charsCount} chars) in ${expName}. Similarity: ${comparison.similarityScore}% (${comparison.riskLevel} Risk).`,
      category: 'integrity',
      timestamp: `Today at ${currentTimeStr}`,
      isRead: false,
      priority: comparison.riskLevel === 'High' ? 'urgent' : 'important',
      studentName: currentUser.name,
      usn: currentUser.usn || '4GW24IS010',
      assignmentName: expName,
      riskLevel: comparison.riskLevel,
      similarityScore: comparison.similarityScore,
      integrityAlertId: alertId,
    };
    setFacultyNotifications((prev) => [facultyAlert, ...prev]);

    // 3. Log into audit activity trail
    logActivity(
      'Academic Integrity Flagged',
      `Suspicious copy-paste detected for ${currentUser.name} [${currentUser.usn}]: ${linesCount} lines pasted in ${expName}. Risk: ${comparison.riskLevel} (${comparison.similarityScore}% similarity).`,
      comparison.riskLevel === 'High' ? 'alert' : 'warning'
    );

    return comparison;
  };

  const reviewIntegrityAlert = (alertId: string, decision: string, remarks: string) => {
    const reviewerName = currentUser?.name || 'Faculty In-Charge';
    const reviewedTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setIntegrityAlerts((prev) =>
      prev.map((a) =>
        a.id === alertId
          ? {
              ...a,
              status: decision.toLowerCase().includes('false positive') ? 'Dismissed False Positive' : 'Reviewed',
              facultyDecision: decision,
              facultyRemarks: remarks,
              reviewedBy: reviewerName,
              reviewedAt: `Today at ${reviewedTime}`,
            }
          : a
      )
    );

    logActivity(
      'Integrity Alert Reviewed',
      `Faculty ${reviewerName} recorded decision: "${decision}" for alert ${alertId}.`,
      'info'
    );
  };

  const dismissIntegrityAlert = (alertId: string, reason: string) => {
    const reviewerName = currentUser?.name || 'Faculty In-Charge';
    const reviewedTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setIntegrityAlerts((prev) =>
      prev.map((a) =>
        a.id === alertId
          ? {
              ...a,
              status: 'Dismissed False Positive',
              facultyDecision: 'Dismissed as False Positive',
              facultyRemarks: reason,
              reviewedBy: reviewerName,
              reviewedAt: `Today at ${reviewedTime}`,
            }
          : a
      )
    );

    logActivity(
      'Integrity Alert Dismissed',
      `Faculty dismissed alert ${alertId} as false-positive: ${reason}`,
      'info'
    );
  };

  // Student Notification Handlers
  const markStudentNotificationAsRead = (id: string) => {
    setStudentNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const markAllStudentNotificationsAsRead = () => {
    setStudentNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const deleteStudentNotification = (id: string) => {
    setStudentNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const clearStudentNotifications = () => {
    setStudentNotifications([]);
  };

  const acknowledgeStudentIntegrityWarning = (notificationId: string) => {
    setStudentNotifications((prev) =>
      prev.map((n) =>
        n.id === notificationId
          ? { ...n, warningStatus: 'Acknowledged', isRead: true }
          : n
      )
    );
  };

  // Faculty Notification Handlers
  const markFacultyNotificationAsRead = (id: string) => {
    setFacultyNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const markAllFacultyNotificationsAsRead = () => {
    setFacultyNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const clearFacultyNotifications = () => {
    setFacultyNotifications([]);
  };

  const submitLabProgram = (
    code: string,
    status: any,
    score: number,
    execTime: number,
    memoryKb: number
  ) => {
    if (!currentUser || !activeLabSessionId) return;
    const session = labSessions.find((ls) => ls.id === activeLabSessionId);
    const existing = studentLabSessions.find(
      (s) => s.studentId === currentUser.id && s.labSessionId === activeLabSessionId
    );

    const testCasesPassed = status === 'Accepted' ? 5 : 3;

    // AI-Based Automatic Marks Evaluation
    const aiEval = evaluateLabSubmission({
      code,
      language: session?.programmingLanguage || 'python',
      experimentTitle: session?.experimentName || 'Laboratory Assignment',
      testCasesPassed,
      totalTestCases: 5,
      activeTimeSeconds: existing?.activeTimeSeconds || 1200,
      idleTimeSeconds: existing?.idleTimeSeconds || 240,
      totalLabSeconds: existing?.totalDurationSeconds || 1440,
      compilationAttempts: (existing?.compilationAttempts || 0) + 1,
      successfulCompilations: (existing?.successfulCompilations || 0) + (status === 'Accepted' ? 1 : 0),
      clipboardViolations: existing?.clipboardViolationCount || 0,
      isSubmitted: true,
      submissionTimeRemainingMinutes: Math.round(sessionRemainingSeconds / 60),
    });

    const evaluatedScore = aiEval.totalSuggestedScore;

    const newSub: Submission = {
      id: `sub-${Date.now()}`,
      labSessionId: activeLabSessionId,
      studentId: currentUser.id,
      studentName: currentUser.name,
      usn: currentUser.usn || '4GW24IS010',
      semesterNumber: currentUser.semester || 5,
      batch: currentUser.batch || 'Batch A',
      experimentName: session?.experimentName || 'Lab Assignment',
      programmingLanguage: session?.programmingLanguage || 'python',
      code,
      status,
      score: evaluatedScore,
      maxScore: 50,
      executionTime: execTime,
      memoryKb,
      submittedAt: new Date().toISOString(),
      feedback: aiEval.overallExplanation,
    };

    setSubmissions((prev) => [newSub, ...prev]);

    setStudentLabSessions((prev) =>
      prev.map((s) =>
        s.studentId === currentUser.id && s.labSessionId === activeLabSessionId
          ? {
              ...s,
              status: 'completed',
              activityStatus: 'Submitted', // 5. Submitted - Purple
              sessionEndTime: new Date().toISOString(),
              logoutTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              testCasesPassed,
              submissionCount: s.submissionCount + 1,
              assignmentStatus: 'Completed',
              score: evaluatedScore,
              aiEvaluation: aiEval,
              facultyApprovedScore: evaluatedScore,
              facultyFeedback: 'AI evaluation ready for faculty review.',
              isFacultyApproved: false,
            }
          : s
      )
    );

    logActivity(
      'Experiment Submitted & AI Evaluated',
      `${currentUser.name} submitted solution for ${session?.experimentName}. AI Suggested Score: ${evaluatedScore}/50. Verdict: ${status}.`,
      status === 'Accepted' ? 'success' : 'warning'
    );
  };

  const approveStudentMarks = (sessionId: string, approvedScore: number, feedback: string) => {
    setStudentLabSessions((prev) =>
      prev.map((s) =>
        s.id === sessionId
          ? {
              ...s,
              score: approvedScore,
              facultyApprovedScore: approvedScore,
              facultyFeedback: feedback,
              isFacultyApproved: true,
              facultyApprovedAt: new Date().toISOString(),
            }
          : s
      )
    );

    logActivity(
      'Faculty Marks Approved',
      `Faculty reviewed and finalized score of ${approvedScore}/50 for session ID ${sessionId}.`,
      'success'
    );
  };

  const runAiEvaluationForSession = (sessionId: string) => {
    setStudentLabSessions((prev) =>
      prev.map((s) => {
        if (s.id !== sessionId) return s;

        const aiEval = evaluateLabSubmission({
          code: s.currentCode || INITIAL_EXPERIMENTS[0].starterCode,
          language: s.programmingLanguage,
          experimentTitle: s.experimentName,
          testCasesPassed: s.testCasesPassed || 4,
          totalTestCases: s.totalTestCases || 5,
          activeTimeSeconds: s.activeTimeSeconds,
          idleTimeSeconds: s.idleTimeSeconds,
          totalLabSeconds: s.totalDurationSeconds,
          compilationAttempts: s.compilationAttempts,
          successfulCompilations: s.successfulCompilations,
          clipboardViolations: s.clipboardViolationCount,
          isSubmitted: s.activityStatus === 'Submitted',
          submissionTimeRemainingMinutes: Math.round(s.remainingSeconds / 60),
        });

        return {
          ...s,
          aiEvaluation: aiEval,
          score: aiEval.totalSuggestedScore,
          facultyApprovedScore: s.facultyApprovedScore ?? aiEval.totalSuggestedScore,
        };
      })
    );

    logActivity('AI Re-Evaluation', `Generated new AI rubric breakdown for session ${sessionId}.`, 'info');
  };

  // Strict One-Active-Batch execution gate for students
  const canStudentExecute = (targetUser?: User | null) => {
    const userToCheck = targetUser === undefined ? currentUser : targetUser;
    if (!activeBatchSession) {
      return {
        allowed: false,
        reason: 'No active batch lab session is currently running. Please wait for your faculty to start a session.',
        activeBatchSession: null,
      };
    }
    if (sessionRemainingSeconds <= 0) {
      return {
        allowed: false,
        reason: `The lab session timer for Semester ${activeBatchSession.semesterNumber} ${activeBatchSession.batch} has expired.`,
        activeBatchSession,
      };
    }
    if (!userToCheck || userToCheck.role !== 'student') {
      return { allowed: true, activeBatchSession };
    }
    const studentSem = userToCheck.semester || userToCheck.currentSemester || 5;
    const studentBatch = userToCheck.batch || 'Batch A';
    if (
      studentSem !== activeBatchSession.semesterNumber ||
      studentBatch !== activeBatchSession.batch
    ) {
      return {
        allowed: false,
        reason: `Execution is locked for your batch (Sem ${studentSem} ${studentBatch}). Only Semester ${activeBatchSession.semesterNumber} ${activeBatchSession.batch} is active right now.`,
        activeBatchSession,
      };
    }
    return { allowed: true, activeBatchSession };
  };

  // Start a Lab Session for a single (Semester, Batch) — enforces One Active Batch at a Time
  const startBatchLabSession = ({
    semesterNumber,
    batch,
    durationMinutes = 120,
    subjectId,
    experimentId,
    programmingLanguage,
    title,
    isCopyPasteRestricted = true,
  }: {
    semesterNumber: number;
    batch: BatchName;
    durationMinutes?: number;
    subjectId?: string;
    experimentId?: string;
    programmingLanguage?: SupportedLanguage;
    title?: string;
    isCopyPasteRestricted?: boolean;
  }) => {
    if (activeBatchSession) {
      return {
        success: false,
        message: `Cannot start Semester ${semesterNumber} ${batch}: Semester ${activeBatchSession.semesterNumber} ${activeBatchSession.batch} already has an active lab session. Please end the current session first.`,
      };
    }

    const chosenSubject =
      subjects.find((s) => s.id === subjectId) ||
      subjects.find((s) => s.semesterNumber === semesterNumber) ||
      subjects[0];
    const chosenExperiment =
      experiments.find((e) => e.id === experimentId) ||
      experiments.find((e) => e.programmingLanguage === (programmingLanguage || chosenSubject?.primaryLanguage)) ||
      experiments[0];
    const lang = programmingLanguage || chosenExperiment?.programmingLanguage || chosenSubject?.primaryLanguage || 'python';

    const now = new Date();
    const endDateObj = new Date(now.getTime() + durationMinutes * 60000);
    const fmt = (d: Date) =>
      d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newSession: LabSession = {
      id: `ls-${Date.now()}`,
      title:
        title ||
        `Sem ${semesterNumber} ${batch} Live Lab: ${chosenExperiment?.title || 'Programming Practice'}`,
      subjectId: chosenSubject?.id || 'sub-is504',
      subjectName: chosenSubject?.name || 'Programming Laboratory',
      subjectCode: chosenSubject?.code || `IS${semesterNumber}01`,
      semesterNumber,
      batch,
      experimentId: chosenExperiment?.id || 'exp-01',
      experimentName: chosenExperiment?.title || 'Laboratory Experiment',
      programmingLanguage: lang,
      teacherId: currentUser?.id || 'usr-teacher-1',
      teacherName: currentUser?.name || 'Dr. Arvind Kulkarni',
      startDate: now.toISOString().split('T')[0],
      startTime: fmt(now),
      endTime: fmt(endDateObj),
      durationMinutes,
      startedAt: now.toISOString(),
      instructions:
        'Only students enrolled in this active batch may execute programs concurrently. 120-minute lab monitoring is enabled.',
      isCopyPasteRestricted,
      status: 'ongoing',
      createdAt: now.toISOString(),
    };

    setLabSessions((prev) => [newSession, ...prev]);
    setActiveLabSessionId(newSession.id);
    setSessionRemainingSeconds(durationMinutes * 60);

    // Populate live monitoring records for all 20+ students in the selected semester & batch
    const batchStudents = users.filter(
      (u) =>
        u.role === 'student' &&
        (u.semester || u.currentSemester) === semesterNumber &&
        u.batch === batch
    );
    const liveRecords = buildLiveBatchMonitoringSessions(
      batchStudents,
      newSession,
      chosenExperiment?.starterCode || '',
      studentLabSessions
    );
    if (liveRecords.length > 0) {
      setStudentLabSessions((prev) => [...liveRecords, ...prev]);
    }

    // Notify student portal of active batch start
    const startNotif: StudentNotificationItem = {
      id: `notif-labstart-${Date.now()}`,
      title: `Lab Session Started: Semester ${semesterNumber} ${batch}`,
      description: `${currentUser?.name || 'Faculty'} started a ${durationMinutes}-minute live lab session for ${newSession.experimentName}. Code execution is now unlocked for ${batch}.`,
      category: 'lab',
      subCategory: 'session_started',
      timestamp: `Today at ${fmt(now)}`,
      isRead: false,
      priority: 'important',
      assignmentName: newSession.experimentName,
    };
    setStudentNotifications((prev) => [startNotif, ...prev]);

    logActivity(
      'Active Batch Session Started',
      `Started ${durationMinutes}-min lab execution session for Semester ${semesterNumber} ${batch} (${batchStudents.length} enrolled students).`,
      'success'
    );

    return {
      success: true,
      message: `Live lab session started for Semester ${semesterNumber} ${batch} (${durationMinutes} mins, ${batchStudents.length} students).`,
      session: newSession,
    };
  };

  const endBatchLabSession = (sessionId?: string) => {
    const target = sessionId
      ? labSessions.find((ls) => ls.id === sessionId)
      : activeBatchSession;
    if (!target) return;

    const nowIso = new Date().toISOString();
    setLabSessions((prev) =>
      prev.map((ls) =>
        ls.id === target.id ? { ...ls, status: 'completed', endedAt: nowIso } : ls
      )
    );
    setSessionRemainingSeconds(0);

    logActivity(
      'Active Batch Session Ended',
      `Ended lab execution session for Semester ${target.semesterNumber} ${target.batch}. Execution locked until next batch starts.`,
      'info'
    );
  };

  // Quiz Management Handlers
  const createQuiz = (quizData: Omit<Quiz, 'id' | 'createdAt' | 'createdBy'>) => {
    const newQuiz: Quiz = {
      ...quizData,
      id: `quiz-${Date.now()}`,
      createdBy: currentUser?.name || 'Dr. Arvind Kulkarni',
      createdAt: new Date().toISOString(),
    };
    setQuizzes((prev) => [newQuiz, ...prev]);

    const notif: StudentNotificationItem = {
      id: `notif-quiz-${Date.now()}`,
      title: `New Quiz Published: ${newQuiz.title}`,
      description: `Semester ${newQuiz.semesterNumber} (${newQuiz.batch}) quiz is now ${newQuiz.status}. Duration: ${newQuiz.durationMinutes} mins · Marks: ${newQuiz.totalMarks}.`,
      category: 'assignment',
      subCategory: 'new_quiz',
      timestamp: 'Just now',
      isRead: false,
      priority: 'important',
      assignmentName: newQuiz.title,
    };
    setStudentNotifications((prev) => [notif, ...prev]);

    logActivity(
      'Quiz Created',
      `Faculty published quiz "${newQuiz.title}" for Semester ${newQuiz.semesterNumber} ${newQuiz.batch}.`,
      'info'
    );
  };

  const toggleQuizStatus = (quizId: string, status: 'active' | 'draft' | 'closed') => {
    setQuizzes((prev) => prev.map((q) => (q.id === quizId ? { ...q, status } : q)));
    logActivity('Quiz Status Updated', `Quiz ${quizId} status changed to ${status}.`, 'info');
  };

  const submitQuizAttempt = (
    quizId: string,
    answers: Record<string, number>,
    timeTakenMinutes: number
  ): QuizAttempt | null => {
    if (!currentUser) return null;
    const quiz = quizzes.find((q) => q.id === quizId);
    if (!quiz) return null;

    let score = 0;
    quiz.questions.forEach((q) => {
      if (answers[q.id] === q.correctOptionIndex) {
        score += q.marks;
      }
    });

    const attempt: QuizAttempt = {
      id: `qa-${Date.now()}`,
      quizId,
      studentId: currentUser.id,
      studentName: currentUser.name,
      usn: currentUser.usn || '4GW24IS010',
      semesterNumber: currentUser.semester || 5,
      batch: currentUser.batch || 'Batch A',
      answers,
      score,
      totalMarks: quiz.totalMarks,
      submittedAt: new Date().toISOString(),
      timeTakenMinutes,
    };

    setQuizAttempts((prev) => [attempt, ...prev]);
    logActivity(
      'Quiz Submitted',
      `${currentUser.name} (${currentUser.usn}) submitted "${quiz.title}" and scored ${score}/${quiz.totalMarks}.`,
      'success'
    );
    return attempt;
  };

  // Teacher actions
  const createLabSession = (data: Partial<LabSession>) => {
    const duration = data.durationMinutes || 120;
    const newSession: LabSession = {
      id: `ls-${Date.now()}`,
      title: data.title || 'Laboratory Session',
      subjectId: data.subjectId || 'sub-is504',
      subjectName: data.subjectName || 'Python Programming Lab',
      subjectCode: data.subjectCode || 'IS504',
      semesterNumber: data.semesterNumber || 5,
      batch: data.batch || 'Batch A',
      experimentId: data.experimentId || 'exp-01',
      experimentName: data.experimentName || 'Programming Experiment',
      programmingLanguage: data.programmingLanguage || 'python',
      teacherId: currentUser?.id || 'usr-teacher-1',
      teacherName: currentUser?.name || 'Dr. Arvind Kulkarni',
      startDate: data.startDate || new Date().toISOString().split('T')[0],
      startTime: data.startTime || '09:00',
      endTime: data.endTime || '11:00',
      durationMinutes: duration,
      instructions: data.instructions || 'Follow lab protocols.',
      isCopyPasteRestricted: data.isCopyPasteRestricted ?? true,
      status: 'scheduled',
      createdAt: new Date().toISOString(),
    };

    setLabSessions((prev) => [newSession, ...prev]);
    logActivity(
      'Lab Session Scheduled',
      `Teacher created "${newSession.title}" for Semester ${newSession.semesterNumber} ${newSession.batch}.`,
      'info'
    );
  };

  const updateLabSessionStatus = (
    sessionId: string,
    status: 'scheduled' | 'ongoing' | 'completed'
  ): { success: boolean; message?: string } => {
    const targetSession = labSessions.find((ls) => ls.id === sessionId);
    if (!targetSession) return { success: false, message: 'Session not found.' };

    if (status === 'ongoing') {
      if (activeBatchSession && activeBatchSession.id !== sessionId) {
        return {
          success: false,
          message: `Semester ${activeBatchSession.semesterNumber} ${activeBatchSession.batch} is already active. End that session before starting another batch.`,
        };
      }
      const duration = targetSession.durationMinutes || 120;
      setSessionRemainingSeconds(duration * 60);
      setActiveLabSessionId(sessionId);

      const batchStudents = users.filter(
        (u) =>
          u.role === 'student' &&
          (u.semester || u.currentSemester) === targetSession.semesterNumber &&
          u.batch === targetSession.batch
      );
      const exp = experiments.find((e) => e.id === targetSession.experimentId);
      const liveRecords = buildLiveBatchMonitoringSessions(
        batchStudents,
        targetSession,
        exp?.starterCode || '',
        studentLabSessions
      );
      if (liveRecords.length > 0) {
        setStudentLabSessions((prev) => [...liveRecords, ...prev]);
      }
    }

    setLabSessions((prev) =>
      prev.map((ls) =>
        ls.id === sessionId
          ? {
              ...ls,
              status,
              startedAt: status === 'ongoing' ? new Date().toISOString() : ls.startedAt,
              endedAt: status === 'completed' ? new Date().toISOString() : ls.endedAt,
            }
          : ls
      )
    );
    logActivity('Session State Updated', `Lab session ${sessionId} status changed to ${status}.`, 'info');
    return { success: true };
  };

  const gradeLabSession = (sessionId: string, score: number, feedback: string) => {
    setStudentLabSessions((prev) =>
      prev.map((s) => (s.id === sessionId ? { ...s, score, feedback } : s))
    );
    logActivity('Marks Recorded', `Faculty assigned ${score} marks for student lab session.`, 'info');
  };

  // Admin actions
  const addStudent = (data: Partial<User>) => {
    const newStudent: User = {
      id: `usr-student-${Date.now()}`,
      name: data.name || 'New Student',
      email: data.email || 'student@gsss.edu.in',
      role: 'student',
      usn: data.usn || '4GW21CS099',
      semester: data.semester || 5,
      batch: data.batch || 'Batch A',
      department: data.department || 'Computer Science & Engineering',
      createdAt: new Date().toISOString().split('T')[0],
    };
    setUsers((prev) => [...prev, newStudent]);
    logActivity('Student Enrolled', `Admin created student account ${newStudent.name} (${newStudent.usn}).`, 'info');
  };

  const updateStudent = (id: string, data: Partial<User>) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...data } : u)));
    logActivity('Student Updated', `Admin modified records for student ID ${id}.`, 'info');
  };

  const deleteStudent = (id: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
    logActivity('Student Deleted', `Admin removed student ID ${id}.`, 'warning');
  };

  const addTeacher = (data: Partial<User>) => {
    const newTeacher: User = {
      id: `usr-teacher-${Date.now()}`,
      name: data.name || 'New Faculty',
      email: data.email || 'faculty@gsss.edu.in',
      role: 'teacher',
      employeeCode: data.employeeCode || `TCH-CSE-${Math.floor(100 + Math.random() * 900)}`,
      designation: data.designation || 'Assistant Professor',
      department: data.department || 'Computer Science & Engineering',
      createdAt: new Date().toISOString().split('T')[0],
      assignedBatches: data.assignedBatches || [],
    };
    setUsers((prev) => [...prev, newTeacher]);
    logActivity('Teacher Added', `Admin registered faculty account ${newTeacher.name}.`, 'info');
  };

  const updateTeacher = (id: string, data: Partial<User>) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...data } : u)));
    logActivity('Teacher Updated', `Admin updated faculty ID ${id}.`, 'info');
  };

  const deleteTeacher = (id: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
    logActivity('Teacher Deleted', `Admin removed faculty ID ${id}.`, 'warning');
  };

  const addSubject = (data: Partial<Subject>) => {
    const newSubject: Subject = {
      id: `sub-${Date.now()}`,
      code: data.code || 'CS505',
      name: data.name || 'New Lab Subject',
      semesterNumber: data.semesterNumber || 5,
      department: 'Computer Science & Engineering',
      credits: data.credits || 2,
      primaryLanguage: data.primaryLanguage || 'python',
    };
    setSubjects((prev) => [...prev, newSubject]);
    logActivity('Curriculum Subject Added', `Admin added subject ${newSubject.code}: ${newSubject.name}.`, 'info');
  };

  const addExperiment = (data: Partial<Experiment>) => {
    const newExp: Experiment = {
      id: `exp-${Date.now()}`,
      subjectId: data.subjectId || 'sub-cs504',
      subjectCode: data.subjectCode || 'CS504',
      experimentNumber: data.experimentNumber || 1,
      title: data.title || 'New Lab Experiment',
      description: data.description || '',
      problemStatement: data.problemStatement || '',
      inputFormat: data.inputFormat || '',
      outputFormat: data.outputFormat || '',
      constraints: data.constraints || [],
      programmingLanguage: data.programmingLanguage || 'python',
      testCases: data.testCases || [],
      starterCode: data.starterCode || '',
      maxMarks: data.maxMarks || 50,
    };
    setExperiments((prev) => [...prev, newExp]);
    logActivity('Experiment Created', `Admin authored experiment: ${newExp.title}.`, 'info');
  };

  const addSemester = (semNumber: number, academicYear: string) => {
    const newSem: Semester = {
      id: `sem-${semNumber}`,
      number: semNumber,
      academicYear,
      isActive: true,
    };
    setSemesters((prev) => [...prev, newSem]);
    // Create default batches A, B, C for this semester
    const newBatches: Batch[] = [
      { id: `batch-${semNumber}a`, semesterId: newSem.id, semesterNumber: semNumber, name: 'Batch A', capacity: 30 },
      { id: `batch-${semNumber}b`, semesterId: newSem.id, semesterNumber: semNumber, name: 'Batch B', capacity: 30 },
      { id: `batch-${semNumber}c`, semesterId: newSem.id, semesterNumber: semNumber, name: 'Batch C', capacity: 30 },
    ];
    setBatches((prev) => [...prev, ...newBatches]);
    logActivity('Semester Configured', `Admin configured Semester ${semNumber} with Batches A, B, and C.`, 'info');
  };

  const logActivity = (
    action: string,
    details: string,
    severity: 'info' | 'success' | 'warning' | 'alert' = 'info'
  ) => {
    const newLog: ActivityLog = {
      id: `act-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      userId: currentUser?.id || 'sys-anon',
      userName: currentUser?.name || 'Guest User',
      userRole: currentUser?.role || 'student',
      usn: currentUser?.usn,
      action,
      details,
      timestamp: new Date().toISOString(),
      severity,
    };
    setActivityLogs((prev) => [newLog, ...prev.slice(0, 59)]);
  };

  const resetAllData = () => {
    localStorage.clear();
    setUsers(INITIAL_USERS);
    setSemesters(INITIAL_SEMESTERS);
    setBatches(INITIAL_BATCHES);
    setSubjects(INITIAL_SUBJECTS);
    setExperiments(INITIAL_EXPERIMENTS);
    setLabSessions(INITIAL_LAB_SESSIONS);
    setStudentLabSessions(INITIAL_STUDENT_LAB_SESSIONS);
    setClipboardEvents(INITIAL_CLIPBOARD_EVENTS);
    setActivityLogs(INITIAL_ACTIVITY_LOGS);
    setSubmissions(INITIAL_SUBMISSIONS);
    setIntegrityAlerts(INITIAL_INTEGRITY_ALERTS);
    setStudentNotifications(
      INITIAL_NOTIFICATIONS.map((n) => ({
        ...n,
        description: n.message,
        priority: n.priority || 'normal',
      }))
    );
    setFacultyNotifications(INITIAL_FACULTY_NOTIFICATIONS);
    setQuizzes(INITIAL_QUIZZES);
    setQuizAttempts(INITIAL_QUIZ_ATTEMPTS);
    setCurrentUser(INITIAL_USERS[0]); // Devika Rao (student)
    setActiveNavTab('dashboard');
    setActiveLabSessionId('ls-501');
    setSessionRemainingSeconds(4920);
    setTheme('dark');
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        currentRole,
        theme,
        toggleTheme,
        users,
        semesters,
        batches,
        subjects,
        experiments,
        labSessions,
        studentLabSessions,
        clipboardEvents,
        activityLogs,
        submissions,
        activeNavTab,
        setActiveNavTab,
        activeLabSessionId,
        setActiveLabSessionId,
        activeBatchSession,
        sessionRemainingSeconds,
        sessionStartTime,
        sessionEndTime,
        totalSessionMinutes,
        isSimulationActive,
        toggleSimulation,
        canStudentExecute,
        startBatchLabSession,
        endBatchLabSession,
        integrityAlerts,
        handlePasteEvent,
        reviewIntegrityAlert,
        dismissIntegrityAlert,
        studentNotifications,
        facultyNotifications,
        markStudentNotificationAsRead,
        markAllStudentNotificationsAsRead,
        deleteStudentNotification,
        clearStudentNotifications,
        acknowledgeStudentIntegrityWarning,
        markFacultyNotificationAsRead,
        markAllFacultyNotificationsAsRead,
        clearFacultyNotifications,
        quizzes,
        quizAttempts,
        createQuiz,
        toggleQuizStatus,
        submitQuizAttempt,
        login,
        logout,
        switchDemoUser,
        startLab,
        trackEditorInteraction,
        trackPageNavigation,
        setStudentCompiling,
        recordCodeRun,
        recordClipboardAttempt,
        updateActiveCode,
        submitLabProgram,
        createLabSession,
        updateLabSessionStatus,
        gradeLabSession,
        approveStudentMarks,
        runAiEvaluationForSession,
        addStudent,
        updateStudent,
        deleteStudent,
        addTeacher,
        updateTeacher,
        deleteTeacher,
        addSubject,
        addExperiment,
        addSemester,
        logActivity,
        resetAllData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
