import {
  AcademicIntegrityAlert,
  ActivityLog,
  Batch,
  ClipboardEventRecord,
  Experiment,
  FacultyNotificationItem,
  LabSession,
  LanguageConfig,
  Semester,
  StudentLabSession,
  Subject,
  Submission,
  SupportedLanguage,
  User,
} from '../types';
import {
  buildFullStudentCohort,
  buildLiveBatchMonitoringSessions,
} from './rosterData';

const FACULTY_AVATAR_ARVIND =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><defs><linearGradient id="g1" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#312e81"/><stop offset="100%" stop-color="#0284c7"/></linearGradient></defs><rect width="120" height="120" rx="24" fill="url(#g1)"/><circle cx="60" cy="44" r="21" fill="#f1c27d"/><path d="M39 40c0-14 9-23 21-23s21 9 21 23c-4-7-11-10-21-10s-17 3-21 10z" fill="#1e293b"/><rect x="44" y="40" width="12" height="7" rx="2" fill="none" stroke="#0f172a" stroke-width="2"/><rect x="64" y="40" width="12" height="7" rx="2" fill="none" stroke="#0f172a" stroke-width="2"/><line x1="56" y1="43" x2="64" y2="43" stroke="#0f172a" stroke-width="2"/><path d="M24 114c2-24 18-36 36-36s34 12 36 36" fill="#0f172a"/><path d="M48 78l12 16 12-16" fill="#e2e8f0"/><polygon points="60,88 56,112 64,112" fill="#38bdf8"/></svg>`
  );

const FACULTY_AVATAR_SUNITA =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><defs><linearGradient id="g2" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#4c1d95"/><stop offset="100%" stop-color="#0ea5e9"/></linearGradient></defs><rect width="120" height="120" rx="24" fill="url(#g2)"/><path d="M33 48c0-18 11-31 27-31s27 13 27 31v22H33V48z" fill="#0f172a"/><circle cx="60" cy="45" r="20" fill="#e0ac69"/><path d="M25 114c2-23 17-35 35-35s33 12 35 35" fill="#1e293b"/><path d="M48 79l12 14 12-14" fill="#f8fafc"/></svg>`
  );

export const SUPPORTED_LANGUAGES: Record<SupportedLanguage, LanguageConfig> = {
  c: {
    id: 'c',
    name: 'C',
    monacoLang: 'c',
    judge0Id: 50, // C (GCC 9.2.0 / 11)
    version: 'GCC 11.2',
    extension: '.c',
    defaultBoilerplate: `#include <stdio.h>
#include <stdlib.h>

int main() {
    // Read input from standard input
    int n;
    if (scanf("%d", &n) == 1) {
        printf("Received input: %d\\n", n);
    } else {
        printf("Hello from SmartLab C Runner\\n");
    }
    return 0;
}
`,
  },
  python: {
    id: 'python',
    name: 'Python',
    monacoLang: 'python',
    judge0Id: 71, // Python (3.11)
    version: '3.11.2',
    extension: '.py',
    defaultBoilerplate: `import sys

def main():
    # Read standard input
    lines = sys.stdin.read().split()
    if lines:
        print(f"Read {len(lines)} tokens from STDIN")
        print("First token:", lines[0])
    else:
        print("Hello from SmartLab Python 3.11 Runner")

if __name__ == '__main__':
    main()
`,
  },
  java: {
    id: 'java',
    name: 'Java',
    monacoLang: 'java',
    judge0Id: 62, // Java (OpenJDK 17)
    version: 'OpenJDK 17',
    extension: '.java',
    defaultBoilerplate: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        if (scanner.hasNextInt()) {
            int n = scanner.nextInt();
            System.out.println("Received input: " + n);
        } else {
            System.out.println("Hello from SmartLab Java 17 Runner");
        }
        scanner.close();
    }
}
`,
  },
};

export const INITIAL_SEMESTERS: Semester[] = [
  { id: 'sem-1', number: 1, academicYear: '2026-2027', isActive: true },
  { id: 'sem-2', number: 2, academicYear: '2026-2027', isActive: true },
  { id: 'sem-3', number: 3, academicYear: '2026-2027', isActive: true },
  { id: 'sem-4', number: 4, academicYear: '2026-2027', isActive: true },
  { id: 'sem-5', number: 5, academicYear: '2026-2027', isActive: true },
  { id: 'sem-6', number: 6, academicYear: '2026-2027', isActive: true },
  { id: 'sem-7', number: 7, academicYear: '2026-2027', isActive: true },
  { id: 'sem-8', number: 8, academicYear: '2026-2027', isActive: true },
];

export const INITIAL_BATCHES: Batch[] = [
  // Sem 1 Batches
  { id: 'batch-1a', semesterId: 'sem-1', semesterNumber: 1, name: 'Batch A', capacity: 30, assignedTeacherId: 'usr-teacher-2' },
  { id: 'batch-1b', semesterId: 'sem-1', semesterNumber: 1, name: 'Batch B', capacity: 30, assignedTeacherId: 'usr-teacher-2' },
  { id: 'batch-1c', semesterId: 'sem-1', semesterNumber: 1, name: 'Batch C', capacity: 30, assignedTeacherId: 'usr-teacher-2' },
  // Sem 2 Batches
  { id: 'batch-2a', semesterId: 'sem-2', semesterNumber: 2, name: 'Batch A', capacity: 30, assignedTeacherId: 'usr-teacher-2' },
  { id: 'batch-2b', semesterId: 'sem-2', semesterNumber: 2, name: 'Batch B', capacity: 30, assignedTeacherId: 'usr-teacher-2' },
  { id: 'batch-2c', semesterId: 'sem-2', semesterNumber: 2, name: 'Batch C', capacity: 30, assignedTeacherId: 'usr-teacher-2' },
  // Sem 3 Batches
  { id: 'batch-3a', semesterId: 'sem-3', semesterNumber: 3, name: 'Batch A', capacity: 32, assignedTeacherId: 'usr-teacher-2' },
  { id: 'batch-3b', semesterId: 'sem-3', semesterNumber: 3, name: 'Batch B', capacity: 32, assignedTeacherId: 'usr-teacher-2' },
  { id: 'batch-3c', semesterId: 'sem-3', semesterNumber: 3, name: 'Batch C', capacity: 32, assignedTeacherId: 'usr-teacher-2' },
  // Sem 4 Batches
  { id: 'batch-4a', semesterId: 'sem-4', semesterNumber: 4, name: 'Batch A', capacity: 30, assignedTeacherId: 'usr-teacher-2' },
  { id: 'batch-4b', semesterId: 'sem-4', semesterNumber: 4, name: 'Batch B', capacity: 30, assignedTeacherId: 'usr-teacher-2' },
  { id: 'batch-4c', semesterId: 'sem-4', semesterNumber: 4, name: 'Batch C', capacity: 30, assignedTeacherId: 'usr-teacher-2' },
  // Sem 5 Batches
  { id: 'batch-5a', semesterId: 'sem-5', semesterNumber: 5, name: 'Batch A', capacity: 30, assignedTeacherId: 'usr-teacher-1' },
  { id: 'batch-5b', semesterId: 'sem-5', semesterNumber: 5, name: 'Batch B', capacity: 30, assignedTeacherId: 'usr-teacher-1' },
  { id: 'batch-5c', semesterId: 'sem-5', semesterNumber: 5, name: 'Batch C', capacity: 30, assignedTeacherId: 'usr-teacher-1' },
  // Sem 6 Batches
  { id: 'batch-6a', semesterId: 'sem-6', semesterNumber: 6, name: 'Batch A', capacity: 30, assignedTeacherId: 'usr-teacher-1' },
  { id: 'batch-6b', semesterId: 'sem-6', semesterNumber: 6, name: 'Batch B', capacity: 30, assignedTeacherId: 'usr-teacher-1' },
  { id: 'batch-6c', semesterId: 'sem-6', semesterNumber: 6, name: 'Batch C', capacity: 30, assignedTeacherId: 'usr-teacher-1' },
  // Sem 7 Batches
  { id: 'batch-7a', semesterId: 'sem-7', semesterNumber: 7, name: 'Batch A', capacity: 30, assignedTeacherId: 'usr-teacher-1' },
  { id: 'batch-7b', semesterId: 'sem-7', semesterNumber: 7, name: 'Batch B', capacity: 30, assignedTeacherId: 'usr-teacher-1' },
  { id: 'batch-7c', semesterId: 'sem-7', semesterNumber: 7, name: 'Batch C', capacity: 30, assignedTeacherId: 'usr-teacher-1' },
  // Sem 8 Batches
  { id: 'batch-8a', semesterId: 'sem-8', semesterNumber: 8, name: 'Batch A', capacity: 30, assignedTeacherId: 'usr-teacher-1' },
  { id: 'batch-8b', semesterId: 'sem-8', semesterNumber: 8, name: 'Batch B', capacity: 30, assignedTeacherId: 'usr-teacher-1' },
  { id: 'batch-8c', semesterId: 'sem-8', semesterNumber: 8, name: 'Batch C', capacity: 30, assignedTeacherId: 'usr-teacher-1' },
];

export const INITIAL_SUBJECTS: Subject[] = [
  {
    id: 'sub-is101',
    code: 'IS101',
    name: 'Problem Solving and C Programming Laboratory',
    semesterNumber: 1,
    department: 'Information Science & Engineering',
    credits: 2,
    primaryLanguage: 'c',
  },
  {
    id: 'sub-is201',
    code: 'IS201',
    name: 'Advanced Data Representation in C Laboratory',
    semesterNumber: 2,
    department: 'Information Science & Engineering',
    credits: 2,
    primaryLanguage: 'c',
  },
  {
    id: 'sub-is302',
    code: 'IS302',
    name: 'Data Structures Laboratory in C',
    semesterNumber: 3,
    department: 'Information Science & Engineering',
    credits: 2,
    primaryLanguage: 'c',
  },
  {
    id: 'sub-is403',
    code: 'IS403',
    name: 'Object Oriented Programming Laboratory (Java)',
    semesterNumber: 4,
    department: 'Information Science & Engineering',
    credits: 2,
    primaryLanguage: 'java',
  },
  {
    id: 'sub-is504',
    code: 'IS504',
    name: 'Python Programming & Scripting Laboratory',
    semesterNumber: 5,
    department: 'Information Science & Engineering',
    credits: 2,
    primaryLanguage: 'python',
  },
  {
    id: 'sub-is601',
    code: 'IS601',
    name: 'Systems Programming & Operating Systems Lab',
    semesterNumber: 6,
    department: 'Information Science & Engineering',
    credits: 2,
    primaryLanguage: 'c',
  },
  {
    id: 'sub-is701',
    code: 'IS701',
    name: 'Cloud Computing & Distributed Systems Lab',
    semesterNumber: 7,
    department: 'Information Science & Engineering',
    credits: 2,
    primaryLanguage: 'python',
  },
  {
    id: 'sub-is801',
    code: 'IS801',
    name: 'Capstone Project & Secure Coding Lab',
    semesterNumber: 8,
    department: 'Information Science & Engineering',
    credits: 2,
    primaryLanguage: 'java',
  },
];

export const INITIAL_EXPERIMENTS: Experiment[] = [
  {
    id: 'exp-01',
    subjectId: 'sub-cs504',
    subjectCode: 'CS504',
    experimentNumber: 1,
    title: 'Two Sum & Frequency Mapping in Python',
    description: 'Implement an optimal hash dictionary mapping to discover matching target sum pairs.',
    problemStatement: `Given an integer array 'nums' and an integer 'target', return the indices of the two numbers such that they add up to 'target'.
