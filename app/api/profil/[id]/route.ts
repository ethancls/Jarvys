import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function GET(request: Request, context: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Authentification requise' }, { status: 401 });
  }
  const userId = context.params.id;
  if (session.user.id !== userId && !session.user.isAdmin) {
    return NextResponse.json({ error: 'Accès interdit' }, { status: 403 });
  }
  try {
    const user = await prisma.student.findUnique({
      where: { id: userId },
      select: {
        id: true,
        number: true,
        firstname: true,
        lastname: true,
      },
    });
    if (!user) return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    // Récupérer tous les exercices
    const exercises = await prisma.exercise.findMany({
      select: {
        id: true,
        title: true,
      }
    });
    // Récupérer les logs de l'utilisateur
    const logs = await prisma.log.findMany({
      where: { studentId: userId },
      select: {
        exerciseId: true,
        success: true,
      },
    });
    // Stats globales
    const totalAttempts = logs.length;
    const successfulAttempts = logs.filter(l => l.success).length;
    const successRate = totalAttempts > 0 ? (successfulAttempts / totalAttempts) * 100 : 0;
    // Stats par exercice
    const exerciseStats = exercises.map(ex => {
      const exLogs = logs.filter(l => l.exerciseId === ex.id);
      const attempts = exLogs.length;
      const successes = exLogs.filter(l => l.success).length;
      const rate = attempts > 0 ? (successes / attempts) * 100 : 0;
      return {
        exerciseId: ex.id,
        exerciseTitle: ex.title,
        attempts,
        successes,
        rate,
      };
    });
    return NextResponse.json({ user: { ...user, stats: { totalAttempts, successfulAttempts, successRate, exerciseStats } } });
  } catch (error) {
    console.error("API Error profil:", error);
    return NextResponse.json({ error: 'Erreur serveur lors de la récupération du profil' }, { status: 500 });
  }
}

export async function PUT(request: Request, context: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Authentification requise' }, { status: 401 });
  }
  const userId = context.params.id;
  if (session.user.id !== userId && !session.user.isAdmin) {
    return NextResponse.json({ error: 'Accès interdit' }, { status: 403 });
  }
  try {
    const body = await request.json();
    const { firstname, lastname, password } = body;
    const data: any = {};
    if (firstname) data.firstname = firstname;
    if (lastname) data.lastname = lastname;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      data.passwordHash = await bcrypt.hash(password, salt);
    }
    await prisma.student.update({
      where: { id: userId },
      data,
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("API Error update profil:", error);
    return NextResponse.json({ error: 'Erreur serveur lors de la mise à jour du profil' }, { status: 500 });
  }
}
