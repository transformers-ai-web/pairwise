import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import { saveGoogleUser } from '@/lib/progress-db';

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [Google],
  session: { strategy: 'jwt' },
  callbacks: {
    jwt({ token, account }) {
      if (account?.provider === 'google') {
        token.sub = account.providerAccountId;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
  events: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google') {
        try {
          await saveGoogleUser({
            googleId: account.providerAccountId,
            email: profile?.email ?? null,
            emailVerified: profile?.email_verified === true,
            name: profile?.name ?? user.name ?? null,
          });
        } catch (error) {
          // Keep Google sign-in available during a database outage; retry on the next sign-in.
          console.error('[auth] user profile save failed', {
            code: (error as { code?: string } | null)?.code,
          });
        }
      }
      if (process.env.NODE_ENV === 'development') {
        console.info('[auth] signed in', {
          authJsUserId: user.id,
          email: user.email,
          provider: account?.provider,
          providerAccountId: account?.providerAccountId,
        });
      }
    },
  },
});