You may assume each input has exactly one solution, and you may not use the same element twice.
Input consists of:
- Line 1: N (array length)
- Line 2: N space-separated integers
- Line 3: Target integer`,
    inputFormat: 'N\nN integers\nTarget',
    outputFormat: 'Two indices sorted in ascending order separated by space',
    constraints: ['2 <= N <= 10^4', '-10^9 <= nums[i] <= 10^9'],
    programmingLanguage: 'python',
    testCases: [
      { id: 'tc-01-1', input: '4\n2 7 11 15\n9', expectedOutput: '0 1', isHidden: false, explanation: '2 + 7 = 9' },
      { id: 'tc-01-2', input: '3\n3 2 4\n6', expectedOutput: '1 2', isHidden: false },
      { id: 'tc-01-3', input: '2\n3 3\n6', expectedOutput: '0 1', isHidden: true },
    ],
    starterCode: `import sys

def two_sum():
    tokens = sys.stdin.read().split()
    if not tokens:
        return
    n = int(tokens[0])
    nums = [int(x) for x in tokens[1:n+1]]
    target = int(tokens[n+1])
    
    seen = {}
    for i, num in enumerate(nums):
        diff = target - num
        if diff in seen:
            print(f"{seen[diff]} {i}")
            return
        seen[num] = i

if __name__ == '__main__':
    two_sum()
`,
    maxMarks: 50,
  },
  {
    id: 'exp-02',
    subjectId: 'sub-cs504',
    subjectCode: 'CS504',
    experimentNumber: 2,
    title: 'Balanced Parentheses Verification',
    description: 'Use a dynamic stack data structure in Python to validate nested brackets in source code.',
    problemStatement: `Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.
Print 'YES' if balanced, otherwise 'NO'.`,
    inputFormat: 'Line 1: T (test strings count)\nNext T lines: bracket strings',
    outputFormat: 'YES or NO for each test string on a new line',
    constraints: ['1 <= T <= 50', '1 <= length(s) <= 10^4'],
    programmingLanguage: 'python',
    testCases: [
      { id: 'tc-02-1', input: '3\n()\n()[]{}\n(]', expectedOutput: 'YES\nYES\nNO', isHidden: false },
      { id: 'tc-02-2', input: '2\n([{}])\n([)]', expectedOutput: 'YES\nNO', isHidden: false },
      { id: 'tc-02-3', input: '1\n{()}', expectedOutput: 'YES', isHidden: true },
    ],
    starterCode: `import sys

def check_brackets(s):
    stack = []
    mapping = {')': '(', '}': '{', ']': '['}
    for ch in s:
        if ch in '({[':
            stack.append(ch)
        elif ch in mapping:
            if not stack or stack[-1] != mapping[ch]:
                return "NO"
            stack.pop()
    return "YES" if not stack else "NO"

def main():
    lines = sys.stdin.read().split()
    if not lines: return
    t = int(lines[0])
    for i in range(1, t + 1):
        if i < len(lines):
            print(check_brackets(lines[i]))

if __name__ == '__main__':
    main()
`,
    maxMarks: 50,
  },
  {
    id: 'exp-03',
    subjectId: 'sub-cs302',
    subjectCode: 'CS302',
    experimentNumber: 1,
    title: 'Singly Linked List Node Insertion & Reversal in C',
    description: 'Implement dynamic node allocation and in-place 3-pointer pointer reversal.',
    problemStatement: `Given an integer N followed by N node values, construct a singly linked list and print the elements in reversed order.`,
    inputFormat: 'Line 1: N\nLine 2: N integers',
    outputFormat: 'Reversed integers separated by space',
    constraints: ['1 <= N <= 1000'],
    programmingLanguage: 'c',
    testCases: [
      { id: 'tc-03-1', input: '4\n10 20 30 40', expectedOutput: '40 30 20 10', isHidden: false },
      { id: 'tc-03-2', input: '1\n99', expectedOutput: '99', isHidden: true },
    ],
    starterCode: `#include <stdio.h>
#include <stdlib.h>

struct Node {
    int data;
    struct Node* next;
};

