/**
 * Mock Data for Student Dashboard Features:
 * Notifications, Assignment Deadlines, Faculty Announcements, Attendance, and Support FAQs
 */

export interface StudentNotification {
  id: string;
  title: string;
  message: string;
  category: 'assignment' | 'lab' | 'announcement' | 'integrity';
  subCategory?: string;
  timestamp: string;
  isRead: boolean;
  priority?: 'normal' | 'important' | 'urgent';
  actionUrl?: string;
  assignmentName?: string;
  copyPasteDetails?: string;
  warningStatus?: 'Active Warning' | 'Acknowledged';
  integrityAlertId?: string;
}

export interface AssignmentDeadline {
  id: string;
  assignmentName: string;
  subjectCode: string;
  subjectName: string;
  facultyName: string;
  assignedDate: string;
  submissionDeadline: string;
  remainingTime: string;
  status: 'Pending' | 'Submitted' | 'Overdue';
  priority: 'approaching' | 'normal' | 'overdue';
  labSessionId?: string;
}

export interface SubjectAttendance {
  subjectCode: string;
  subjectName: string;
  totalClasses: number;
  attended: number;
  missed: number;
  percentage: number;
  facultyInCharge: string;
}

export interface AttendanceSummary {
  totalClasses: number;
  classesAttended: number;
  classesMissed: number;
  overallPercentage: number;
  subjects: SubjectAttendance[];
}

export interface FAQItem {
  id: string;
  question: string;
  category: 'editor' | 'submission' | 'security' | 'evaluation';
  answer: string;
}

