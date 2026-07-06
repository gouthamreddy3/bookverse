import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getBookBySlug } from "@/features/books/book-service";
import { BookHeader } from "@/features/books/components/book-header";
import { ReadingActions } from "@/features/reading-lists/components/reading-actions";
import { ReviewsSection } from "@/features/reviews/components/reviews-section";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const book = await getBookBySlug(slug);
  return { title: book?.title ?? "Book not found" };
}

export default async function BookDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const book = await getBookBySlug(slug);

  if (!book) notFound();

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-12 px-6 py-12">
      <BookHeader book={book} />
      <ReadingActions bookId={book.id} />
      <ReviewsSection
        bookId={book.id}
        averageRating={book.averageRating}
        ratingsCount={book.ratingsCount}
      />
    </div>
  );
}
