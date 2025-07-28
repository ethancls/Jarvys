import { UploadedFile } from './code';

/**
 * Représente un cas de test pour un exercice
 */
export interface TestCase {
  input: string;
  expected_output: string;
  description: string;
  hidden?: boolean;
}

/**
 * Représente un exercice dans le système
 */
export interface Exercise {
  id: string;
  title: string;
  description: string;
  input: string;
  output: string;
  testCases?: TestCase[];
}

/**
 * Résultat d'exécution d'un test
 */
export interface TestResult {
  description: string;
  input: string;
  expected_output: string;
  actual_output: string;
  error: string;
  success: boolean;
}

/**
 * Solution d'un étudiant pour un exercice donné
 */
export interface Solution {
  dateFormatted: ReactNode;
  id(id: any): void;
  studentName: ReactNode;
  exerciseTitle: string;
  studentNumber: string;
  studentId: string;
  exerciseId: string;
  files: UploadedFile[];
  timestamp: string;
  lastModified: string;
} 