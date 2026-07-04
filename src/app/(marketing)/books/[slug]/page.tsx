import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getBookBySlug } from "@/features/books/book-service";
import { BookHeader } from "@/features/books/components/book-header";

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
    <div className="mx-auto max-w-4xl px-6 py-12">
      <BookHeader book={book} />
    </div>
  );
}
