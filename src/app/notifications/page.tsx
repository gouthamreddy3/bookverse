import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Bell, BellOff, Heart, MessageCircle } from "lucide-react";

import { markAllNotificationsRead } from "@/features/notifications/actions";
import { getNotifications } from "@/features/notifications/queries";
import { formatRelativeTime } from "@/features/reviews/utils";
import { auth } from "@/lib/auth";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Notifications" };

function describe(n: Awaited<ReturnType<typeof getNotifications>>[number]): string {
  const actor = n.actor?.profile?.displayName ?? n.actor?.name ?? "Someone";
  const book = n.review?.book.title;

  switch (n.type) {
    case "REVIEW_LIKED":
      return `${actor} liked your review${book ? ` of ${book}` : ""}`;
    case "REVIEW_COMMENTED":
      return `${actor} commented on your review${book ? ` of ${book}` : ""}`;
    case "COMMENT_REPLIED":
      return `${actor} replied to your comment${book ? ` on ${book}` : ""}`;
    default:
      return `${actor} interacted with your activity`;
  }
}

const ICONS: Record<string, typeof Heart> = {
  REVIEW_LIKED: Heart,
  REVIEW_COMMENTED: MessageCircle,
  COMMENT_REPLIED: MessageCircle,
};

export default async function NotificationsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const notifications = await getNotifications(session.user.id);
  await markAllNotificationsRead();

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
          {notifications.map((n) => {
            const Icon = ICONS[n.type] ?? Bell;
            const content = (
              <div
                className={cn(
                  "flex items-center gap-3 rounded-lg border border-border p-3 text-sm",
                  !n.isRead && "bg-muted/40"
                )}
              >
                <Icon className="size-4 shrink-0 text-muted-foreground" />
                <span className="flex-1">{describe(n)}</span>
                <span className="text-xs text-muted-foreground">
                  {formatRelativeTime(n.createdAt)}
                </span>
              </div>
            );
            return n.review ? (
              <Link key={n.id} href={`/books/${n.review.book.slug}`}>
                {content}
              </Link>
            ) : (
              <div key={n.id}>{content}</div>
            );
          })}
        </div>
      )}
    </div>
  );
}
