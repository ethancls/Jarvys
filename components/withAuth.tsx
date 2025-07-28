'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { Student } from '@/lib/models';

export interface AuthProps {
  student: Student;
  logout: () => Promise<void>;
}

// HOC pour l'authentification (Higher Order Component)
export default function withAuth<P extends AuthProps>(
  Component: React.ComponentType<P>,
  requireAdmin = false
) {
  return function WithAuth(props: Omit<P, keyof AuthProps>) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const loading = status === 'loading';
    
    useEffect(() => {
      console.log('[withAuth] Status session:', status, 'admin requis:', requireAdmin);
      
      // Si l'utilisateur n'est pas connecté et que la session est chargée, rediriger vers la page de connexion
      if (status === 'unauthenticated') {
        console.log('[withAuth] Non authentifié, redirection vers page de connexion');
        router.push('/');
      }
      
      // Si l'administrateur est requis mais que l'utilisateur n'est pas admin, rediriger vers le tableau de bord
      if (status === 'authenticated' && requireAdmin && !session?.user?.isAdmin) {
        console.log('[withAuth] Accès admin refusé, redirection vers dashboard');
        router.push('/dashboard');
      }
    }, [status, router, session, requireAdmin]);

    const logout = async () => {
      await signOut({ redirect: true, callbackUrl: '/' });
    };

    if (loading) {
      return (
        <div className="flex h-full items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-200 border-t-violet-500"></div>
        </div>
      );
    }

    if (!session?.user) {
      console.log('[withAuth] Session non disponible, affichage du spinner de chargement');
      return (
        <div className="flex h-full items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-200 border-t-violet-500"></div>
        </div>
      );
    }

    // Convertir la session en objet Student
    const student = {
      id: session.user.id as string,
      number: session.user.number as string,
      firstname: session.user.firstname as string || '',
      lastname: session.user.lastname as string || '',
      isAdmin: session.user.isAdmin as boolean,
    } as Student;

    console.log('[withAuth] Session chargée pour l\'utilisateur:', student.number);
    return <Component {...(props as P)} student={student} logout={logout} />;
  };
} 