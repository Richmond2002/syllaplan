import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Calculates a student's current level based on their index number.
 * Assumes an academic year starts around August.
 * e.g., 'PS/ITC/21/0001' for the 2021-2022 academic year.
 * In the 2024-2025 academic year, this student would be in Level 400.
 * @param indexNumber The student's full index number.
 * @returns The calculated level (100, 200, 300, 400).
 */
export function calculateStudentLevel(indexNumber: string): number {
  if (!indexNumber || typeof indexNumber !== 'string') {
    return 100; // Default or error case
  }
  
  const parts = indexNumber.split('/');
  if (parts.length < 3) {
    return 100; // Invalid format
  }

  const yearSuffix = parts[2];
  if (yearSuffix.length !== 2 || isNaN(parseInt(yearSuffix, 10))) {
    return 100; // Invalid year suffix
  }

  const enrollmentStartYear = parseInt(`20${yearSuffix}`, 10);
  const currentJsDate = new Date();
  const currentMonth = currentJsDate.getMonth(); // 0-11 for Jan-Dec
  const currentYear = currentJsDate.getFullYear();
  
  // An academic year typically starts in August (month index 7).
  // If we are before August, we are still in the previous academic year.
  // For example, in May 2024, we are still in the 2023-2024 academic year.
  const currentAcademicYearStart = currentMonth >= 7 ? currentYear : currentYear - 1;

  const academicYearsCompleted = currentAcademicYearStart - enrollmentStartYear;

  let level = (academicYearsCompleted * 100) + 100;
  
  // Cap the level at 400 and handle edge cases
  if (level > 400) {
    level = 400;
  }
  if (level < 100) {
      level = 100;
  }

  return level;
}
