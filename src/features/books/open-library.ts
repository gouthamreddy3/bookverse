import type {
  OpenLibraryAuthor,
  OpenLibraryEdition,
  OpenLibrarySearchResponse,
  OpenLibraryWork,
} from "@/features/books/types";

const BASE_URL = "https://openlibrary.org";
const COVERS_URL = "https://covers.openlibrary.org";

// Revalidate window for Open Library responses cached by Next's fetch layer —
// on top of our own Postgres-level cache for book detail pages.
const REVALIDATE_SECONDS = 3600;

export class OpenLibraryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OpenLibraryError";
  }
}

export async function searchOpenLibrary(
  query: string,
  page: number
): Promise<OpenLibrarySearchResponse> {
  const url = new URL("/search.json", BASE_URL);
  url.searchParams.set("q", query);
  url.searchParams.set("page", String(page));
  url.searchParams.set("limit", "20");
  url.searchParams.set(
    "fields",
    "key,title,author_name,author_key,first_publish_year,isbn,cover_i,subject"
  );

  const res = await fetch(url, { next: { revalidate: REVALIDATE_SECONDS } });
  if (!res.ok) {
    throw new OpenLibraryError(`Open Library search failed (${res.status})`);
  }
  return res.json();
}

export async function getOpenLibraryWork(workId: string): Promise<OpenLibraryWork> {
  const res = await fetch(`${BASE_URL}/works/${workId}.json`, {
    next: { revalidate: REVALIDATE_SECONDS },
  });
  if (!res.ok) {
    throw new OpenLibraryError(`Open Library work lookup failed (${res.status})`);
  }
  return res.json();
}

export async function getOpenLibraryAuthor(authorId: string): Promise<OpenLibraryAuthor> {
  const res = await fetch(`${BASE_URL}/authors/${authorId}.json`, {
    next: { revalidate: REVALIDATE_SECONDS },
  });
  if (!res.ok) {
    throw new OpenLibraryError(`Open Library author lookup failed (${res.status})`);
  }
  return res.json();
}

/** Returns a single representative edition — not necessarily the original printing. */
export async function getOpenLibraryEdition(
  workId: string
): Promise<OpenLibraryEdition | null> {
  const res = await fetch(`${BASE_URL}/works/${workId}/editions.json?limit=1`, {
    next: { revalidate: REVALIDATE_SECONDS },
  });
  if (!res.ok) {
    throw new OpenLibraryError(`Open Library edition lookup failed (${res.status})`);
  }
  const data = await res.json();
  return data.entries?.[0] ?? null;
}

export function coverImageUrl(coverId: number, size: "S" | "M" | "L" = "M"): string {
  return `${COVERS_URL}/b/id/${coverId}-${size}.jpg`;
}

export function authorPhotoUrl(authorOpenLibraryId: string, size: "S" | "M" | "L" = "M"): string {
  return `${COVERS_URL}/a/olid/${authorOpenLibraryId}-${size}.jpg`;
}

/**
 * Open Library's first_publish_date is a loosely formatted free-text string
 * ("January 1938", "1937", sometimes a full date). Rather than trust Date's
 * string parser (timezone-dependent, unreliable near year boundaries), we
 * extract just the year and anchor it to UTC midnight — deterministic, and
 * immune to the local-timezone-shift bug that would otherwise show the wrong
 * year for books published in January when read back with getFullYear().
 */
export function parsePublishedYear(dateString: string | undefined): Date | null {
  if (!dateString) return null;
  const match = dateString.match(/\d{4}/);
  if (!match) return null;
  return new Date(Date.UTC(Number(match[0]), 0, 1));
}

/** Open Library represents free text as either a plain string or { type, value }. */
export function normalizeOpenLibraryText(
  text: string | { type: string; value: string } | undefined
): string | null {
  if (!text) return null;
  if (typeof text === "string") return text;
  return text.value ?? null;
}
