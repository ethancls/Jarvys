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
    const allowed = await prisma.allowedStudentNumber.findMany({
      orderBy: [{ number: 'asc' }],
      select: { id: true, number: true, label: true, createdAt: true }
    });
    return NextResponse.json(allowed);
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur lors de la récupération' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
  }
  try {
    const body = await request.json();
    const { number, label } = body;
    if (!number) {
      return NextResponse.json({ error: 'Numéro requis' }, { status: 400 });
    }
    const exists = await prisma.allowedStudentNumber.findUnique({ where: { number } });
    if (exists) {
      return NextResponse.json({ error: 'Numéro déjà autorisé' }, { status: 409 });
    }
    const allowed = await prisma.allowedStudentNumber.create({ data: { number, label } });
    return NextResponse.json(allowed, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur lors de la création' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
  }
  try {
    const body = await request.json();
    const { id } = body;
    if (!id) {
      return NextResponse.json({ error: 'ID requis' }, { status: 400 });
    }
    await prisma.allowedStudentNumber.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur lors de la suppression' }, { status: 500 });
  }
}
