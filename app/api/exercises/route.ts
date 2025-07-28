import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from '../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: 'Authentification requise' }, { status: 401 });
  }

  try {
    const exercises = await prisma.exercise.findMany({
      orderBy: {
        title: 'asc',
      },
      select: {
        id: true,
        title: true,
        description: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: { logs: true, solutions: true },
        },
      }
    });
    return NextResponse.json({ exercises });
  } catch (error) {
    console.error("API Error fetching exercises:", error);
    return NextResponse.json({ error: 'Erreur serveur lors de la récupération des exercices' }, { status: 500 });
  }
}