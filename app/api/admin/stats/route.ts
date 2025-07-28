import { NextResponse } from 'next/server';
import { authOptions } from '@/app/api/auth/[...nextauth]/route'; // Ajustez le chemin
import { getServerSession } from "next-auth/next";
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
  }

  try {
    // Utiliser $transaction pour exécuter plusieurs requêtes atomiquement
    const [
      totalStudents,
      totalExercises,
      totalLogs,
      totalSolutions,
      logsPerExercise,
      solutionsPerExercise,
      // Ajoutez d'autres agrégations si nécessaire
    ] = await prisma.$transaction([
      prisma.student.count(),
      prisma.exercise.count(),
      prisma.log.count(),
      prisma.solution.count(),
      prisma.log.groupBy({
        by: ['exerciseId'],
        _count: {
          id: true, // Compter les logs par exercice
        },
        orderBy: {
          _count: {
            id: 'desc',
          },
        },
      }),
      prisma.solution.groupBy({
        by: ['exerciseId'],
        _count: {
          id: true, // Compter les solutions par exercice
        },
        orderBy: {
          _count: {
            id: 'desc',
          },
        },
      }),
    ]);

    // Récupérer les titres des exercices pour les groupes
    const exerciseIds = [...new Set([...logsPerExercise.map(l => l.exerciseId), ...solutionsPerExercise.map(s => s.exerciseId)])];
    const exercises = await prisma.exercise.findMany({
      where: { id: { in: exerciseIds } },
      select: { id: true, title: true },
    });
    const exerciseTitleMap = new Map(exercises.map(e => [e.id, e.title]));

    // Formater les résultats groupés
    const formattedLogsPerExercise = logsPerExercise.map(item => {
      let count = 0;
      if (item._count && typeof item._count === 'object' && typeof item._count.id === 'number') {
        count = item._count.id;
      } else if (typeof item._count === 'number') {
        count = item._count;
      }
      return {
        exerciseId: item.exerciseId,
        title: exerciseTitleMap.get(item.exerciseId) || 'Exercice Inconnu',
        count,
      };
    });

    const formattedSolutionsPerExercise = solutionsPerExercise.map(item => {
      let count = 0;
      if (item._count && typeof item._count === 'object' && typeof item._count.id === 'number') {
        count = item._count.id;
      } else if (typeof item._count === 'number') {
        count = item._count;
      }
      return {
        exerciseId: item.exerciseId,
        title: exerciseTitleMap.get(item.exerciseId) || 'Exercice Inconnu',
        count,
      };
    });


    const stats = {
      totalStudents,
      totalExercises,
      totalLogs,
      totalSolutions,
      logsPerExercise: formattedLogsPerExercise,
      solutionsPerExercise: formattedSolutionsPerExercise,
      // ... autres stats
    };

    return NextResponse.json(stats);

  } catch (error) {
    console.error("API Error fetching stats:", error);
    return NextResponse.json({ error: 'Erreur serveur lors de la récupération des statistiques' }, { status: 500 });
  }
}
