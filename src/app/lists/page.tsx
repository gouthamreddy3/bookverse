import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { CreateListForm } from "@/features/reading-lists/components/create-list-form";
import { getUserReadingLists } from "@/features/reading-lists/queries";
import { auth } from "@/lib/auth";

export const metadata: Metadata = { title: "Reading Lists" };

export default async function ReadingListsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const lists = await getUserReadingLists(session.user.id);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8 px-6 py-12">
      <div>
        <h1 className="font-serif text-3xl italic tracking-tight">Reading Lists</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your shelves — Want to Read, Reading, Finished, and custom lists.
        </p>
      </div>

      <CreateListForm />

      {lists.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          You haven&apos;t created any reading lists yet.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {lists.map((list) => (
            <Link
              key={list.id}
              href={`/lists/${list.id}`}
              className="flex items-center justify-between rounded-lg border border-border p-4 transition-colors hover:bg-muted/40"
            >
              <div>
                <p className="text-sm font-medium">{list.name}</p>
                {list.description && (
                  <p className="text-xs text-muted-foreground">{list.description}</p>
                )}
              </div>
              <span className="text-xs text-muted-foreground">
                {list._count.items} book{list._count.items === 1 ? "" : "s"}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
