"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
import { useState } from "react";

import { NAV_ITEMS, NOTIFICATIONS_NAV, PROFILE_NAV } from "@/config/nav";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function MobileNav({ isAuthenticated }: { isAuthenticated: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const items = [
    ...NAV_ITEMS,
    ...(isAuthenticated ? [NOTIFICATIONS_NAV, PROFILE_NAV] : []),
  ].filter((item) => !item.requiresAuth || isAuthenticated);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger
        render={<Button variant="ghost" size="icon" aria-label="Open menu" className="md:hidden" />}
      >
        <Menu className="size-4" />
      </SheetTrigger>
      <SheetContent side="left">
        <SheetHeader>
          <SheetTitle className="font-serif italic">BookVerse</SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-1 px-2">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
            >
              <item.icon className="size-4" />
              {item.label}
            </Link>
          ))}
          {!isAuthenticated && (
            <>
              <Link
                href="/login"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
              >
                Sign up
              </Link>
            </>
          )}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
