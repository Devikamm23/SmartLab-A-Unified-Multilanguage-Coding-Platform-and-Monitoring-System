export type UserRole = 'student' | 'teacher' | 'admin';

export type BatchName = 'Batch A' | 'Batch B' | 'Batch C';

export interface User {
  id: string;
  name: string;
  studentName?: string; // Explicit field for MySQL student record compatibility
  email: string;
  role: UserRole;
  avatar?: string;
  department: string;
  createdAt: string;
  // Specific to student (Separate fields for MySQL schema):
  usn?: string; // Permanent USN based on admission year (e.g. 4GW24IS010)
  admissionYear?: number; // Permanent admission year (e.g. 2024)
  currentSemester?: number; // 1 to 8
  semester?: number; // Backward compatibility alias
  academicYear?: string; // e.g. "2026-2027"
  batch?: BatchName;
  // Specific to teacher:
  employeeCode?: string;
  designation?: string;
  assignedBatches?: Array<{ semester: number; batch: BatchName; subjectId: string }>;
}

export type SupportedLanguage = 'c' | 'python' | 'java';

export interface LanguageConfig {
  id: SupportedLanguage;
  name: string;
  monacoLang: string;
  judge0Id: number;
  version: string;
  extension: string;
  defaultBoilerplate: string;
}

export interface Semester {
  id: string;
  number: number; // 1 to 8
  academicYear: string; // e.g. "2026-2027"
  isActive: boolean;
}

export interface Batch {
  id: string;
  semesterId: string;
  semesterNumber: number;
  name: BatchName;
  capacity: number;
  assignedTeacherId?: string;
}

export interface Subject {
  id: string;
  code: string; // e.g. "CS504"
  name: string; // e.g. "Python Programming & Scripting Laboratory"
  semesterNumber: number;
  department: string;
  credits: number;
  primaryLanguage: SupportedLanguage;
}

export interface TestCase {
  id: string;
  input: string;
  expectedOutput: string;
  isHidden: boolean;
  explanation?: string;
}

export interface TestCaseResult {
  testCaseId: string;
  index: number;
  passed: boolean;
  input: string;
  expectedOutput: string;
  actualOutput: string;
  executionTime: number;
  memoryKb: number;
  errorDetails?: string;
  isHidden: boolean;
}

export interface Experiment {
  id: string;
  subjectId: string;
  subjectCode: string;
  experimentNumber: number;
  title: string;
  description: string;
  problemStatement: string;
  inputFormat: string;
  outputFormat: string;
  constraints: string[];
  programmingLanguage: SupportedLanguage;
  testCases: TestCase[];
  starterCode: string;
  maxMarks: number;
}

export interface LabSession {
  id: string;
  title: string;
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  semesterNumber: number;
  batch: BatchName;
  experimentId: string;
  experimentName: string;
  programmingLanguage: SupportedLanguage;
  teacherId: string;
  teacherName: string;
  startDate: string;
  startTime: string;
  endTime: string;
  instructions: string;
  isCopyPasteRestricted: boolean;
  status: 'scheduled' | 'ongoing' | 'completed';
  durationMinutes?: number; // Default 120 minutes
  startedAt?: string;
  endedAt?: string;
  createdAt: string;
  isMakeup?: boolean;
  allowedStudentIds?: string[];
}

export type StudentActivityStatus = 'Typing' | 'Compiling' | 'Idle' | 'Viewing' | 'Absent' | 'Submitted';

export interface AiEvaluationCriterion {
  criteriaName: string;
  marksAwarded: number;
  maxMarks: number;
  explanation: string;
}

export interface AiEvaluationResult {
  activeParticipation: AiEvaluationCriterion; // Max 10
  problemUnderstanding: AiEvaluationCriterion; // Max 10
  codeImplementation: AiEvaluationCriterion; // Max 15
  testCaseResults: AiEvaluationCriterion; // Max 10
  assignmentCompletion: AiEvaluationCriterion; // Max 5
  totalSuggestedScore: number; // Max 50
  overallExplanation: string;
  codeQualitySummary: string;
  evaluatedAt: string;
}

export interface StudentLabSession {
  id: string;
  studentId: string;
  studentName: string;
  usn: string;
  semesterNumber: number;
  batch: BatchName;
  labSessionId: string;
  experimentName: string;
  subjectName: string;
  programmingLanguage: SupportedLanguage;
  sessionStartTime: string;
  sessionEndTime?: string;
  loginTime: string;
  logoutTime?: string;
  totalDurationSeconds: number;
  activeTimeSeconds: number;
  idleTimeSeconds: number;
  compilationAttempts: number;
  successfulCompilations: number;
  failedCompilations: number;
  programExecutions: number;
  executionErrors: number;
  clipboardViolationCount: number;
  lastInteractionTime: string;
  status: 'active' | 'idle' | 'completed';
  activityStatus: StudentActivityStatus;
  sessionDurationMinutes: number; // Default 120
  remainingSeconds: number;
  testCasesPassed: number;
  totalTestCases: number;
  submissionCount: number;
  assignmentStatus: 'Completed' | 'In Progress' | 'Not Started' | 'Overdue';
  currentCode: string;
  score?: number;
  feedback?: string;
  aiEvaluation?: AiEvaluationResult;
  facultyApprovedScore?: number;
  facultyFeedback?: string;
  isFacultyApproved?: boolean;
  facultyApprovedAt?: string;
  isSimulated?: boolean;
}

