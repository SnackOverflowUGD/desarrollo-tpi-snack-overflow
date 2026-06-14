# Snack Overflow — Frontend (`client/`)

Next.js 16 (App Router) + React 19 + Tailwind v4 + shadcn/ui. UI in es-AR.
The binding visual baseline is [`DESIGN-SYSTEM.md`](./DESIGN-SYSTEM.md) (single
source of truth for tokens, fonts, components, a11y).

## Getting Started

The NestJS backend owns port **3000**, so run the frontend on **3001**:

```bash
npm run dev -- -p 3001
```

Open [http://localhost:3001](http://localhost:3001).

### Backend proxy (no CORS)

The browser never calls the backend cross-origin. Instead, the client calls the
same-origin relative path `/api/...`, which Next rewrites to the backend (see
`next.config.ts`). For example, registration POSTs to `/api/auth/register` and
is proxied to `http://localhost:3000/auth/register`.

The backend base URL is configurable via the **server-only** `BACKEND_URL` env
var (default `http://localhost:3000`). No `NEXT_PUBLIC_*` var is needed.

```bash
# optional override
BACKEND_URL=http://localhost:3000 npm run dev -- -p 3001
```

## Stack notes

- **Tailwind v4**: CSS-native config. Tokens live in `app/globals.css` inside
  the `@theme { }` block (no `tailwind.config.js`).
- **Fonts**: Fraunces (display), Figtree (sans), IBM Plex Mono (mono) via
  `next/font/google`, wired to the `@theme` font tokens.
- **Forms**: react-hook-form + zod. Validation schema in `lib/validation/`.
- **Dark mode**: class-based via `next-themes` (first-class theme).

## Scripts

```bash
npm run dev      # dev server (use -- -p 3001)
npm run build    # production build
npm run lint     # eslint
npm run test:e2e # playwright
```
