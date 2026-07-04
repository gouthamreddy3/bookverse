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
prisma/                    # Prisma schema, migrations
```

## Database Schema

The Prisma schema (`prisma/schema.prisma`) models the full Phase 1 domain
(users, profiles, follows, books/authors/genres, ratings, reviews, reading
lists, reading status, comments, likes, activity feed, notifications) plus
Phase 2-ready models (quotes, achievements). It's connected to a
[Neon](https://neon.tech) Postgres database, with the initial migration
applied.

**Pinned to Prisma 6** (not 7): Prisma 7 requires a `prisma.config.ts` +
mandatory driver adapters and removes `datasource { url }` from the schema
file. `@auth/prisma-adapter`, which the upcoming Auth.js integration depends
on, only declares peer support up to Prisma 6. Revisit this pin once the
adapter ecosystem catches up.

**Neon connection strings:** the schema declares both `url` (pooled, via
PgBouncer — used by the app at runtime) and `directUrl` (unpooled — used by
Prisma Migrate). Both are required; get them from your Neon project's
Connection Details panel.

## Getting Started

```bash
npm install
cp .env.example .env.local   # fill in your own Neon connection strings
npm run db:migrate           # apply migrations to your database
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

See [`.env.example`](./.env.example): `DATABASE_URL` and `DIRECT_URL` (Neon
Postgres) are required. Auth.js and Google Books variables are documented
ahead of their integration milestones — not required yet.

## Scripts

| Command             | Description                              |
| ------------------- | ------------------------------------------ |
| `npm run dev`        | Start the dev server                      |
| `npm run build`      | Production build                          |
| `npm run start`      | Run the production build                  |
| `npm run lint`       | Lint the codebase                         |
| `npm run db:migrate` | Create/apply a Prisma migration (dev)     |
| `npm run db:generate`| Regenerate the Prisma Client              |
| `npm run db:studio`  | Open Prisma Studio                        |
| `npm run db:deploy`  | Apply pending migrations (production)     |

## License

MIT — see [LICENSE](./LICENSE).
