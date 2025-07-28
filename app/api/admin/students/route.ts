import { NextResponse } from 'next/server';
import { authOptions } from '../../auth/[...nextauth]/route';
import { getServerSession } from "next-auth/next";
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
  }

  try {
    const students = await prisma.student.findMany({
      orderBy: [
        { lastname: 'asc' },
        { firstname: 'asc' },
      ],
      // Exclure le hash du mot de passe
      select: {
        id: true,
        number: true,
        isAdmin: true,
        firstname: true,
        lastname: true,
        createdAt: true,
        updatedAt: true,
        _count: { // Compter les logs et solutions si nécessaire
          select: { logs: true, solutions: true },
        },
      }
    });
    return NextResponse.json(students);
  } catch (error) {
    console.error("API Error fetching students:", error);
    return NextResponse.json({ error: 'Erreur serveur lors de la récupération des étudiants' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
  }
  try {
    const body = await request.json();
    const { number, password, isAdmin, firstname, lastname } = body;
    if (!number || !password || !firstname || !lastname) {
      return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 });
    }
    
    // Hacher le mot de passe
    const passwordHash = bcrypt.hashSync(password, 10);
    
    const student = await prisma.student.create({
      data: { number, passwordHash, isAdmin: !!isAdmin, firstname, lastname },
    });
    return NextResponse.json(student, { status: 201 });
  } catch (error) {
    console.error("API Error creating student:", error);
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
    const { id, number, isAdmin, firstname, lastname, password } = body;
    if (!id) {
      return NextResponse.json({ error: 'ID requis' }, { status: 400 });
    }
    // Si password présent, on ne modifie que le mot de passe
    if (typeof password === "string" && password.length > 0) {
      const passwordHash = bcrypt.hashSync(password, 10);
      await prisma.student.update({
        where: { id },
        data: { passwordHash },
      });
      return NextResponse.json({ success: true });
    }
    // Sinon, modification des autres champs
    if (!number || !firstname || !lastname) {
      return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 });
    }
    const student = await prisma.student.update({
      where: { id },
      data: { number, isAdmin: !!isAdmin, firstname, lastname },
    });
    return NextResponse.json(student);
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
    await prisma.student.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur lors de la suppression' }, { status: 500 });
  }
}
