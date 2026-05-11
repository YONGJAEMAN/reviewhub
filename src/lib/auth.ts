import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import Facebook from 'next-auth/providers/facebook';
import Credentials from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/prisma';
import { GOOGLE_BUSINESS_SCOPE } from '@/lib/google';
import { exchangeForLongLivedToken } from '@/lib/facebook';
import bcrypt from 'bcryptjs';

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: `openid email profile ${GOOGLE_BUSINESS_SCOPE}`,
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    }),
    Facebook({
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: 'email,pages_read_engagement,pages_manage_engagement,pages_show_list',
        },
      },
    }),
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user || !user.password) return null;

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!isValid) return null;

        return { id: user.id, name: user.name, email: user.email };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    // 30-day rolling session — long enough for daily users, short enough to
    // limit stolen-cookie blast radius. updateAge keeps the JWT exp fresh
    // on activity instead of forcing re-login mid-session.
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // refresh JWT every 24h of activity
  },
  pages: {
    signIn: '/login',
  },
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === 'production'
        ? '__Secure-authjs.session-token'
        : 'authjs.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        // Force Secure in production. NextAuth would do this automatically
        // when NEXTAUTH_URL is https, but being explicit prevents accidental
        // cookie leakage if the URL is misconfigured.
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
  callbacks: {
    async jwt({ token, user, account, trigger }) {
      if (user) {
        token.id = user.id;
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { onboardingCompleted: true },
        });
        token.onboardingCompleted = dbUser?.onboardingCompleted ?? false;
      }
      if (trigger === 'update') {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { onboardingCompleted: true },
        });
        token.onboardingCompleted = dbUser?.onboardingCompleted ?? false;
      }
      // Store Google access_token in JWT for easy access
      if (account?.provider === 'google') {
        token.googleAccessToken = account.access_token;
      }
      // Facebook: exchange the short-lived token for a long-lived (~60 day)
      // one, then persist back to the Account row so the cron sync can read
      // it. Failures are non-fatal — fall back to the short-lived token.
      if (account?.provider === 'facebook' && account.access_token && user?.id) {
        try {
          const { accessToken, expiresIn } = await exchangeForLongLivedToken(
            account.access_token,
          );
          const expiresAt = Math.floor(Date.now() / 1000) + expiresIn;
          await prisma.account.updateMany({
            where: {
              userId: user.id,
              provider: 'facebook',
              providerAccountId: account.providerAccountId,
            },
            data: { access_token: accessToken, expires_at: expiresAt },
          });
        } catch (err) {
          // Sentry-friendly: log but don't break login flow.
          console.error('[fb] long-lived token exchange failed:', err);
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.onboardingCompleted = token.onboardingCompleted as boolean;
      }
      return session;
    },
  },
});
