"use server";

import { revalidatePath } from "next/cache";

import { updateProfileSchema } from "@/features/profile/schemas";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type ActionResult =
  | { success: true }
  | { success: false; error: string; fieldErrors?: Record<string, string[] | undefined> };

export async function updateProfile(input: unknown): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Not authenticated." };

  const parsed = updateProfileSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: "Please fix the errors below.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const { displayName, bio, location, websiteUrl, pronouns, avatarUrl, bannerUrl } = parsed.data;

  const profile = await prisma.profile.update({
    where: { userId: session.user.id },
    data: {
      displayName: displayName || null,
      bio: bio || null,
      location: location || null,
      websiteUrl: websiteUrl || null,
      pronouns: pronouns || null,
      avatarUrl: avatarUrl || null,
      bannerUrl: bannerUrl || null,
    },
    select: { username: true },
  });

  revalidatePath(`/profile/${profile.username}`);
  revalidatePath("/settings");
  return { success: true };
}

export async function setReadingGoal(goal: number | null): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) return { success: false, error: "Not authenticated." };

  if (goal !== null && (!Number.isInteger(goal) || goal < 1 || goal > 1000)) {
    return { success: false, error: "Enter a goal between 1 and 1000 books." };
  }

  await prisma.profile.update({
    where: { userId: session.user.id },
    data: { readingGoal: goal },
  });

  revalidatePath("/dashboard");
  return { success: true };
}
