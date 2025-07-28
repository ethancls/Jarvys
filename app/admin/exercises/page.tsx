'use client';

import { useEffect, useState } from 'react';
import { Exercise } from '@/lib/models/exercise';
import { Edit, Trash2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Spinner } from '@/components/ui/spinner';
import { Input } from '@/components/ui/input';

export default function AdminExercisesPage() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchExercises();
  }, []);

  // Ajout du formulaire d'ajout/modification d'exercice
  const [showForm, setShowForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formId, setFormId] = useState<string | null>(null); // null = création, sinon édition
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formInput, setFormInput] = useState("");
  const [formOutput, setFormOutput] = useState("");
  const [formTestCases, setFormTestCases] = useState<any[]>([]);

  const [search, setSearch] = useState("");

  function openForm(ex?: Exercise) {
    if (ex) {
      setFormId(ex.id);
      setFormTitle(ex.title);
      setFormDescription(ex.description);
      setFormInput(ex.input || "");
      setFormOutput(ex.output || "");
      setFormTestCases(Array.isArray(ex.testCases) ? ex.testCases : []);
    } else {
      setFormId(null);
      setFormTitle("");
      setFormDescription("");
      setFormInput("");
      setFormOutput("");
      setFormTestCases([]);
    }
    setShowForm(true);
  }

  function handleTestCaseChange(idx: number, field: string, value: any) {
    setFormTestCases(tc => tc.map((t, i) => i === idx ? { ...t, [field]: value } : t));
  }
  function addTestCase() {
    setFormTestCases(tc => [...tc, { input: '', expected_output: '', description: '', hidden: false }]);
  }
  function removeTestCase(idx: number) {
    setFormTestCases(tc => tc.filter((_, i) => i !== idx));
  }

  async function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);
    try {
      const method = formId ? 'PUT' : 'POST';
      const url = '/api/admin/exercises';
      const body = {
        ...(formId ? { id: formId } : {}),
        title: formTitle,
        description: formDescription,
        inputExample: formInput,
        expectedOutputExample: formOutput,
        testCases: formTestCases,
      };
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erreur lors de la sauvegarde');
      }
      setShowForm(false);
      fetchExercises();
    } catch (e: any) {
      setFormError(e.message);
    } finally {
      setFormLoading(false);
    }
  }

  // Correction du fetch : l'API renvoie un tableau directement
  async function fetchExercises() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/exercises');
      if (!res.ok) {
        throw new Error('Erreur lors du chargement des exercices');
      }
      const data = await res.json();
      setExercises(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setError(e.message);
      setExercises([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Supprimer cet exercice ?')) return;
    setError(null);
    try {
      const res = await fetch('/api/admin/exercises', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error('Erreur lors de la suppression');
      fetchExercises();
    } catch (e: any) {
      setError(e.message);
    }
  }

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className="container mx-auto px-2 sm:px-4 py-8 min-h-screen">
      <div className="mb-6 flex flex-wrap gap-2 items-center">
        <span className="px-4 py-2 rounded-full bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 font-semibold">
          {exercises.length} exercice{exercises.length > 1 ? 's' : ''}
        </span>
        <div className="flex-1"></div>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Rechercher..."
          className="h-9 w-48 border-cyan-300 focus:border-cyan-500 focus:ring-cyan-500 text-sm rounded-md px-3 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-200"
        />
        <Button className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-700 text-white font-semibold" onClick={() => openForm()}>
          <Plus className="h-4 w-4" />
          Ajouter
        </Button>
      </div>
      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 p-4 text-red-700 dark:text-red-300 flex items-center gap-2 shadow">
          <span className="font-medium">{error}</span>
        </div>
      )}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {exercises.length === 0 ? (
          <div className="col-span-full rounded-lg border border-cyan-200 bg-white dark:bg-black p-8 text-center shadow-sm">
            <h3 className="text-lg font-medium text-cyan-600 dark:text-cyan-400">Aucun exercice</h3>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">Ajoutez un exercice pour commencer.</p>
          </div>
        ) : (
          exercises.filter(ex => {
            if (!search.trim()) return true;
            const q = search.trim().toLowerCase();
            return (
              ex.title.toLowerCase().includes(q) ||
              (ex.description && ex.description.toLowerCase().includes(q))
            );
          }).map((exercise) => (
            <div key={exercise.id} className="group rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-6 shadow-lg transition-all cursor-pointer hover:bg-cyan-50 dark:hover:bg-cyan-900/30 hover:shadow-md min-h-[260px] max-h-[340px] flex flex-col justify-between" style={{ maxWidth: '400px', margin: '0 auto', height: '280px' }}>
              <div>
                <h3 className="mb-2 text-base font-bold text-cyan-600 dark:text-cyan-300 truncate">{exercise.title}</h3>
                <p className="mb-2 text-sm text-neutral-700 dark:text-neutral-300 min-h-[60px] max-h-[80px] overflow-hidden text-ellipsis whitespace-pre-line line-clamp-4 pr-2">{exercise.description}</p>
              </div>
              <div className="flex flex-col gap-1 mt-2">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-none bg-cyan-500 text-white hover:bg-cyan-700 font-medium cursor-pointer flex items-center gap-1"
                    onClick={() => openForm(exercise)}
                  >
                    <Edit className="h-4 w-4 mr-1" /> Modifier
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-none bg-red-500 text-white hover:bg-red-700 font-medium cursor-pointer flex items-center gap-1"
                    onClick={() => handleDelete(exercise.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" /> Supprimer
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Formulaire d'ajout/modification d'exercice */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <form
            onSubmit={handleFormSubmit}
            className="w-full max-w-2xl rounded-lg border-2 border-none bg-white dark:bg-black p-8 shadow-xl flex flex-col gap-4 max-h-[90vh] overflow-y-auto"
          >
            <h2 className="text-xl font-bold text-cyan-600 dark:text-cyan-400 mb-2">{formId ? 'Modifier' : 'Nouvel'} exercice</h2>
            {formError && (
              <div className="rounded border border-red-200 bg-red-50 p-2 text-red-700 dark:border-red-900/30 dark:bg-red-900/10 dark:text-red-400 text-sm">{formError}</div>
            )}
            <label className="text-sm font-medium text-cyan-600 dark:text-cyan-400">Titre</label>
            <Input
              value={formTitle}
              onChange={e => setFormTitle(e.target.value)}
              required
              className="mb-2"
              placeholder="Titre de l'exercice"
            />
            <label className="text-sm font-medium text-cyan-600 dark:text-cyan-400">Description</label>
            <textarea
              value={formDescription}
              onChange={e => setFormDescription(e.target.value)}
              required
              className="mb-2 rounded-md border-1 border-neutral-100 bg-transparent p-2 text-base text-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 min-h-[120px] resize-y"
              placeholder="Description de l'exercice"
              rows={6}
              style={{ minHeight: 120 }}
            />
            <label className="text-sm font-medium text-cyan-600 dark:text-cyan-400">Exemple d'entrée</label>
            <Input
              value={formInput}
              onChange={e => setFormInput(e.target.value)}
              className="mb-2"
              placeholder="Exemple d'entrée"
            />
            <label className="text-sm font-medium text-cyan-600 dark:text-cyan-400">Exemple de sortie attendue</label>
            <Input
              value={formOutput}
              onChange={e => setFormOutput(e.target.value)}
              className="mb-2"
              placeholder="Exemple de sortie"
            />
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-bold text-cyan-600 dark:text-cyan-400">Cas de test</label>
                <Button type="button" size="sm" className="bg-cyan-500 text-white" onClick={addTestCase}>+ Ajouter</Button>
              </div>
              {formTestCases.length === 0 && (
                <div className="text-neutral-400 text-sm">Aucun cas de test</div>
              )}
              <div className="space-y-4">
                {formTestCases.map((tc, idx) => (
                  <div key={idx} className="rounded border border-cyan-200 dark:border-cyan-900 p-3 flex flex-col gap-2 bg-cyan-50 dark:bg-cyan-900/20">
                    <div className="flex gap-2">
                      <Input
                        value={tc.input}
                        onChange={e => handleTestCaseChange(idx, 'input', e.target.value)}
                        placeholder="Entrée"
                        className="flex-1"
                      />
                      <Input
                        value={tc.expected_output}
                        onChange={e => handleTestCaseChange(idx, 'expected_output', e.target.value)}
                        placeholder="Sortie attendue"
                        className="flex-1"
                      />
                    </div>
                    <Input
                      value={tc.description}
                      onChange={e => handleTestCaseChange(idx, 'description', e.target.value)}
                      placeholder="Description du test"
                    />
                    <div className="flex items-center gap-2">
                      <label className="text-xs text-cyan-600 dark:text-cyan-400">
                        <input
                          type="checkbox"
                          checked={!!tc.hidden}
                          onChange={e => handleTestCaseChange(idx, 'hidden', e.target.checked)}
                          className="mr-1"
                        />
                        Test caché (non visible pour l'étudiant)
                      </label>
                      <Button type="button" size="sm" variant="outline" className="border-red-200 text-red-500 ml-auto" onClick={() => removeTestCase(idx)}>
                        Supprimer
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex gap-2 justify-end mt-2">
              <Button type="button" variant="outline" className="border-cyan-200 text-cyan-500" onClick={() => setShowForm(false)} disabled={formLoading}>
                Annuler
              </Button>
              <Button type="submit" className="bg-cyan-500 hover:bg-cyan-600 text-white" disabled={formLoading}>
                {formLoading ? (formId ? 'Modification...' : 'Ajout...') : (formId ? 'Modifier' : 'Ajouter')}
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
