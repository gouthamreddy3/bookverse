"use client";

import { Check, ListPlus, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { createReadingList, toggleBookInList } from "@/features/reading-lists/actions";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";

export function AddToListButton({
  bookId,
  initialLists,
}: {
  bookId: string;
  initialLists: { id: string; name: string; isMember: boolean }[];
}) {
  const router = useRouter();
  const [lists, setLists] = useState(initialLists);
  const [newListName, setNewListName] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleToggle = (listId: string) => {
    startTransition(async () => {
      const result = await toggleBookInList({ listId, bookId });
      if (result.success) {
        setLists((prev) =>
          prev.map((l) => (l.id === listId ? { ...l, isMember: result.added } : l))
        );
        router.refresh();
      }
    });
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const name = newListName.trim();
    if (!name) return;
    startTransition(async () => {
      const result = await createReadingList({ name });
      if (result.success) {
        setLists((prev) => [...prev, { id: result.id, name, isMember: false }]);
        setNewListName("");
        handleToggle(result.id);
      }
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="outline" disabled={isPending} />}>
        <ListPlus className="size-4" />
        Add to list
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        {lists.length === 0 && (
          <p className="px-2 py-1.5 text-sm text-muted-foreground">No lists yet.</p>
        )}
        {lists.map((list) => (
          <DropdownMenuItem key={list.id} onClick={() => handleToggle(list.id)}>
            {list.isMember && <Check className="size-4" />}
            {list.name}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <form onSubmit={handleCreate} className="flex items-center gap-1 px-2 py-1">
          <Input
            value={newListName}
            onChange={(e) => setNewListName(e.target.value)}
            placeholder="New list..."
            className="h-7 text-xs"
            onClick={(e) => e.stopPropagation()}
          />
          <Button type="submit" size="icon-xs" variant="ghost" aria-label="Create list">
            <Plus className="size-3" />
          </Button>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
