"use client";

import Image from "next/image";
import Link from "next/link";
import { LogOut, Settings, User } from "lucide-react";

import { logout } from "@/features/auth/actions";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function UserMenu({
  displayName,
  avatarUrl,
  username,
}: {
  displayName: string;
  avatarUrl: string | null;
  username: string;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="icon" aria-label="Account menu" className="rounded-full" />
        }
      >
        <span className="relative size-7 overflow-hidden rounded-full bg-muted">
          {avatarUrl ? (
            <Image src={avatarUrl} alt="" fill sizes="28px" className="object-cover" />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-xs font-medium">
              {displayName.charAt(0).toUpperCase()}
            </span>
          )}
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem render={<Link href={`/u/${username}`} />}>
          <User className="size-4" />
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem render={<Link href="/settings" />}>
          <Settings className="size-4" />
          Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={() => logout()}>
          <LogOut className="size-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
