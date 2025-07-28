import { NextResponse } from 'next/server';
import { authOptions } from '../../auth/[...nextauth]/route';
import { getServerSession } from "next-auth/next";
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);

  // Sécurité: Vérifier si l'utilisateur est connecté et est admin
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
  }

  try {
    const logsData = await prisma.log.findMany({
      include: {
        student: { // Inclure les détails de l'étudiant
          select: { id: true, firstname: true, lastname: true, number: true } // Sélectionner les champs nécessaires
        },
        exercise: { // Inclure les détails de l'exercice
          select: { id: true, title: true } // Sélectionner les champs nécessaires
        }
      },
      orderBy: {
        timestamp: 'desc' // Trier par date décroissante
      }
    });

    // Transformer les données pour inclure les noms/titres directement
    const logsWithDetails = logsData.map((log: any) => ({
      ...log,
      studentName: log.student ? `${log.student.firstname} ${log.student.lastname}` : 'Inconnu',
      exerciseTitle: log.exercise ? log.exercise.title : 'Inconnu',
      studentNumber: log.student ? log.student.number : 'Inconnu',
    }));


    return NextResponse.json(logsWithDetails);

  } catch (error) {
    console.error("API Error fetching logs:", error);
    return NextResponse.json({ error: 'Erreur serveur lors de la récupération des logs' }, { status: 500 });
  } finally {
     // Déconnexion Prisma non nécessaire ici avec l'instance partagée
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
  }
  try {
    const body = await request.json();
    const { studentId, exerciseId, code, success, isAutoSave } = body;
    if (!studentId || !exerciseId || !code) {
      return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 });
    }
    const log = await prisma.log.create({
      data: { studentId, exerciseId, code, success, isAutoSave },
    });
    return NextResponse.json(log, { status: 201 });
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
    const { id, code, success, isAutoSave } = body;
    if (!id || !code) {
      return NextResponse.json({ error: 'ID et code requis' }, { status: 400 });
    }
    const log = await prisma.log.update({
      where: { id },
      data: { code, success, isAutoSave },
    });
    return NextResponse.json(log);
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
    await prisma.log.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur lors de la suppression' }, { status: 500 });
  }
}
