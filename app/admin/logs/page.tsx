"use client";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { Log } from '@/lib/models';
import { FileText, Filter, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function AdminLogs() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedLog, setSelectedLog] = useState<Log | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
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
    setDeleteId(null);
    setError(null);
    try {
      const res = await fetch('/api/admin/logs', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error('Erreur lors de la suppression');
      setSuccess('Log supprimé avec succès');
      fetchLogs();
      setTimeout(() => setSuccess(null), 3000);
    } catch (e: any) {
      setError(e.message);
    }
  }

  const filteredLogs = logs.filter((log) => {
    const matchSearch = searchTerm === '' ||
      (log.studentName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.studentId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.exerciseTitle || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.exerciseId || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchSuccess = filterSuccess === '' || (filterSuccess === 'oui' && log.success === true) || (filterSuccess === 'non' && log.success === false) || (filterSuccess === 'indet' && log.success == null);
    return matchSearch && matchSuccess;
  });

  return (
    <div className="container mx-auto px-2 sm:px-4 py-8 min-h-screen">
      <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-4 md:p-6 shadow-lg bg-white dark:bg-neutral-950 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex-1 flex items-center gap-2">
            <h1 className="text-xl font-bold text-violet-500 dark:text-violet-300 mr-4">Logs des exécutions</h1>
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
              <label className="text-sm font-medium  text-violet-500 dark:text-violet-300">Succès</label>
              <select
                value={filterSuccess}
                onChange={e => setFilterSuccess(e.target.value)}
                className="h-9 border-violet-300 focus:border-violet-500 focus:ring-violet-500 text-sm rounded-md px-3 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-200"
              >
                <option value="">Tous</option>
                <option value="oui">Succès</option>
                <option value="non">Échec</option>
                <option value="indet">Indéterminé</option>
              </select>
            </div>
            <div className="flex items-end">
              <Button
                onClick={() => {
                  setFilterSuccess('');
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
        {success && (<div className="mb-6 rounded-lg border border-none bg-green-50 dark:bg-green-900/20 p-4 text-green-700 dark:text-green-300 flex items-center gap-2"><span>{success}</span></div>)}
        {error && (<div className="mb-6 rounded-lg border border-none bg-red-50 dark:bg-red-900/20 p-4 text-red-700 dark:text-red-300 flex items-center gap-2"><span>{error}</span></div>)}
        {loading ? (
          <div className="flex justify-center items-center h-32 py-16">
            <Spinner />
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-neutral-200 dark:border-neutral-800">
            <table className="w-full text-sm">
              <thead className="bg-neutral-100 dark:bg-neutral-900/40">
                <tr>
                  <th className="px-4 py-3 text-left font-bold uppercase tracking-wider text-violet-500 dark:text-violet-300">Étudiant</th>
                  <th className="px-4 py-3 text-left font-bold uppercase tracking-wider text-violet-500 dark:text-violet-300">Exercice</th>
                  <th className="px-4 py-3 text-left font-bold uppercase tracking-wider text-violet-500 dark:text-violet-300">Date</th>
                  <th className="px-4 py-3 text-left font-bold uppercase tracking-wider text-violet-500 dark:text-violet-300">Succès</th>
                  <th className="px-4 py-3 text-right font-bold uppercase tracking-wider text-violet-500 dark:text-violet-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-neutral-500 dark:text-neutral-400">
                      Aucun log à afficher.
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log, idx) => (
                    <tr
                      key={log.id}
                      className={
                        `bg-white dark:bg-neutral-950 hover:bg-violet-50 dark:hover:bg-violet-900/30 cursor-pointer hover:opacity-90 transition-opacity` +
                        (idx !== filteredLogs.length - 1 ? ' border-b border-neutral-200 dark:border-neutral-800' : '')
                      }
                    >
                      <td className="whitespace-nowrap px-4 py-3 font-mono">
                        <span className="font-semibold text-violet-500">#{log.studentNumber}</span>
                        <span className="ml-2 text-neutral-500">{log.studentName}</span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">{log.exerciseTitle || log.exerciseId}</td>
                      <td className="whitespace-nowrap px-4 py-3">{log.timestamp ? new Date(log.timestamp).toLocaleString('fr-FR') : '-'}</td>
                      <td className="whitespace-nowrap px-4 py-3">
                        {log.success === true ? (
                          <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-bold text-green-600 dark:bg-green-900/20 dark:text-green-400">Succès</span>
                        ) : log.success === false ? (
                          <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-bold text-red-600 dark:bg-red-900/20 dark:text-red-400">Échec</span>
                        ) : (
                          <span className="rounded-full bg-neutral-100 px-2 py-1 text-xs font-medium text-neutral-600 dark:bg-neutral-900/20 dark:text-neutral-400">Indéterminé</span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right flex gap-2 justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-none bg-violet-500 text-white hover:bg-violet-700 font-medium cursor-pointer"
                          onClick={() => setSelectedLog(log)}
                        >
                          Détails
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-none bg-red-500 text-white hover:bg-red-700 font-medium cursor-pointer"
                          onClick={() => setDeleteId(log.id)}
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
          )}
          </div>
      {/* Modal de détails */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-auto border-none">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <FileText className="text-violet-500 dark:text-violet-300 h-6 w-6" />
                <h3 className="font-bold text-lg  text-violet-500 dark:text-violet-300">
                  Log de {selectedLog.studentName || selectedLog.studentId} - {selectedLog.exerciseTitle || selectedLog.exerciseId}
                </h3>
              </div>
              <Button
                className="bg-violet-500 hover:bg-violet-700 text-white font-medium hover:cursor-pointer"
                onClick={() => setSelectedLog(null)}
              >
                <X className="h-4 w-4 mr-1" /> Fermer
              </Button>
            </div>
            <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="mb-2 text-sm"><b>Étudiant :</b> {selectedLog.studentName || selectedLog.studentId}</div>
                <div className="mb-2 text-sm"><b>Exercice :</b> {selectedLog.exerciseTitle || selectedLog.exerciseId}</div>
                <div className="mb-2 text-sm"><b>Date :</b> {selectedLog.timestamp ? new Date(selectedLog.timestamp).toLocaleString('fr-FR') : '-'}</div>
                <div className="mb-2 text-sm"><b>Succès :</b> {selectedLog.success === true ? 'Succès' : selectedLog.success === false ? 'Échec' : 'Indéterminé'}</div>
              </div>
              <div>
                <div className="mb-2 text-sm"><b>Code/Fichiers :</b></div>
                <pre className="bg-neutral-100 dark:bg-neutral-900 rounded p-2 text-xs overflow-x-auto max-h-64">
                  {typeof selectedLog.code === 'string' ? selectedLog.code : JSON.stringify(selectedLog.code, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Modal de confirmation suppression */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-lg p-6 w-full max-w-sm">
            <div className="flex items-center gap-3 mb-4">
              <Trash2 className="text-red-500" />
              <h3 className="font-bold text-lg">Supprimer le log ?</h3>
            </div>
            <p className="mb-6 text-sm text-neutral-600 dark:text-neutral-300">Cette action est irréversible. Le log sera supprimé définitivement.</p>
            <div className="flex justify-end gap-2">
              <Button type="button" size="sm" className="bg-neutral-200 hover:bg-neutral-300 text-neutral-700 cursor-pointer" onClick={() => setDeleteId(null)}>Annuler</Button>
              <Button type="button" size="sm" className="bg-red-600 hover:bg-red-700 text-white cursor-pointer" onClick={() => handleDelete(deleteId)}>Confirmer</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}