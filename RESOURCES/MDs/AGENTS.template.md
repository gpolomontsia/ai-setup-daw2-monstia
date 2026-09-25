# AGENTS.md

<!--
  Per-project template. Fill in everything marked <...> and delete what doesn't apply.
  Only include what an agent CAN'T work out by reading the repo. Generic rules
  (git, style, basic security) live in global-rules.md.
  Target: < 100 lines. Everything you add competes for the model's attention.
-->

## Project

<One or two sentences: what it is, who it's for, and its stage (prototype, beta, production).>

- Stack: <e.g. Next.js 15 (App Router) + TypeScript + Tailwind + Supabase>
- Package manager: <pnpm> — the lockfile is `<pnpm-lock.yaml>`; don't use any other manager.
- Runtime: <Node 22, see `.nvmrc`>

## Languages

<!-- Code is always in English and the agent replies in each person's language
     (global rules). This section only decides documentation and UI languages. -->

- Documentation: <es, en> — primary <es>. Layout: <`README.md` (es) + `README.en.md`>.
- UI: <es, en, ca> — default <es>. i18n with <next-intl>; translations in `<messages/{locale}.json>`.
- <Single language for now: don't set up i18n until I ask for it.>

<!-- If there's a language switcher, decide the following; the other rules are in the global rules. -->

- Language in the URL: <prefix on every route (`/es/...`, `/en/...`) | no prefix for the default language>.
- First visit: <browser language (`Accept-Language`) if supported; otherwise the default language>.
- User's choice: stored in <the `NEXT_LOCALE` cookie> and, when signed in, in <`profiles.locale`>.
- Switcher: <in the header and in account settings>.
- Missing keys: fall back to the default language in production and make <`pnpm test`> fail in development.

## Commands

```bash
<pnpm install>                           # install dependencies
<pnpm dev>                               # local server at <http://localhost:3000>
<pnpm test>                              # all tests
<pnpm test -- path/to/file.test.ts>      # a single file
<pnpm lint>
<pnpm typecheck>
```

## Definition of done

1. `<pnpm lint>`, `<pnpm typecheck>` and the affected tests pass.
2. If you changed logic, a test covers it (new or updated).
3. If you changed commands, environment variables or startup: update `README.md` and `.env.example`.
4. In your final summary, say what you verified and what you couldn't verify.

## Repo map

```text
<src/app/>        <routes and pages>
<src/lib/>        <business logic, no UI dependencies>
<src/lib/ai/>     <the only place that talks to model providers>
<prompts/>        <versioned system prompts>
<tests/>          <integration tests and fixtures>
```

## Project conventions

Only what isn't obvious from reading the code:

- <e.g. Server Components by default; `"use client"` only for interactive components.>
- <e.g. Remote data with TanStack Query; UI state with Zustand. Don't add another state library.>
- <e.g. Zod schemas in `src/lib/schemas/`, shared between client and server.>

## Skills

Installed in `.agents/skills/` and pinned in `skills-lock.json` with
`node ~/Projects/ai-setup/skills/skills.mjs install`. Don't use `npx skills add`.

- New project or large feature without a settled plan: use the `grilling` skill before writing code (I trigger it with `/grill-me`).
- Any UI work: follow `frontend-design` and, when done, review with `web-design-guidelines`.
- <Stack: e.g. `vue-best-practices`, `pinia`, `supabase-postgres-best-practices` — use them when touching that code.>

## Ask before touching

- <Migrations: `supabase/migrations/`>
- <Deployment and CI: `vercel.json`, `.github/workflows/`>
- <Framework config: `next.config.ts`>

## Known pitfalls

<!-- Add a line every time you have to correct the agent twice for the same thing. -->

- <e.g. Integration tests need `supabase start`; without it they fail with ECONNREFUSED.>

## AI model calls

<!-- Delete this section if the project doesn't use model APIs. -->

- All provider access goes through `<src/lib/ai/>`; the rest of the code never imports the SDK directly.
- The model name comes from configuration (`<AI_MODEL>`), never hardcoded in each call.
- Every call has a timeout, bounded retries and `maxTokens`. No unbounded calls in loops.
- Model output is untrusted input: validate it against a schema before using it.
- Text from users, websites or documents is passed as data, never concatenated into the system prompt.
- Don't log prompts or responses containing personal data.
- If you change a prompt in `<prompts/>`, run `<pnpm eval>` and explain the change in the commit.
- Warn me before any change that raises the cost per request (pricier model, more calls, more context).
