import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';




export async function POST(req: Request) {
  try {
    const body = await req.json();
    let { studentNumber, password, firstname, lastname } = body;
    studentNumber = studentNumber?.trim();
    console.log('[REGISTER] Reçu:', { studentNumber, password, firstname, lastname });

    if (!studentNumber || !password || !firstname || !lastname) {
      console.log('[REGISTER] Champs manquants', { studentNumber, password, firstname, lastname });
      return NextResponse.json({ error: 'Champs manquants.' }, { status: 400 });
    }

    // Validation du format du numéro étudiant (8 chiffres)
    if (!/^\d{8}$/.test(studentNumber)) {
      console.log('[REGISTER] Format numéro étudiant invalide:', studentNumber);
      return NextResponse.json({ error: 'Le numéro étudiant doit comporter 8 chiffres.' }, { status: 400 });
    }

    // Vérification whitelist dynamique depuis la base
    const allowed = await prisma.allowedStudentNumber.findUnique({ where: { number: studentNumber } });
    if (!allowed) {
      console.log('[REGISTER] Numéro non autorisé (base):', studentNumber);
      return NextResponse.json({ error: 'Numéro étudiant non autorisé.' }, { status: 403 });
    }

    // Vérifier si l'utilisateur existe déjà
    const existing = await prisma.student.findUnique({ where: { number: studentNumber } });
    if (existing) {
      console.log('[REGISTER] Numéro déjà inscrit:', studentNumber);
      return NextResponse.json({ error: 'Ce numéro est déjà inscrit.' }, { status: 409 });
    }

    // Hash du mot de passe (exemple simple, à remplacer par bcrypt en prod)
    const hashedPassword = password; // Remplacer par un vrai hash !

    const student = await prisma.student.create({
      data: {
        number: studentNumber,
        firstname,
        lastname,
        isAdmin: false,
        passwordHash: hashedPassword,
      },
    });
    console.log('[REGISTER] Étudiant créé:', { id: student.id, number: student.number });

    return NextResponse.json({ success: true, student: { id: student.id, number: student.number } });
  } catch (e: any) {
    console.log('[REGISTER] Erreur serveur:', e);
    return NextResponse.json({ error: e.message || 'Erreur serveur.' }, { status: 500 });
  }
}
