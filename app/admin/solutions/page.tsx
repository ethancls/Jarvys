'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Solution } from '@/lib/models/exercise';
import Link from 'next/link';
import { ArrowLeft, Search, X, FileText, Code, Eye, Download, Clock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import JSZip from 'jszip';
import { UploadedFile } from '@/lib/models';

export default function AdminSolutionsPage() {
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [students, setStudents] = useState<any[]>([]); // À typer selon ton modèle user
  const [exercises, setExercises] = useState<any[]>([]); // À typer selon ton modèle exercise
  const [filteredSolutions, setFilteredSolutions] = useState<Solution[]>([]);
  const [selectedSolution, setSelectedSolution] = useState<Solution | null>(null);

  // Chargement des étudiants et exercices pour les filtres
  useEffect(() => {
    fetchSolutions();
    fetchStudents();
    fetchExercises();
  }, []);

  async function fetchStudents() {
    try {
      const res = await fetch('/api/admin/students');
      if (!res.ok) return;
      const data = await res.json();
      setStudents(Array.isArray(data) ? data : []);
    } catch {}
  }
  async function fetchExercises() {
    try {
      const res = await fetch('/api/admin/exercises');
      if (!res.ok) return;
      const data = await res.json();
      setExercises(Array.isArray(data) ? data : []);
    } catch {}
  }

  // Filtrage dynamique
  useEffect(() => {
    let filtered = solutions;
    if (searchTerm) {
      filtered = filtered.filter(s =>
        (s.files?.some(f => f.name.toLowerCase().includes(searchTerm.toLowerCase())) || false) ||
        (students.find(st => st.id === s.studentId)?.firstname + ' ' + students.find(st => st.id === s.studentId)?.lastname).toLowerCase().includes(searchTerm.toLowerCase()) ||
        (exercises.find(ex => ex.id === s.exerciseId)?.title || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (selectedExercise) filtered = filtered.filter(s => s.exerciseId === selectedExercise);
    if (selectedStudent) filtered = filtered.filter(s => s.studentId === selectedStudent);
    if (selectedDate) filtered = filtered.filter(s => s.timestamp && s.timestamp.startsWith(selectedDate));
    // enrichir pour l'affichage
    setFilteredSolutions(filtered.map(s => ({
      ...s,
      studentName: students.find(st => st.id === s.studentId) ? `${students.find(st => st.id === s.studentId).firstname} ${students.find(st => st.id === s.studentId).lastname}` : s.studentId,
      studentNumber: students.find(st => st.id === s.studentId)?.number || '',
      exerciseTitle: exercises.find(ex => ex.id === s.exerciseId)?.title || s.exerciseId,
      dateFormatted: s.timestamp ? new Date(s.timestamp).toLocaleString('fr-FR') : '',
    })));
    // dates disponibles
    setAvailableDates([...new Set(solutions.map(s => s.timestamp?.slice(0, 10)).filter(Boolean))]);
  }, [solutions, searchTerm, selectedExercise, selectedStudent, selectedDate, students, exercises]);

  function resetFilters() {
    setSearchTerm('');
    setSelectedExercise(null);
    setSelectedStudent(null);
    setSelectedDate(null);
  }

  function closeModal() {
    setSelectedSolution(null);
  }

  function viewSolution(solution: Solution) {
    setSelectedSolution(solution);
  }

  async function downloadSolution(solution: Solution) {
    if (!solution.files || solution.files.length === 0) return;
    const zip = new JSZip();
    solution.files.forEach((file) => {
      zip.file(file.name, file.content || '');
    });
    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `solution_${solution.studentNumber || solution.studentId}_${solution.exerciseTitle || solution.exerciseId}.zip`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  }

  async function fetchSolutions() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/solutions');
      if (!res.ok) throw new Error('Erreur lors du chargement des solutions');
      const data = await res.json();
      setSolutions(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    setError(null);
    try {
      const res = await fetch('/api/admin/solutions', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error('Erreur lors de la suppression');
      fetchSolutions();
    } catch (e: any) {
      setError(e.message);
    }
  }

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className="container mx-auto py-8 min-h-screen">
      <div className="mb-8 flex items-center justify-between">
        <div>
          {/* Suppression du lien retour au tableau de bord */}
          <h1 className="text-3xl font-bold">
            <span className="text-cyan-500">Solutions des étudiants</span>
          </h1>
          <p className="text-sm font-medium text-neutral-500">
            Consultez et téléchargez les solutions des étudiants aux exercices
          </p>
        </div>
      </div>
      {/* Filtres */}
      <div className="mb-6 rounded-lg border-2 border-cyan-200 bg-white dark:bg-black p-6 shadow-lg">
        <div className="mb-4 flex items-center">
          <Search className="mr-2 h-5 w-5 text-cyan-500" />
          <h2 className="text-xl font-bold text-cyan-600">Filtres</h2>
        </div>
        
        <div className="grid gap-4 md:grid-cols-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-cyan-600">Recherche</label>
            <div className="relative">
              <Input 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher..."
                className="bg-transparent border-2 border-cyan-200 pl-10 pr-4 h-10 shadow-sm transition-colors focus:border-cyan-500"
              />
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            </div>
          </div>
          
          <div>
            <label className="mb-2 block text-sm font-medium text-cyan-600">Exercice</label>
            <select 
              value={selectedExercise || ''}
              onChange={(e) => setSelectedExercise(e.target.value || null)}
              className="w-full h-10 rounded-md bg-transparent border-2 border-cyan-200 px-3 py-1 text-sm shadow-sm transition-colors focus:border-cyan-500 focus:outline-none"
            >
              <option value="">Tous les exercices</option>
              {exercises.map((exercise) => (
                <option key={exercise.id} value={exercise.id}>{exercise.title}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="mb-2 block text-sm font-medium text-cyan-600">Étudiant</label>
            <select 
              value={selectedStudent || ''}
              onChange={(e) => setSelectedStudent(e.target.value || null)}
              className="w-full h-10 rounded-md bg-transparent border-2 border-cyan-200 px-3 py-1 text-sm shadow-sm transition-colors focus:border-cyan-500 focus:outline-none"
            >
              <option value="">Tous les étudiants</option>
              {students.filter(s => !s.isAdmin).map((student) => (
                <option key={student.id} value={student.id}>
                  {student.number} - {student.firstname} {student.lastname}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="mb-2 block text-sm font-medium text-cyan-600">Date</label>
            <select 
              value={selectedDate || ''}
              onChange={(e) => setSelectedDate(e.target.value || null)}
              className="w-full h-10 rounded-md bg-transparent border-2 border-cyan-200 px-3 py-1 text-sm shadow-sm transition-colors focus:border-cyan-500 focus:outline-none"
            >
              <option value="">Toutes les dates</option>
              {availableDates.map((date) => (
                <option key={date} value={date}>
                  {new Date(date).toLocaleDateString('fr-FR')}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="mt-4 flex justify-end">
          <Button
            onClick={resetFilters}
            variant="outline"
            size="sm"
            className="border-cyan-200 text-cyan-500 hover:bg-cyan-50 font-medium"
          >
            <X className="mr-2 h-4 w-4" />
            Réinitialiser les filtres
          </Button>
        </div>
      </div>
      {/* Liste des solutions */}
      <div className="rounded-lg border-2 border-cyan-200 bg-white dark:bg-black p-6 shadow-lg">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center">
            <FileText className="mr-2 h-5 w-5 text-cyan-500" />
            <h2 className="text-xl font-bold text-cyan-600">Solutions ({filteredSolutions.length})</h2>
          </div>
        </div>
        {filteredSolutions.length === 0 ? (
          <div className="rounded-lg border border-cyan-200 bg-white dark:bg-black p-8 text-center">
            <Code className="mx-auto h-12 w-12 text-cyan-300" />
            <h3 className="mt-2 text-xl font-bold text-cyan-600 dark:text-cyan-400">Aucune solution trouvée</h3>
            <p className="mt-1 text-sm font-medium text-neutral-500 dark:text-neutral-400">Aucune solution ne correspond aux critères sélectionnés.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-cyan-200 dark:border-cyan-900">
            <table className="min-w-full divide-y divide-cyan-100 dark:divide-cyan-900">
              <thead className="bg-cyan-50 dark:bg-cyan-900/20">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-cyan-600">
                    Étudiant
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-cyan-600">
                    Exercice
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-cyan-600">
                    Date de soumission
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-cyan-600">
                    Fichiers
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wider text-cyan-600">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cyan-100 dark:divide-cyan-900">
                {filteredSolutions.map((solution) => (
                  <tr key={`${solution.studentId}-${solution.exerciseId}`} className="bg-white dark:bg-black hover:bg-cyan-50 dark:hover:bg-cyan-900/30">
                    <td className="whitespace-nowrap px-4 py-3 text-sm font-medium">
                      <div className="flex flex-col">
                        <span className="font-bold text-cyan-600">#{solution.studentNumber}</span>
                        <span className="text-neutral-500">{solution.studentName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-neutral-700">
                      {solution.exerciseTitle}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-neutral-700">
                      <div className="flex items-center">
                        <Clock className="mr-2 h-4 w-4 text-cyan-500" />
                        {solution.dateFormatted}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-neutral-700">
                      {solution.files?.length || 0} fichier(s)
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right text-sm">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-cyan-200 bg-white text-cyan-500 hover:bg-cyan-50 font-medium"
                          onClick={() => viewSolution(solution)}
                        >
                          <Eye className="mr-1 h-4 w-4" />
                          Voir
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-cyan-200 bg-white text-cyan-500 hover:bg-cyan-50 font-medium"
                          onClick={() => downloadSolution(solution)}
                        >
                          <Download className="mr-1 h-4 w-4" />
                          Télécharger
                        </Button>
                        <Button variant="outline" size="sm" className="border-cyan-200 bg-white text-cyan-500 hover:bg-cyan-50 font-medium" onClick={() => handleDelete(solution.id)}>Supprimer</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {/* Modal de visualisation du code */}
      {selectedSolution && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="w-full max-w-6xl max-h-[90vh] overflow-auto rounded-lg border-2 border-cyan-200 bg-white dark:bg-black p-6 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-cyan-600 dark:text-cyan-400">
                Code de {selectedSolution.studentName} - {selectedSolution.exerciseTitle}
              </h3>
              <Button
                variant="outline"
                size="sm"
                className="border-cyan-200 text-cyan-500 hover:bg-cyan-50 dark:hover:bg-cyan-900 font-medium"
                onClick={closeModal}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="mt-4 mb-4 flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="border-cyan-200 text-cyan-500 hover:bg-cyan-50 dark:hover:bg-cyan-900 font-medium"
                onClick={() => downloadSolution(selectedSolution)}
              >
                <Download className="mr-1 h-4 w-4" />
                Télécharger tous les fichiers
              </Button>
            </div>
            <div className="space-y-4">
              {selectedSolution.files?.map((file: UploadedFile, index: number) => (
                <div key={index} className="rounded-lg border border-cyan-200 dark:border-cyan-900 overflow-hidden">
                  <div className="flex items-center justify-between bg-cyan-50 dark:bg-cyan-900/20 px-4 py-2">
                    <h4 className="font-bold text-cyan-600 dark:text-cyan-400">
                      {file.name} {file.isMain && <span className="text-xs text-cyan-500 dark:text-cyan-300">(Fichier principal)</span>}
                    </h4>
                  </div>
                  <div className="p-4">
                    <pre className="whitespace-pre-wrap overflow-x-auto bg-neutral-50 dark:bg-neutral-900 p-4 rounded-md font-mono text-sm text-neutral-800 dark:text-neutral-200">
                      {file.content}
                    </pre>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}