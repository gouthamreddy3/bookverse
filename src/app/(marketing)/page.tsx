import { generateHTML } from "@tiptap/html";
import Image from "next/image";
import Link from "next/link";
import { BookOpen } from "lucide-react";

import { getRecentlyAddedBooks } from "@/features/books/book-service";
import { BookCard } from "@/features/books/components/book-card";
import { SearchBar } from "@/features/books/components/search-bar";
import { reviewEditorExtensions } from "@/features/reviews/editor-extensions";
import { getRecentReviews } from "@/features/reviews/queries";
import { StarRatingDisplay } from "@/features/reviews/components/star-rating-display";
import { auth } from "@/lib/auth";

export default async function HomePage() {
  const session = await auth();
  const [recentBooks, recentReviews] = await Promise.all([
    getRecentlyAddedBooks(6),
    getRecentReviews(session?.user?.id ?? null, 3),
  ]);

  return (
    <div className="flex flex-1 flex-col">
      <section className="flex flex-col items-center gap-6 px-6 py-20 text-center">
        <h1 className="font-serif text-4xl italic tracking-tight sm:text-6xl">
          Every book has a story.
        </h1>
        <p className="max-w-md text-balance text-muted-foreground">
          BookVerse is a home for readers to track what they read, share what
          they think, and discover what to read next.
        </p>
        <div className="w-full max-w-md">
          <SearchBar />
        </div>
      </section>

      <section className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-6 py-12">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recently discovered</h2>
          <Link href="/explore" className="text-sm font-medium underline underline-offset-4">
            See all
          </Link>
        </div>
        {recentBooks.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No books yet — search above to add the first one.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-6">
            {recentBooks.map((book) => (
              <BookCard key={book.openLibraryId} book={book} />
            ))}
          </div>
        )}
      </section>

      <section className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-6 py-12">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Latest reviews</h2>
          <Link href="/reviews" className="text-sm font-medium underline underline-offset-4">
            See all
          </Link>
        </div>
        {recentReviews.length === 0 ? (
          <p className="text-sm text-muted-foreground">No reviews yet — be the first to write one.</p>
        ) : (
          <div className="flex flex-col gap-4">
            {recentReviews.map((review) => {
              const html = generateHTML(JSON.parse(review.content), reviewEditorExtensions);
              const displayName =
                review.user.profile?.displayName ?? review.user.name ?? "Reader";
              return (
                <Link
                  key={review.id}
                  href={`/books/${review.book.slug}`}
                  className="flex gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-muted/40"
                >
                  <div className="relative aspect-[2/3] w-12 shrink-0 overflow-hidden rounded-md bg-muted">
                    {review.book.coverImageUrl ? (
                      <Image
                        src={review.book.coverImageUrl}
                        alt=""
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <BookOpen className="size-4 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{review.book.title}</p>
                      {review.rating && (
                        <StarRatingDisplay value={Number(review.rating.value)} size="sm" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">by {displayName}</p>
                    {!review.containsSpoilers && (
                      <div
                        className="line-clamp-2 text-sm text-foreground/80"
                        dangerouslySetInnerHTML={{ __html: html }}
                      />
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      <footer className="mt-auto border-t border-border px-6 py-8 text-center text-sm text-muted-foreground">
        <p className="font-serif italic">BookVerse</p>
        <p className="mt-1">A social platform for readers.</p>
      </footer>
    </div>
  );
}
