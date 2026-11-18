import {
  AcademicIntegrityAlert,
  ActivityLog,
  Batch,
  ClipboardEventRecord,
  Experiment,
  FacultyNotificationItem,
  LabSession,
  LanguageConfig,
  MakeupLabRequest,
  Semester,
  StudentLabSession,
  Subject,
  Submission,
  SupportedLanguage,
  User,
} from '../types';
import { COLLEGE_CONFIG } from '../constants/college';

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
  {
    id: 'exp-05',
    subjectId: 'sub-is504',
    subjectCode: 'IS504',
    experimentNumber: 5,
    title: 'Binary Search Tree & Inorder Traversal in Python',
    description: 'Build a Binary Search Tree from input integers and output sorted inorder traversal.',
    problemStatement: `Given N integers, insert them sequentially into a Binary Search Tree (BST) and print the inorder traversal separated by spaces.`,
    inputFormat: 'Line 1: N\nLine 2: N space-separated integers',
    outputFormat: 'Space-separated integers in inorder sequence',
    constraints: ['1 <= N <= 500'],
    programmingLanguage: 'python',
    testCases: [
      { id: 'tc-05-1', input: '5\n50 30 70 20 40', expectedOutput: '20 30 40 50 70', isHidden: false },
      { id: 'tc-05-2', input: '3\n10 5 15', expectedOutput: '5 10 15', isHidden: true },
    ],
    starterCode: `import sys

class Node:
    def __init__(self, val):
        self.val = val
        self.left = None
        self.right = None

def insert(root, val):
    if not root:
        return Node(val)
    if val < root.val:
        root.left = insert(root.left, val)
    else:
        root.right = insert(root.right, val)
    return root

def inorder(root, out):
    if not root:
        return
    inorder(root.left, out)
    out.append(str(root.val))
    inorder(root.right, out)

def main():
    tokens = sys.stdin.read().split()
    if not tokens:
        return
    n = int(tokens[0])
    vals = [int(x) for x in tokens[1:n+1]]
    root = None
    for v in vals:
        root = insert(root, v)
    out = []
    inorder(root, out)
    print(" ".join(out))

if __name__ == '__main__':
    main()
`,
    maxMarks: 50,
  },
];

const BASE_INITIAL_USERS: User[] = [
  // --- FACULTY USERS ---
  {
    id: 'usr-teacher-1',
    name: 'Dr Girish S C',
    email: 'girish.sc@gsss.edu.in',
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

export const INITIAL_USERS: User[] = BASE_INITIAL_USERS;

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
    teacherName: 'Dr Girish S C',
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
    teacherName: 'Dr Girish S C',
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

export const INITIAL_STUDENT_LAB_SESSIONS: StudentLabSession[] = [];

export const INITIAL_CLIPBOARD_EVENTS: ClipboardEventRecord[] = [];

export const INITIAL_ACTIVITY_LOGS: ActivityLog[] = [];

export const INITIAL_SUBMISSIONS: Submission[] = [];

export const INITIAL_INTEGRITY_ALERTS: AcademicIntegrityAlert[] = [];

export const INITIAL_FACULTY_NOTIFICATIONS: FacultyNotificationItem[] = [];

export const INITIAL_MAKEUP_REQUESTS: MakeupLabRequest[] = [];