int main() {
    int n;
    if (scanf("%d", &n) != 1) return 0;
    int arr[1000];
    for (int i = 0; i < n; i++) {
        scanf("%d", &arr[i]);
    }
    // Print reversed
    for (int i = n - 1; i >= 0; i--) {
        printf("%d%s", arr[i], (i == 0 ? "" : " "));
    }
    printf("\\n");
    return 0;
}
`,
    maxMarks: 50,
  },
  {
    id: 'exp-04',
    subjectId: 'sub-cs403',
    subjectCode: 'CS403',
    experimentNumber: 1,
    title: 'Matrix Multiplication with Object Oriented Classes in Java',
    description: 'Create a Matrix class with constructor, row-major storage, and multiplication methods.',
    problemStatement: `Multiply two N x N matrices A and B and display product matrix C.`,
    inputFormat: 'Line 1: N\nNext N lines: Matrix A\nNext N lines: Matrix B',
    outputFormat: 'N lines with N integers each',
    constraints: ['1 <= N <= 50'],
    programmingLanguage: 'java',
    testCases: [
      { id: 'tc-04-1', input: '2\n1 2\n3 4\n2 0\n1 2', expectedOutput: '4 4\n10 8', isHidden: false },
    ],
    starterCode: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (!sc.hasNextInt()) return;
        int n = sc.nextInt();
        int[][] A = new int[n][n];
        int[][] B = new int[n][n];
        int[][] C = new int[n][n];
        
        for (int i = 0; i < n; i++)
            for (int j = 0; j < n; j++)
                A[i][j] = sc.nextInt();
                
        for (int i = 0; i < n; i++)
            for (int j = 0; j < n; j++)
                B[i][j] = sc.nextInt();
                
        for (int i = 0; i < n; i++)
            for (int k = 0; k < n; k++)
                for (int j = 0; j < n; j++)
                    C[i][j] += A[i][k] * B[k][j];
                    
        for (int i = 0; i < n; i++) {
            StringBuilder sb = new StringBuilder();
            for (int j = 0; j < n; j++) {
                if (j > 0) sb.append(" ");
                sb.append(C[i][j]);
            }
            System.out.println(sb.toString());
        }
    }
}
`,
    maxMarks: 50,
  },
];

const BASE_INITIAL_USERS: User[] = [
  // --- 2024 Admission Batch (Semester 5 & 6, 3rd Year) ---
  {
    id: 'usr-student-1',
    name: 'Devika Rao',
    studentName: 'Devika Rao',
    email: 'devika.24is010@gsss.edu.in',
    role: 'student',
    usn: '4GW24IS010',
    admissionYear: 2024,
    currentSemester: 5,
    semester: 5,
    academicYear: '2026-2027',
    batch: 'Batch A',
    department: 'Information Science & Engineering',
    createdAt: '2024-08-10',
  },
  {
    id: 'usr-student-2',
    name: 'Sneha Patil',
    studentName: 'Sneha Patil',
    email: 'sneha.24is011@gsss.edu.in',
    role: 'student',
    usn: '4GW24IS011',
    admissionYear: 2024,
    currentSemester: 5,
    semester: 5,
    academicYear: '2026-2027',
    batch: 'Batch B',
    department: 'Information Science & Engineering',
    createdAt: '2024-08-10',
  },
  {
    id: 'usr-student-3',
    name: 'Ananya Sen',
    studentName: 'Ananya Sen',
    email: 'ananya.24is012@gsss.edu.in',
    role: 'student',
    usn: '4GW24IS012',
    admissionYear: 2024,
    currentSemester: 5,
    semester: 5,
    academicYear: '2026-2027',
    batch: 'Batch A',
    department: 'Information Science & Engineering',
    createdAt: '2024-08-10',
  },
  {
    id: 'usr-student-3b',
    name: 'Shreya Kulkarni',
    studentName: 'Shreya Kulkarni',
    email: 'shreya.24is013@gsss.edu.in',
    role: 'student',
    usn: '4GW24IS013',
    admissionYear: 2024,
    currentSemester: 5,
    semester: 5,
    academicYear: '2026-2027',
    batch: 'Batch C',
    department: 'Information Science & Engineering',
    createdAt: '2024-08-10',
  },
  {
    id: 'usr-student-6a',
    name: 'Kruthi Mohan',
    studentName: 'Kruthi Mohan',
    email: 'kruthi.24is014@gsss.edu.in',
    role: 'student',
    usn: '4GW24IS014',
    admissionYear: 2024,
    currentSemester: 6,
    semester: 6,
    academicYear: '2026-2027',
    batch: 'Batch A',
    department: 'Information Science & Engineering',
    createdAt: '2024-08-10',
  },

  // --- 2025 Admission Batch (Semester 3 & 4, 2nd Year) ---
  {
    id: 'usr-student-4',
    name: 'Keerthana M.',
    studentName: 'Keerthana M.',
    email: 'keerthana.25is010@gsss.edu.in',
    role: 'student',
    usn: '4GW25IS010',
    admissionYear: 2025,
    currentSemester: 3,
    semester: 3,
    academicYear: '2026-2027',
    batch: 'Batch A',
    department: 'Information Science & Engineering',
    createdAt: '2025-08-12',
  },
  {
    id: 'usr-student-3b-2',
    name: 'Priya Dharshini',
    studentName: 'Priya Dharshini',
    email: 'priya.25is011@gsss.edu.in',
    role: 'student',
    usn: '4GW25IS011',
    admissionYear: 2025,
    currentSemester: 3,
    semester: 3,
    academicYear: '2026-2027',
    batch: 'Batch B',
    department: 'Information Science & Engineering',
    createdAt: '2025-08-12',
  },
  {
    id: 'usr-student-3c',
    name: 'Tanvi Hegde',
    studentName: 'Tanvi Hegde',
    email: 'tanvi.25is012@gsss.edu.in',
    role: 'student',
    usn: '4GW25IS012',
    admissionYear: 2025,
    currentSemester: 3,
    semester: 3,
    academicYear: '2026-2027',
    batch: 'Batch C',
    department: 'Information Science & Engineering',
    createdAt: '2025-08-12',
  },
  {
    id: 'usr-student-4a',
    name: 'Niharika V.',
    studentName: 'Niharika V.',
    email: 'niharika.25is013@gsss.edu.in',
    role: 'student',
    usn: '4GW25IS013',
    admissionYear: 2025,
    currentSemester: 4,
    semester: 4,
    academicYear: '2026-2027',
    batch: 'Batch A',
    department: 'Information Science & Engineering',
    createdAt: '2025-08-12',
  },

  // --- 2023 Admission Batch (Semester 7 & 8, 4th Year) ---
  {
    id: 'usr-student-7a',
    name: 'Bhavana S.',
    studentName: 'Bhavana S.',
    email: 'bhavana.23is010@gsss.edu.in',
    role: 'student',
    usn: '4GW23IS010',
    admissionYear: 2023,
    currentSemester: 7,
    semester: 7,
    academicYear: '2026-2027',
    batch: 'Batch A',
    department: 'Information Science & Engineering',
    createdAt: '2023-08-10',
  },
  {
    id: 'usr-student-7b',
    name: 'Meghana R.',
    studentName: 'Meghana R.',
    email: 'meghana.23is011@gsss.edu.in',
    role: 'student',
    usn: '4GW23IS011',
    admissionYear: 2023,
    currentSemester: 7,
    semester: 7,
    academicYear: '2026-2027',
    batch: 'Batch B',
    department: 'Information Science & Engineering',
    createdAt: '2023-08-10',
  },
  {
    id: 'usr-student-7c',
    name: 'Rachana Pai',
    studentName: 'Rachana Pai',
    email: 'rachana.23is012@gsss.edu.in',
    role: 'student',
    usn: '4GW23IS012',
    admissionYear: 2023,
    currentSemester: 7,
    semester: 7,
    academicYear: '2026-2027',
    batch: 'Batch C',
    department: 'Information Science & Engineering',
    createdAt: '2023-08-10',
  },
  {
    id: 'usr-student-8a',
    name: 'Swathi Shetty',
    studentName: 'Swathi Shetty',
    email: 'swathi.23is013@gsss.edu.in',
    role: 'student',
    usn: '4GW23IS013',
    admissionYear: 2023,
    currentSemester: 8,
    semester: 8,
    academicYear: '2026-2027',
    batch: 'Batch A',
    department: 'Information Science & Engineering',
    createdAt: '2023-08-10',
  },

  // --- 2026 Admission Batch (Semester 1 & 2, 1st Year) ---
  {
    id: 'usr-student-1a',
    name: 'Aditi Sharma',
    studentName: 'Aditi Sharma',
    email: 'aditi.26is010@gsss.edu.in',
    role: 'student',
    usn: '4GW26IS010',
    admissionYear: 2026,
    currentSemester: 1,
    semester: 1,
    academicYear: '2026-2027',
    batch: 'Batch A',
    department: 'Information Science & Engineering',
    createdAt: '2026-08-14',
  },
  {
    id: 'usr-student-1b',
    name: 'Sahana Kulkarni',
    studentName: 'Sahana Kulkarni',
    email: 'sahana.26is011@gsss.edu.in',
    role: 'student',
    usn: '4GW26IS011',
    admissionYear: 2026,
    currentSemester: 1,
    semester: 1,
    academicYear: '2026-2027',
    batch: 'Batch B',
    department: 'Information Science & Engineering',
    createdAt: '2026-08-14',
  },
  {
    id: 'usr-student-1c',
    name: 'Varsha Gowda',
    studentName: 'Varsha Gowda',
    email: 'varsha.26is012@gsss.edu.in',
    role: 'student',
    usn: '4GW26IS012',
    admissionYear: 2026,
    currentSemester: 1,
    semester: 1,
    academicYear: '2026-2027',
    batch: 'Batch C',
    department: 'Information Science & Engineering',
    createdAt: '2026-08-14',
  },
  {
    id: 'usr-student-2a',
    name: 'Deepa N.',
    studentName: 'Deepa N.',
    email: 'deepa.26is013@gsss.edu.in',
    role: 'student',
    usn: '4GW26IS013',
    admissionYear: 2026,
    currentSemester: 2,
    semester: 2,
    academicYear: '2026-2027',
    batch: 'Batch A',
    department: 'Information Science & Engineering',
    createdAt: '2026-08-14',
  },

  // --- FACULTY USERS ---
  {
    id: 'usr-teacher-1',
    name: 'Dr. Arvind Kulkarni',
    email: 'arvind.kulkarni@gsss.edu.in',
    role: 'teacher',
    avatar: FACULTY_AVATAR_ARVIND,
    employeeCode: 'TCH-ISE-012',
    designation: 'Associate Professor & Lab In-Charge',
    department: 'Information Science & Engineering',
    createdAt: '2019-06-15',
    assignedBatches: [
      { semester: 5, batch: 'Batch A', subjectId: 'sub-is504' },
      { semester: 5, batch: 'Batch B', subjectId: 'sub-is504' },
      { semester: 3, batch: 'Batch A', subjectId: 'sub-is302' },
      { semester: 7, batch: 'Batch A', subjectId: 'sub-is701' },
    ],
  },
  {
    id: 'usr-teacher-2',
    name: 'Prof. Sunita Menon',
    email: 'sunita.menon@gsss.edu.in',
    role: 'teacher',
    avatar: FACULTY_AVATAR_SUNITA,
    employeeCode: 'TCH-ISE-028',
    designation: 'Assistant Professor & Lab Coordinator',
    department: 'Information Science & Engineering',
    createdAt: '2021-01-20',
    assignedBatches: [
      { semester: 1, batch: 'Batch A', subjectId: 'sub-is101' },
      { semester: 3, batch: 'Batch C', subjectId: 'sub-is302' },
      { semester: 4, batch: 'Batch A', subjectId: 'sub-is403' },
    ],
  },

  // --- ADMINISTRATOR ---
  {
    id: 'usr-admin-1',
    name: 'Prof. Rajesh Verma',
    email: 'admin.rajesh@gsss.edu.in',
    role: 'admin',
    employeeCode: 'ADM-SYS-001',
    designation: 'Head of Academic Computing & Systems Administrator',
    department: 'Central Computing Facility',
    createdAt: '2016-04-01',
  },
];

