"use client";

import { Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function QuickSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    router.push(`/books?q=${encodeURIComponent(trimmed)}`);
    setIsOpen(false);
    setQuery("");
  };

  if (!isOpen) {
    return (
      <Button
        variant="ghost"
        size="icon"
        aria-label="Search"
        onClick={() => setIsOpen(true)}
      >
        <Search className="size-4" />
      </Button>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex items-center gap-1">
      <Input
        ref={inputRef}
        type="search"
        placeholder="Search books..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onBlur={() => !query && setIsOpen(false)}
        className="h-8 w-40 sm:w-56"
      />
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label="Close search"
        onClick={() => setIsOpen(false)}
      >
        <X className="size-4" />
      </Button>
    </form>
  );
}
