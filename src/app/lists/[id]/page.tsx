import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { getReadingListDetail } from "@/features/reading-lists/queries";
import { BookCard } from "@/features/books/components/book-card";
import { auth } from "@/lib/auth";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const list = await getReadingListDetail(id);
  return { title: list?.name ?? "Reading List" };
}

export default async function ReadingListDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { id } = await params;
  const list = await getReadingListDetail(id);
  if (!list || list.userId !== session.user.id) notFound();

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8 px-6 py-12">
      <div>
        <h1 className="font-serif text-3xl italic tracking-tight">{list.name}</h1>
        {list.description && (
          <p className="mt-1 text-sm text-muted-foreground">{list.description}</p>
        )}
      </div>

      {list.items.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No books in this list yet — add one from any book&apos;s page.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {list.items.map((item) => (
            <BookCard
              key={item.id}
              book={{
                openLibraryId: item.bookId,
                slug: item.book.slug,
                title: item.book.title,
                authorNames: [],
                firstPublishYear: null,
                coverImageUrl: item.book.coverImageUrl,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
