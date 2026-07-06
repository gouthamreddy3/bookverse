"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { createReadingList } from "@/features/reading-lists/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function CreateListForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [isPending, startTransition] = useTransition();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    startTransition(async () => {
      const result = await createReadingList({ name: trimmed });
      if (result.success) {
        setName("");
        router.refresh();
      }
    });
  };

  return (
    <form onSubmit={onSubmit} className="flex gap-2">
      <Input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="New list name..."
      />
      <Button type="submit" disabled={isPending}>
        {isPending ? "Creating..." : "Create list"}
      </Button>
    </form>
  );
}
