"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function SearchBar({ initialQuery = "" }: { initialQuery?: string }) {
  const [query, setQuery] = useState(initialQuery);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    startTransition(() => {
      router.push(`/books?q=${encodeURIComponent(trimmed)}`);
    });
  };

  return (
    <form onSubmit={onSubmit} className="flex gap-2">
      <Input
        type="search"
        placeholder="Search for a book or author..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        aria-label="Search books"
      />
      <Button type="submit" disabled={isPending}>
        <Search className="size-4" />
        {isPending ? "Searching..." : "Search"}
      </Button>
    </form>
  );
}
