import { NextResponse, NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Chemins publics qui ne nécessitent pas d'authentification
const publicPaths = [
  '/',
  '/register',
  '/api/register',
  '/favicon.ico',
  '/images/icon-dark.svg',
  '/images/icon-light.svg',
];

// Fonction pour vérifier si le chemin est public
const isPublicPath = (path: string) => {
  if (
    path.startsWith('/_next') ||
    path.startsWith('/api/auth') ||
    path.startsWith('/api/public') ||
    path.startsWith('/favicon') ||
    path.match(/^\/(icon).*\.(svg)$/)
  ) {
    return true;
  }
  return publicPaths.includes(path);
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Si le chemin est public, on laisse passer
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }
  
  // Récupérer le token JWT depuis les cookies
  const token = await getToken({ 
    req: request, 
    secret: process.env.NEXTAUTH_SECRET
  });
  
  // Si pas de token, rediriger vers la page de connexion
  if (!token) {
    //console.log(`[Middleware] Non authentifié, redirection depuis ${pathname} vers la page de connexion`);
    const url = new URL('/', request.url);
    // Ajouter le chemin d'origine comme callback URL pour rediriger après connexion
    url.searchParams.set('callbackUrl', request.url);
    return NextResponse.redirect(url);
  }
  
  // Vérifier les autorisations pour les chemins admin
  if (pathname.startsWith('/admin')) {
    const isAdmin = token.isAdmin === true;
    
    if (!isAdmin) {
      //console.log(`[Middleware] Accès admin refusé pour ${token.number}, redirection vers le dashboard`);
      // Rediriger vers le tableau de bord si l'utilisateur n'est pas admin
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }
  
  // Si tout est en ordre, on laisse passer
  return NextResponse.next();
}

// Configuration pour indiquer sur quels chemins le middleware doit s'exécuter
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}; 