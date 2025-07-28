'use client';
import { useEffect, useState } from 'react';
import { Exercise } from '@/lib/models/exercise';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Terminal, ExternalLink } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { Spinner } from '@/components/ui/spinner';

export default function Dashboard() {
  const { data: session } = useSession();
  const student = session?.user;
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchExercises();
  }, []);

  async function fetchExercises() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/exercises');
      if (!res.ok) throw new Error('Erreur lors du chargement des exercices');
      const data = await res.json();
      setExercises(data.exercises || []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-2 sm:px-4 py-8 min-h-screen">
      <div className="w-full">
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 p-4 text-red-700 dark:text-red-300 flex items-center gap-2 shadow">
            <Terminal className="h-5 w-5 text-red-500 dark:text-red-400" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <Terminal className="h-7 w-7 text-violet-500 dark:text-violet-300" />
            <h2 className="font-bold text-2xl text-violet-500 dark:text-violet-300 tracking-tight">Exercices disponibles</h2>
            <span className="ml-3 px-3 py-1 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 text-xs font-semibold">{exercises.length} exercice{exercises.length > 1 ? 's' : ''}</span>
          </div>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher..."
            className="h-9 w-full sm:w-64 rounded-md border border-violet-300 focus:border-violet-500 focus:ring-violet-500 px-3 text-sm bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-200"
          />
        </div>

        {exercises.length === 0 ? (
          <div className="mt-8 rounded-lg border border-violet-200 dark:border-violet-800 bg-white dark:bg-black p-8 text-center shadow-lg">
            <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-violet-50 dark:bg-violet-900/30">
              <Terminal className="h-8 w-8 text-violet-500 dark:text-violet-300" />
            </div>
            <h3 className="text-lg font-bold text-violet-500 dark:text-violet-300">Aucun exercice disponible</h3>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">Revenez plus tard pour voir les nouveaux exercices.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {exercises.filter(ex => {
              if (!search.trim()) return true;
              const q = search.trim().toLowerCase();
              return (
                ex.title.toLowerCase().includes(q) ||
                (ex.description && ex.description.toLowerCase().includes(q))
              );
            }).map((exercise) => (
              <Link href={`/exercises/${exercise.id}`} key={exercise.id}>
                <div
                  className="group rounded-xl border border-none bg-white dark:bg-neutral-950 p-6 shadow-lg transition-all cursor-pointer hover:bg-violet-50 dark:hover:bg-violet-900/30 hover:shadow-md min-h-[260px] max-h-[340px] flex flex-col justify-between"
                  style={{ maxWidth: '400px', margin: '0 auto', height: '280px' }}
                >
                  <div>
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-md bg-violet-50 dark:bg-violet-900/20 group-hover:bg-violet-100 dark:group-hover:bg-violet-900/40 transition-colors">
                      <Terminal className="h-6 w-6 text-violet-500 dark:text-violet-300" />
                    </div>
                    <h3 className="mb-2 text-base font-bold text-violet-500 dark:text-violet-300 truncate">{exercise.title}</h3>
                    <p className="mb-2 text-sm text-neutral-700 dark:text-neutral-300 min-h-[60px] max-h-[80px] overflow-hidden text-ellipsis whitespace-pre-line line-clamp-4 pr-2">
                      {exercise.description}
                    </p>
                  </div>
                  <div className="flex flex-col gap-1 mt-2">
                    <div className="flex justify-end">
                      <span className="text-xs text-violet-500 dark:text-violet-300 font-semibold">Voir l'exercice →</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
