import StarterKit from "@tiptap/starter-kit";

/**
 * Shared between the client-side editor (review-editor.tsx) and the
 * server-side generateHTML() call used to render stored reviews. These MUST
 * stay in sync — a mismatch means content written with one mark/node type
 * renders incorrectly (or drops silently) on read.
 */
export const reviewEditorExtensions = [
  StarterKit.configure({
    heading: false,
    codeBlock: false,
  }),
];

export const EMPTY_DOC = { type: "doc", content: [{ type: "paragraph" }] };
