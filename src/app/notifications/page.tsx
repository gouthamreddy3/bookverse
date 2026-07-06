import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { BellOff } from "lucide-react";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Notifications" };

export default async function NotificationsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const notifications = await prisma.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 px-6 py-12">
      <h1 className="font-serif text-3xl italic tracking-tight">Notifications</h1>

      {notifications.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
          <BellOff className="size-6" />
          No notifications yet.
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`rounded-lg border border-border p-3 text-sm ${n.isRead ? "text-muted-foreground" : "font-medium"}`}
            >
              {n.type}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
