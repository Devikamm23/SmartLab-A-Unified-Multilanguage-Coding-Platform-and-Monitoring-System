import {
  BatchName,
  LabSession,
  Quiz,
  QuizAttempt,
  StudentActivityStatus,
  StudentLabSession,
  User,
} from '../types';
import { getAdmissionYearForSemester, getUSNPrefix } from '../utils/usnHelper';
import { COLLEGE_CONFIG } from '../constants/college';

const FIRST_NAMES = [
  'Aishwarya', 'Akshata', 'Amrutha', 'Anagha', 'Ananya', 'Anusha', 'Apoorva', 'Archana',
  'Ashwini', 'Bhavya', 'Bhoomika', 'Chandana', 'Chaitra', 'Deepika', 'Devika', 'Dhanya',
  'Divya', 'Gagana', 'Harshitha', 'Hema', 'Ishita', 'Janani', 'Jhanavi', 'Kavya',
  'Keerthana', 'Krupa', 'Lavanya', 'Likhitha', 'Madhura', 'Manasa', 'Meghana', 'Monisha',
  'Namratha', 'Nandini', 'Nethra', 'Niharika', 'Nischitha', 'Nivedita', 'Pallavi', 'Pavithra',
  'Pooja', 'Pragathi', 'Prarthana', 'Preethi', 'Priyanka', 'Rachana', 'Rakshitha', 'Rashmi',
  'Rhea', 'Roshni', 'Sahana', 'Sanjana', 'Shravya', 'Shreya', 'Shruthi', 'Sindhu',
  'Sneha', 'Soumya', 'Spoorthi', 'Sinchana', 'Srushti', 'Suhasini', 'Swathi', 'Tanvi',
  'Tejaswini', 'Vaishnavi', 'Varsha', 'Vasudha', 'Vidya', 'Vismaya',
];

const LAST_NAMES = [
  'Rao', 'Patil', 'Kulkarni', 'Sharma', 'Hegde', 'Bhat', 'Shetty', 'Gowda',
  'Joshi', 'Deshpande', 'Nair', 'Menon', 'Kamath', 'Pai', 'Murthy', 'Iyengar',
  'Prabhu', 'Shenoy', 'Kamat', 'Naik', 'Acharya', 'Adiga', 'Urs', 'Holla',
];

const BATCHES: BatchName[] = ['Batch A', 'Batch B', 'Batch C'];

/**
 * Populates every semester (1 to 8) and every batch (Batch A, Batch B, Batch C)
 * with at least 20 realistic students while preserving existing named demo accounts.
 */
export function buildFullStudentCohort(baseUsers: User[]): User[] {
  const existingStudents = baseUsers.filter((u) => u.role === 'student');
  const nonStudents = baseUsers.filter((u) => u.role !== 'student');

  const usedUsns = new Set<string>(
    existingStudents.map((s) => (s.usn || '').toUpperCase()).filter(Boolean)
  );
  const generatedStudents: User[] = [...existingStudents];

  let nameCursor = 0;

  for (let sem = 1; sem <= 8; sem++) {
    const admissionYear = getAdmissionYearForSemester(sem);
    const prefix = getUSNPrefix(admissionYear, 'IS');
    const isEvenSem = sem % 2 === 0;

    BATCHES.forEach((batch, batchIndex) => {
      const existingInBatch = generatedStudents.filter(
        (s) => (s.semester || s.currentSemester) === sem && s.batch === batch
      );

      const needed = Math.max(0, 20 - existingInBatch.length);
      // Odd semesters: Batch A -> 010..029, Batch B -> 030..049, Batch C -> 050..069
      // Even semesters: Batch A -> 101..120, Batch B -> 121..140, Batch C -> 141..160
      let seq = isEvenSem ? 101 + batchIndex * 20 : 10 + batchIndex * 20;

      for (let i = 0; i < needed; i++) {
        let candidateUsn = `${prefix}${String(seq).padStart(3, '0')}`;
        while (usedUsns.has(candidateUsn.toUpperCase())) {
          seq++;
          candidateUsn = `${prefix}${String(seq).padStart(3, '0')}`;
        }
        usedUsns.add(candidateUsn.toUpperCase());
        seq++;

        const firstName = FIRST_NAMES[(nameCursor * 7 + sem * 3 + batchIndex * 5 + i) % FIRST_NAMES.length];
        const lastName = LAST_NAMES[(nameCursor * 11 + sem * 5 + batchIndex * 7 + i) % LAST_NAMES.length];
        nameCursor++;

        const fullName = `${firstName} ${lastName}`;
        const emailHandle = `${firstName.toLowerCase()}.${String(admissionYear).slice(-2)}is${candidateUsn.slice(-3)}`;

        generatedStudents.push({
          id: `usr-st-s${sem}-${batch.replace(' ', '').toLowerCase()}-${i + 1}`,
          name: fullName,
          studentName: fullName,
          email: `${emailHandle}@gsss.edu.in`,
          role: 'student',
          usn: candidateUsn,
          admissionYear,
          currentSemester: sem,
          semester: sem,
          academicYear: '2026-2027',
          batch,
          department: COLLEGE_CONFIG.department,
          createdAt: `${admissionYear}-08-15`,
        });
      }
    });
  }

  // Sort students nicely by semester, batch, and USN while keeping Devika Rao first
  generatedStudents.sort((a, b) => {
    if (a.id === 'usr-student-1') return -1;
    if (b.id === 'usr-student-1') return 1;
    const semDiff = (a.semester || 5) - (b.semester || 5);
    if (semDiff !== 0) return semDiff;
    const batchDiff = (a.batch || 'Batch A').localeCompare(b.batch || 'Batch A');
    if (batchDiff !== 0) return batchDiff;
    return (a.usn || '').localeCompare(b.usn || '');
  });

  return [...generatedStudents, ...nonStudents];
}

