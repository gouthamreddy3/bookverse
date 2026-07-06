import "server-only";

import { prisma } from "@/lib/prisma";

const actorSelect = {
  id: true,
  name: true,
  profile: { select: { username: true, displayName: true, avatarUrl: true } },
} as const;

export async function getNotifications(userId: string) {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      actor: { select: actorSelect },
      review: { select: { book: { select: { title: true, slug: true } } } },
    },
  });
}

export async function getUnreadNotificationCount(userId: string) {
  return prisma.notification.count({ where: { userId, isRead: false } });
}