export const INITIAL_USERS: User[] = buildFullStudentCohort(BASE_INITIAL_USERS);

export const INITIAL_LAB_SESSIONS: LabSession[] = [
  {
    id: 'ls-501',
    title: 'Python Lab Slot 1: Hash Dictionaries & Pair Search',
    subjectId: 'sub-is504',
    subjectName: 'Python Programming & Scripting Laboratory',
    subjectCode: 'IS504',
    semesterNumber: 5,
    batch: 'Batch A',
    experimentId: 'exp-01',
    experimentName: 'Two Sum & Frequency Mapping in Python',
    programmingLanguage: 'python',
    teacherId: 'usr-teacher-1',
    teacherName: 'Dr. Arvind Kulkarni',
    startDate: '2026-11-15',
    startTime: '09:00',
    endTime: '11:00',
    durationMinutes: 120,
    startedAt: '2026-11-15T09:00:00',
    instructions: 'Write clean Python 3.11 code. Enforce copy/paste restrictions. Test sample cases before final evaluation.',
    isCopyPasteRestricted: true,
    status: 'ongoing',
    createdAt: '2026-11-01T08:00:00',
  },
  {
    id: 'ls-502',
    title: 'Python Lab Slot 2: Stack Parentheses Evaluation',
    subjectId: 'sub-cs504',
    subjectName: 'Python Programming & Scripting Laboratory',
    subjectCode: 'CS504',
    semesterNumber: 5,
    batch: 'Batch B',
    experimentId: 'exp-02',
    experimentName: 'Balanced Parentheses Verification',
    programmingLanguage: 'python',
    teacherId: 'usr-teacher-1',
    teacherName: 'Dr. Arvind Kulkarni',
    startDate: '2026-11-04',
    startTime: '13:30',
    endTime: '16:30',
    instructions: 'Use stack abstractions. Avoid external regex libraries.',
    isCopyPasteRestricted: true,
    status: 'scheduled',
    createdAt: '2026-11-01T08:30:00',
  },
  {
    id: 'ls-301',
    title: 'Data Structures Lab Slot 1: Linked List Pointer Reversal in C',
    subjectId: 'sub-cs302',
    subjectName: 'Data Structures Laboratory in C',
    subjectCode: 'CS302',
    semesterNumber: 3,
    batch: 'Batch C',
    experimentId: 'exp-03',
    experimentName: 'Singly Linked List Node Insertion & Reversal in C',
    programmingLanguage: 'c',
    teacherId: 'usr-teacher-2',
    teacherName: 'Prof. Sunita Menon',
    startDate: '2026-11-05',
    startTime: '10:00',
    endTime: '13:00',
    instructions: 'Manage dynamic memory with malloc/free properly without memory leaks.',
    isCopyPasteRestricted: false,
    status: 'scheduled',
    createdAt: '2026-11-02T10:00:00',
  },
];

