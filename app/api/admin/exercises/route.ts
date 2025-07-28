import { NextResponse } from 'next/server';
import { authOptions } from '../../auth/[...nextauth]/route';
import { getServerSession } from "next-auth/next";
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
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
        inputExample: true,
        expectedOutputExample: true,
        testCases: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: { logs: true, solutions: true },
        },
      }
    });
    return NextResponse.json(exercises);
  } catch (error) {
    console.error("API Error fetching exercises:", error);
    return NextResponse.json({ error: 'Erreur serveur lors de la récupération des exercices' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
  }
  try {
    const body = await request.json();
    const { title, description, inputExample, expectedOutputExample, testCases } = body;
    if (!title || !description) {
      return NextResponse.json({ error: 'Titre et description requis' }, { status: 400 });
    }
    const exercise = await prisma.exercise.create({
      data: {
        title,
        description,
        inputExample,
        expectedOutputExample,
        testCases: testCases ?? [],
      },
    });
    return NextResponse.json(exercise, { status: 201 });
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
    const { id, title, description, inputExample, expectedOutputExample, testCases } = body;
    if (!id || !title || !description) {
      return NextResponse.json({ error: 'ID, titre et description requis' }, { status: 400 });
    }
    const exercise = await prisma.exercise.update({
      where: { id },
      data: {
        title,
        description,
        inputExample,
        expectedOutputExample,
        testCases: testCases ?? [],
      },
    });
    return NextResponse.json(exercise);
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
    await prisma.exercise.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur lors de la suppression' }, { status: 500 });
  }
}
