"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import { Bold, Italic, List, ListOrdered, Quote, Strikethrough } from "lucide-react";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { upsertReview } from "@/features/reviews/actions";
import { StarRatingInput } from "@/features/reviews/components/star-rating-input";
import { EMPTY_DOC, reviewEditorExtensions } from "@/features/reviews/editor-extensions";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

function ToolbarButton({
  onClick,
  active,
  label,
  children,
}: {
  onClick: () => void;
  active: boolean;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      className={cn(
        "flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground",
        active && "bg-muted text-foreground"
      )}
    >
      {children}
    </button>
  );
}

export function ReviewEditor({
  bookId,
  initialContent,
  initialRating,
  initialSpoiler,
  onSuccess,
}: {
  bookId: string;
  initialContent?: object;
  initialRating?: number;
  initialSpoiler?: boolean;
  onSuccess?: () => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [rating, setRating] = useState(initialRating ?? 0);
  const [containsSpoilers, setContainsSpoilers] = useState(initialSpoiler ?? false);
  const [error, setError] = useState<string | null>(null);

  const editor = useEditor({
    extensions: reviewEditorExtensions,
    content: initialContent ?? EMPTY_DOC,
    immediatelyRender: false,
  });

  const onSubmit = () => {
    if (!editor) return;
    setError(null);

    startTransition(async () => {
      const result = await upsertReview({
        bookId,
        content: editor.getJSON(),
        containsSpoilers,
        ratingValue: rating > 0 ? rating : null,
      });

      if (!result.success) {
        setError(result.error);
        return;
      }

      onSuccess?.();
      router.refresh();
    });
  };

  if (!editor) return null;

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border p-4">
      <div className="flex items-center justify-between">
        <StarRatingInput value={rating} onChange={setRating} disabled={isPending} />
      </div>

      <div className="flex items-center gap-1 border-b border-border pb-2">
        <ToolbarButton
          label="Bold"
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Italic"
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Strikethrough"
          active={editor.isActive("strike")}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        >
          <Strikethrough className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Bullet list"
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Numbered list"
          active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Quote"
          active={editor.isActive("blockquote")}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <Quote className="size-4" />
        </ToolbarButton>
      </div>

      <EditorContent
        editor={editor}
        className="min-h-32 text-sm leading-relaxed [&_.tiptap]:min-h-32 [&_.tiptap]:outline-none [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-3 [&_blockquote]:italic"
      />

      <div className="flex items-center gap-2">
        <Checkbox
          id="spoiler"
          checked={containsSpoilers}
          onCheckedChange={(checked) => setContainsSpoilers(checked === true)}
        />
        <Label htmlFor="spoiler" className="text-sm font-normal text-muted-foreground">
          This review contains spoilers
        </Label>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex justify-end">
        <Button onClick={onSubmit} disabled={isPending}>
          {isPending ? "Saving..." : "Post review"}
        </Button>
      </div>
    </div>
  );
}
