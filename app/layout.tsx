'use client';
import "./globals.css";
import { ThemeProvider } from 'next-themes';
import GlobalStyles from './styles';
import { SessionProvider } from 'next-auth/react';
import Navigation from '@/components/layout/Navigation';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Toaster } from 'react-hot-toast';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [showNav, setShowNav] = useState(false);
  useEffect(() => {
    if (pathname && pathname !== '/' && pathname !== '/register') {
      setShowNav(true);
    } else {
      setShowNav(false);
    }
  }, [pathname]);
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <title>Jarvys</title>
        <meta name="description" content="Plateforme d&apos;exercices Python pour étudiants" />
        <link rel="icon" href="/images/icon-light.svg" media="(prefers-color-scheme: light)" type="image/svg+xml" />
        <link rel="icon" href="/images/icon-dark.svg" media="(prefers-color-scheme: dark)" type="image/svg+xml" />
      </head>
      <body className="font-sans text-black antialiased overflow-hidden bg-white dark:bg-black dark:text-white">
        <SessionProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem={false}
            disableTransitionOnChange
          >
            <GlobalStyles />
            <div className="flex flex-col h-screen overflow-hidden">
              {/* Navigation/Header */}
              {showNav && <Navigation />}
              {/* Contenu principal */}
              <main className="flex-1 h-[calc(100vh-3.5rem-2rem)] overflow-y-auto bg-white dark:bg-black">
                {children}
                <Toaster position="bottom-right" />
              </main>
              {/* Footer */}
              <footer className="h-8 relative z-10">
                <div className="mx-auto max-w-7xl h-full flex items-center justify-center px-4 md:px-6 text-xs text-neutral-500">
                  <p>© 2025 Jarvys. Tous droits réservés.</p>
                </div>
              </footer>
            </div>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}