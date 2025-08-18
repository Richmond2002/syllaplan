import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Calculates a student's current level based on their index number.
 * e.g., 'PS/ITC/21/0001' with current year 2024 results in level 400.
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

  const enrollmentYear = parseInt(`20${yearSuffix}`, 10);
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth(); // 0-11 for Jan-Dec

  // Assuming academic year starts around August (index 7)
  const academicYearAdjustment = currentMonth < 7 ? -1 : 0;
  const academicYear = currentYear + academicYearAdjustment;

  const yearsSinceEnrollment = academicYear - enrollmentYear;

  let level = (yearsSinceEnrollment * 100) + 100;
  
  // Cap the level at 400
  if (level > 400) {
    level = 400;
  }
  if (level < 100) {
      level = 100;
  }

  return level;
}
