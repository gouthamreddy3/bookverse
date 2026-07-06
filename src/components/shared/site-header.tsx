import Link from "next/link";
import { Bell } from "lucide-react";

import { NAV_ITEMS } from "@/config/nav";
import { BottomNav } from "@/components/shared/bottom-nav";
import { MobileNav } from "@/components/shared/mobile-nav";
import { QuickSearch } from "@/components/shared/quick-search";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { UserMenu } from "@/components/shared/user-menu";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function SiteHeader() {
  const session = await auth();
  const isAuthenticated = !!session?.user;

  const profile = isAuthenticated
    ? await prisma.profile.findUnique({
        where: { userId: session.user.id },
        select: { displayName: true, username: true, avatarUrl: true },
      })
    : null;

  const visibleNavItems = NAV_ITEMS.filter((item) => !item.requiresAuth || isAuthenticated);

  return (
    <>
      <header className="sticky top-0 z-40 flex items-center justify-between gap-4 border-b border-border bg-background/95 px-4 py-3 backdrop-blur-sm sm:px-6">
        <div className="flex items-center gap-6">
          <MobileNav isAuthenticated={isAuthenticated} />
          <Link href="/" className="font-serif text-lg font-medium italic tracking-tight">
            BookVerse
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {visibleNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-1">
          <QuickSearch />
          <ThemeToggle />
          {isAuthenticated ? (
            <>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Notifications"
                nativeButton={false}
                render={<Link href="/notifications" />}
              >
                <Bell className="size-4" />
              </Button>
              <UserMenu
                displayName={profile?.displayName ?? session.user.name ?? "Reader"}
                avatarUrl={profile?.avatarUrl ?? null}
                username={profile?.username ?? ""}
              />
            </>
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Button variant="ghost" nativeButton={false} render={<Link href="/login" />}>
                Log in
              </Button>
              <Button nativeButton={false} render={<Link href="/signup" />}>
                Sign up
              </Button>
            </div>
          )}
        </div>
      </header>
      <BottomNav isAuthenticated={isAuthenticated} />
    </>
  );
}