const BASE_INITIAL_STUDENT_LAB_SESSIONS: StudentLabSession[] = [
  {
    id: 'sls-01',
    studentId: 'usr-student-1',
    studentName: 'Devika Rao',
    usn: '4GW24IS010',
    semesterNumber: 5,
    batch: 'Batch A',
    labSessionId: 'ls-501',
    experimentName: 'Two Sum & Frequency Mapping in Python',
    subjectName: 'Python Programming & Scripting Laboratory',
    programmingLanguage: 'python',
    sessionStartTime: '2026-11-04T09:00:00',
    loginTime: '2026-11-04 09:02:15',
    totalDurationSeconds: 2280, // 38 mins into 120-min session
    activeTimeSeconds: 1980, // 33 mins typing
    idleTimeSeconds: 300, // 5 mins idle
    compilationAttempts: 6,
    successfulCompilations: 5,
    failedCompilations: 1,
    programExecutions: 5,
    executionErrors: 0,
    clipboardViolationCount: 0,
    lastInteractionTime: '2026-11-04T09:37:45',
    status: 'active',
    activityStatus: 'Typing', // 1. Typing – Green
    sessionDurationMinutes: 120,
    remainingSeconds: 4920, // 82 mins remaining
    testCasesPassed: 5,
    totalTestCases: 5,
    submissionCount: 1,
    assignmentStatus: 'In Progress',
    currentCode: INITIAL_EXPERIMENTS[0].starterCode,
    score: 48,
    aiEvaluation: {
      activeParticipation: {
        criteriaName: 'Active Lab Participation',
        marksAwarded: 10,
        maxMarks: 10,
        explanation: 'Excellent interaction rhythm with 33 minutes focused coding and zero security violations.',
      },
      problemUnderstanding: {
        criteriaName: 'Problem Understanding & Approach',
        marksAwarded: 10,
        maxMarks: 10,
        explanation: 'Utilized optimal dictionary hashing for O(N) linear time frequency lookup.',
      },
      codeImplementation: {
        criteriaName: 'Code Implementation & Correctness',
        marksAwarded: 14,
        maxMarks: 15,
        explanation: 'Clean idiomatic Python code with modular functions and defensive type checks.',
      },
      testCaseResults: {
        criteriaName: 'Test Case Results',
        marksAwarded: 10,
        maxMarks: 10,
        explanation: '5 of 5 test cases passed with zero memory leaks (100% test accuracy).',
      },
      assignmentCompletion: {
        criteriaName: 'Assignment Completion & Submission',
        marksAwarded: 4,
        maxMarks: 5,
        explanation: 'Working solution ready; pending final official submission confirmation.',
      },
      totalSuggestedScore: 48,
      overallExplanation: 'Outstanding solution demonstrated. Highly efficient hash mapping approach with all test cases verified.',
      codeQualitySummary: 'Lines: 24 | Complexity: O(N) Hash Lookup | Edge Cases: Handled',
      evaluatedAt: '2026-11-04T09:38:00',
    },
    facultyApprovedScore: 48,
    facultyFeedback: 'Clean dictionary logic and well-structured code. Keep it up.',
    isFacultyApproved: true,
    facultyApprovedAt: '2026-11-04T09:40:00',
  },
  {
    id: 'sls-02',
    studentId: 'usr-student-2',
    studentName: 'Sneha Patil',
    usn: '4GW24IS011',
    semesterNumber: 5,
    batch: 'Batch B',
    labSessionId: 'ls-501',
    experimentName: 'Two Sum & Frequency Mapping in Python',
    subjectName: 'Python Programming & Scripting Laboratory',
    programmingLanguage: 'python',
    sessionStartTime: '2026-11-04T09:00:00',
    sessionEndTime: '2026-11-04T10:45:00',
    loginTime: '2026-11-04 09:01:20',
    logoutTime: '2026-11-04 10:48:10',
    totalDurationSeconds: 6300, // 1h 45m
    activeTimeSeconds: 5200,
    idleTimeSeconds: 1100,
    compilationAttempts: 9,
    successfulCompilations: 8,
    failedCompilations: 1,
    programExecutions: 8,
    executionErrors: 0,
    clipboardViolationCount: 0,
    lastInteractionTime: '2026-11-04T10:45:00',
    status: 'completed',
    activityStatus: 'Submitted', // 5. Submitted – Purple
    sessionDurationMinutes: 120,
    remainingSeconds: 900,
    testCasesPassed: 5,
    totalTestCases: 5,
    submissionCount: 2,
    assignmentStatus: 'Completed',
    currentCode: INITIAL_EXPERIMENTS[0].starterCode,
    score: 49,
    aiEvaluation: {
      activeParticipation: {
        criteriaName: 'Active Lab Participation',
        marksAwarded: 10,
        maxMarks: 10,
        explanation: 'Regular compile-run iterations and steady focused typing throughout the 120-minute slot.',
      },
      problemUnderstanding: {
        criteriaName: 'Problem Understanding & Approach',
        marksAwarded: 10,
        maxMarks: 10,
        explanation: 'Clear grasp of space-time trade-offs; implemented optimal hash table indexing.',
      },
      codeImplementation: {
        criteriaName: 'Code Implementation & Correctness',
        marksAwarded: 14,
        maxMarks: 15,
        explanation: 'Very readable code with comprehensive comments and proper indentation.',
      },
      testCaseResults: {
        criteriaName: 'Test Case Results',
        marksAwarded: 10,
        maxMarks: 10,
        explanation: 'All public and hidden test cases passed successfully.',
      },
      assignmentCompletion: {
        criteriaName: 'Assignment Completion & Submission',
        marksAwarded: 5,
        maxMarks: 5,
        explanation: 'Submitted 15 minutes before lab session end time.',
      },
      totalSuggestedScore: 49,
      overallExplanation: 'Complete and fully verified submission. Exceeds standard syllabus criteria.',
      codeQualitySummary: 'Lines: 28 | Complexity: O(N) | Edge Cases: Handled',
      evaluatedAt: '2026-11-04T10:46:00',
    },
    facultyApprovedScore: 49,
    facultyFeedback: 'Excellent solution. Verified test suite passed completely.',
    isFacultyApproved: true,
    facultyApprovedAt: '2026-11-04T10:50:00',
  },
  {
    id: 'sls-03',
    studentId: 'usr-student-3',
    studentName: 'Ananya Sen',
    usn: '4GW24IS012',
    semesterNumber: 5,
    batch: 'Batch A',
    labSessionId: 'ls-501',
    experimentName: 'Two Sum & Frequency Mapping in Python',
    subjectName: 'Python Programming & Scripting Laboratory',
    programmingLanguage: 'python',
    sessionStartTime: '2026-11-04T09:00:00',
    loginTime: '2026-11-04 09:04:10',
    totalDurationSeconds: 2100, // 35 mins
    activeTimeSeconds: 1300,
    idleTimeSeconds: 800,
    compilationAttempts: 4,
    successfulCompilations: 3,
    failedCompilations: 1,
    programExecutions: 3,
    executionErrors: 0,
    clipboardViolationCount: 0,
    lastInteractionTime: '2026-11-04T09:35:00',
    status: 'active',
    activityStatus: 'Viewing', // 3. Viewing – Blue
    sessionDurationMinutes: 120,
    remainingSeconds: 5100,
    testCasesPassed: 3,
    totalTestCases: 5,
    submissionCount: 0,
    assignmentStatus: 'In Progress',
    currentCode: INITIAL_EXPERIMENTS[0].starterCode,
    score: 38,
    aiEvaluation: {
      activeParticipation: {
        criteriaName: 'Active Lab Participation',
        marksAwarded: 8,
        maxMarks: 10,
        explanation: 'Active in session viewing problem constraints and reference materials.',
      },
      problemUnderstanding: {
        criteriaName: 'Problem Understanding & Approach',
        marksAwarded: 8,
        maxMarks: 10,
        explanation: 'Identified brute force search approach; working towards hash optimization.',
      },
      codeImplementation: {
        criteriaName: 'Code Implementation & Correctness',
        marksAwarded: 11,
        maxMarks: 15,
        explanation: 'Syntactically valid nested loop implementation.',
      },
      testCaseResults: {
        criteriaName: 'Test Case Results',
        marksAwarded: 6,
        maxMarks: 10,
        explanation: '3 of 5 test cases passed. Large input test case hit timeout limit.',
      },
      assignmentCompletion: {
        criteriaName: 'Assignment Completion & Submission',
        marksAwarded: 3,
        maxMarks: 5,
        explanation: 'Currently coding draft implementation; not yet submitted.',
      },
      totalSuggestedScore: 36,
      overallExplanation: 'Solid progress. Encourage student to replace O(N^2) loops with dictionary mapping before final submission.',
      codeQualitySummary: 'Lines: 18 | Complexity: O(N^2) Nested Loops | Edge Cases: Partial',
      evaluatedAt: '2026-11-04T09:36:00',
    },
    facultyApprovedScore: 36,
    facultyFeedback: 'Advised to eliminate nested loop before final cutoff.',
    isFacultyApproved: false,
  },
  {
    id: 'sls-04',
    studentId: 'usr-student-4',
    studentName: 'Keerthana M.',
    usn: '4GW25IS010',
    semesterNumber: 5,
    batch: 'Batch A',
    labSessionId: 'ls-501',
    experimentName: 'Two Sum & Frequency Mapping in Python',
    subjectName: 'Python Programming & Scripting Laboratory',
    programmingLanguage: 'python',
    sessionStartTime: '2026-11-04T09:00:00',
    loginTime: '2026-11-04 09:08:45',
    totalDurationSeconds: 1800, // 30 mins
    activeTimeSeconds: 600, // 10 mins active
    idleTimeSeconds: 1200, // 20 mins idle (>2 min threshold)
    compilationAttempts: 1,
    successfulCompilations: 1,
    failedCompilations: 0,
    programExecutions: 1,
    executionErrors: 0,
    clipboardViolationCount: 0,
    lastInteractionTime: '2026-11-04T09:18:00',
    status: 'idle',
    activityStatus: 'Idle', // 2. Idle – Yellow
    sessionDurationMinutes: 120,
    remainingSeconds: 5400,
    testCasesPassed: 1,
    totalTestCases: 5,
    submissionCount: 0,
    assignmentStatus: 'In Progress',
    currentCode: INITIAL_EXPERIMENTS[0].starterCode,
    score: 28,
    aiEvaluation: {
      activeParticipation: {
        criteriaName: 'Active Lab Participation',
        marksAwarded: 4,
        maxMarks: 10,
        explanation: 'Student has been inactive for extended period (>15 minutes of inactivity).',
      },
      problemUnderstanding: {
        criteriaName: 'Problem Understanding & Approach',
        marksAwarded: 6,
        maxMarks: 10,
        explanation: 'Initial boilerplate instantiated; algorithm not yet formulated.',
      },
      codeImplementation: {
        criteriaName: 'Code Implementation & Correctness',
        marksAwarded: 8,
        maxMarks: 15,
        explanation: 'Minimal custom logic written beyond starter template.',
      },
      testCaseResults: {
        criteriaName: 'Test Case Results',
        marksAwarded: 2,
        maxMarks: 10,
        explanation: '1 of 5 default test case passed.',
      },
      assignmentCompletion: {
        criteriaName: 'Assignment Completion & Submission',
        marksAwarded: 2,
        maxMarks: 5,
        explanation: 'Currently idle; assignment incomplete.',
      },
      totalSuggestedScore: 22,
      overallExplanation: 'Low activity detected. Faculty intervention advised to assist with algorithm breakdown.',
      codeQualitySummary: 'Lines: 12 | Complexity: Incomplete | Edge Cases: None',
      evaluatedAt: '2026-11-04T09:30:00',
    },
    facultyApprovedScore: 22,
    facultyFeedback: 'Reminded student to focus on lab task.',
    isFacultyApproved: false,
  },
  {
    id: 'sls-05',
    studentId: 'usr-student-5',
    studentName: 'Pooja V.',
    usn: '4GW25IS011',
    semesterNumber: 5,
    batch: 'Batch C',
    labSessionId: 'ls-501',
    experimentName: 'Two Sum & Frequency Mapping in Python',
    subjectName: 'Python Programming & Scripting Laboratory',
    programmingLanguage: 'python',
    sessionStartTime: '2026-11-04T09:00:00',
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
    lastInteractionTime: '2026-11-04T09:00:00',
    status: 'idle',
    activityStatus: 'Absent', // 4. Absent – Red
    sessionDurationMinutes: 120,
    remainingSeconds: 7200,
    testCasesPassed: 0,
    totalTestCases: 5,
    submissionCount: 0,
    assignmentStatus: 'Not Started',
    currentCode: '',
    score: 0,
    aiEvaluation: {
      activeParticipation: {
        criteriaName: 'Active Lab Participation',
        marksAwarded: 0,
        maxMarks: 10,
        explanation: 'Student did not log into the laboratory session.',
      },
      problemUnderstanding: {
        criteriaName: 'Problem Understanding & Approach',
        marksAwarded: 0,
        maxMarks: 10,
        explanation: 'No submission or approach recorded.',
      },
      codeImplementation: {
        criteriaName: 'Code Implementation & Correctness',
        marksAwarded: 0,
        maxMarks: 15,
        explanation: 'No code submitted.',
      },
      testCaseResults: {
        criteriaName: 'Test Case Results',
        marksAwarded: 0,
        maxMarks: 10,
        explanation: '0 of 5 test cases evaluated.',
      },
      assignmentCompletion: {
        criteriaName: 'Assignment Completion & Submission',
        marksAwarded: 0,
        maxMarks: 5,
        explanation: 'Absent from scheduled lab slot.',
      },
      totalSuggestedScore: 0,
      overallExplanation: 'Student marked absent. Medical or official leave verification required.',
      codeQualitySummary: 'Lines: 0 | Status: Absent',
      evaluatedAt: '2026-11-04T09:30:00',
    },
    facultyApprovedScore: 0,
    facultyFeedback: 'Marked absent for lab slot.',
    isFacultyApproved: true,
    facultyApprovedAt: '2026-11-04T09:35:00',
  },
  {
    id: 'sls-06',
    studentId: 'usr-student-7a',
    studentName: 'Bhavana S.',
    usn: '4GW23IS010',
    semesterNumber: 7,
    batch: 'Batch A',
    labSessionId: 'ls-501',
    experimentName: 'Cloud Native Microservices Architecture Lab',
    subjectName: 'Cloud Computing Laboratory',
    programmingLanguage: 'python',
    sessionStartTime: '2026-11-04T09:00:00',
    sessionEndTime: '2026-11-04T10:30:00',
    loginTime: '2026-11-04 09:03:00',
    logoutTime: '2026-11-04 10:32:00',
    totalDurationSeconds: 5400,
    activeTimeSeconds: 4600,
    idleTimeSeconds: 800,
    compilationAttempts: 8,
    successfulCompilations: 8,
    failedCompilations: 0,
    programExecutions: 8,
    executionErrors: 0,
    clipboardViolationCount: 0,
    lastInteractionTime: '2026-11-04T10:30:00',
    status: 'completed',
    activityStatus: 'Submitted', // 5. Submitted - Purple
    sessionDurationMinutes: 120,
    remainingSeconds: 1800,
    testCasesPassed: 5,
    totalTestCases: 5,
    submissionCount: 1,
    assignmentStatus: 'Completed',
    currentCode: INITIAL_EXPERIMENTS[0].starterCode,
    score: 50,
    aiEvaluation: {
      activeParticipation: {
        criteriaName: 'Active Lab Participation',
        marksAwarded: 10,
        maxMarks: 10,
        explanation: 'Flawless execution pace with disciplined commits.',
      },
      problemUnderstanding: {
        criteriaName: 'Problem Understanding & Approach',
        marksAwarded: 10,
        maxMarks: 10,
        explanation: 'Demonstrated complete architectural understanding.',
      },
      codeImplementation: {
        criteriaName: 'Code Implementation & Correctness',
        marksAwarded: 15,
        maxMarks: 15,
        explanation: 'Optimal algorithmic structure with perfect exception handling.',
      },
      testCaseResults: {
        criteriaName: 'Test Case Results',
        marksAwarded: 10,
        maxMarks: 10,
        explanation: 'All 5 test cases verified.',
      },
      assignmentCompletion: {
        criteriaName: 'Assignment Completion & Submission',
        marksAwarded: 5,
        maxMarks: 5,
        explanation: 'Submitted 30 minutes ahead of lab close.',
      },
      totalSuggestedScore: 50,
      overallExplanation: 'Exemplary submission across all metrics.',
      codeQualitySummary: 'Lines: 36 | Complexity: O(N) | Edge Cases: Handled',
      evaluatedAt: '2026-11-04T10:31:00',
    },
    facultyApprovedScore: 50,
    facultyFeedback: 'Outstanding work.',
    isFacultyApproved: true,
    facultyApprovedAt: '2026-11-04T10:35:00',
  },
  {
    id: 'sls-07',
    studentId: 'usr-student-1a',
    studentName: 'Aditi Sharma',
    usn: '4GW26IS010',
    semesterNumber: 1,
    batch: 'Batch A',
    labSessionId: 'ls-501',
    experimentName: 'Problem Solving through C Programming',
    subjectName: 'C Programming & Logic Laboratory',
    programmingLanguage: 'c',
    sessionStartTime: '2026-11-04T09:00:00',
    loginTime: '2026-11-04 09:05:30',
    totalDurationSeconds: 1950,
    activeTimeSeconds: 1600,
    idleTimeSeconds: 350,
    compilationAttempts: 5,
    successfulCompilations: 4,
    failedCompilations: 1,
    programExecutions: 4,
    executionErrors: 0,
    clipboardViolationCount: 0,
    lastInteractionTime: '2026-11-04T09:35:00',
    status: 'active',
    activityStatus: 'Typing', // 1. Typing – Green
    sessionDurationMinutes: 120,
    remainingSeconds: 5250,
    testCasesPassed: 4,
    totalTestCases: 5,
    submissionCount: 0,
    assignmentStatus: 'In Progress',
    currentCode: INITIAL_EXPERIMENTS[2].starterCode,
    score: 42,
    aiEvaluation: {
      activeParticipation: {
        criteriaName: 'Active Lab Participation',
        marksAwarded: 9,
        maxMarks: 10,
        explanation: 'Good coding cadence and debugging rhythm.',
      },
      problemUnderstanding: {
        criteriaName: 'Problem Understanding & Approach',
        marksAwarded: 8,
        maxMarks: 10,
        explanation: 'Correct use of pointer and dynamic structures.',
      },
      codeImplementation: {
        criteriaName: 'Code Implementation & Correctness',
        marksAwarded: 13,
        maxMarks: 15,
        explanation: 'Clean structure with appropriate memory allocation.',
      },
      testCaseResults: {
        criteriaName: 'Test Case Results',
        marksAwarded: 8,
        maxMarks: 10,
        explanation: '4 of 5 test cases passing.',
      },
      assignmentCompletion: {
        criteriaName: 'Assignment Completion & Submission',
        marksAwarded: 4,
        maxMarks: 5,
        explanation: 'Active in editor with 85+ minutes remaining.',
      },
      totalSuggestedScore: 42,
      overallExplanation: 'Promising code from 1st year cohort. Near completion.',
      codeQualitySummary: 'Lines: 22 | Pointers: Valid | Edge Cases: Handled',
      evaluatedAt: '2026-11-04T09:36:00',
    },
    facultyApprovedScore: 42,
    facultyFeedback: 'Fix boundary condition for node null pointer.',
    isFacultyApproved: false,
  },
];

