import { DefaultSession } from 'next-auth';

// Étendre le type User dans next-auth
declare module 'next-auth' {
  interface User {
    id: string;
    isAdmin: boolean;
    number: string;
    firstname?: string;
    lastname?: string;
  }

  interface Session extends DefaultSession {
    user: {
      id: string;
      isAdmin: boolean;
      number: string;
      firstname?: string;
      lastname?: string;
    } & DefaultSession['user'];
  }
}

// Étendre le type JWT dans next-auth/jwt
declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    isAdmin: boolean;
    number: string;
    firstname?: string;
    lastname?: string;
  }
} 