export const INITIAL_NOTIFICATIONS: StudentNotification[] = [
  // A. Academic Integrity Alert (Student Warning Notification)
  {
    id: 'notif-integrity-1',
    title: 'Academic Integrity Alert',
    message: 'Unusual copy-paste activity has been detected in your coding session. Please ensure that your submitted code represents your own work.',
    category: 'integrity',
    subCategory: 'copy_paste_warning',
    timestamp: 'Today at 10:14 AM',
    isRead: false,
    priority: 'urgent',
    assignmentName: 'Java Programming Lab: Thread Synchronization',
    copyPasteDetails: 'Large code block (28 lines / 840 characters) pasted into Monaco editor buffer.',
    warningStatus: 'Active Warning',
    integrityAlertId: 'int-01',
  },

  // B. Assignment Notifications
  {
    id: 'notif-asg-1',
    title: 'New Assignment Published by Faculty',
    message: 'Dr Girish S C published "Experiment 2: Balanced Parentheses Verification using Stack in Python" for Semester 5 Batch A.',
    category: 'assignment',
    subCategory: 'new_assignment',
    timestamp: '25 mins ago',
    isRead: false,
    priority: 'important',
    assignmentName: 'Balanced Parentheses Verification',
  },
  {
    id: 'notif-asg-2',
    title: 'Assignment Deadline Reminder',
    message: 'Submission deadline for "Experiment 1: Two Sum & Frequency Mapping" is approaching in 24 hours (Tomorrow at 5:00 PM).',
    category: 'assignment',
    subCategory: 'deadline_reminder',
    timestamp: '1 hour ago',
    isRead: false,
    priority: 'urgent',
    assignmentName: 'Two Sum & Frequency Mapping in Python',
  },
  {
    id: 'notif-asg-3',
    title: 'Assignment Submission Confirmation',
    message: 'Your practical program for "Experiment 1: Two Sum & Frequency Mapping" was successfully compiled, executed, and submitted. Scored: 50/50.',
    category: 'assignment',
    subCategory: 'submission_confirmation',
    timestamp: '2 hours ago',
    isRead: true,
    priority: 'normal',
    assignmentName: 'Two Sum & Frequency Mapping in Python',
  },
  {
    id: 'notif-asg-4',
    title: 'Assignment Deadline Approaching Soon',
    message: 'Final submission cutoff for "Experiment 3: Matrix Multiplication" in Java closes in 2 hours. Ensure all test cases are validated.',
    category: 'assignment',
    subCategory: 'deadline_approaching',
    timestamp: '3 hours ago',
    isRead: true,
    priority: 'important',
    assignmentName: 'Matrix Multiplication & Strassen Algorithm',
  },
  {
    id: 'notif-asg-5',
    title: 'Assignment Overdue Notification',
    message: 'The submission window for "Experiment 0: Shell Scripting Basics" has closed. Please contact your faculty in-charge for re-submission approval.',
    category: 'assignment',
    subCategory: 'overdue_notice',
    timestamp: 'Yesterday at 6:00 PM',
    isRead: true,
    priority: 'important',
    assignmentName: 'Shell Scripting Basics',
  },

  // C. Lab-Related Notifications
  {
    id: 'notif-lab-1',
    title: 'Upcoming Lab Session Notification',
    message: 'Practical Laboratory Slot CS504 (Python Programming) scheduled for Semester 5 Batch A on Friday at 09:00 AM in Lab 3.',
    category: 'lab',
    subCategory: 'upcoming_lab',
    timestamp: '4 hours ago',
    isRead: false,
    priority: 'normal',
  },
  {
    id: 'notif-lab-2',
    title: 'Lab Session Started',
    message: 'Lab session "Python Programming & Scripting Laboratory" is now live. Allocated duration: 120 minutes (09:00 AM - 11:00 AM).',
    category: 'lab',
    subCategory: 'session_started',
    timestamp: 'Today at 09:00 AM',
    isRead: true,
    priority: 'normal',
  },
  {
    id: 'notif-lab-3',
    title: 'Lab Session Ending Soon',
    message: 'Only 15 minutes remaining in current laboratory session. Please review unit test pass rates and submit your final source code.',
    category: 'lab',
    subCategory: 'session_ending_soon',
    timestamp: 'Today at 10:45 AM',
    isRead: true,
    priority: 'important',
  },
  {
    id: 'notif-lab-4',
    title: 'Lab Session Completed',
    message: 'Laboratory slot concluded successfully. Your active typing dwell time was recorded as 48 minutes with 0 unhandled runtime faults.',
    category: 'lab',
    subCategory: 'session_completed',
    timestamp: 'Nov 04, 2026',
    isRead: true,
    priority: 'normal',
  },
  {
    id: 'notif-lab-5',
    title: 'Lab Instructions & Compiler Update',
    message: 'Compiler engine updated to Python 3.11.2 (GCC 11.2). External web copy/paste policy remains enforced across all active terminals.',
    category: 'lab',
    subCategory: 'instructions_update',
    timestamp: 'Nov 03, 2026',
    isRead: true,
    priority: 'normal',
  },
  {
    id: 'notif-lab-6',
    title: 'Lab Attendance & Performance Update',
    message: 'IS504 laboratory attendance synchronized: 10 of 12 practical sessions attended (83.3% attendance). Academic eligibility status: Eligible.',
    category: 'lab',
    subCategory: 'attendance_performance',
    timestamp: 'Nov 02, 2026',
    isRead: true,
    priority: 'normal',
  },

  // D. Faculty Announcements
  {
    id: 'notif-ann-1',
    title: 'Important Faculty Announcement',
    message: 'Continuous Internal Evaluation (CIE-1) practical schedule announced for Information Science & Engineering 3rd year students.',
    category: 'announcement',
    subCategory: 'faculty_announcement',
    timestamp: 'Nov 01, 2026',
    isRead: true,
    priority: 'important',
  },
  {
    id: 'notif-ann-2',
    title: 'Change in Lab Schedule',
    message: 'Semester 5 Batch B laboratory scheduled for Friday afternoon has been rescheduled to Thursday 2:00 PM - 5:00 PM due to department symposium.',
    category: 'announcement',
    subCategory: 'schedule_change',
    timestamp: 'Oct 30, 2026',
    isRead: true,
    priority: 'urgent',
  },
  {
    id: 'notif-ann-3',
    title: 'New Instructions from Faculty',
    message: 'Dr Girish S C: Please ensure recursive functions include explicit base-case terminations to avoid stack overflow errors.',
    category: 'announcement',
    subCategory: 'faculty_instruction',
    timestamp: 'Oct 28, 2026',
    isRead: true,
    priority: 'normal',
  },
  {
    id: 'notif-ann-4',
    title: 'Academic Updates & Practical Syllabus',
    message: 'Department of Information Science & Engineering has published revised rubric criteria for laboratory practical assessments (50 marks scale).',
    category: 'announcement',
    subCategory: 'academic_update',
    timestamp: 'Oct 25, 2026',
    isRead: true,
    priority: 'normal',
  },
];

