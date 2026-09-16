import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./prisma";

export const { auth, handlers, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  // Vercel terminates TLS at its edge and forwards over HTTP internally, so NextAuth's
  // built-in host/protocol check on the incoming request needs to be told to trust it —
  // without this, callback URLs can resolve wrong and the OAuth redirect silently fails.
  trustHost: true,
  providers: [
    GitHub({
      clientId: process.env.GITHUB_WEB_ID,
      clientSecret: process.env.GITHUB_WEB_SECRET,
    }),
    Google({
      clientId: process.env.GOOGLE_WEB_CLIENT_ID,
      clientSecret: process.env.GOOGLE_WEB_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async session({ session, user }: any) {
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signout",
    error: "/auth/error",
  },
});
