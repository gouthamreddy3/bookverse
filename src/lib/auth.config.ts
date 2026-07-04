import type { NextAuthConfig } from "next-auth";

const PUBLIC_ROUTES = new Set(["/", "/login", "/signup"]);

/**
 * Edge-safe config: no Prisma, no bcrypt, no Credentials provider (all
 * Node-only). This is what src/middleware.ts runs on the Edge runtime.
 * The full config in auth.ts spreads this and adds the Node-only pieces.
 */
export const authConfig = {
  pages: {
    signIn: "/login",
  },
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const isPublicRoute = PUBLIC_ROUTES.has(request.nextUrl.pathname);

      if (isPublicRoute) return true;
      return isLoggedIn;
    },
  },
} satisfies NextAuthConfig;
