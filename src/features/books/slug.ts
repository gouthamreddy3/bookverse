const COMBINING_DIACRITICS = new RegExp("[\\u0300-\\u036f]", "g");
const WORK_ID_PATTERN = /(OL\d+W)$/;

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(COMBINING_DIACRITICS, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

/** e.g. buildBookSlug("The Hobbit", "OL27482W") -> "the-hobbit-OL27482W" */
export function buildBookSlug(title: string, openLibraryWorkId: string): string {
  const titlePart = slugify(title) || "book";
  return `${titlePart}-${openLibraryWorkId}`;
}

/** e.g. buildAuthorSlug("J.R.R. Tolkien", "OL26320A") -> "j-r-r-tolkien-OL26320A" */
export function buildAuthorSlug(name: string, openLibraryAuthorId: string): string {
  const namePart = slugify(name) || "author";
  return `${namePart}-${openLibraryAuthorId}`;
}

/** Extracts "OL27482W" from a slug like "the-hobbit-OL27482W", or null if malformed. */
export function parseOpenLibraryWorkId(slug: string): string | null {
  const match = slug.match(WORK_ID_PATTERN);
  return match?.[1] ?? null;
}

/** e.g. "/works/OL27482W" -> "OL27482W" */
export function stripWorksPrefix(workKey: string): string {
  return workKey.replace(/^\/works\//, "");
}

/** e.g. "/authors/OL26320A" -> "OL26320A" */
export function stripAuthorsPrefix(authorKey: string): string {
  return authorKey.replace(/^\/authors\//, "");
}
