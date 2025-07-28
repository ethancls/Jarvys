'use client';

import { useEffect, useState, useMemo } from 'react';
import { Spinner } from '@/components/ui/spinner';
import Link from 'next/link';
import { ArrowLeft, BarChart3, Users, FileText, ListChecks, CheckCircle2 } from 'lucide-react';

export default function AdminStatsPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [exercises, setExercises] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    fetchStats();
    fetchStudents();
    fetchExercises();
    fetchLogs();
  }, []);

  async function fetchStats() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/stats');
      if (!res.ok) {
        throw new Error('Erreur lors du chargement des statistiques');
      }
      const data = await res.json();
      setStats(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

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
  async function fetchLogs() {
    try {
      const res = await fetch('/api/admin/logs');
      if (!res.ok) return;
      const data = await res.json();
      setLogs(Array.isArray(data) ? data : []);
    } catch {}
  }

  // Calcul stats dynamiques
  const exerciseStats = useMemo(() => {
    if (!logs.length || !exercises.length) return [];
    return exercises.map(ex => {
      const logsForEx = logs.filter(l => l.exerciseId === ex.id);
      const total = logsForEx.length;
      const success = logsForEx.filter(l => l.success).length;
      return {
        exerciseId: ex.id,
        exerciseTitle: ex.title,
        totalAttempts: total,
        successfulAttempts: success,
        successRate: total > 0 ? (success / total) * 100 : 0,
      };
    });
  }, [logs, exercises]);

  const studentStats = useMemo(() => {
    if (!students.length) return [];
    return students.filter(s => !s.isAdmin).map(st => {
      const logsForSt = logs.filter(l => l.studentId === st.id);
      const total = logsForSt.length;
      const success = logsForSt.filter(l => l.success).length;
      return {
        studentId: st.id,
        studentNumber: st.number,
        studentName: `${st.firstname} ${st.lastname}`,
        totalAttempts: total,
        successfulAttempts: success,
        successRate: total > 0 ? (success / total) * 100 : 0,
      };
    });
  }, [logs, students]);

  if (loading) {
    return <Spinner />;
  }

  if (error) {
    return (
      <div className="flex h-[calc(100vh-64px)] items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="container mx-auto py-8 min-h-screen">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            <span className="text-cyan-500">Statistiques</span>
          </h1>
          <p className="text-sm font-medium text-neutral-500">
            Analyse des performances des étudiants sur les exercices
          </p>
        </div>
      </div>
      
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Statistiques par exercice */}
        <div className="rounded-lg border-2 border-cyan-200 bg-white dark:bg-neutral-900 p-6 shadow-lg">
          <div className="mb-6 flex items-center">
            <BarChart3 className="mr-2 h-5 w-5 text-cyan-500" />
            <h2 className="text-xl font-bold text-cyan-600 dark:text-cyan-300">Statistiques par exercice</h2>
          </div>
          {exerciseStats.length === 0 ? (
            <div className="rounded-lg border border-cyan-200 p-8 text-center bg-white dark:bg-neutral-900">
              <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Aucune donnée disponible</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg border border-cyan-200 dark:border-cyan-800">
              <table className="w-full">
                <thead className="bg-cyan-50 dark:bg-cyan-900/30">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-300">Exercice</th>
                    <th className="px-6 py-3 text-center text-xs font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-300">Tentatives</th>
                    <th className="px-6 py-3 text-center text-xs font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-300">Réussites</th>
                    <th className="px-6 py-3 text-right text-xs font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-300">Taux de réussite</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cyan-100 dark:divide-cyan-800">
                  {exerciseStats.map((stat) => (
                    <tr key={stat.exerciseId} className="bg-white dark:bg-neutral-900 hover:bg-cyan-50 dark:hover:bg-cyan-900/40">
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-neutral-700 dark:text-neutral-200">{stat.exerciseTitle}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-center font-medium text-neutral-700 dark:text-neutral-200">{stat.totalAttempts}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-center font-medium text-neutral-700 dark:text-neutral-200">{stat.successfulAttempts}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-right">
                        <div className="flex items-center justify-end">
                          <div className="mr-2 h-3 w-24 rounded-full bg-neutral-100 dark:bg-neutral-800 border border-cyan-200 dark:border-cyan-800">
                            <div className="h-3 rounded-full bg-cyan-500" style={{ width: `${stat.successRate}%` }}></div>
                          </div>
                          <span className="font-bold text-cyan-600 dark:text-cyan-300">{stat.successRate.toFixed(0)}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        {/* Statistiques par étudiant */}
        <div className="rounded-lg border-2 border-cyan-200 bg-white dark:bg-neutral-900 p-6 shadow-lg">
          <div className="mb-6 flex items-center">
            <BarChart3 className="mr-2 h-5 w-5 text-cyan-500" />
            <h2 className="text-xl font-bold text-cyan-600 dark:text-cyan-300">Statistiques par étudiant</h2>
          </div>
          {studentStats.length === 0 ? (
            <div className="rounded-lg border border-cyan-200 p-8 text-center bg-white dark:bg-neutral-900">
              <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Aucune donnée disponible</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg border border-cyan-200 dark:border-cyan-800">
              <table className="w-full">
                <thead className="bg-cyan-50 dark:bg-cyan-900/30">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-300">Étudiant</th>
                    <th className="px-6 py-3 text-center text-xs font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-300">Tentatives</th>
                    <th className="px-6 py-3 text-center text-xs font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-300">Réussites</th>
                    <th className="px-6 py-3 text-right text-xs font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-300">Taux de réussite</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cyan-100 dark:divide-cyan-800">
                  {studentStats.map((stat) => (
                    <tr key={stat.studentId} className="bg-white dark:bg-neutral-900 hover:bg-cyan-50 dark:hover:bg-cyan-900/40">
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-neutral-700 dark:text-neutral-200">#{stat.studentNumber} {stat.studentName}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-center font-medium text-neutral-700 dark:text-neutral-200">{stat.totalAttempts}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-center font-medium text-neutral-700 dark:text-neutral-200">{stat.successfulAttempts}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-right">
                        <div className="flex items-center justify-end">
                          <div className="mr-2 h-3 w-24 rounded-full bg-neutral-100 dark:bg-neutral-800 border border-cyan-200 dark:border-cyan-800">
                            <div className="h-3 rounded-full bg-cyan-500" style={{ width: `${stat.successRate}%` }}></div>
                          </div>
                          <span className="font-bold text-cyan-600 dark:text-cyan-300">{stat.successRate.toFixed(0)}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        
        {/* Résumé global */}
        <div className="lg:col-span-2">
          <div className="rounded-lg border-2 border-cyan-200 bg-white dark:bg-black p-6 shadow-lg">
            <h2 className="mb-6 text-xl font-bold text-cyan-600 dark:text-cyan-400">Résumé global</h2>
            
            <div className="grid gap-6 md:grid-cols-4">
              <div className="rounded-lg border-2 border-cyan-200 bg-white dark:bg-black p-4 text-center shadow-md flex flex-col items-center">
                <Users className="mx-auto mb-2 h-7 w-7 text-cyan-500" />
                <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Nombre d'étudiants</p>
                <p className="mt-2 text-3xl font-bold text-cyan-500">{students.length}</p>
              </div>
              
              <div className="rounded-lg border-2 border-cyan-200 bg-white dark:bg-black p-4 text-center shadow-md flex flex-col items-center">
                <FileText className="mx-auto mb-2 h-7 w-7 text-cyan-500" />
                <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Nombre d'exercices</p>
                <p className="mt-2 text-3xl font-bold text-cyan-500">{exercises.length}</p>
              </div>
              
              <div className="rounded-lg border-2 border-cyan-200 bg-white dark:bg-black p-4 text-center shadow-md flex flex-col items-center">
                <ListChecks className="mx-auto mb-2 h-7 w-7 text-cyan-500" />
                <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Tentatives totales</p>
                <p className="mt-2 text-3xl font-bold text-cyan-500">{logs.length}</p>
              </div>
              
              <div className="rounded-lg border-2 border-cyan-200 bg-white dark:bg-black p-4 text-center shadow-md flex flex-col items-center">
                <CheckCircle2 className="mx-auto mb-2 h-7 w-7 text-cyan-500" />
                <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Taux de réussite global</p>
                <p className="mt-2 text-3xl font-bold text-cyan-500">
                  {logs.length > 0 
                    ? `${((logs.filter(log => log.success).length / logs.length) * 100).toFixed(0)}%` 
                    : '0%'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}