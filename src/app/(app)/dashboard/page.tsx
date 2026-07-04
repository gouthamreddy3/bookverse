import type { Metadata } from "next";

import { logout } from "@/features/auth/actions";
import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const session = await auth();

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="font-serif text-3xl italic tracking-tight">
        Welcome, {session?.user.name ?? session?.user.email}
      </h1>
      <p className="text-sm text-muted-foreground">
        Role: {session?.user.role} · {session?.user.email}
      </p>
      <form action={logout}>
        <Button type="submit" variant="outline">
          Log out
        </Button>
      </form>
    </div>
  );
}
