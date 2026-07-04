# BookVerse

A modern social platform for readers — track what you read, rate and review
books, build reading lists, and follow other readers. Inspired by the social
experience of Letterboxd, reimagined for books.

> **Status:** early development (foundation milestone). Not yet deployed.

## Tech Stack

| Layer      | Choice                                       |
| ---------- | --------------------------------------------- |
| Framework  | Next.js 16 (App Router)                       |
| Language   | TypeScript (strict)                           |
| UI         | React, Tailwind CSS, shadcn/ui                |
| Backend    | Next.js Route Handlers, Server Actions        |
| Database   | PostgreSQL                                    |
| ORM        | Prisma 6 (pinned — see note below)            |
| Auth       | Auth.js                                       |
| Validation | Zod                                           |
| Forms      | React Hook Form                               |
| Deployment | Vercel                                        |
| Book data  | Open Library API (Google Books as fallback)   |

## Project Structure

```
src/
├── app/                 # Routes only (App Router)
│   ├── (marketing)/     # Public/landing routes
│   └── (app)/           # Authenticated app routes
├── components/
│   ├── ui/               # shadcn/ui primitives
│   └── shared/            # Cross-feature reusable components
├── features/              # Feature modules (books, reviews, profiles, ...)
├── lib/                   # Utilities and helpers
├── config/                # Site config, constants
└── types/                 # Shared TypeScript types
prisma/                    # Prisma schema (schema.prisma) — no migrations yet
```

## Database Schema

The Prisma schema (`prisma/schema.prisma`) is fully designed but not yet
connected to a database — no migrations have been run. It models the full
Phase 1 domain (users, profiles, follows, books/authors/genres, ratings,
reviews, reading lists, reading status, comments, likes, activity feed,
notifications) plus Phase 2-ready models (quotes, achievements).

**Pinned to Prisma 6** (not 7): Prisma 7 requires a `prisma.config.ts` +
mandatory driver adapters and removes `datasource { url }` from the schema
file. `@auth/prisma-adapter`, which the upcoming Auth.js integration depends
on, only declares peer support up to Prisma 6. Revisit this pin once the
adapter ecosystem catches up.

## Getting Started

```bash
npm install
cp .env.example .env.local   # fill in values as features come online
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

See [`.env.example`](./.env.example). Nothing is required yet for the current
milestone — variables are documented ahead of the Prisma and Auth.js
integration milestones.

## Scripts

| Command          | Description               |
| ---------------- | -------------------------- |
| `npm run dev`     | Start the dev server       |
| `npm run build`   | Production build           |
| `npm run start`   | Run the production build   |
| `npm run lint`    | Lint the codebase          |

## License

MIT — see [LICENSE](./LICENSE).
