import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from '../../../auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

// POST: Enregistrer la solution de l'utilisateur
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }
  const studentId = session.user.id;
  const exerciseId = params.id;

  try {
    const { files } = await req.json();

    if (!files || !Array.isArray(files)) {
      return NextResponse.json({ error: 'Format de données invalide pour les fichiers.' }, { status: 400 });
    }

    // Utiliser upsert avec la contrainte unique [studentId, exerciseId]
    const solution = await prisma.solution.upsert({
      where: {
        // Utiliser la contrainte unique définie dans le schéma
        studentId_exerciseId: {
          studentId: studentId,
          exerciseId: exerciseId,
        },
      },
      update: {
        files: files, // Mettre à jour les fichiers
        timestamp: new Date(), // Mettre à jour le timestamp
      },
      create: {
        // l'id sera généré par cuid() par défaut
        studentId: studentId,
        exerciseId: exerciseId,
        files: files,
        timestamp: new Date(),
      },
    });

    return NextResponse.json({ success: true, solutionId: solution.id });

  } catch (e) {
    return NextResponse.json({ error: 'Erreur serveur lors de l\'enregistrement de la solution.' }, { status: 500 });
  }
}

// GET: Récupérer la solution sauvegardée
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {

  // Modification: Utiliser getServerSession comme dans POST
  const session = await getServerSession(authOptions); 
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }
  const studentId = session.user.id; // Utiliser l'ID de l'utilisateur authentifié
  const exerciseId = params.id;

  try {
    const solution = await prisma.solution.findFirst({
      where: {
        studentId: studentId,
        exerciseId: exerciseId,
      },
      orderBy: {
        timestamp: 'desc' // Prendre la plus récente si jamais il y en a plusieurs (ne devrait pas arriver)
      }
    });

    if (!solution) {
      // Retourner une structure vide si aucune solution n'est trouvée,
      // plutôt qu'une erreur 404, pour que le frontend puisse gérer l'absence de solution.
      return NextResponse.json({ solution: null });
    }

    return NextResponse.json({ solution }); // Renvoyer l'objet solution complet

  } catch (error) {
    console.error("Erreur lors de la récupération de la solution:", error);
    return NextResponse.json({ error: 'Erreur serveur lors de la récupération de la solution.' }, { status: 500 });
  }
}
