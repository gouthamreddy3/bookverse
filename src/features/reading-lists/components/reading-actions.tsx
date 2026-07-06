import Link from "next/link";

import { AddToListButton } from "@/features/reading-lists/components/add-to-list-button";
import { ReadingStatusSelector } from "@/features/reading-lists/components/reading-status-selector";
import { getListsWithMembership, getUserReadingStatus } from "@/features/reading-lists/queries";
import { auth } from "@/lib/auth";

export async function ReadingActions({ bookId }: { bookId: string }) {
  const session = await auth();
  if (!session?.user) {
    return (
      <p className="text-sm text-muted-foreground">
        <Link href="/login" className="font-medium underline underline-offset-4">
          Log in
        </Link>{" "}
        to track this book or add it to a list.
      </p>
    );
  }

  const [status, lists] = await Promise.all([
    getUserReadingStatus(session.user.id, bookId),
    getListsWithMembership(session.user.id, bookId),
  ]);

  return (
    <div className="flex flex-wrap gap-2">
      <ReadingStatusSelector bookId={bookId} initialStatus={status} />
      <AddToListButton bookId={bookId} initialLists={lists} />
    </div>
  );
}
