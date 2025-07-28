// Page de connexion (page.tsx)
'use client';
import { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowRight, MailQuestion, Eye, EyeOff } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';
import SuspenseBoundary from './SuspenseBoundary';
import { useTheme } from 'next-themes';

export default function Login() {
  const [number, setNumber] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  const router = useRouter();
  const { status } = useSession();
  const [showPassword, setShowPassword] = useState(false);

  // Rediriger si déjà connecté
  useEffect(() => {
    if (status === 'authenticated') {
      router.replace('/dashboard');
    }
  }, [status, router]);

  const handleLogin = async () => {
    try {
      setLoading(true);
      setError('');

      if (!number || !password) {
        setError('Veuillez remplir tous les champs');
        setLoading(false);
        return;
      }

      // Utiliser NextAuth pour la connexion avec redirection automatique
      const result = await signIn('credentials', {
        redirect: false, // Gérer la redirection manuellement
        number,
        password,
      });

      if (result?.error) {
        setError('Numéro étudiant ou mot de passe incorrect');
        console.error('Erreur de connexion:', result.error);
      } else {
        // Attendre un court instant pour être sûr que la session est mise à jour
        console.log('Connexion réussie, redirection vers:', '/dashboard');
        setTimeout(() => {
          router.push('/dashboard');
        }, 300);
      }
    } catch (err) {
      setError('Erreur de connexion au serveur');
      console.error('Exception lors de la connexion:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SuspenseBoundary>
      <div className="flex h-full items-center justify-center px-4">
        <div className="relative w-full max-w-sm">
          {/* Logo flottant au-dessus */}
          <div className="absolute -top-20 left-1/2 flex -translate-x-1/2 items-center justify-center">
            <div className="flex h-20 items-center justify-center gap-3 rounded-2xl px-6">
              {mounted && (
                theme === 'dark' ? (
                  <Image
                    src="/icon-dark.svg"
                    alt="Logo Jarvys"
                    width={60}
                    height={60}
                    priority
                    className="h-16 w-auto"
                  />
                ) : (
                  <Image
                    src="/icon-light.svg"
                    alt="Logo Jarvys"
                    width={60}
                    height={60}
                    priority
                    className="h-16 w-auto"
                  />
                )
              )}
              <span className="font-space text-3xl font-bold tracking-tight text-neutral-800 dark:text-white">
                Jarvys
              </span>
            </div>
          </div>

          {/* Carte principale */}
          <div className="mt-10 w-full space-y-5 rounded-lg border border-neutral-200 bg-white p-6 shadow-md dark:border-neutral-800 dark:bg-black">
            <div className="text-center">
              <h1 className="font-space text-xl font-medium">Connexion</h1>
              <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">Accédez à votre compte Jarvys</p>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="student-number" className="mb-1.5 block text-xs font-medium text-neutral-600 dark:text-neutral-300">
                  Numéro étudiant
                </label>
                <Input
                  id="student-number"
                  value={number}
                  onChange={(e) => setNumber(e.target.value)}
                  className="h-10 border-neutral-200 bg-white text-sm dark:text-white shadow-sm transition-colors focus:border-violet-500 dark:border-neutral-800 dark:bg-neutral-950"
                  placeholder="12345678"
                />
              </div>

              <div>
                <label htmlFor="password" className="mb-1.5 block text-xs font-medium text-neutral-600 dark:text-neutral-300">
                  Mot de passe
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-10 border-neutral-200 bg-white text-sm dark:text-white shadow-sm transition-colors focus:border-violet-500 dark:border-neutral-800 dark:bg-neutral-950 pr-10"
                    onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div className="rounded-md bg-red-50 px-3 py-2.5 text-xs text-red-600 shadow-sm border border-red-100 dark:bg-red-900/10 dark:text-red-400 dark:border-red-900/20">
                  {error}
                </div>
              )}

              <Button
                onClick={handleLogin}
                disabled={loading}
                className="mt-2 w-full h-10 transition-all bg-violet-500 text-black hover:opacity-90 hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Connexion...' : 'Se connecter'}
                {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
              </Button>

              <div className="pt-4 flex flex-col items-center gap-2">
                <div className="text-xs text-neutral-500 dark:text-neutral-400">
                  Pas encore inscrit ?{' '}
                  <Link
                    href="/register"
                    className="font-medium  text-violet-500 hover:text-violet-500 transition-colors"
                  >
                    Créer un compte
                  </Link>
                </div>
                <div>
                  <a
                    href="mailto:support@jarvys.app?subject=Problème%20connexion%20Jarvys"
                    className="inline-flex items-center gap-1 text-xs  text-violet-500 hover:text-violet-500 transition-colors"
                    title="Contacter le support Jarvys"
                  >
                    <MailQuestion className="h-4 w-4" />
                    Contactez le support
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SuspenseBoundary>
  );
} 