'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import {
  Moon,
  Sun,
  LogOut,
  UserCircle,
  BarChart3,
  FileText,
  Menu,
  X,
  ChevronDown,
  Shield,
  Terminal,
  Code
} from 'lucide-react';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';

export default function Navigation() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [adminMenuOpen, setAdminMenuOpen] = useState(false);

  // Attendre que le composant soit monté pour éviter les problèmes d'hydratation
  useEffect(() => {
    setMounted(true);
  }, []);

  const logout = async () => {
    await signOut({ callbackUrl: '/' });
  };

  // Fermer le menu mobile quand le chemin change
  useEffect(() => {
    setMobileMenuOpen(false);
    setAdminMenuOpen(false);
  }, [pathname]);

  // Masquer la navigation sur la page de connexion
  if (pathname === '/' && !session) return null;

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur dark:bg-black/95">
      <div className="container mx-auto h-16 px-4 flex items-center justify-between">
        {/* Logo et nom du site */}
        <div className="flex items-center">
          <Link href={session ? "/dashboard" : "/"} className="flex items-center hover:opacity-80 hover:cursor-pointer">
            {theme === 'dark' ? (
              <Image
                src="/icon-dark.svg"
                alt="Logo Jarvys"
                width={60}
                height={60}
                priority
                className="h-11 w-auto"
              />
            ) : (
              <Image
                src="/icon-light.svg"
                alt="Logo Jarvys"
                width={60}
                height={60}
                priority
                className="h-10 w-auto"
              />
            )}
            <span className="hidden sm:inline font-bold text-3xl tracking-tight text-neutral-800 dark:text-white ml-3">Jarvys</span>
          </Link>
        </div>
        {/* Navigation desktop - visible seulement si connecté */}
        {session && (
          <nav className="hidden md:flex items-center space-x-1">
            <Link
              href="/dashboard"
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${pathname === '/dashboard'
                  ? 'bg-cyan-50 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300'
                  : 'text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800'
                }`}
            >
              Tableau de bord
            </Link>

            {session.user.isAdmin && (
              <div className="relative">
                <button
                  onClick={() => setAdminMenuOpen(!adminMenuOpen)}
                  className={`flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${pathname.startsWith('/admin')
                      ? 'bg-cyan-50 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300'
                      : 'text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800'
                    }`}
                >
                  <Shield className="h-4 w-4 mr-1 hover:opacity-80 cursor-pointer transition-opacity duration-150" />
                  Administration
                  <ChevronDown className={`h-4 w-4 transition-transform ${adminMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {adminMenuOpen && (
                  <div className="absolute top-full mt-1 w-48 rounded-md shadow-lg bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 overflow-hidden">
                    <div className="py-1">
                      <Link
                        href="/admin/exercises"
                        className={`block px-4 py-2 text-sm ${pathname.startsWith('/admin/exercises')
                            ? 'bg-cyan-50 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300'
                            : 'text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800'
                          }`}
                      >
                        <div className="flex items-center">
                          <Terminal className="h-4 w-4 mr-2 hover:opacity-80 cursor-pointer transition-opacity duration-150" />
                          Exercices
                        </div>
                      </Link>
                      <Link
                        href="/admin/students"
                        className={`block px-4 py-2 text-sm ${pathname.startsWith('/admin/students')
                            ? 'bg-cyan-50 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300'
                            : 'text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800'
                          }`}
                      >
                        <div className="flex items-center">
                          <UserCircle className="h-4 w-4 mr-2 hover:opacity-80 cursor-pointer transition-opacity duration-150" />
                          Étudiants
                        </div>
                      </Link>
                      <Link
                        href="/admin/solutions"
                        className={`block px-4 py-2 text-sm ${pathname.startsWith('/admin/solutions')
                            ? 'bg-cyan-50 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300'
                            : 'text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800'
                          }`}
                      >
                        <div className="flex items-center">
                          <Code className="h-4 w-4 mr-2 hover:opacity-80 cursor-pointer transition-opacity duration-150" />
                          Solutions
                        </div>
                      </Link>
                      <Link
                        href="/admin/stats"
                        className={`block px-4 py-2 text-sm ${pathname.startsWith('/admin/stats')
                            ? 'bg-cyan-50 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300'
                            : 'text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800'
                          }`}
                      >
                        <div className="flex items-center">
                          <BarChart3 className="h-4 w-4 mr-2 hover:opacity-80 cursor-pointer transition-opacity duration-150" />
                          Statistiques
                        </div>
                      </Link>
                      <Link
                        href="/admin/logs"
                        className={`block px-4 py-2 text-sm ${pathname.startsWith('/admin/logs')
                            ? 'bg-cyan-50 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300'
                            : 'text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800'
                          }`}
                      >
                        <div className="flex items-center">
                          <FileText className="h-4 w-4 mr-2 hover:opacity-80 cursor-pointer transition-opacity duration-150" />
                          Logs
                        </div>
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}
          </nav>
        )}

        {/* Actions utilisateur */}
        <div className="flex items-center gap-2">
          {/* Nom de l'utilisateur */}
          {session && (
            <div className="hidden sm:block">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-md bg-gradient-to-br from-cyan-500 to-blue-300 flex items-center justify-center text-white font-medium text-sm">
                  {session.user.firstname?.charAt(0)}{session.user.lastname?.charAt(0)}
                </div>
                <span className="text-sm text-neutral-600 dark:text-neutral-300">
                  {session.user.firstname} {session.user.lastname}
                </span>
              </div>
            </div>
          )}

          {/* Séparateur vertical */}
          {session && (
            <div className="hidden sm:block h-6 w-px bg-neutral-200 dark:bg-neutral-700 mx-2"></div>
          )}

          {/* Bouton de changement de thème */}
          {mounted && (
            <Button
              variant="ghost"
              size="icon"
              className="rounded-md h-9 w-9"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              title={theme === 'dark' ? 'Passer au thème clair' : 'Passer au thème sombre'}
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5 text-yellow-500 hover:opacity-80 cursor-pointer transition-opacity duration-150" />
              ) : (
                <Moon className="h-5 w-5 text-cyan-400 hover:opacity-80 cursor-pointer transition-opacity duration-150" />
              )}
              <span className="sr-only">Changer de thème</span>
            </Button>
          )}

          {/* Bouton de déconnexion */}
          {session && (
            <Button
              variant="ghost"
              size="icon"
              className="rounded-md h-9 w-9"
              onClick={logout}
              title="Se déconnecter"
            >
              <LogOut className="h-5 w-5 text-neutral-700 dark:text-neutral-300 hover:opacity-80 cursor-pointer transition-opacity duration-150" />
              <span className="sr-only">Déconnexion</span>
            </Button>
          )}

          {/* Menu mobile */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-md h-9 w-9"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5 text-neutral-700 dark:text-neutral-300 hover:opacity-80 cursor-pointer transition-opacity duration-150" />
              ) : (
                <Menu className="h-5 w-5 text-neutral-700 dark:text-neutral-300 hover:opacity-80 cursor-pointer transition-opacity duration-150" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Menu mobile */}
      {mobileMenuOpen && session && (
        <div className="md:hidden border-t border-neutral-200 dark:border-neutral-800">
          <div className="container mx-auto py-2 px-4">
            <nav className="space-y-1">
              <Link
                href="/dashboard"
                className={`block px-3 py-2 text-sm font-medium rounded-md ${pathname === '/dashboard'
                    ? 'bg-cyan-50 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300'
                    : 'text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800'
                  }`}
              >
                Tableau de bord
              </Link>

              {session.user.isAdmin && (
                <>
                  <div
                    className="block px-3 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300"
                  >
                    <span className="flex items-center">
                      <Shield className="h-4 w-4 mr-2 hover:opacity-80 cursor-pointer transition-opacity duration-150" />
                      Administration
                    </span>
                  </div>

                  <div className="pl-6 space-y-1">
                    <Link
                      href="/admin/exercises"
                      className={`block px-3 py-2 text-sm font-medium rounded-md ${pathname.startsWith('/admin/exercises')
                          ? 'bg-cyan-50 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300'
                          : 'text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800'
                        }`}
                    >
                      <div className="flex items-center">
                        <Terminal className="h-4 w-4 mr-2 hover:opacity-80 cursor-pointer transition-opacity duration-150" />
                        Exercices
                      </div>
                    </Link>
                    <Link
                      href="/admin/students"
                      className={`block px-3 py-2 text-sm font-medium rounded-md ${pathname.startsWith('/admin/students')
                          ? 'bg-cyan-50 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300'
                          : 'text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800'
                        }`}
                    >
                      <div className="flex items-center">
                        <UserCircle className="h-4 w-4 mr-2 hover:opacity-80 cursor-pointer transition-opacity duration-150" />
                        Étudiants
                      </div>
                    </Link>
                    <Link
                      href="/admin/solutions"
                      className={`block px-3 py-2 text-sm font-medium rounded-md ${pathname.startsWith('/admin/solutions')
                          ? 'bg-cyan-50 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300'
                          : 'text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800'
                        }`}
                    >
                      <div className="flex items-center">
                        <Code className="h-4 w-4 mr-2 hover:opacity-80 cursor-pointer transition-opacity duration-150" />
                        Solutions
                      </div>
                    </Link>
                    <Link
                      href="/admin/stats"
                      className={`block px-3 py-2 text-sm font-medium rounded-md ${pathname.startsWith('/admin/stats')
                          ? 'bg-cyan-50 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300'
                          : 'text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800'
                        }`}
                    >
                      <div className="flex items-center">
                        <BarChart3 className="h-4 w-4 mr-2 hover:opacity-80 cursor-pointer transition-opacity duration-150" />
                        Statistiques
                      </div>
                    </Link>
                    <Link
                      href="/admin/logs"
                      className={`block px-3 py-2 text-sm font-medium rounded-md ${pathname.startsWith('/admin/logs')
                          ? 'bg-cyan-50 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300'
                          : 'text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800'
                        }`}
                    >
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 mr-2 hover:opacity-80 cursor-pointer transition-opacity duration-150" />
                        Logs
                      </div>
                    </Link>
                  </div>
                </>
              )}

              {/* User info mobile */}
              <div className="mt-3 pt-3 border-t border-neutral-200 dark:border-neutral-800">
                <div className="flex items-center gap-2 px-3 py-2">
                  <div className="h-8 w-8 rounded-md bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-medium text-sm">
                    {session.user.firstname?.charAt(0)}{session.user.lastname?.charAt(0)}
                  </div>
                  <span className="text-sm text-neutral-600 dark:text-neutral-300">
                    {session.user.firstname} {session.user.lastname}
                  </span>
                </div>
              </div>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}