import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

const JARVYS_API_URL = process.env.JARVYS_API_URL || 'http://localhost:8000/execute';

// POST: Relayer l'exécution du code à l'API Python
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.text();
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }
    const studentId = session.user.id;
    const exerciseId = params.id;
    const code = JSON.parse(body).files || null;
    // Appel à l'API Python
    const res = await fetch(JARVYS_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    });
    const data = await res.json();
    // Log dans la base : success = all_tests_passed si présent, sinon success général
    await prisma.log.create({
      data: {
        studentId,
        exerciseId,
        code,
        success: typeof data.all_tests_passed === 'boolean' ? data.all_tests_passed : (data.success ?? null),
        isAutoSave: false,
        timestamp: new Date(),
      },
    });
    return NextResponse.json(data, { status: res.status });
  } catch (e) {
    return NextResponse.json({ error: 'Erreur lors de l\'exécution du code.' }, { status: 500 });
  }
}
