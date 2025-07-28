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
      setExercises(data.exercises || []); // Accéder à la propriété exercises dans la réponse
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-6xl h-full px-4 py-6">
        
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-900/30 dark:bg-red-900/10 dark:text-red-400">
            <p className="font-medium">{error}</p>
          </div>
        )}
        
        <h2 className="mb-5 font-medium text-lg text-cyan-600 dark:text-cyan-400">
          Exercices disponibles
        </h2>
        
        {exercises.length === 0 ? (
          <div className="mt-8 rounded-md border border-neutral-200 bg-white p-8 text-center shadow-sm dark:border-neutral-800 dark:bg-black">
            <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-900">
              <Terminal className="h-8 w-8 text-cyan-500" />
            </div>
            <h3 className="text-lg font-medium text-cyan-600 dark:text-cyan-400">Aucun exercice disponible</h3>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">Revenez plus tard pour voir les nouveaux exercices.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {exercises.map((exercise) => (
              <div 
                key={exercise.id} 
                className="group rounded-md border border-neutral-200 bg-white p-5 shadow-sm transition-all hover:border-cyan-200 dark:border-neutral-800 dark:bg-black dark:hover:border-cyan-900"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-md bg-cyan-50 group-hover:bg-cyan-100 transition-colors dark:bg-cyan-900/20 dark:group-hover:bg-cyan-900/30">
                  <Terminal className="h-5 w-5 text-cyan-500" />
                </div>
                
                <h3 className="mb-2 text-base font-medium text-cyan-600 dark:text-cyan-400">{exercise.title}</h3>
                <p className="mb-4 text-sm text-neutral-500 line-clamp-2 dark:text-neutral-400">{exercise.description}</p>
                
                <Link href={`/exercises/${exercise.id}`}>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full hover:border-cyan-200 hover:text-cyan-600 dark:hover:border-cyan-900 dark:hover:text-cyan-400"
                  >
                    <ExternalLink className="mr-1.5 h-4 w-4" />
                    Accéder
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