/**
 * Generates live StudentLabSession records for every student in the active batch
 * so Faculty Monitoring displays all 20+ students concurrently with realistic
 * Typing (Green), Compiling (Orange), Idle (Yellow), Viewing (Blue), and Submitted (Purple) states.
 */
export function buildLiveBatchMonitoringSessions(
  studentsInBatch: User[],
  labSession: LabSession,
  starterCode: string,
  existingSessions: StudentLabSession[] = []
): StudentLabSession[] {
  const durationMinutes = labSession.durationMinutes || 120;
  const totalSec = durationMinutes * 60;
  const nowIso = new Date().toISOString();
  const statusPattern: StudentActivityStatus[] = [
    'Typing',
    'Typing',
    'Compiling',
    'Typing',
    'Idle',
    'Typing',
    'Compiling',
    'Viewing',
    'Typing',
    'Submitted',
    'Typing',
    'Compiling',
    'Idle',
    'Typing',
    'Viewing',
    'Typing',
    'Compiling',
    'Idle',
    'Typing',
    'Submitted',
  ];

  const existingIds = new Set(
    existingSessions
      .filter((s) => s.labSessionId === labSession.id)
      .map((s) => s.studentId)
  );

  const created: StudentLabSession[] = [];

  studentsInBatch.forEach((student, idx) => {
    if (existingIds.has(student.id)) return;

    const activityStatus = statusPattern[idx % statusPattern.length];
    const isIdle = activityStatus === 'Idle';
    const isSubmitted = activityStatus === 'Submitted';
    const isCompiling = activityStatus === 'Compiling';

    const elapsedMins = 28 + ((idx * 3) % 18);
    const activeMins = isIdle ? Math.max(8, elapsedMins - 14) : elapsedMins - 3;
    const idleMins = Math.max(2, elapsedMins - activeMins);

    const lastInteractionDate = new Date(
      Date.now() - (isIdle ? 150000 + idx * 15000 : isCompiling ? 3000 : 8000)
    );

    const loginMinute = String((idx * 2) % 12).padStart(2, '0');
    const loginSec = String((idx * 17) % 60).padStart(2, '0');

    const compileCount = isCompiling ? 7 + (idx % 5) : 3 + (idx % 6);
    const passedTests = isSubmitted ? 5 : isCompiling ? 4 : 2 + (idx % 4);
    const aiScore = isSubmitted ? 45 + (idx % 5) : 36 + (idx % 10);

    created.push({
      id: `sls-${labSession.id}-${student.id}`,
      studentId: student.id,
      studentName: student.name,
      usn: student.usn || '4GW24IS010',
      semesterNumber: student.semester || labSession.semesterNumber,
      batch: student.batch || labSession.batch,
      labSessionId: labSession.id,
      experimentName: labSession.experimentName,
      subjectName: labSession.subjectName,
      programmingLanguage: labSession.programmingLanguage,
      sessionStartTime: labSession.startedAt || nowIso,
      loginTime: `${new Date().toISOString().split('T')[0]} 09:${loginMinute}:${loginSec}`,
      totalDurationSeconds: elapsedMins * 60,
      activeTimeSeconds: activeMins * 60,
      idleTimeSeconds: idleMins * 60,
      compilationAttempts: compileCount,
      successfulCompilations: Math.max(1, compileCount - (idx % 2)),
      failedCompilations: idx % 2,
      programExecutions: compileCount,
      executionErrors: idx % 3 === 0 ? 1 : 0,
      clipboardViolationCount: 0,
      lastInteractionTime: lastInteractionDate.toISOString(),
      status: isSubmitted ? 'completed' : isIdle ? 'idle' : 'active',
      activityStatus,
      sessionDurationMinutes: durationMinutes,
      remainingSeconds: Math.max(0, totalSec - elapsedMins * 60),
      testCasesPassed: passedTests,
      totalTestCases: 5,
      submissionCount: isSubmitted ? 1 : 0,
      assignmentStatus: isSubmitted ? 'Completed' : 'In Progress',
      currentCode: starterCode,
      score: aiScore,
      facultyApprovedScore: isSubmitted ? aiScore : undefined,
      isFacultyApproved: isSubmitted && idx % 2 === 0,
      isSimulated: idx > 0,
    });
  });

  return created;
}

