import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { BookOpen, Flame, Star } from "lucide-react";

import { getDashboardStats } from "@/features/dashboard/queries";
import { ReadingGoalCard } from "@/features/dashboard/components/reading-goal-card";
import { logout } from "@/features/auth/actions";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const session = await auth();
  const stats = await getDashboardStats(session!.user.id);

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-8 px-6 py-12">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-3xl italic tracking-tight">
          Welcome, {session?.user.name}
        </h1>
        <form action={logout}>
          <Button type="submit" variant="outline" size="sm">
            Log out
          </Button>
        </form>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-border p-4">
          <p className="text-xs text-muted-foreground">Reading goal ({new Date().getUTCFullYear()})</p>
          <div className="mt-2">
            <ReadingGoalCard goal={stats.readingGoal} booksReadThisYear={stats.booksReadThisYear} />
          </div>
        </div>

        <div className="rounded-lg border border-border p-4">
          <p className="text-xs text-muted-foreground">Current streak</p>
          <p className="mt-2 flex items-center gap-1.5 text-2xl font-semibold">
            <Flame className="size-5 text-orange-500" />
            {stats.streak} {stats.streak === 1 ? "day" : "days"}
          </p>
        </div>

        <div className="rounded-lg border border-border p-4">
          <p className="text-xs text-muted-foreground">Pages read this year</p>
          <p className="mt-2 text-2xl font-semibold tabular-nums">
            {stats.pagesReadThisYear.toLocaleString()}
          </p>
        </div>

        <div className="rounded-lg border border-border p-4">
          <p className="text-xs text-muted-foreground">Books read (all time)</p>
          <p className="mt-2 text-2xl font-semibold tabular-nums">{stats.booksReadTotal}</p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Currently reading</h2>
        {stats.currentlyReading.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nothing marked as Reading yet —{" "}
            <Link href="/books" className="font-medium underline underline-offset-4">
              find a book
            </Link>{" "}
            to start.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
            {stats.currentlyReading.map((item) => (
              <Link key={item.id} href={`/books/${item.book.slug}`} className="flex flex-col gap-2">
                <div className="relative aspect-[2/3] w-full overflow-hidden rounded-md bg-muted">
                  {item.book.coverImageUrl ? (
                    <Image
                      src={item.book.coverImageUrl}
                      alt=""
                      fill
                      sizes="150px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <BookOpen className="size-6 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <p className="line-clamp-2 text-xs font-medium">{item.book.title}</p>
              </Link>
            ))}
          </div>
        )}
      </div>

      {stats.ratingsGivenCount > 0 && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Star className="size-4 fill-amber-400 text-amber-400" />
          You&apos;ve rated {stats.ratingsGivenCount} book{stats.ratingsGivenCount === 1 ? "" : "s"},
          averaging {stats.averageRatingGiven?.toFixed(1)} stars.
        </div>
      )}
    </div>
  );
}