export const INITIAL_STUDENT_LAB_SESSIONS: StudentLabSession[] = [
  ...BASE_INITIAL_STUDENT_LAB_SESSIONS,
  ...buildLiveBatchMonitoringSessions(
    INITIAL_USERS.filter(
      (u) => u.role === 'student' && (u.semester || u.currentSemester) === 5 && u.batch === 'Batch A'
    ),
    INITIAL_LAB_SESSIONS[0],
    INITIAL_EXPERIMENTS[0].starterCode,
    BASE_INITIAL_STUDENT_LAB_SESSIONS
  ),
];

export const INITIAL_CLIPBOARD_EVENTS: ClipboardEventRecord[] = [
  {
    id: 'cb-01',
    studentId: 'usr-student-1',
    studentName: 'Devika Rao',
    usn: '4GW24IS010',
    labSessionId: 'ls-501',
    experimentName: 'Two Sum & Frequency Mapping in Python',
    action: 'paste',
    blocked: true,
    timestamp: '2026-11-04T09:18:22',
    details: 'Blocked Ctrl+V external clipboard paste into Monaco Editor buffer.',
  },
  {
    id: 'cb-02',
    studentId: 'usr-student-2',
    studentName: 'Sneha Patil',
    usn: '4GW24IS011',
    labSessionId: 'ls-502',
    experimentName: 'Balanced Parentheses Verification',
    action: 'copy',
    blocked: true,
    timestamp: '2026-11-03T15:20:10',
    details: 'Blocked Ctrl+C copying solution text to external clipboard.',
  },
];

