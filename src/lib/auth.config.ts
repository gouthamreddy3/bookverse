import type { NextAuthConfig } from "next-auth";

const PUBLIC_EXACT_ROUTES = new Set(["/", "/login", "/signup"]);
const PUBLIC_ROUTE_PREFIXES = ["/books", "/explore", "/reviews", "/u"];

function isPublicRoute(pathname: string): boolean {
  if (PUBLIC_EXACT_ROUTES.has(pathname)) return true;
  return PUBLIC_ROUTE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

/**
 * Edge-safe config: no Prisma, no bcrypt, no Credentials provider (all
 * Node-only). This is what src/proxy.ts runs. The full config in auth.ts
 * spreads this and adds the Node-only pieces.
 */
export const authConfig = {
  pages: {
    signIn: "/login",
  },
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;

      if (isPublicRoute(request.nextUrl.pathname)) return true;
      return isLoggedIn;
    },
  },
} satisfies NextAuthConfig;
