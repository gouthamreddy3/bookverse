import Link from "next/link";
import type { Metadata } from "next";

import { getGenresWithBookCounts, getRecentlyAddedBooks } from "@/features/books/book-service";
import { BookCard } from "@/features/books/components/book-card";

export const metadata: Metadata = { title: "Explore" };

export default async function ExplorePage() {
  const [genres, recentBooks] = await Promise.all([
    getGenresWithBookCounts(),
    getRecentlyAddedBooks(12),
  ]);

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-12 px-6 py-12">
      <div>
        <h1 className="font-serif text-3xl italic tracking-tight">Explore</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Browse genres and see what readers are discovering.
        </p>
      </div>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Genres</h2>
        {genres.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No genres yet — they appear as readers explore books.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {genres.map((genre) => (
              <Link
                key={genre.id}
                href={`/books?q=${encodeURIComponent(genre.name)}`}
                className="rounded-full bg-secondary px-3 py-1.5 text-sm font-medium text-secondary-foreground transition-colors hover:bg-secondary/70"
              >
                {genre.name}
                <span className="ml-1.5 text-muted-foreground">{genre.bookCount}</span>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Recently discovered</h2>
        {recentBooks.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No books yet —{" "}
            <Link href="/books" className="font-medium underline underline-offset-4">
              search for one
            </Link>{" "}
            to get started.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {recentBooks.map((book) => (
              <BookCard key={book.openLibraryId} book={book} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
