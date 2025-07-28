/**
 * Modèle représentant un étudiant ou un administrateur dans le système
 */
export interface Student {
  id: string;
  number: string;
  firstname?: string;
  lastname?: string;
  isAdmin: boolean;
  passwordHash?: string;
} 