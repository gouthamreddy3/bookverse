import { BookCardSkeleton } from "@/features/books/components/book-card-skeleton";

export default function BooksSearchLoading() {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8 px-6 py-12">
      <div className="h-9 w-64 animate-pulse rounded bg-muted" />
      <div className="h-8 w-full max-w-md animate-pulse rounded bg-muted" />
      <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {Array.from({ length: 10 }).map((_, i) => (
          <BookCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