export const INITIAL_ACTIVITY_LOGS: ActivityLog[] = [
  {
    id: 'act-01',
    userId: 'usr-student-1',
    userName: 'Devika Rao',
    userRole: 'student',
    usn: '4GW24IS010',
    action: 'Lab Session Initialized',
    details: 'Entered Python Lab Slot 1 (Two Sum) on Sem 5 Batch A.',
    timestamp: '2026-11-04T09:05:00',
    severity: 'info',
  },
  {
    id: 'act-02',
    userId: 'usr-student-1',
    userName: 'Devika Rao',
    userRole: 'student',
    usn: '4GW24IS010',
    action: 'Clipboard Violation Intercepted',
    details: 'Copy/paste security policy enforced: blocked Ctrl+V attempt.',
    timestamp: '2026-11-04T09:18:22',
    severity: 'warning',
  },
  {
    id: 'act-03',
    userId: 'usr-student-1',
    userName: 'Devika Rao',
    userRole: 'student',
    usn: '4GW24IS010',
    action: 'Code Compilation & Execution',
    details: 'Compiled solution. Verdict: Accepted (3/3 test cases passed in 0.038s).',
    timestamp: '2026-11-04T09:25:10',
    severity: 'success',
  },
  {
    id: 'act-04',
    userId: 'usr-teacher-1',
    userName: 'Dr. Arvind Kulkarni',
    userRole: 'teacher',
    action: 'Lab Session Started',
    details: 'Unlocked Session "Python Lab Slot 1" for Semester 5 Batch A.',
    timestamp: '2026-11-04T09:00:00',
    severity: 'info',
  },
  {
    id: 'act-05',
    userId: 'usr-admin-1',
    userName: 'Prof. Rajesh Verma',
    userRole: 'admin',
    action: 'Batch Allocated',
    details: 'Assigned 30 students to Semester 5 Batch A and Batch B.',
    timestamp: '2026-11-01T10:00:00',
    severity: 'info',
  },
];

export const INITIAL_SUBMISSIONS: Submission[] = [
  {
    id: 'sub-01',
    labSessionId: 'ls-501',
    studentId: 'usr-student-1',
    studentName: 'Devika Rao',
    usn: '4GW24IS010',
    semesterNumber: 5,
    batch: 'Batch A',
    experimentName: 'Two Sum & Frequency Mapping in Python',
    programmingLanguage: 'python',
    code: INITIAL_EXPERIMENTS[0].starterCode,
    status: 'Accepted',
    score: 50,
    maxScore: 50,
    executionTime: 0.038,
    memoryKb: 14200,
    submittedAt: '2026-11-04T09:25:10',
    feedback: 'Optimal dictionary lookup implementation with O(N) complexity.',
  },
  {
    id: 'sub-02',
    labSessionId: 'ls-502',
    studentId: 'usr-student-2',
    studentName: 'Sneha Patil',
    usn: '4GW24IS011',
    semesterNumber: 5,
    batch: 'Batch B',
    experimentName: 'Java Programming Lab',
    programmingLanguage: 'java',
    code: `import java.util.concurrent.Semaphore;

class SharedResource {
    static int count = 0;
    static Semaphore sem = new Semaphore(1);
    
    void modify(String threadName) {
        try {
            System.out.println(threadName + " waiting for lock");
            sem.acquire();
            System.out.println(threadName + " acquired lock");
            for(int i = 0; i < 5; i++) {
                count++;
                System.out.println(threadName + ": " + count);
                Thread.sleep(100);
            }
        } catch(InterruptedException e) {
            e.printStackTrace();
        } finally {
            System.out.println(threadName + " released lock");
            sem.release();
        }
    }
}`,
    status: 'Accepted',
    score: 48,
    maxScore: 50,
    executionTime: 0.042,
    memoryKb: 16800,
    submittedAt: '2026-11-03T16:15:00',
    feedback: 'Correct semaphore thread locking implementation.',
  },
];

