export default function HomePage() {
  return (
    <div className="flex flex-1 flex-col">
      <main className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <h1 className="font-serif text-4xl italic tracking-tight sm:text-6xl">
          Every book has a story.
        </h1>
        <p className="mt-4 max-w-md text-balance text-muted-foreground">
          BookVerse is a home for readers to track what they read, share what
          they think, and discover what to read next.
        </p>
      </main>
    </div>
  );
}