export const INITIAL_DEADLINES: AssignmentDeadline[] = [
  {
    id: 'dl-1',
    assignmentName: 'Two Sum & Frequency Mapping in Python',
    subjectCode: 'IS504',
    subjectName: 'Python Programming & Scripting Laboratory',
    facultyName: 'Dr Girish S C',
    assignedDate: '2026-11-01',
    submissionDeadline: '2026-11-08 17:00',
    remainingTime: '18 hours remaining',
    status: 'Pending',
    priority: 'approaching',
    labSessionId: 'ls-501',
  },
  {
    id: 'dl-2',
    assignmentName: 'Balanced Parentheses Verification Stack',
    subjectCode: 'IS504',
    subjectName: 'Python Programming & Scripting Laboratory',
    facultyName: 'Dr Girish S C',
    assignedDate: '2026-11-03',
    submissionDeadline: '2026-11-12 16:30',
    remainingTime: '4 days remaining',
    status: 'Pending',
    priority: 'normal',
    labSessionId: 'ls-502',
  },
  {
    id: 'dl-3',
    assignmentName: 'Thread Synchronization & Semaphores (Java)',
    subjectCode: 'IS502',
    subjectName: 'Java Enterprise Architecture Laboratory',
    facultyName: 'Prof. Sunita Menon',
    assignedDate: '2026-10-25',
    submissionDeadline: '2026-11-02 23:59',
    remainingTime: 'Overdue by 5 days',
    status: 'Overdue',
    priority: 'overdue',
  },
  {
    id: 'dl-4',
    assignmentName: 'Circular Queue and Linked Memory Management in C',
    subjectCode: 'IS302',
    subjectName: 'Data Structures Laboratory',
    facultyName: 'Prof. Sunita Menon',
    assignedDate: '2026-10-15',
    submissionDeadline: '2026-10-28 17:00',
    remainingTime: 'Completed on time',
    status: 'Submitted',
    priority: 'normal',
  },
];

export const INITIAL_ATTENDANCE: AttendanceSummary = {
  totalClasses: 12,
  classesAttended: 10,
  classesMissed: 2,
  overallPercentage: 83.3,
  subjects: [
    {
      subjectCode: 'IS504',
      subjectName: 'Python Programming & Scripting Laboratory',
      totalClasses: 12,
      attended: 10,
      missed: 2,
      percentage: 83.3,
      facultyInCharge: 'Dr Girish S C',
    },
  ],
};

export const INITIAL_FAQS: FAQItem[] = [
  {
    id: 'faq-1',
    category: 'editor',
    question: 'How do I compile and test my code in the Monaco Editor?',
    answer: 'Select your programming language (C, Python, or Java) from the dropdown at the top right of the editor. Provide any required inputs in the "Standard Input (STDIN)" console, then click the green "Run Code" button. Execution metrics (CPU time, memory usage, exit status) and program output will appear immediately in the Output console.',
  },
  {
    id: 'faq-2',
    category: 'submission',
    question: 'How are test cases evaluated (Public vs Hidden)?',
    answer: 'When you click "Run Tests", SmartLab executes your program against public test cases with visible inputs/outputs, as well as secret hidden test cases designed to test edge cases. All test cases must pass with an exit code of 0 within the allowed time limit for a 100% Accepted verdict.',
  },
  {
    id: 'faq-3',
    category: 'security',
    question: 'What happens if my clipboard is restricted during an exam session?',
    answer: 'During proctored or restricted laboratory sessions, copy (Ctrl+C), paste (Ctrl+V), and cut (Ctrl+X) shortcuts are disabled to preserve academic integrity. Any attempt is automatically intercepted, blocked, and recorded in the audit log for faculty review.',
  },
  {
    id: 'faq-4',
    category: 'submission',
    question: 'How do I submit an assignment before the deadline?',
    answer: 'Click the blue "Submit Code" button in the Online Code Editor when you are satisfied with your solution. The platform will record your final code, runtime metrics, and test results, time-stamping your submission in the academic ledger.',
  },
  {
    id: 'faq-5',
    category: 'evaluation',
    question: 'How do I check my faculty evaluation feedback and marks?',
    answer: 'Navigate to "Lab History" in the sidebar menu. Each completed laboratory session displays the score awarded out of 50, test case pass rate, and personalized instructor comments.',
  },
];
