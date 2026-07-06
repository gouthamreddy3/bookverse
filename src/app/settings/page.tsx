import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { SettingsForm } from "@/features/profile/components/settings-form";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const profile = await prisma.profile.findUnique({ where: { userId: session.user.id } });
  if (!profile) redirect("/login");

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-8 px-6 py-12">
      <div>
        <h1 className="font-serif text-3xl italic tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Update how your profile appears to other readers.
        </p>
      </div>
      <SettingsForm profile={profile} />
    </div>
  );
}
