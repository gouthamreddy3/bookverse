"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { NAV_ITEMS, PROFILE_NAV } from "@/config/nav";
import { cn } from "@/lib/utils";

export function BottomNav({ isAuthenticated }: { isAuthenticated: boolean }) {
  const pathname = usePathname();
  const items = [...NAV_ITEMS.filter((item) => item.inBottomNav), PROFILE_NAV].filter(
    (item) => !item.requiresAuth || isAuthenticated
  );

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-border bg-background/95 backdrop-blur-sm md:hidden">
      {items.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={isAuthenticated || !item.requiresAuth ? item.href : "/login"}
            className={cn(
              "flex flex-1 flex-col items-center gap-0.5 py-2 text-[0.65rem] font-medium text-muted-foreground",
              isActive && "text-foreground"
            )}
          >
            <item.icon className="size-5" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
