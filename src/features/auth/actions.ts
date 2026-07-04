"use server";

import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";

import { generateUniqueUsername } from "@/features/auth/username";
import { loginSchema, signUpSchema } from "@/features/auth/schemas";
import { signIn, signOut } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";

export type ActionResult =
  | { success: true }
  | {
      success: false;
      error: string;
      fieldErrors?: Record<string, string[] | undefined>;
    };

const PASSWORD_HASH_ROUNDS = 12;

export async function signUp(input: unknown): Promise<ActionResult> {
  const rateLimit = await checkRateLimit("signup");
  if (!rateLimit.success) {
    return { success: false, error: "Too many attempts. Please try again later." };
  }

  const parsed = signUpSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: "Please fix the errors below.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const { name, email, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return {
      success: false,
      error: "An account with this email already exists.",
      fieldErrors: { email: ["An account with this email already exists."] },
    };
  }

  const hashedPassword = await bcrypt.hash(password, PASSWORD_HASH_ROUNDS);
  const username = await generateUniqueUsername(name);

  await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: { name, email, hashedPassword },
    });
    await tx.profile.create({
      data: { userId: user.id, username, displayName: name },
    });
  });

  try {
    await signIn("credentials", { email, password, redirectTo: "/dashboard" });
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        success: false,
        error: "Account created, but automatic sign-in failed. Please log in.",
      };
    }
    throw error;
  }

  return { success: true };
}

export async function login(input: unknown): Promise<ActionResult> {
  const rateLimit = await checkRateLimit("login");
  if (!rateLimit.success) {
    return { success: false, error: "Too many attempts. Please try again later." };
  }

  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: "Please fix the errors below.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    await signIn("credentials", { ...parsed.data, redirectTo: "/dashboard" });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { success: false, error: "Invalid email or password." };
        default:
          return { success: false, error: "Something went wrong. Please try again." };
      }
    }
    throw error;
  }

  return { success: true };
}

export async function signInWithGoogle(): Promise<void> {
  await signIn("google", { redirectTo: "/dashboard" });
}

export async function logout(): Promise<void> {
  await signOut({ redirectTo: "/" });
}