export const INITIAL_INTEGRITY_ALERTS: AcademicIntegrityAlert[] = [
  {
    id: 'int-01',
    studentId: 'usr-student-2',
    studentName: 'Sneha Patil',
    usn: '4GW24IS011',
    semesterNumber: 5,
    batch: 'Batch B',
    labSessionId: 'ls-502',
    assignmentName: 'Java Programming Lab',
    pastedCode: `import java.util.concurrent.Semaphore;

class SharedResource {
    static int count = 0;
    static Semaphore sem = new Semaphore(1);
    
    void modify(String threadName) {
        try {
            System.out.println(threadName + " waiting for lock");
            sem.acquire();
            System.out.println(threadName + " acquired lock");
            for(int i = 0; i < 5; i++) {
                count++;
                System.out.println(threadName + ": " + count);
                Thread.sleep(100);
            }
        } catch(InterruptedException e) {
            e.printStackTrace();
        } finally {
            System.out.println(threadName + " released lock");
            sem.release();
        }
    }
}`,
    linesPasted: 28,
    charactersPasted: 840,
    timestamp: 'Today at 10:14:22 AM',
    similarityScore: 88,
    riskLevel: 'High',
    matchedStudentName: 'Devika Rao',
    matchedStudentUsn: '4GW24IS010',
    matchedCode: `import java.util.concurrent.Semaphore;

class SharedBuffer {
    static int counter = 0;
    static Semaphore lock = new Semaphore(1);
    
    void update(String name) {
        try {
            System.out.println(name + " waiting for lock");
            lock.acquire();
            System.out.println(name + " acquired lock");
            for(int i = 0; i < 5; i++) {
                counter++;
                System.out.println(name + ": " + counter);
                Thread.sleep(100);
            }
        } catch(InterruptedException err) {
            err.printStackTrace();
        } finally {
            System.out.println(name + " released lock");
            lock.release();
        }
    }
}`,
    matchedSourceDescription: 'Peer submission from Semester 5 Batch A buffer (88% AST & control flow alignment)',
    structuralMetrics: {
      tokenOverlapPercentage: 92,
      controlFlowMatchPercentage: 96,
      identicalBlockLength: 20,
    },
    status: 'Pending Review',
    isSimulated: true,
  },
  {
    id: 'int-02',
    studentId: 'usr-student-3',
    studentName: 'Ananya Sen',
    usn: '4GW24IS012',
    semesterNumber: 5,
    batch: 'Batch A',
    labSessionId: 'ls-501',
    assignmentName: 'Python Programming Lab: Hash Mapping',
    pastedCode: `def two_sum_hash(arr, target):
    lookup = {}
    for idx, val in enumerate(arr):
        rem = target - val
        if rem in lookup:
            return [lookup[rem], idx]
        lookup[val] = idx
    return []`,
    linesPasted: 9,
    charactersPasted: 215,
    timestamp: 'Today at 09:42:10 AM',
    similarityScore: 64,
    riskLevel: 'Medium',
    matchedStudentName: 'Devika Rao',
    matchedStudentUsn: '4GW24IS010',
    matchedCode: INITIAL_EXPERIMENTS[0].starterCode,
    matchedSourceDescription: 'Standard textbook algorithm implementation with common token sequencing',
    structuralMetrics: {
      tokenOverlapPercentage: 68,
      controlFlowMatchPercentage: 74,
      identicalBlockLength: 5,
    },
    status: 'Reviewed',
    facultyRemarks: 'Standard optimal solution for Two Sum problem. Slight variable renaming observed, but represents standard textbook approach.',
    facultyDecision: 'Legitimate Syntax / Common Algorithm',
    reviewedBy: 'Dr. Arvind Kulkarni',
    reviewedAt: 'Today at 09:55 AM',
    isSimulated: true,
  },
  {
    id: 'int-03',
    studentId: 'usr-student-2a',
    studentName: 'Keerthana M.',
    usn: '4GW25IS010',
    semesterNumber: 3,
    batch: 'Batch A',
    labSessionId: 'ls-301',
    assignmentName: 'Data Structures Laboratory: Linked List',
    pastedCode: `struct Node {
    int data;
    struct Node* next;
};

void printList(struct Node* n) {
    while (n != NULL) {
        printf("%d ", n->data);
        n = n->next;
    }
}`,
    linesPasted: 11,
    charactersPasted: 168,
    timestamp: 'Yesterday at 11:20:00 AM',
    similarityScore: 32,
    riskLevel: 'Low',
    matchedSourceDescription: 'Standard C struct and traversal boilerplate from lab syllabus manual',
    structuralMetrics: {
      tokenOverlapPercentage: 42,
      controlFlowMatchPercentage: 35,
      identicalBlockLength: 4,
    },
    status: 'Dismissed False Positive',
    facultyRemarks: 'Standard linked list struct and print helper from VTU lab manual. Not an integrity breach.',
    facultyDecision: 'Dismissed as False Positive',
    reviewedBy: 'Prof. Sunita Menon',
    reviewedAt: 'Yesterday at 11:35 AM',
    isSimulated: true,
  },
];

export const INITIAL_FACULTY_NOTIFICATIONS: FacultyNotificationItem[] = [
  {
    id: 'fac-notif-1',
    title: 'Suspicious Copy-Paste Activity Detected',
    description: 'Sneha Patil [4GW24IS011] pasted a large code block (28 lines / 840 chars) in Java Programming Lab. Similarity: 88% (High Risk).',
    category: 'integrity',
    timestamp: 'Just now (10:14 AM)',
    isRead: false,
    priority: 'urgent',
    studentName: 'Sneha Patil',
    usn: '4GW24IS011',
    assignmentName: 'Java Programming Lab',
    riskLevel: 'High',
    similarityScore: 88,
    integrityAlertId: 'int-01',
    isSimulated: true,
  },
  {
    id: 'fac-notif-2',
    title: 'Suspicious Copy-Paste Activity Detected',
    description: 'Ananya Sen [4GW24IS012] pasted 9 lines in Python Programming Lab. Similarity: 64% (Medium Risk).',
    category: 'integrity',
    timestamp: 'Today at 09:42 AM',
    isRead: false,
    priority: 'important',
    studentName: 'Ananya Sen',
    usn: '4GW24IS012',
    assignmentName: 'Python Programming Lab: Hash Mapping',
    riskLevel: 'Medium',
    similarityScore: 64,
    integrityAlertId: 'int-02',
    isSimulated: true,
  },
  {
    id: 'fac-notif-3',
    title: 'Lab Session Submission Milestone',
    description: 'Devika Rao [4GW24IS010] completed and submitted Python Lab Slot 1 (Two Sum). Automatic AI score: 50/50 ready for faculty approval.',
    category: 'submission',
    timestamp: 'Today at 09:25 AM',
    isRead: true,
    priority: 'normal',
    studentName: 'Devika Rao',
    usn: '4GW24IS010',
    assignmentName: 'Two Sum & Frequency Mapping in Python',
  },
  {
    id: 'fac-notif-4',
    title: 'Lab Session Schedule Initialized',
    description: 'Laboratory session "Python Programming Slot 1" for Semester 5 Batch A successfully started. 30 student terminals connected.',
    category: 'session',
    timestamp: 'Today at 09:00 AM',
    isRead: true,
    priority: 'normal',
  },
];

