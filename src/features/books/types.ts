// Open Library API response shapes (only the fields we actually request/use).

export interface OpenLibrarySearchDoc {
  key: string; // "/works/OL27482W"
  title: string;
  author_name?: string[];
  author_key?: string[];
  first_publish_year?: number;
  isbn?: string[];
  cover_i?: number;
  subject?: string[];
}

export interface OpenLibrarySearchResponse {
  numFound: number;
  docs: OpenLibrarySearchDoc[];
}

export interface OpenLibraryWork {
  key: string;
  title: string;
  description?: string | { type: string; value: string };
  subjects?: string[];
  covers?: number[];
  authors?: { author: { key: string } }[];
  first_publish_date?: string;
}

export interface OpenLibraryAuthor {
  key: string;
  name: string;
  bio?: string | { type: string; value: string };
  photos?: number[];
}

/** A single representative edition — not necessarily the original printing. */
export interface OpenLibraryEdition {
  isbn_10?: string[];
  isbn_13?: string[];
  publishers?: string[];
  number_of_pages?: number;
  publish_date?: string;
}

// Our own view models, decoupled from Open Library's shape.

export interface BookSearchResult {
  openLibraryId: string;
  slug: string;
  title: string;
  authorNames: string[];
  firstPublishYear: number | null;
  coverImageUrl: string | null;
}

export interface BookSearchOutcome {
  query: string;
  page: number;
  totalCount: number;
  results: BookSearchResult[];
}

export interface AuthorSummary {
  id: string;
  name: string;
  photoUrl: string | null;
}

export interface BookDetail {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  coverImageUrl: string | null;
  publishedAt: Date | null;
  isbn10: string | null;
  isbn13: string | null;
  authors: AuthorSummary[];
  genres: string[];
  averageRating: number;
  ratingsCount: number;
}
