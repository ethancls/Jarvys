'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Solution } from '@/lib/models/exercise';
import Link from 'next/link';
import { ArrowLeft, Search, X, FileText, Code, Eye, Download, Clock, Trash2, Filter, AlertTriangle } from 'lucide-react';
// Modal de confirmation suppression
function ConfirmModal({ open, onClose, onConfirm, title, description }: { open: boolean; onClose: () => void; onConfirm: () => void; title: string; description: string }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-lg p-6 w-full max-w-sm">
        <div className="flex items-center gap-3 mb-4">
          <Trash2 className="text-red-500" />
          <h3 className="font-bold text-lg">{title}</h3>
        </div>
        <p className="mb-6 text-sm text-neutral-600 dark:text-neutral-300">{description}</p>
        <div className="flex justify-end gap-2">
          <Button type="button" size="sm" className="bg-neutral-200 hover:bg-neutral-300 text-neutral-700 cursor-pointer" onClick={onClose}>Annuler</Button>
          <Button type="button" size="sm" className="bg-red-600 hover:bg-red-700 text-white cursor-pointer" onClick={onConfirm}>Confirmer</Button>
        </div>
      </div>
    </div>
  );
}
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
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

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
    setDeleteId(null);
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

  return (
    <div className="container mx-auto px-2 sm:px-4 py-8 min-h-screen">
      <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-4 md:p-6 shadow-lg bg-white dark:bg-neutral-950">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex-1 flex items-center gap-2">
            <h2 className="text-xl font-bold text-violet-500 dark:text-violet-300 mr-4">Liste des solutions</h2>
            <Input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Rechercher..."
              className="h-9 w-48 border-violet-300 focus:border-violet-500 focus:ring-violet-500 text-sm"
            />
          </div>
          <Button
            onClick={() => setShowFilters(v => !v)}
            className="w-full sm:w-auto bg-violet-500 hover:bg-violet-700 hover:cursor-pointer text-white font-semibold flex items-center gap-2 justify-end"
          >
            <Filter className="h-4 w-4" />
            Filtrer
          </Button>
        </div>
        {showFilters && (
          <div className="mb-6 flex flex-col gap-4 sm:grid sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium  text-violet-500 dark:text-violet-300">Exercice</label>
              <select
                value={selectedExercise || ''}
                onChange={e => setSelectedExercise(e.target.value || null)}
                className="h-9 border-violet-300 focus:border-violet-500 focus:ring-violet-500 text-sm rounded-md px-3 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-200"
              >
                <option value="">Tous les exercices</option>
                {exercises.map((exercise) => (
                  <option key={exercise.id} value={exercise.id}>{exercise.title}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium  text-violet-500 dark:text-violet-300">Étudiant</label>
              <select
                value={selectedStudent || ''}
                onChange={e => setSelectedStudent(e.target.value || null)}
                className="h-9 border-violet-300 focus:border-violet-500 focus:ring-violet-500 text-sm rounded-md px-3 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-200"
              >
                <option value="">Tous les étudiants</option>
                {students.filter(s => !s.isAdmin).map((student) => (
                  <option key={student.id} value={student.id}>{student.number} - {student.firstname} {student.lastname}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium  text-violet-500 dark:text-violet-300">Date</label>
              <select
                value={selectedDate || ''}
                onChange={e => setSelectedDate(e.target.value || null)}
                className="h-9 border-violet-300 focus:border-violet-500 focus:ring-violet-500 text-sm rounded-md px-3 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-200"
              >
                <option value="">Toutes les dates</option>
                {availableDates.map((date) => (
                  <option key={date} value={date}>{new Date(date).toLocaleDateString('fr-FR')}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <Button
                onClick={() => {
                  setSelectedExercise(null);
                  setSelectedStudent(null);
                  setSelectedDate(null);
                  setShowFilters(false);
                }}
                className="w-full bg-violet-500 hover:bg-violet-700 hover:cursor-pointer text-white font-semibold"
              >
                <X className="mr-2 h-4 w-4" />
                Réinitialiser les filtres
              </Button>
            </div>
          </div>
        )}
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <Spinner />
          </div>
        ) : filteredSolutions.length === 0 ? (
          <div className="rounded-lg border border-none p-8 bg-white/50 dark:bg-neutral-900/50 text-center">
            <Code className="mx-auto h-12 w-12 text-violet-300" />
            <h3 className="mt-2 text-xl font-bold text-violet-500 dark:text-violet-300">Aucune solution trouvée</h3>
            <p className="mt-1 text-sm font-medium text-neutral-500 dark:text-neutral-400">Aucune solution ne correspond aux critères sélectionnés.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-neutral-200 dark:border-neutral-800">
            <table className="w-full text-sm">
              <thead className="bg-neutral-100 dark:bg-neutral-900/40">
                <tr>
                  <th className="px-4 py-3 text-left font-bold uppercase tracking-wider text-violet-500 dark:text-violet-300">Étudiant</th>
                  <th className="px-4 py-3 text-left font-bold uppercase tracking-wider text-violet-500 dark:text-violet-300">Exercice</th>
                  <th className="px-4 py-3 text-left font-bold uppercase tracking-wider text-violet-500 dark:text-violet-300">Date</th>
                  <th className="px-4 py-3 text-left font-bold uppercase tracking-wider text-violet-500 dark:text-violet-300">Fichiers</th>
                  <th className="px-4 py-3 text-right font-bold uppercase tracking-wider text-violet-500 dark:text-violet-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-900/40">
                {filteredSolutions.map((solution) => (
                  <tr key={String(solution.id)} className="bg-white dark:bg-neutral-950 hover:bg-violet-50 dark:hover:bg-violet-900/30 cursor-pointer hover:opacity-90 transition-opacity">
                    <td className="whitespace-nowrap px-4 py-3 font-mono">
                      <span className="font-semibold text-violet-500">#{solution.studentNumber}</span>
                      <span className="ml-2 text-neutral-500">{solution.studentName}</span>
                    </td>
                    <td className="px-4 py-3">{solution.exerciseTitle}</td>
                    <td className="px-4 py-3">{solution.dateFormatted}</td>
                    <td className="px-4 py-3">{solution.files?.length || 0} fichier(s)</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          className="bg-violet-500 hover:bg-violet-700 text-white font-medium hover:cursor-pointer cursor-pointer"
                          onClick={() => viewSolution(solution)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          className="bg-violet-500 hover:bg-violet-700 text-white font-medium hover:cursor-pointer cursor-pointer"
                          onClick={() => downloadSolution(solution)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          className="bg-red-500 hover:bg-red-700 text-white font-medium hover:cursor-pointer cursor-pointer"
                          onClick={() => setDeleteId(String(solution.id))}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-auto border-none">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <FileText className="text-violet-500 dark:text-violet-300 h-6 w-6" />
                <h3 className="font-bold text-lg  text-violet-500 dark:text-violet-300">
                  Code de {selectedSolution.studentName} - {selectedSolution.exerciseTitle}
                </h3>
              </div>
              <Button
                className="bg-violet-500 hover:bg-violet-700 text-white font-medium hover:cursor-pointer"
                onClick={closeModal}
              >
                <X className="h-4 w-4 mr-1" /> Fermer
              </Button>
            </div>
            <div className="mb-4 flex gap-2">
              <Button
                className="bg-violet-500 hover:bg-violet-700 text-white font-medium hover:cursor-pointer"
                onClick={() => downloadSolution(selectedSolution)}
              >
                <Download className="mr-1 h-4 w-4" />
                Télécharger tous les fichiers
              </Button>
            </div>
            <div className="space-y-4">
              {selectedSolution.files?.map((file: UploadedFile, index: number) => (
                <div key={index} className="rounded-lg border border-violet-200 dark:border-violet-900 overflow-hidden">
                  <div className="flex items-center justify-between bg-violet-50 dark:bg-violet-900/20 px-4 py-2">
                    <h4 className="font-bold  text-violet-500 dark:text-violet-400">
                      {file.name} {file.isMain && <span className="text-xs text-violet-500 dark:text-violet-300">(Fichier principal)</span>}
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
      {/* Modal de confirmation suppression */}
      <ConfirmModal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && handleDelete(deleteId)}
        title="Supprimer la solution ?"
        description="Cette action est irréversible. La solution sera supprimée définitivement."
      />
    </div>
  );
}