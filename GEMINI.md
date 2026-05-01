# Wunschlistä (wunschlistae)

A self-hosted, sharable wunschlistä application built with SvelteKit, Prisma, and SQLite.

## Project Overview

- **Purpose:** Allows users to create wunschlistäs, share them with groups, and claim items.
- **Main Technologies:**
    - **Frontend:** [Svelte 5](https://svelte.dev/), [SvelteKit](https://kit.svelte.dev/), [Skeleton UI](https://www.skeleton.dev/), [Tailwind CSS 4](https://tailwindcss.com/).
    - **Backend:** SvelteKit (Node.js adapter), [Prisma ORM](https://www.prisma.io/), [SQLite](https://www.sqlite.org/).
    - **Authentication:** Custom session-based auth (Oslojs), supports OAuth (OpenID Connect) and Header-based auth.
    - **Internalization:** [svelte-i18n](https://github.com/kaisermann/svelte-i18n) (supports 20+ languages).
    - **Containerization:** Docker & Docker Compose.

## Architecture

- **SvelteKit:** Used for both UI and API routes (`src/routes`).
- **Prisma:** Manages the SQLite database schema (`prisma/schema.prisma`).
- **Server Logic:** Located in `src/lib/server/` (Auth, Config, Email, Items, Lists, etc.).
- **Components:** Modular Svelte components in `src/lib/components/`.
- **Styling:** Vanilla CSS and Tailwind CSS.
- **I18n:** Localization files in `src/i18n/`.

## Development Workflows

### Prerequisites
- Node.js v24.x
- pnpm v10.x

### Setup
1.  **Install dependencies:** `pnpm install`
2.  **Environment Variables:** Create `.env.development` (see `DEVELOPMENT.md` or `.env.example`).
3.  **Initialize Database:**
    ```bash
    source .env.development
    pnpm prisma generate
    pnpm prisma migrate dev
    pnpm prisma db seed
    pnpm db:patch
    ```

### Common Commands
- **Dev Server:** `pnpm dev`
- **Build:** `pnpm build`
- **Linting:** `pnpm lint`
- **Formatting:** `pnpm format`
- **Type Check:** `pnpm check`
- **Tests:** `pnpm test` (Playwright)

## Development Conventions

- **Svelte 5:** Uses runes (`$state`, `$derived`, etc.) where applicable.
- **Prisma Client:** Generated into `src/lib/generated/prisma`.
- **API Routes:** Prefer SvelteKit's standard `+server.ts` or `+page.server.ts` for backend logic.
- **Error Handling:** Centralized in `src/hooks.server.ts` using `handleError`.
- **Logging:** Uses `pino` for structured logging.
- **Branding:** Use the `Logo.svelte` component for all logo displays to ensure theme-aware rendering (e.g., shark fin color changes in dark mode). Favicons use `favicon.svg` for dynamic theme support in browsers.
- **Surgical Updates:** When modifying files, maintain existing patterns (naming, typing, and formatting).
