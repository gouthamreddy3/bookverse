import { randomInt } from "crypto";

import { prisma } from "@/lib/prisma";

const COMBINING_DIACRITICS = new RegExp("[\\u0300-\\u036f]", "g");

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(COMBINING_DIACRITICS, "")
    .replace(/[^a-z0-9]/g, "")
    .slice(0, 20);
}

export async function generateUniqueUsername(seed: string): Promise<string> {
  const base = slugify(seed) || "reader";
  const candidateBase = base.length < 3 ? `${base}reader`.slice(0, 20) : base;

  for (let attempt = 0; attempt < 5; attempt++) {
    const candidate =
      attempt === 0 ? candidateBase : `${candidateBase}${randomInt(1000, 9999)}`;
    const existing = await prisma.profile.findUnique({
      where: { username: candidate },
      select: { id: true },
    });
    if (!existing) return candidate;
  }

  return `${candidateBase}${randomInt(100000, 999999)}`;
}