export interface ClipboardEventRecord {
  id: string;
  studentId: string;
  studentName: string;
  usn: string;
  labSessionId: string;
  experimentName: string;
  action: 'copy' | 'paste' | 'cut';
  blocked: boolean;
  timestamp: string;
  details: string;
}

export interface Submission {
  id: string;
  studentLabSessionId?: string;
  labSessionId: string;
  studentId: string;
  studentName: string;
  usn: string;
  semesterNumber: number;
  batch: BatchName;
  experimentName: string;
  programmingLanguage: SupportedLanguage;
  code: string;
  status: 'Accepted' | 'Wrong Answer' | 'Compilation Error' | 'Runtime Error' | 'Time Limit Exceeded';
  score: number;
  maxScore: number;
  executionTime: number;
  memoryKb: number;
  submittedAt: string;
  feedback?: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  usn?: string;
  action: string;
  details: string;
  timestamp: string;
  severity: 'info' | 'success' | 'warning' | 'alert';
}

export interface Judge0Config {
  baseUrl: string;
  apiKey: string;
  isMockEnabled: boolean;
}

export type IntegrityRiskLevel = 'Low' | 'Medium' | 'High';

export interface AcademicIntegrityAlert {
  id: string;
  studentId: string;
  studentName: string;
  usn: string;
  semesterNumber: number;
  batch: string;
  labSessionId: string;
  assignmentName: string;
  pastedCode: string;
  linesPasted: number;
  charactersPasted: number;
  timestamp: string;
  similarityScore: number; // 0 to 100
  riskLevel: IntegrityRiskLevel;
  matchedStudentName?: string;
  matchedStudentUsn?: string;
  matchedCode?: string;
  matchedSourceDescription: string;
  structuralMetrics: {
    tokenOverlapPercentage: number;
    controlFlowMatchPercentage: number;
    identicalBlockLength: number;
  };
  status: 'Pending Review' | 'Reviewed' | 'Dismissed False Positive' | 'Action Taken';
  facultyRemarks?: string;
  facultyDecision?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  isSimulated?: boolean;
}

export type NotificationCategory = 'assignment' | 'lab' | 'announcement' | 'integrity';

export interface StudentNotificationItem {
  id: string;
  studentId?: string; // Target student ID or all
  title: string;
  description: string;
  category: NotificationCategory;
  subCategory?: string;
  timestamp: string;
  isRead: boolean;
  priority: 'normal' | 'important' | 'urgent';
  // Contextual data
  assignmentName?: string;
  copyPasteDetails?: string;
  warningStatus?: 'Active Warning' | 'Acknowledged';
  integrityAlertId?: string;
  actionUrl?: string;
}

export interface FacultyNotificationItem {
  id: string;
  title: string;
  description: string;
  category: 'integrity' | 'submission' | 'session' | 'announcement';
  timestamp: string;
  isRead: boolean;
  priority: 'normal' | 'important' | 'urgent';
  studentName?: string;
  usn?: string;
  assignmentName?: string;
  riskLevel?: IntegrityRiskLevel;
  similarityScore?: number;
  integrityAlertId?: string;
  isSimulated?: boolean;
}

export interface QuizQuestion {
  id: string;
  questionText: string;
  codeSnippet?: string;
  options: string[];
  correctOptionIndex: number;
  marks: number;
  explanation?: string;
}

export interface Quiz {
  id: string;
  title: string;
  subjectCode: string;
  subjectName: string;
  semesterNumber: number;
  batch: BatchName | 'All Batches';
  durationMinutes: number;
  totalMarks: number;
  status: 'active' | 'draft' | 'closed';
  createdBy: string;
  createdAt: string;
  questions: QuizQuestion[];
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  studentId: string;
  studentName: string;
  usn: string;
  semesterNumber: number;
  batch: BatchName;
  answers: Record<string, number>;
  score: number;
  totalMarks: number;
  submittedAt: string;
  timeTakenMinutes: number;
}

export interface MakeupLabRequest {
  id: string;
  studentId: string;
  studentName: string;
  usn: string;
  semesterNumber: number;
  batch: BatchName;
  experimentId: string;
  experimentName: string;
  subjectCode: string;
  subjectName: string;
  programmingLanguage: SupportedLanguage;
  missedLabDate: string;
  reason: string;
  preferredSlot: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Completed';
  requestedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  facultyRemarks?: string;
  makeupLabSessionId?: string;
}
