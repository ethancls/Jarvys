'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Exercise, TestCase, TestResult } from '@/lib/models/exercise';
import { UploadedFile, CodeRequest } from '@/lib/models/code';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import TextareaAutosize from 'react-textarea-autosize'; // Importation
import {
  Terminal,
  Save,
  Play,
  Plus,
  Trash2,
  FileCode,
  ChevronDown,
  ChevronUp,
  Check,
  X,
  ArrowLeft,
  PlayCircle,
  CheckCircle // Ajouter CheckCircle
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { HelpCircle } from 'lucide-react';

// Composant pour l'éditeur de code
function CodeEditor({
  files,
  onFileChange,
  onFileNameChange,
  onAddFile,
  onRemoveFile,
  onSetMainFile
}: {
  files: UploadedFile[];
  onFileChange: (index: number, content: string) => void;
  onFileNameChange: (index: number, name: string) => void;
  onAddFile: () => void;
  onRemoveFile: (index: number) => void;
  onSetMainFile: (index: number) => void;
}) {
  const [activeFileIndex, setActiveFileIndex] = useState(0);

  return (
    // Assurer que le conteneur peut grandir
    <div className="border rounded-lg overflow-hidden flex flex-col h-full">
      {/* Barre d'onglets */}
      <div className="bg-gray-100 dark:bg-neutral-950 p-2 flex items-center justify-between flex-shrink-0">
        <div className="flex space-x-2 overflow-x-auto">
          {files.map((file, index) => (
            <div
              key={index}
              className={`flex items-center px-3 py-1 rounded cursor-pointer ${activeFileIndex === index
                  ? 'bg-white dark:bg-neutral-700'
                  : 'hover:bg-gray-200 dark:hover:bg-neutral-600'
                } ${file.isMain ? 'font-bold border-b-2 border-violet-500' : ''}`}
              onClick={() => setActiveFileIndex(index)}
            >
              <FileCode size={16} className="mr-1" />
              <input
                type="text"
                value={file.name}
                onChange={(e) => onFileNameChange(index, e.target.value)}
                className="bg-transparent border-none outline-none w-20"
                onClick={(e) => e.stopPropagation()}
              />
              <div className="flex ml-2">
                {!file.isMain && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSetMainFile(index);
                    }}
                    className="text-xs px-1 hover:cursor-pointer text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    title="Définir comme fichier principal"
                  >
                    <Terminal size={14} />
                  </button>
                )}
                {files.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveFile(index);
                      if (activeFileIndex === index) {
                        setActiveFileIndex(0);
                      }
                    }}
                    className="text-xs px-1 hover:cursor-pointer text-gray-500 hover:text-red-500"
                    title="Supprimer le fichier"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          ))}
          <button
            onClick={onAddFile}
            className="px-3 py-1 hover:cursor-pointer text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600 rounded flex items-center"
            title="Ajouter un fichier"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>
      {/* Remplacement de textarea par TextareaAutosize */}
      <TextareaAutosize
        className="w-full p-4 font-mono text-sm outline-none border-none resize-none dark:bg-neutral-900 flex-grow" // Suppression de h-134, flex-grow permet de prendre l'espace
        value={files[activeFileIndex]?.content || ''} // Utilisation de ?. pour sécurité
        onChange={(e) => onFileChange(activeFileIndex, e.target.value)}
        spellCheck={false}
        minRows={10} // Optionnel: définir une hauteur minimale (en lignes)
        cacheMeasurements // Optionnel: pour la performance
      />
    </div>
  );
}

// Composant pour afficher les résultats des tests
interface AugmentedTestResult extends TestResult {
  hidden?: boolean; // Ajouter la propriété hidden
}

