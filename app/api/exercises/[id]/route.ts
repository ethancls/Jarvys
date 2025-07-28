import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from '../../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request, 
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: 'Authentification requise' }, { status: 401 });
  }

  const { id } = params;

  if (!id) {
    return NextResponse.json({ error: 'ID de l\'exercice requis' }, { status: 400 });
  }

  try {
    const exercise = await prisma.exercise.findUnique({
      where: { id },
      include: {
        _count: {
          select: { logs: true, solutions: true },
        },
      }
    });

    if (!exercise) {
      return NextResponse.json({ error: 'Exercice non trouvé' }, { status: 404 });
    }

    // Vérifier si l'étudiant a déjà soumis une solution pour cet exercice
    if (!session.user.isAdmin) {
      const userSolutions = await prisma.solution.findMany({
        where: {
          exerciseId: id,
          userId: session.user.id
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 1
      });

      return NextResponse.json({ 
        exercise,
        userSolution: userSolutions.length > 0 ? userSolutions[0] : null 
      });
    }

    return NextResponse.json({ exercise });
  } catch (error) {
    console.error("API Error fetching exercise:", error);
    return NextResponse.json({ error: 'Erreur serveur lors de la récupération de l\'exercice' }, { status: 500 });
  }
}