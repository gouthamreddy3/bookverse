import Link from "next/link";
import type { Metadata } from "next";

import { searchBooks } from "@/features/books/book-service";
import { BookCard } from "@/features/books/components/book-card";
import { SearchBar } from "@/features/books/components/search-bar";

export const metadata: Metadata = {
  title: "Search books",
};

export default async function BooksSearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { q = "", page = "1" } = await searchParams;
  const pageNumber = Math.max(1, Number(page) || 1);
  const outcome = q.trim() ? await searchBooks(q, pageNumber) : null;

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8 px-6 py-12">
      <div className="flex flex-col gap-4">
        <h1 className="font-serif text-3xl italic tracking-tight">Find your next book</h1>
        <SearchBar initialQuery={q} />
      </div>

      {!outcome && (
        <p className="text-sm text-muted-foreground">
          Search by title or author to get started.
        </p>
      )}

      {outcome && outcome.results.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No books found for &ldquo;{outcome.query}&rdquo;.
        </p>
      )}

      {outcome && outcome.results.length > 0 && (
        <>
          <p className="text-sm text-muted-foreground">
            {outcome.totalCount.toLocaleString()} results for &ldquo;{outcome.query}&rdquo;
          </p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {outcome.results.map((book) => (
              <BookCard key={book.openLibraryId} book={book} />
            ))}
          </div>
          <div className="flex justify-center gap-4">
            {pageNumber > 1 && (
              <Link
                href={`/books?q=${encodeURIComponent(q)}&page=${pageNumber - 1}`}
                className="text-sm font-medium underline underline-offset-4"
              >
                Previous
              </Link>
            )}
            {outcome.results.length === 20 && (
              <Link
                href={`/books?q=${encodeURIComponent(q)}&page=${pageNumber + 1}`}
                className="text-sm font-medium underline underline-offset-4"
              >
                Next
              </Link>
            )}
          </div>
        </>
      )}
    </div>
  );
}
