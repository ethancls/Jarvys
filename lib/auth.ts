import bcrypt from 'bcryptjs';
import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaClient } from './generated/prisma';

// Créer une instance Prisma
const prisma = new PrismaClient();

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        number: { label: "Numéro étudiant", type: "text" },
        password: { label: "Mot de passe", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.number || !credentials?.password) {
          return null;
        }
        
        try {
          // Utiliser prisma directement au lieu d'axios
          const student = await prisma.student.findFirst({
            where: { 
              number: credentials.number 
            }
          });
          
          // Vérifier que l'étudiant existe et que le mot de passe est correct
          if (student && bcrypt.compareSync(credentials.password, student.passwordHash)) {
            // On ne renvoie pas le hash du mot de passe dans le token
            const { passwordHash, ...studentWithoutPassword } = student;
            return studentWithoutPassword;
          }
          
          return null;
        } catch (error) {
          console.error('Erreur d\'authentification:', error);
          return null;
        }
      }
    })
  ],
  pages: {
    signIn: '/',
    signOut: '/',
    error: '/'
  },
  callbacks: {
    async jwt({ token, user }) {
      // Ajouter les propriétés de l'utilisateur au token
      if (user) {
        token.id = user.id;
        token.isAdmin = user.isAdmin;
        token.number = user.number;
        token.firstname = user.firstname;
        token.lastname = user.lastname;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user = {
          ...session.user,
          id: token.id as string,
          isAdmin: token.isAdmin as boolean,
          number: token.number as string,
          firstname: token.firstname as string,
          lastname: token.lastname as string
        };
      }
      return session;
    }
  },
  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60, // 7 jours
  },
  secret: process.env.NEXTAUTH_SECRET || 'jarvys-secret-key',
  debug: process.env.NODE_ENV === 'development',
};