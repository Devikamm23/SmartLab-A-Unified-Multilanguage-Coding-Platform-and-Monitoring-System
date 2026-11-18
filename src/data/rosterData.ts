import {
  LabSession,
  Quiz,
  QuizAttempt,
  StudentLabSession,
  User,
} from '../types';

/**
 * Initializes clean non-simulated StudentLabSession records for real enrolled
 * students when a batch lab session starts.
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

  const existingIds = new Set(
    existingSessions
      .filter((s) => s.labSessionId === labSession.id)
      .map((s) => s.studentId)
  );

  const created: StudentLabSession[] = [];

  studentsInBatch.forEach((student) => {
    if (existingIds.has(student.id)) return;

    created.push({
      id: `sls-${labSession.id}-${student.id}`,
      studentId: student.id,
      studentName: student.name,
      usn: student.usn || '',
      semesterNumber: student.semester || labSession.semesterNumber,
      batch: student.batch || labSession.batch,
      labSessionId: labSession.id,
      experimentName: labSession.experimentName,
      subjectName: labSession.subjectName,
      programmingLanguage: labSession.programmingLanguage,
      sessionStartTime: labSession.startedAt || nowIso,
      loginTime: 'Not Logged In',
      totalDurationSeconds: 0,
      activeTimeSeconds: 0,
      idleTimeSeconds: 0,
      compilationAttempts: 0,
      successfulCompilations: 0,
      failedCompilations: 0,
      programExecutions: 0,
      executionErrors: 0,
      clipboardViolationCount: 0,
      lastInteractionTime: nowIso,
      status: 'idle',
      activityStatus: 'Absent',
      sessionDurationMinutes: durationMinutes,
      remainingSeconds: totalSec,
      testCasesPassed: 0,
      totalTestCases: 5,
      submissionCount: 0,
      assignmentStatus: 'Not Started',
      currentCode: starterCode,
      isSimulated: false,
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
    createdBy: 'Dr Girish S C',
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

export const INITIAL_QUIZ_ATTEMPTS: QuizAttempt[] = [];
