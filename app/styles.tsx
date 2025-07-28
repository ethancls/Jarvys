'use client';

import { Montserrat } from 'next/font/google';

// Définir les polices
export const inter = Montserrat({ subsets: ['latin'], variable: '--font-inter' });
export const spaceGrotesk = Montserrat({ subsets: ['latin'], variable: '--font-space' });

export default function GlobalStyles() {
  return (
    <style jsx global>{`
      /* Police personnalisée */
      :root {
        --font-sans: var(--font-inter);
        --font-space: var(--font-space);
      }
      
      .font-sans {
        font-family: var(--font-sans);
      }
      
      .font-space {
        font-family: var(--font-space);
      }
    `}</style>
  );
} 