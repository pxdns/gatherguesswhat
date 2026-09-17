import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  adapter: PrismaAdapter(prisma),
  providers: [
    GitHub({
      clientId: process.env.GITHUB_WEB_ID!,
      clientSecret: process.env.GITHUB_WEB_SECRET!,
      authorization: {
        params: {
          // read:org — see org memberships
          // repo — see public+private repos
          // read:user — full profile
          // user:email — email addresses
          scope: "read:user user:email read:org repo",
        },
      },
    }),
    Google({
      clientId: process.env.GOOGLE_WEB_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_WEB_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: "database",
  },
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        // Pull GitHub username from Account table
        const ghAccount = await prisma.account.findFirst({
          where: { userId: user.id, provider: "github" },
          select: { providerAccountId: true },
        });
        if (ghAccount) {
          const dbUser = await prisma.user.findUnique({
            where: { id: user.id },
            select: { githubUsername: true },
          });
          (session.user as any).githubUsername = dbUser?.githubUsername;
        }
      }
      return session;
    },
    async signIn({ user, account, profile }) {
      // Store GitHub username on the User row
      if (account?.provider === "github" && profile) {
        await prisma.user.update({
          where: { id: user.id! },
          data: {
            githubUsername: (profile as any).login,
            githubId: String((profile as any).id),
          },
        }).catch(() => null); // non-fatal if user row not yet created
      }
      return true;
    },
  },
  pages: {
    signIn: "/signin",
  },
});
