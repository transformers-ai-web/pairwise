import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';

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
    async signIn({ user, account }) {
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
