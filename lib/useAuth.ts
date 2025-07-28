import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { Student } from './models';

interface UseAuthResult {
  student: Student | null;
  loading: boolean;
  error: string | null;
  logout: () => Promise<void>;
  requireAdmin?: boolean;
}

export function useAuth(requireAdmin = false): UseAuthResult {
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/auth/user');
        
        if (response.status === 200 && response.data.user) {
          const user = response.data.user;
          
          // Vérifier si l'utilisateur est admin si c'est requis
          if (requireAdmin && !user.isAdmin) {
            setError('Accès non autorisé');
            router.push('/dashboard');
            return;
          }
          
          setStudent(user);
          setError(null);
        } else {
          setError('Non authentifié');
          router.push('/');
        }
      } catch (error) {
        console.error('Erreur lors de la récupération de l\'utilisateur:', error);
        setError('Erreur lors de la récupération de l\'utilisateur');
        router.push('/');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router, requireAdmin]);

  const logout = async () => {
    try {
      await axios.post('/api/auth/logout');
      router.push('/');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  return { student, loading, error, logout, requireAdmin };
} 