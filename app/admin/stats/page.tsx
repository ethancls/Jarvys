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
    } catch { }
  }
  async function fetchExercises() {
    try {
      const res = await fetch('/api/admin/exercises');
      if (!res.ok) return;
      const data = await res.json();
      setExercises(Array.isArray(data) ? data : []);
    } catch { }
  }
  async function fetchLogs() {
    try {
      const res = await fetch('/api/admin/logs');
      if (!res.ok) return;
      const data = await res.json();
      setLogs(Array.isArray(data) ? data : []);
    } catch { }
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
    return students.map(st => {
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
    <div className="container mx-auto px-2 sm:px-4 py-8 min-h-screen">
      <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-4 md:p-6 shadow-lg bg-white dark:bg-neutral-950 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex-1 flex items-center gap-2">
            <h1 className="text-2xl font-bold text-violet-500 dark:text-violet-300 mr-4">Statistiques</h1>
          </div>
        </div>
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Statistiques par exercice */}
          <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-6 shadow-md overflow-x-auto">
            <div className="mb-6 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-violet-500" />
              <h2 className="text-xl font-bold  text-violet-500 dark:text-violet-300">Par exercice</h2>
            </div>
            {exerciseStats.length === 0 ? (
              <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-8 text-center bg-white dark:bg-neutral-950">
                <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Aucune donnée disponible</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-neutral-200 dark:border-neutral-800 ">
                <table className="w-full text-sm">
                  <thead className="bg-neutral-100 dark:bg-neutral-900/40 border-b border-neutral-200 dark:border-neutral-800">
                    <tr>
                      <th className="px-4 py-3 text-left font-bold uppercase tracking-wider  text-violet-500 dark:text-violet-300">Exercice</th>
                      <th className="px-4 py-3 text-center font-bold uppercase tracking-wider  text-violet-500 dark:text-violet-300">Tentatives</th>
                      <th className="px-4 py-3 text-center font-bold uppercase tracking-wider  text-violet-500 dark:text-violet-300">Réussites</th>
                      <th className="px-4 py-3 text-right font-bold uppercase tracking-wider  text-violet-500 dark:text-violet-300">Taux de réussite</th>
                    </tr>
                  </thead>
                  <tbody>
                    {exerciseStats.map((stat, idx) => (
                      <tr
                        key={stat.exerciseId}
                        className={
                          `bg-white dark:bg-neutral-950 hover:bg-violet-100 dark:hover:bg-violet-900/40 cursor-pointer hover:opacity-90 transition-opacity border-b border-neutral-200 dark:border-neutral-800`
                        }
                      >
                        <td className="whitespace-nowrap px-4 py-3 font-medium">{stat.exerciseTitle}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-center">{stat.totalAttempts}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-center">{stat.successfulAttempts}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-right">
                          <div className="flex items-center justify-start">
                            <div className="mr-2 h-3 w-24 rounded-full bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-800 ">
                              <div
                                className="h-3 rounded-full"
                                style={{
                                  width: `${stat.successRate}%`,
                                  backgroundColor: `hsl(262, 85%, ${100 - stat.successRate * 0.5}%)`,
                                  transition: 'background-color 0.3s',
                                }}
                              ></div>
                            </div>
                            <span className="font-bold  text-violet-500 dark:text-violet-300">{stat.successRate.toFixed(0)}%</span>
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
          <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-6 shadow-md overflow-x-auto">
            <div className="mb-6 flex items-center gap-2">
              <Users className="h-5 w-5 text-violet-500" />
              <h2 className="text-xl font-bold  text-violet-500 dark:text-violet-300">Par étudiant</h2>
            </div>
            {studentStats.length === 0 ? (
              <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 p-8 text-center bg-white dark:bg-neutral-950">
                <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Aucune donnée disponible</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-neutral-200 dark:border-neutral-800 ">
                <table className="w-full text-sm">
                  <thead className="bg-neutral-100 dark:bg-neutral-900/40 border-b border-neutral-200 dark:border-neutral-800">
                    <tr>
                      <th className="px-4 py-3 text-left font-bold uppercase tracking-wider  text-violet-500 dark:text-violet-300">Étudiant</th>
                      <th className="px-4 py-3 text-center font-bold uppercase tracking-wider  text-violet-500 dark:text-violet-300">Tentatives</th>
                      <th className="px-4 py-3 text-center font-bold uppercase tracking-wider  text-violet-500 dark:text-violet-300">Réussites</th>
                      <th className="px-4 py-3 text-right font-bold uppercase tracking-wider  text-violet-500 dark:text-violet-300">Taux de réussite</th>
                    </tr>
                  </thead>
                  <tbody>
                    {studentStats.map((stat, idx) => (
                      <tr
                        key={stat.studentId}
                        className={
                          `bg-white dark:bg-neutral-950 hover:bg-violet-100 dark:hover:bg-violet-900/40 cursor-pointer hover:opacity-90 transition-opacity border-b border-neutral-200 dark:border-neutral-800`
                        }
                      >
                        <td className="whitespace-nowrap px-4 py-3 font-mono">
                          <span className="font-semibold text-violet-500">#{stat.studentNumber}</span>
                          <span className="ml-2 text-neutral-500">{stat.studentName}</span>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-center">{stat.totalAttempts}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-center">{stat.successfulAttempts}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-right">
                          <div className="flex items-center justify-start">
                            <div className="mr-2 h-3 w-24 rounded-full bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-800 ">
                              <div
                                className="h-3 rounded-full"
                                style={{
                                  width: `${stat.successRate}%`,
                                  backgroundColor: `hsl(262, 85%, ${90 - stat.successRate * 0.5}%)`,
                                  transition: 'background-color 0.3s',
                                }}
                              ></div>
                            </div>
                            <span className="font-bold  text-violet-500 dark:text-violet-300">{stat.successRate.toFixed(0)}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
        {/* Résumé global */}
        <div className="mt-8 grid gap-6 md:grid-cols-4">
          <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-4 text-center shadow-md flex flex-col items-center">
            <Users className="mx-auto mb-2 h-7 w-7 text-violet-500" />
            <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Nombre d'étudiants</p>
            <p className="mt-2 text-3xl font-bold text-violet-500">{students.length}</p>
          </div>
          <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-4 text-center shadow-md flex flex-col items-center">
            <FileText className="mx-auto mb-2 h-7 w-7 text-violet-500" />
            <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Nombre d'exercices</p>
            <p className="mt-2 text-3xl font-bold text-violet-500">{exercises.length}</p>
          </div>
          <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-4 text-center shadow-md flex flex-col items-center">
            <ListChecks className="mx-auto mb-2 h-7 w-7 text-violet-500" />
            <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Tentatives totales</p>
            <p className="mt-2 text-3xl font-bold text-violet-500">{logs.length}</p>
          </div>
          <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-4 text-center shadow-md flex flex-col items-center">
            <CheckCircle2 className="mx-auto mb-2 h-7 w-7 text-violet-500" />
            <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Taux de réussite global</p>
            <p className="mt-2 text-3xl font-bold text-violet-500">
              {logs.length > 0
                ? `${((logs.filter(log => log.success).length / logs.length) * 100).toFixed(0)}%`
                : '0%'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}