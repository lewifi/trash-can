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

## Next steps

- The AI endpoint uses model id `gemini-3.5-flash`. If appraisals error, confirm
  that id is valid for your key and adjust it in `src/worker.ts`.
- Account auth and gated submissions are not built yet; the planned next step is
  to add them, likely migrating storage from KV to D1 at that point.
