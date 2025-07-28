import { NextResponse } from 'next/server';
import { authOptions } from '../../auth/[...nextauth]/route';
import { getServerSession } from "next-auth/next";
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
  }

  try {
    const solutionsData = await prisma.solution.findMany({
      include: {
        student: {
          select: { id: true, firstname: true, lastname: true, number: true }
        },
        exercise: {
          select: { id: true, title: true }
        }
      },
      orderBy: {
        timestamp: 'desc'
      }
    });

     const solutionsWithDetails = solutionsData.map((sol: any) => ({
       ...sol,
       studentName: sol.student ? `${sol.student.firstname} ${sol.student.lastname}` : 'Inconnu',
       exerciseTitle: sol.exercise ? sol.exercise.title : 'Inconnu',
     }));

    return NextResponse.json(solutionsWithDetails);

  } catch (error) {
    console.error("API Error fetching solutions:", error);
    return NextResponse.json({ error: 'Erreur serveur lors de la récupération des solutions' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
  }
  try {
    const body = await request.json();
    const { studentId, exerciseId, files } = body;
    if (!studentId || !exerciseId || !files) {
      return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 });
    }
    const solution = await prisma.solution.create({
      data: { studentId, exerciseId, files },
    });
    return NextResponse.json(solution, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur lors de la création' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
  }
  try {
    const body = await request.json();
    const { id, files } = body;
    if (!id || !files) {
      return NextResponse.json({ error: 'ID et fichiers requis' }, { status: 400 });
    }
    const solution = await prisma.solution.update({
      where: { id },
      data: { files },
    });
    return NextResponse.json(solution);
  } catch (error) {
    return NextResponse.json({ error: 'Erreur lors de la modification' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
  }
  try {
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ error: 'ID requis' }, { status: 400 });
    }
    await prisma.solution.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur lors de la suppression' }, { status: 500 });
  }
}
