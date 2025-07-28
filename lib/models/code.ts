/**
 * Structure pour stocker les fichiers uploadés
 */
export interface UploadedFile {
  name: string;
  content: string;
  isMain: boolean;
}

/**
 * Interface pour la requête d'exécution de code
 */
export interface CodeRequest {
  main_file: string;
  files: UploadedFile[];
  requirements: string[];
  test_cases?: any[];
  expected_output?: string;
} 