"use client";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { Log } from '@/lib/models';
import { Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function AdminLogs() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLog, setSelectedLog] = useState<Log | null>(null);
  const [filterStudent, setFilterStudent] = useState('');
  const [filterExercise, setFilterExercise] = useState('');
  const [filterSuccess, setFilterSuccess] = useState('');

  useEffect(() => {
    fetchLogs();
  }, []);

  async function fetchLogs() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/logs');
      if (!res.ok) throw new Error('Erreur lors du chargement des logs');
      const data = await res.json();
      setLogs(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    setError(null);
    try {
      const res = await fetch('/api/admin/logs', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error('Erreur lors de la suppression');
      fetchLogs();
    } catch (e: any) {
      setError(e.message);
    }
  }

  const filteredLogs = logs.filter((log) => {
    const matchStudent = filterStudent === '' || (log.studentName || '').toLowerCase().includes(filterStudent.toLowerCase());
    const matchExercise = filterExercise === '' || (log.exerciseTitle || '').toLowerCase().includes(filterExercise.toLowerCase());
    const matchSuccess = filterSuccess === '' || (filterSuccess === 'oui' && log.success === true) || (filterSuccess === 'non' && log.success === false) || (filterSuccess === 'indet' && log.success == null);
    return matchStudent && matchExercise && matchSuccess;
  });

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-64px)] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 min-h-screen">
      <h1 className="mb-8 text-3xl font-bold text-cyan-500">Logs des exécutions</h1>
      {/* Filtres */}
      <div className="mb-4 flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-xs font-bold text-cyan-600 mb-1">Étudiant</label>
          <Input
            placeholder="Nom ou numéro..."
            value={filterStudent}
            onChange={e => setFilterStudent(e.target.value)}
            className="w-40"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-cyan-600 mb-1">Exercice</label>
          <Input
            placeholder="Titre ou ID..."
            value={filterExercise}
            onChange={e => setFilterExercise(e.target.value)}
            className="w-40"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-cyan-600 mb-1">Succès</label>
          <select
            value={filterSuccess}
            onChange={e => setFilterSuccess(e.target.value)}
            className="w-28 border rounded px-2 py-1 text-sm"
          >
            <option value="">Tous</option>
            <option value="oui">Oui</option>
            <option value="non">Non</option>
            <option value="indet">Indéterminé</option>
          </select>
        </div>
        <Button variant="outline" onClick={() => {setFilterStudent('');setFilterExercise('');setFilterSuccess('');}}>Réinitialiser</Button>
      </div>
      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-900/30 dark:bg-red-900/10 dark:text-red-400">
          <p className="font-medium">{error}</p>
        </div>
      )}
      <div className="overflow-x-auto rounded-lg border-2 border-cyan-200 bg-white dark:bg-black p-4 shadow-lg">
        <table className="min-w-full divide-y divide-cyan-100 dark:divide-cyan-900">
          <thead className="bg-cyan-50 dark:bg-cyan-900/20">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-bold uppercase tracking-wider text-cyan-600">Étudiant</th>
              <th className="px-4 py-2 text-left text-xs font-bold uppercase tracking-wider text-cyan-600">Exercice</th>
              <th className="px-4 py-2 text-left text-xs font-bold uppercase tracking-wider text-cyan-600">Date</th>
              <th className="px-4 py-2 text-left text-xs font-bold uppercase tracking-wider text-cyan-600">Succès</th>
              <th className="px-4 py-2 text-right text-xs font-bold uppercase tracking-wider text-cyan-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cyan-100 dark:divide-cyan-900">
            {filteredLogs.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-neutral-500 dark:text-neutral-400">
                  Aucun log à afficher.
                </td>
              </tr>
            ) : (
              filteredLogs.map((log) => (
                <tr key={log.id} className="bg-white dark:bg-black hover:bg-cyan-50 dark:hover:bg-cyan-900/30">
                  <td className="whitespace-nowrap px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-200">
                    {log.studentName || log.studentId}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2 text-sm text-neutral-700 dark:text-neutral-200">
                    {log.exerciseTitle || log.exerciseId}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2 text-sm text-neutral-700 dark:text-neutral-200">
                    {log.timestamp ? new Date(log.timestamp).toLocaleString('fr-FR') : '-'}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2 text-sm">
                    {log.success === true ? (
                      <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-bold text-green-600 dark:bg-green-900/20 dark:text-green-400">Oui</span>
                    ) : log.success === false ? (
                      <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-bold text-red-600 dark:bg-red-900/20 dark:text-red-400">Non</span>
                    ) : (
                      <span className="rounded-full bg-neutral-100 px-2 py-1 text-xs font-medium text-neutral-600 dark:bg-neutral-900/20 dark:text-neutral-400">-</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2 text-right flex gap-2 justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-cyan-200 bg-white text-cyan-600 hover:bg-cyan-50 dark:bg-black dark:hover:bg-cyan-900/10 font-medium"
                      onClick={() => setSelectedLog(log)}
                    >
                      Détails
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-red-200 bg-white text-red-500 hover:bg-red-50 dark:bg-black dark:hover:bg-red-900/10 font-medium"
                      onClick={() => handleDelete(log.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {/* Modal de détails */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-black rounded-lg shadow-lg max-w-2xl w-full p-6 relative">
            <button className="absolute top-2 right-2 text-neutral-400 hover:text-neutral-700 dark:hover:text-white" onClick={() => setSelectedLog(null)}>
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold mb-4 text-cyan-500">Détail du log</h2>
            <div className="mb-2 text-sm"><b>Étudiant :</b> {selectedLog.studentName || selectedLog.studentId}</div>
            <div className="mb-2 text-sm"><b>Exercice :</b> {selectedLog.exerciseTitle || selectedLog.exerciseId}</div>
            <div className="mb-2 text-sm"><b>Date :</b> {selectedLog.timestamp ? new Date(selectedLog.timestamp).toLocaleString('fr-FR') : '-'}</div>
            <div className="mb-2 text-sm"><b>Succès :</b> {selectedLog.success === true ? 'Oui' : selectedLog.success === false ? 'Non' : '-'}</div>
            <div className="mb-2 text-sm"><b>Code/Fichiers :</b></div>
            <pre className="bg-neutral-100 dark:bg-neutral-900 rounded p-2 text-xs overflow-x-auto max-h-64">
              {typeof selectedLog.code === 'string' ? selectedLog.code : JSON.stringify(selectedLog.code, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}