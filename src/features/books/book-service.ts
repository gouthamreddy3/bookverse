import "server-only";

import { Prisma } from "@prisma/client";
import { cache } from "react";

import { prisma } from "@/lib/prisma";
import {
  authorPhotoUrl,
  coverImageUrl,
  getOpenLibraryAuthor,
  getOpenLibraryEdition,
  getOpenLibraryWork,
  normalizeOpenLibraryText,
  parsePublishedYear,
  searchOpenLibrary,
} from "@/features/books/open-library";
import {
  buildAuthorSlug,
  buildBookSlug,
  parseOpenLibraryWorkId,
  slugify,
  stripAuthorsPrefix,
  stripWorksPrefix,
} from "@/features/books/slug";
import type { BookDetail, BookSearchOutcome, BookSearchResult } from "@/features/books/types";

const MAX_GENRES_PER_BOOK = 5;

export async function searchBooks(query: string, page = 1): Promise<BookSearchOutcome> {
  const trimmed = query.trim();
  if (!trimmed) {
    return { query: trimmed, page, totalCount: 0, results: [] };
  }

  const response = await searchOpenLibrary(trimmed, page);

  const results: BookSearchResult[] = response.docs.map((doc) => {
    const openLibraryId = stripWorksPrefix(doc.key);
    return {
      openLibraryId,
      slug: buildBookSlug(doc.title, openLibraryId),
      title: doc.title,
      authorNames: doc.author_name ?? [],
      firstPublishYear: doc.first_publish_year ?? null,
      coverImageUrl: doc.cover_i ? coverImageUrl(doc.cover_i) : null,
    };
  });

  return { query: trimmed, page, totalCount: response.numFound, results };
}

function toBookDetail(book: {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  coverImageUrl: string | null;
  publishedAt: Date | null;
  isbn10: string | null;
  isbn13: string | null;
  averageRating: unknown;
  ratingsCount: number;
  authors: { author: { id: string; name: string; photoUrl: string | null } }[];
  genres: { genre: { name: string } }[];
}): BookDetail {
  return {
    id: book.id,
    slug: book.slug,
    title: book.title,
    subtitle: book.subtitle,
    description: book.description,
    coverImageUrl: book.coverImageUrl,
    publishedAt: book.publishedAt,
    isbn10: book.isbn10,
    isbn13: book.isbn13,
    averageRating: Number(book.averageRating),
    ratingsCount: book.ratingsCount,
    authors: book.authors.map(({ author }) => ({
      id: author.id,
      name: author.name,
      photoUrl: author.photoUrl,
    })),
    genres: book.genres.map(({ genre }) => genre.name),
  };
}

const bookWithRelations = {
  include: {
    authors: { include: { author: true }, orderBy: { position: "asc" as const } },
    genres: { include: { genre: true } },
  },
};

/**
 * Resolves a book detail page from its slug. Cache hit: served entirely from
 * Postgres, zero external calls. Cache miss: fetches from Open Library,
 * upserts Book/Author/BookAuthor/Genre/BookGenre, then serves. Returns null
 * if the slug is malformed or the work doesn't exist on Open Library.
 *
 * Wrapped in React's cache() so generateMetadata and the page body — which
 * both call this with the same slug in one request — only trigger it once.
 */
export const getBookBySlug = cache(async (slug: string): Promise<BookDetail | null> => {
  const openLibraryId = parseOpenLibraryWorkId(slug);
  if (!openLibraryId) return null;

  const cached = await prisma.book.findUnique({
    where: { openLibraryId },
    ...bookWithRelations,
  });
  if (cached) return toBookDetail(cached);

  return syncBookFromOpenLibrary(openLibraryId, slug);
});

async function syncBookFromOpenLibrary(
  openLibraryId: string,
  slug: string
): Promise<BookDetail | null> {
  let work;
  try {
    work = await getOpenLibraryWork(openLibraryId);
  } catch {
    return null;
  }

  const [edition, authorRefs] = await Promise.all([
    getOpenLibraryEdition(openLibraryId).catch(() => null),
    Promise.all(
      (work.authors ?? []).map(async ({ author }) => {
        const authorId = stripAuthorsPrefix(author.key);
        try {
          const details = await getOpenLibraryAuthor(authorId);
          const hasPhoto = details.photos?.some((id) => id > 0) ?? false;
          return {
            openLibraryId: authorId,
            name: details.name,
            bio: normalizeOpenLibraryText(details.bio),
            photoUrl: hasPhoto ? authorPhotoUrl(authorId) : null,
          };
        } catch {
          return { openLibraryId: authorId, name: authorId, bio: null, photoUrl: null };
        }
      })
    ),
  ]);

  const isbn10 = edition?.isbn_10?.[0] ?? null;
  const isbn13 = edition?.isbn_13?.[0] ?? null;
  const publisher = edition?.publishers?.[0] ?? null;
  const pageCount = edition?.number_of_pages ?? null;
  const coverId = work.covers?.find((id) => id > 0);
  const genreNames = (work.subjects ?? []).slice(0, MAX_GENRES_PER_BOOK);

  try {
    const book = await prisma.$transaction(async (tx) => {
      const created = await tx.book.upsert({
        where: { openLibraryId },
        create: {
          openLibraryId,
          title: work.title,
          slug,
          description: normalizeOpenLibraryText(work.description),
          coverImageUrl: coverId ? coverImageUrl(coverId, "L") : null,
          publishedAt: parsePublishedYear(work.first_publish_date),
          isbn10,
          isbn13,
          publisher,
          pageCount: pageCount ?? undefined,
        },
        update: {},
      });

      for (const [index, authorRef] of authorRefs.entries()) {
        const author = await tx.author.upsert({
          where: { openLibraryId: authorRef.openLibraryId },
          create: {
            openLibraryId: authorRef.openLibraryId,
            name: authorRef.name,
            slug: buildAuthorSlug(authorRef.name, authorRef.openLibraryId),
            bio: authorRef.bio,
            photoUrl: authorRef.photoUrl,
          },
          update: {},
        });

        await tx.bookAuthor.upsert({
          where: { bookId_authorId: { bookId: created.id, authorId: author.id } },
          create: { bookId: created.id, authorId: author.id, position: index },
          update: {},
        });
      }

      for (const name of genreNames) {
        const genreSlug = slugify(name);
        if (!genreSlug) continue;

        const genre = await tx.genre.upsert({
          where: { slug: genreSlug },
          create: { name, slug: genreSlug },
          update: {},
        });

        await tx.bookGenre.upsert({
          where: { bookId_genreId: { bookId: created.id, genreId: genre.id } },
          create: { bookId: created.id, genreId: genre.id },
          update: {},
        });
      }

      return tx.book.findUniqueOrThrow({
        where: { id: created.id },
        ...bookWithRelations,
      });
    });

    return toBookDetail(book);
  } catch (error) {
    // Next.js Link prefetch can race the actual navigation, so two requests
    // for the same never-before-seen book can hit this sync concurrently.
    // Whichever loses the race hits a unique constraint conflict here —
    // treat that as success and read back what the winner just created,
    // rather than surfacing a spurious error for a book that now exists.
    const isConflict =
      error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
    if (!isConflict) throw error;

    const existing = await prisma.book.findUnique({
      where: { openLibraryId },
      ...bookWithRelations,
    });
    return existing ? toBookDetail(existing) : null;
  }
}