function TestResults({ results }: { results: AugmentedTestResult[] | null }) {
  const [expanded, setExpanded] = useState(true);

  if (!results || results.length === 0) return null;

  const successCount = results.filter(r => r.success).length;
  const totalCount = results.length;

  return (
    <div className="mt-6 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden shadow-sm">
      {/* En-tête résumé */}
      <div
        className={`p-4 flex justify-between items-center cursor-pointer transition-colors ${successCount === totalCount
            ? 'bg-violet-50 dark:bg-violet-900/30 hover:bg-violet-100 dark:hover:bg-violet-900/40'
            : 'bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/40'
          }`}
        onClick={() => setExpanded(!expanded)}
      >
        <div className="font-semibold flex items-center text-sm">
          {successCount === totalCount
            ? <Check className="mr-2 text-violet-500 dark:text-violet-400" size={18} />
            : <X className="mr-2 text-red-500 dark:text-red-400" size={18} />
          }
          <span className={`${successCount === totalCount ? 'text-violet-600 dark:text-violet-300' : 'text-red-700 dark:text-red-300'}`}>
            Résultats : {successCount}/{totalCount} tests réussis
          </span>
        </div>
        {expanded ? <ChevronUp size={20} className="text-neutral-500" /> : <ChevronDown size={20} className="text-neutral-500" />}
      </div>

      {/* Détails des tests (si déplié) */}
      {expanded && (
        <div className="p-4 bg-white dark:bg-neutral-950 space-y-3">
          {results.map((result, idx) => (
            <div
              key={idx}
              className={`border rounded-lg overflow-hidden ${result.success
                  ? 'border-violet-200 dark:border-violet-800'
                  : 'border-red-300 dark:border-red-800'
                }`}
            >
              {/* En-tête du test individuel */}
              <div className={`px-3 py-2 flex items-center justify-between ${result.success ? 'bg-violet-50 dark:bg-violet-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
                <div className="font-medium text-xs flex items-center">
                  {result.success
                    ? <Check className="mr-1.5 text-violet-500 dark:text-violet-400" size={14} />
                    : <X className="mr-1.5 text-red-500 dark:text-red-400" size={14} />
                  }
                  <span className={`${result.success ? 'text-violet-600 dark:text-violet-300' : 'text-red-700 dark:text-red-300'}`}>
                    {result.description || `Test #${idx + 1}`}
                  </span>
                </div>
                {result.hidden && (
                  <span className="text-xs font-medium bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 px-1.5 py-0.5 rounded-full">Caché</span>
                )}
              </div>

              {/* Corps du test individuel */}
              <div className="p-3 text-xs space-y-2">
                {/* Entrée */}
                <div>
                  <div className="font-medium mb-1 text-neutral-600 dark:text-neutral-400">Entrée :</div>
                  <pre className="bg-neutral-100 dark:bg-neutral-800/50 p-2 rounded overflow-auto text-xs font-mono text-neutral-800 dark:text-neutral-200">{result.input || '(Aucune)'}</pre>
                </div>

                {/* Sortie Attendue (si non caché) */}
                {!result.hidden && (
                  <div>
                    <div className="font-medium mb-1 text-neutral-600 dark:text-neutral-400">Sortie Attendue :</div>
                    <pre className="bg-neutral-100 dark:bg-neutral-800/50 p-2 rounded overflow-auto text-xs font-mono text-neutral-800 dark:text-neutral-200">{result.expected_output}</pre>
                  </div>
                )}

                {/* Sortie Obtenue */}
                <div>
                  <div className={`font-medium mb-1 ${result.success ? 'text-violet-600 dark:text-violet-400' : 'text-red-600 dark:text-red-400'}`}>Sortie Obtenue :</div>
                  <pre className={`${result.success ? 'bg-violet-50 dark:bg-violet-900/20' : 'bg-red-50 dark:bg-red-900/20'} p-2 rounded overflow-auto text-xs font-mono ${result.success ? 'text-violet-800 dark:text-violet-200' : 'text-red-800 dark:text-red-200'}`}>{result.actual_output || '(Aucune)'}</pre>
                </div>

                {/* Erreur (si présente) */}
                {result.error && (
                  <div>
                    <div className="font-medium text-red-600 dark:text-red-400 mb-1">Erreur :</div>
                    <pre className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 p-2 rounded overflow-auto text-xs font-mono">{result.error}</pre>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Composant pour le contenu de l'exercice
function ExerciseContent({ exercise, loading, error }: {
  exercise: Exercise | null;
  loading: boolean;
  error: string | null;
}) {
  const [files, setFiles] = useState<UploadedFile[]>([
    { name: 'main.py', content: '# Écrivez votre code ici', isMain: true }
  ]);
  const [testResults, setTestResults] = useState<AugmentedTestResult[] | null>(null); // Correction type
  const [executing, setExecuting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showTestCases, setShowTestCases] = useState(false);
  const [activeTestCase, setActiveTestCase] = useState<number | null>(null);
  const [helpOpen, setHelpOpen] = useState(false);

  // Charger la solution sauvegardée au chargement
  useEffect(() => {
    if (exercise?.id) {
      fetchSavedSolution();
    }
  }, [exercise?.id]);

  // Récupérer la solution sauvegardée
  async function fetchSavedSolution() {
    try {
      const res = await fetch(`/api/exercises/${exercise?.id}/solution`);
      if (res.ok) {
        const data = await res.json();
        if (data.solution && data.solution.files && data.solution.files.length > 0) {
          setFiles(data.solution.files);
        }
      }
    } catch (error) {
      console.error("Erreur lors du chargement de la solution:", error);
    }
  }

  // Gérer les changements de fichiers
  const handleFileChange = (index: number, content: string) => {
    setFiles(prev => prev.map((file, i) =>
      i === index ? { ...file, content } : file
    ));
  };

  const handleFileNameChange = (index: number, name: string) => {
    setFiles(prev => prev.map((file, i) =>
      i === index ? { ...file, name } : file
    ));
  };

  const handleAddFile = () => {
    setFiles(prev => [...prev, {
      name: `file${prev.length + 1}.py`,
      content: '# Nouveau fichier',
      isMain: false
    }]);
  };

  const handleRemoveFile = (index: number) => {
    setFiles(prev => {
      // Si c'est le fichier principal qu'on supprime, il faut définir un nouveau fichier principal
      if (prev[index].isMain && prev.length > 1) {
        const newFiles = prev.filter((_, i) => i !== index);
        newFiles[0].isMain = true;
        return newFiles;
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSetMainFile = (index: number) => {
    setFiles(prev => prev.map((file, i) => ({
      ...file,
      isMain: i === index
    })));
  };

  // Enregistrer la solution
  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/exercises/${exercise?.id}/solution`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ files }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        toast.error(errorData.error || "Erreur lors de l'enregistrement");
        throw new Error(errorData.error || "Erreur lors de l'enregistrement");
      }
      toast.success('Solution enregistrée avec succès !');
    } catch (e: any) {
      console.error("Erreur lors de l'enregistrement:", e);
      // toast.error déjà appelé ci-dessus
    } finally {
      setSaving(false);
    }
  };

  // Exécuter le code (modifié pour accepter un index optionnel)
  const handleExecute = async (testCaseIndex?: number) => { // Ajout de testCaseIndex?
    setExecuting(true);
    setTestResults(null);

    try {
      const mainFile = files.find(f => f.isMain)?.name || files[0].name;

      // Déterminer quels test cases envoyer
      const testCasesToSend = testCaseIndex !== undefined && exercise?.testCases
        ? [exercise.testCases[testCaseIndex]] // Un seul cas
        : exercise?.testCases || []; // Tous les cas

      if (testCasesToSend.length === 0) {
        console.warn("Aucun test case à exécuter.");
        setExecuting(false);
        return; // Ne rien faire s'il n'y a pas de tests
      }

      const codeRequest: CodeRequest = {
        main_file: mainFile,
        files: files,
        requirements: [],
        test_cases: testCasesToSend, // Utiliser les cas déterminés
      };

      const res = await fetch(`/api/exercises/${exercise?.id}/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(codeRequest),
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error('API Error Data:', errorData);
        throw new Error(errorData.error || 'Erreur lors de l\'exécution');
      }

      const data = await res.json();

      // Adapter l'indexation si un seul cas est testé
      const startIndex = testCaseIndex !== undefined ? testCaseIndex : 0;

      if (data.test_results && exercise?.testCases) {
        // Utiliser les testCases originaux complets pour le mapping hidden
        const resultsWithHiddenInfo: AugmentedTestResult[] = data.test_results.map((result: TestResult, index: number) => {
          const originalIndex = startIndex + index; // Calculer l'index original par rapport à la liste complète
          return {
            ...result,
            hidden: exercise.testCases?.[originalIndex]?.hidden ?? false,
          };
        });
        setTestResults(resultsWithHiddenInfo);
      } else {
        console.error("Format de réponse inattendu ou testCases manquants:", data);
        setTestResults([]);
      }

    } catch (e: any) {
      console.error("Erreur dans handleExecute:", e);
      alert(`Erreur lors de l'exécution: ${e.message}`);
      setTestResults([]);
    } finally {
      setExecuting(false);
    }
  };

  // Sélectionner un test case pour afficher/cacher les détails
  const selectTestCase = (idx: number) => {
    setActiveTestCase(prev => (prev === idx ? null : idx));
  };

  function HelpModal({ open, onClose }: { open: boolean; onClose: () => void }) {
    if (!open) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
        <div className="bg-white dark:bg-neutral-950 rounded-lg shadow-lg p-8 w-full max-w-lg relative">
          <button onClick={onClose} className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 text-xl font-bold"><X className="h-6 w-6 hover:cursor-pointer" /></button>
          <h2 className="text-xl font-bold text-violet-500 dark:text-violet-300 mb-4 flex items-center gap-2"><HelpCircle className="h-6 w-6" />Aide sur l'entrée/sortie</h2>
          <div className="space-y-4 text-sm">
            <div>
              <p className="mb-2 font-semibold text-violet-500">Comment l'API envoie les entrées :</p>
              <ul className="list-disc ml-5 mb-2 text-neutral-700 dark:text-neutral-300">
                <li>Les entrées sont envoyées via <span className="font-mono">stdin</span> (input standard).</li>
                <li>Pour chaque test, l'entrée est fournie sous forme de texte, chaque valeur sur une ligne.</li>
                <li>Exemple d'entrée pour un tableau :<br />
                  <pre className="bg-neutral-100 dark:bg-neutral-900/40 p-2 rounded mt-1 font-mono">5\n1 2 3 4 5</pre>
                  <span className="text-xs text-neutral-500">(5 = taille du tableau, puis les éléments séparés par des espaces)</span>
                </li>
              </ul>
            </div>
            <div>
              <p className="mb-2 font-semibold text-violet-500">Exemples de code pour lire l'entrée :</p>
              <pre className="bg-neutral-100 dark:bg-neutral-900/40 p-2 rounded font-mono text-xs mb-2">
                # Lire un entier <br />
                n = int(input()) <br />
                # Lire un tableau d'entiers <br />
                arr = list(map(int, input().split())) <br />
                # Lire plusieurs lignes <br />
                lines = [input() for _ in range(n)] 
              </pre>
            </div>
            <div>
              <p className="mb-2 font-semibold text-violet-500">Comment renvoyer la sortie :</p>
              <ul className="list-disc ml-5 mb-2 text-neutral-700 dark:text-neutral-300">
                <li>Votre code doit <span className="font-mono">imprimer</span> la sortie attendue (via <span className="font-mono">print()</span>).</li>
                <li>Pour un tableau, imprimez les éléments séparés par des espaces :</li>
              </ul>
              <pre className="bg-neutral-100 dark:bg-neutral-900/40 p-2 rounded font-mono text-xs mb-2">
                # Afficher un entier <br />
                print(n) <br />
                # Afficher un tableau <br />
                print(' '.join(map(str, arr)))
              </pre>
            </div>
            <div>
              <p className="mb-2 font-semibold text-violet-500">Remarques :</p>
              <ul className="list-disc ml-5 text-neutral-700 dark:text-neutral-300">
                <li>Ne pas ajouter de texte explicatif dans la sortie, uniquement la valeur ou le tableau attendu.</li>
                <li>La comparaison se fait sur la sortie brute (strip).</li>
                <li>Le code est exécuté avec un timeout de 10 secondes.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return <Spinner />;
  }

  if (error) {
    return (
      <div className="p-6 text-red-500">
        Erreur: {error}
      </div>
    );
  }

  if (!exercise) {
    return <div className="p-6">Exercice non trouvé</div>;
  }

  return (
    <div className="container mx-auto px-2 sm:px-4 py-8 min-h-screen">
      <HelpModal open={helpOpen} onClose={() => setHelpOpen(false)} />
      <div className="w-full">
        {/* Header harmonisé */}
        <div className="mb-8 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-2">
            <Link href="/dashboard" className="inline-flex items-center text-sm text-violet-500 hover:text-violet-600 font-medium">
              <ArrowLeft className="mr-1 h-4 w-4" />
              Retour au tableau de bord
            </Link>
            <h1 className="text-2xl font-bold text-violet-500 dark:text-violet-300">{exercise.title}</h1>
          </div>
          <Button
            type="button"
            onClick={() => setHelpOpen(true)}
            className="ml-auto bg-neutral-100 dark:bg-neutral-900/40 border hover:cursor-pointer border-neutral-200 dark:border-neutral-800 text-violet-500 dark:text-violet-300 hover:bg-violet-50 dark:hover:bg-violet-900/30 font-semibold rounded-lg px-4 py-2 flex items-center gap-2 shadow"
          >
            <HelpCircle className="h-5 w-5 mr-1" />
            Aide
          </Button>
        </div>
        {/* Grid harmonisé */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          {/* Colonne Énoncé & Tests */}
          <div className="space-y-8">
            <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 shadow-lg p-8 flex flex-col min-h-[480px]">
              <h2 className="mb-4 text-lg font-bold text-violet-500 dark:text-violet-300">Énoncé</h2>
              <p className="text-base text-neutral-800 dark:text-neutral-200 leading-relaxed mb-6">{exercise.description}</p>
              <div className="space-y-4">
                {exercise.testCases && exercise.testCases.length > 0 ? (
                  <div>
                    <h3 className="mb-2 text-sm font-bold text-violet-500 dark:text-violet-300">Jeux de tests</h3>
                    <div className="space-y-2">
                      {exercise.testCases.map((testCase, idx) => (
                        <div key={idx} className={`rounded-lg border p-3 shadow-sm transition-all ${activeTestCase === idx ? 'border-violet-400 bg-violet-50 dark:bg-neutral-900/40' : 'bg-neutral-100 border-neutral-200 dark:bg-neutral-900/40 dark:border-neutral-800'}`}>
                          <div className="flex cursor-pointer items-center justify-between hover:bg-violet-100 dark:hover:bg-violet-900/30 rounded-md p-2" onClick={() => selectTestCase(idx)}>
                            <h4 className="text-sm font-bold text-violet-500">{testCase.description || `Test #${idx + 1}`}</h4>
                            <div className="flex items-center">
                              <span className="mr-2 text-xs text-violet-500">{activeTestCase === idx ? 'Cacher les détails' : 'Voir les détails'}</span>
                              {activeTestCase === idx ? (
                                <ChevronUp className="h-4 w-4 text-violet-500" />
                              ) : (
                                <ChevronDown className="h-4 w-4 text-violet-500" />
                              )}
                            </div>
                          </div>
                          {activeTestCase === idx && (
                            <div className="mt-3 space-y-3">
                              {testCase.hidden ? (
                                <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-md p-4 text-center">
                                  <div className="flex flex-col items-center">
                                    <div className="w-12 h-12 rounded-full bg-violet-50 dark:bg-violet-900/30 flex items-center justify-center mb-2">
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-violet-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                                    </div>
                                    <p className="text-sm font-medium text-violet-500">Test masqué</p>
                                    <p className="text-xs text-neutral-500 mt-1">Exécutez votre code pour vérifier votre solution</p>
                                  </div>
                                </div>
                              ) : (
                                <div className="space-y-3">
                                  <div>
                                    <h5 className="mb-1 text-xs font-bold text-violet-500">Entrée</h5>
                                    <pre className="rounded-md bg-neutral-100 dark:bg-neutral-900/40 p-2 text-xs font-mono text-neutral-900 dark:text-neutral-200 whitespace-pre-wrap break-words">{testCase.input || '(Aucune entrée)'}</pre>
                                  </div>
                                  <div>
                                    <h5 className="mb-1 text-xs font-bold text-violet-500">Sortie attendue</h5>
                                    <pre className="rounded-md bg-neutral-100 dark:bg-neutral-900/40 p-2 text-xs font-mono text-neutral-900 dark:text-neutral-200 whitespace-pre-wrap break-words">{testCase.expected_output}</pre>
                                  </div>
                                </div>
                              )}
                              <Button
                                onClick={() => handleExecute(idx)}
                                disabled={executing}
                                variant="default"
                                className="mt-2 w-full rounded-lg px-5 py-2 text-base font-semibold shadow border hover:cursor-pointer border-violet-200 dark:border-violet-800 bg-violet-500 dark:bg-violet-800 hover:bg-violet-700 dark:hover:bg-violet-900 text-white transition-all duration-150 flex items-center justify-center gap-2"
                              >
                                <Play size={16} />
                                <span>Tester ce cas</span>
                              </Button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <>
                    <div>
                      <h3 className="mb-2 text-sm font-bold  text-violet-500">Entrée</h3>
                      <pre className="mt-1 rounded-md bg-violet-100 p-3 text-sm font-mono text-neutral-900 whitespace-pre-wrap break-words">{exercise.input || 'Aucune entrée requise'}</pre>
                    </div>
                    <div>
                      <h3 className="mb-2 text-sm font-bold  text-violet-500">Sortie attendue</h3>
                      <pre className="mt-1 rounded-md bg-violet-100 p-3 text-sm font-mono text-neutral-900 whitespace-pre-wrap break-words">{exercise.output}</pre>
                    </div>
                  </>
                )}
              </div>
            </div>
            {/* Carte Résultats harmonisée */}
            <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 shadow-lg">
              <div className="p-6">
                <h2 className="mb-4 text-lg font-semibold text-violet-500 dark:text-violet-300">Résultats de l'exécution</h2>
                {!testResults && !executing && (
                  <div className="flex flex-col items-center justify-center p-8 bg-neutral-100 dark:bg-neutral-900/40 rounded-lg border border-dashed border-neutral-200 dark:border-neutral-800">
                    <PlayCircle size={32} className="text-neutral-400 dark:text-neutral-600 mb-3" />
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 font-medium">Cliquez sur "Exécuter" pour voir les résultats.</p>
                  </div>
                )}
                {executing && (
                  <div className="flex flex-col items-center justify-center p-8 bg-neutral-100 dark:bg-neutral-900/40 rounded-lg animate-pulse">
                    <Spinner size='lg' className="mb-3 text-violet-500" />
                    <p className="text-base text-violet-700 dark:text-violet-300 font-semibold mb-1">Exécution en cours...</p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">Veuillez patienter pendant que nous testons votre code</p>
                  </div>
                )}
                {testResults && <TestResults results={testResults} />}
              </div>
            </div>
          </div>
          {/* Colonne Éditeur harmonisée */}
          <div>
            <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 shadow-lg overflow-hidden flex flex-col h-full">
              <div className="p-6 flex flex-col flex-grow">
                <div className="flex justify-between items-center mb-4 flex-shrink-0">
                  <h2 className="text-lg font-semibold text-violet-500 dark:text-violet-300">Votre Solution</h2>
                  <div className="flex items-center gap-3">
                    <Button
                      onClick={handleSave}
                      disabled={saving}
                      variant="secondary"
                      className="rounded-lg px-5 py-2 text-base font-semibold shadow hover:cursor-pointer border border-none bg-violet-50 dark:bg-neutral-900 hover:bg-violet-100 dark:hover:bg-violet-900 text-violet-500 dark:text-violet-200 transition-all duration-150 flex items-center gap-2"
                    >
                      {saving ? <Spinner size="sm" /> : <Save size={18} />}
                      <span>Enregistrer</span>
                    </Button>
                    <Button
                      onClick={() => handleExecute()}
                      disabled={executing}
                      variant="default"
                      className="rounded-lg px-5 py-2 text-base font-semibold shadow hover:cursor-pointer border border-none bg-violet-500 dark:bg-violet-800 hover:bg-violet-700 dark:hover:bg-violet-900 text-white transition-all duration-150 flex items-center gap-2"
                    >
                      {executing ? <Spinner size="sm" /> : <Play size={18} />}
                      <span>Exécuter</span>
                    </Button>
                  </div>
                </div>
                <div className="flex-grow min-h-0">
                  <CodeEditor
                    files={files}
                    onFileChange={handleFileChange}
                    onFileNameChange={handleFileNameChange}
                    onAddFile={handleAddFile}
                    onRemoveFile={handleRemoveFile}
                    onSetMainFile={handleSetMainFile}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ExercisePage() {
  const { id } = useParams();
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchExercise();
  }, [id]);

  async function fetchExercise() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/exercises/${id}`);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Erreur lors du chargement de l\'exercice');
      }
      const data = await res.json();
      setExercise(data.exercise);
    } catch (e: any) {
      setError(e.message);
      console.error("Erreur lors du chargement de l'exercice:", e);
    } finally {
      setLoading(false);
    }
  }

  return <ExerciseContent exercise={exercise} loading={loading} error={error} />;
}
