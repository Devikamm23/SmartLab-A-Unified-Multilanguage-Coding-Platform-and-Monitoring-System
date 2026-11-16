/**
 * SmartLab Academic USN & Semester Progression Engine
 * Compliant with VTU and GSSSIETW Engineering Academic Regulations
 */

export interface ProgressionDetails {
  semester: number;
  yearOfStudy: string;
  yearOfStudyShort: string;
  admissionYear: number;
  admissionBatchLabel: string;
  usnPrefix: string;
  academicYear: string;
  departmentCode: string;
  departmentName: string;
}

export const REFERENCE_ACADEMIC_YEAR = '2026-2027';
export const REFERENCE_CALENDAR_YEAR = 2026;
export const DEFAULT_DEPT_CODE = 'IS';
export const DEFAULT_DEPT_NAME = 'Information Science & Engineering';
export const COLLEGE_CODE = '4GW';

/**
 * Calculates the admission year based on the semester according to academic progression:
 * - Sem 1, 2: 1st Year -> 2026 Admission Batch (USN: 4GW26IS...)
 * - Sem 3, 4: 2nd Year -> 2025 Admission Batch (USN: 4GW25IS...)
 * - Sem 5, 6: 3rd Year -> 2024 Admission Batch (USN: 4GW24IS...)
 * - Sem 7, 8: 4th Year -> 2023 Admission Batch (USN: 4GW23IS...)
 */
export function getAdmissionYearForSemester(
  semester: number,
  referenceYear: number = REFERENCE_CALENDAR_YEAR
): number {
  const yearIndex = Math.ceil(Math.max(1, Math.min(8, semester)) / 2) - 1;
  return referenceYear - yearIndex;
}

export function getYearOfStudy(semester: number): {
  long: string;
  short: string;
} {
  const year = Math.ceil(Math.max(1, Math.min(8, semester)) / 2);
  switch (year) {
    case 1:
      return { long: 'First-Year Students', short: '1st Year' };
    case 2:
      return { long: 'Second-Year Students', short: '2nd Year' };
    case 3:
      return { long: 'Third-Year Students', short: '3rd Year' };
    case 4:
    default:
      return { long: 'Fourth-Year Students', short: '4th Year' };
  }
}

export function getUSNPrefix(
  admissionYear: number,
  deptCode: string = DEFAULT_DEPT_CODE,
  collegeCode: string = COLLEGE_CODE
): string {
  const twoDigitYear = String(admissionYear).slice(-2);
  return `${collegeCode}${twoDigitYear}${deptCode.toUpperCase()}`;
}

/**
 * Generates a standard VTU / GSSSIETW format USN:
 * e.g. generateUSN(2024, 'IS', 10) => "4GW24IS010"
 */
export function generateUSN(
  admissionYear: number,
  deptCode: string = DEFAULT_DEPT_CODE,
  sequenceNo: number = 10,
  collegeCode: string = COLLEGE_CODE
): string {
  const prefix = getUSNPrefix(admissionYear, deptCode, collegeCode);
  const seqPadded = String(sequenceNo).padStart(3, '0');
  return `${prefix}${seqPadded}`;
}

/**
 * Extracts admission year directly from an existing USN:
 * e.g. "4GW24IS010" => 2024
 */
export function extractAdmissionYearFromUSN(usn?: string): number | null {
  if (!usn) return null;
  const match = usn.toUpperCase().match(/^4GW(\d{2})[A-Z]{2}\d{3}$/);
  if (match && match[1]) {
    const twoDigit = parseInt(match[1], 10);
    return 2000 + twoDigit;
  }
  return null;
}

/**
 * Returns comprehensive academic progression details for any semester 1 to 8.
 */
export function getProgressionDetails(
  semester: number,
  deptCode: string = DEFAULT_DEPT_CODE,
  deptName: string = DEFAULT_DEPT_NAME
): ProgressionDetails {
  const semClamped = Math.max(1, Math.min(8, semester));
  const admissionYear = getAdmissionYearForSemester(semClamped);
  const yearInfo = getYearOfStudy(semClamped);
  const usnPrefix = getUSNPrefix(admissionYear, deptCode);

  return {
    semester: semClamped,
    yearOfStudy: yearInfo.long,
    yearOfStudyShort: yearInfo.short,
    admissionYear,
    admissionBatchLabel: `${admissionYear} Admission Batch`,
    usnPrefix,
    academicYear: REFERENCE_ACADEMIC_YEAR,
    departmentCode: deptCode,
    departmentName: deptName,
  };
}
