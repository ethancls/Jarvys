/**
 * Représente une entrée dans les logs d'exécution
 */
export interface Log {
  studentName: string;
  exerciseTitle: string;
  id: string;
  studentId: string;
  exerciseId: string;
  code: string;
  timestamp: string;
  success: boolean | null;
  isAutoSave?: boolean;
}

/**
 * Statistiques par étudiant
 */
export interface StudentStats {
  studentId: string;
  studentNumber: string;
  totalAttempts: number;
  successfulAttempts: number;
  successRate: number;
}

/**
 * Statistiques par exercice
 */
export interface ExerciseStats {
  exerciseId: string;
  exerciseTitle: string;
  totalAttempts: number;
  successfulAttempts: number;
  successRate: number;
} 