export const INITIAL_QUIZZES: Quiz[] = [
  {
    id: 'quiz-5a-01',
    title: 'Python Dictionaries, Hashing & Time Complexity Quiz',
    subjectCode: 'IS504',
    subjectName: 'Python Programming & Scripting Laboratory',
    semesterNumber: 5,
    batch: 'Batch A',
    durationMinutes: 15,
    totalMarks: 20,
    status: 'active',
    createdBy: 'Dr. Arvind Kulkarni',
    createdAt: '2026-11-14T09:00:00',
    questions: [
      {
        id: 'q1',
        questionText: 'What is the average time complexity of key lookup in a Python dictionary (dict)?',
        options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
        correctOptionIndex: 0,
        marks: 5,
        explanation: 'Python dicts are implemented using open-addressed hash tables, providing O(1) average lookup.',
      },
      {
        id: 'q2',
        questionText: 'Which data structure is best suited for checking balanced parentheses in a single pass?',
        options: ['Queue', 'Stack', 'Binary Heap', 'Adjacency Matrix'],
        correctOptionIndex: 1,
        marks: 5,
        explanation: 'LIFO stack ordering matches each closing bracket against the most recent unclosed opening bracket.',
      },
      {
        id: 'q3',
        questionText: 'What will be the output of the following Python snippet?',
        codeSnippet: 'd = {"a": 1, "b": 2}\nprint(d.get("c", 10))',
        options: ['None', 'KeyError', '10', '0'],
        correctOptionIndex: 2,
        marks: 5,
        explanation: 'dict.get(key, default) returns the default value 10 when the key is missing.',
      },
      {
        id: 'q4',
        questionText: 'Which built-in module in Python provides Counter and defaultdict?',
        options: ['itertools', 'functools', 'collections', 'heapq'],
        correctOptionIndex: 2,
        marks: 5,
        explanation: 'collections exports specialized container datatypes including Counter and defaultdict.',
      },
    ],
  },
  {
    id: 'quiz-3a-01',
    title: 'C Pointers & Dynamic Memory Allocation Assessment',
    subjectCode: 'IS302',
    subjectName: 'Data Structures Laboratory in C',
    semesterNumber: 3,
    batch: 'All Batches',
    durationMinutes: 20,
    totalMarks: 15,
    status: 'active',
    createdBy: 'Prof. Sunita Menon',
    createdAt: '2026-11-13T11:30:00',
    questions: [
      {
        id: 'q3-1',
        questionText: 'Which C standard library function allocates zero-initialized contiguous memory for an array?',
        options: ['malloc()', 'calloc()', 'realloc()', 'alloca()'],
        correctOptionIndex: 1,
        marks: 5,
      },
      {
        id: 'q3-2',
        questionText: 'What happens if you dereference a pointer after calling free(ptr) without setting ptr = NULL?',
        options: ['Automatic garbage collection', 'Dangling pointer / Undefined behavior', 'Compile-time error', 'Memory is zeroed safely'],
        correctOptionIndex: 1,
        marks: 5,
      },
      {
        id: 'q3-3',
        questionText: 'In a singly linked list, what is the time complexity to insert a node at the head?',
        options: ['O(1)', 'O(n)', 'O(log n)', 'O(n^2)'],
        correctOptionIndex: 0,
        marks: 5,
      },
    ],
  },
];

export const INITIAL_QUIZ_ATTEMPTS: QuizAttempt[] = [
  {
    id: 'qa-01',
    quizId: 'quiz-5a-01',
    studentId: 'usr-student-1',
    studentName: 'Devika Rao',
    usn: '4GW24IS010',
    semesterNumber: 5,
    batch: 'Batch A',
    answers: { q1: 0, q2: 1, q3: 2, q4: 2 },
    score: 20,
    totalMarks: 20,
    submittedAt: '2026-11-14T09:22:00',
    timeTakenMinutes: 7,
  },
  {
    id: 'qa-02',
    quizId: 'quiz-5a-01',
    studentId: 'usr-student-3',
    studentName: 'Ananya Sen',
    usn: '4GW24IS012',
    semesterNumber: 5,
    batch: 'Batch A',
    answers: { q1: 0, q2: 1, q3: 0, q4: 2 },
    score: 15,
    totalMarks: 20,
    submittedAt: '2026-11-14T09:26:00',
    timeTakenMinutes: 10,
  },
];
