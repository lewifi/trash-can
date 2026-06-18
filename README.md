# Glitch Graveyard — trash-can.net

An interactive memorial for dead software projects. A Vite + React single-page
app served by a single Cloudflare Worker that also exposes the `/api/*` backend
(project "dumps", likes/flowers, private venting rooms, and an AI "Waste
Management Consultant" powered by Gemini). State is stored in Workers KV.

## Architecture

```
Browser ──> Cloudflare Worker (src/worker.ts, Hono)
              ├── /api/*          -> handled by the Worker (KV + Gemini)
              └── everything else -> static assets from ./dist (the built SPA)
```

- Frontend: Vite + React 19 + Tailwind v4, built to `./dist`.
- Backend: one Worker (`src/worker.ts`) using Hono. `run_worker_first: ["/api/*"]`
  in `wrangler.jsonc` sends API requests to the Worker; all other paths are served
  from the static build, with SPA fallback to `index.html`.
- Storage: Workers KV namespace bound as `GRAVEYARD_KV`.
- Secret: `GEMINI_API_KEY` (runtime secret; the app falls back to a canned
  appraisal if it is not set).

## Run locally

```bash
npm install
cp .dev.vars.example .dev.vars   # then put your Gemini key in .dev.vars
npm run dev                      # builds the SPA, then runs `wrangler dev`
```

`wrangler dev` serves the SPA + API at http://localhost:8787.

## Deploy from the command line

```bash
npx wrangler secret put GEMINI_API_KEY   # one time, sets the production secret
npm run deploy                           # builds the SPA, then `wrangler deploy`
```

## Deploy automatically from GitHub (Workers Builds)

Set this up once in the Cloudflare dashboard:

1. Workers & Pages -> Create -> Workers -> Import a repository, and connect
   `github.com/lewifi/trash-can`.
2. Build settings:
   - Build command: `npm run build`
   - Deploy command: `npx wrangler deploy`
   - Branch: `main`
   - Root directory: leave blank (project is at the repo root)
3. Dependencies install automatically. There is no committed `package-lock.json`,
   so the build runs `npm install` and generates one.
4. After the first build, add the runtime secret:
   Worker -> Settings -> Variables and Secrets -> add `GEMINI_API_KEY` (Secret),
   then re-deploy.

The KV binding and asset config are already in `wrangler.jsonc`, so nothing else
needs dashboard setup.

### KV namespace

`wrangler.jsonc` points at a KV namespace already created for this project
(id `a6644daf2d85427ca08b03c8b1b07c14`, binding `GRAVEYARD_KV`). To make a new
one: `npx wrangler kv namespace create GRAVEYARD_KV` and paste the id in.

## Project layout

| Path                         | Purpose                                          |
| ---------------------------- | ------------------------------------------------ |
| `index.html`, `src/`         | React SPA (entry `src/main.tsx` -> `src/App.tsx`)|
| `src/worker.ts`              | Cloudflare Worker: API routes + asset fallback   |
| `src/server/initial-data.ts` | Seed data for the graveyard                      |
| `wrangler.jsonc`             | Worker + assets + KV configuration               |
| `vite.config.ts`             | Frontend build config (outputs to `./dist`)      |

## Moderation

New submissions are pre-screened by Gemini (see `moderateSubmission` in
`src/worker.ts`). It blocks genuinely harmful content (hate, harassment, sexual
content, doxxing, spam) while deliberately allowing the site's dark humor and
profanity about dead projects. It fails open: if the Gemini call errors, the
submission is allowed so users are never blocked by an outage. Rejections return
HTTP 422 with a reason. The model is `gemini-2.5-flash` (override via the
`GEMINI_MODEL` variable).

## Next steps

- No user accounts yet (intentionally, to keep submission friction low). If spam
  gets bad, options are a submission rate limit, a manual review queue, or social
  login (Google/GitHub) via D1.
- The AI model id is `gemini-2.5-flash`; adjust in `src/worker.ts` or via the
  `GEMINI_MODEL` env var if needed.
