# Run and deploy your AI Studio app (Glitch Graveyard)

This contains everything you need to run your app locally and deploy it to Cloudflare Pages.

View your app in AI Studio: https://ai.studio/apps/5ef222d6-4914-4cfc-ba40-c96f708fd402

## Run Locally (Express Developer Server)

**Prerequisites:** Node.js

1. Install dependencies:
   ```bash
   npm install
   ```
2. Set the `GEMINI_API_KEY` in `.env` to your Gemini API key.
3. Run the app:
   ```bash
   npm run dev
   ```

## Run Locally (Cloudflare Pages Emulation)

If you want to run the project in a simulated Cloudflare environment (with serverless function edge routes and local Key-Value storage emulation):

1. Make sure your static assets are compiled first:
   ```bash
   npm run build
   ```
2. Start the wrangler development environment:
   ```bash
   npm run pages:dev
   ```
   This compiles your serverless routing Functions under the `/functions` folder and boots up the Wrangler server on `http://localhost:8788`.
3. If you want to supply environment variables (like `GEMINI_API_KEY`) to the serverless emulator, create a `.dev.vars` file in the root of the project:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

## Deploying to Cloudflare Pages

### 1. Set up Cloudflare KV Storage
Create a Key-Value storage namespace in your Cloudflare dashboard (under **Workers & Pages -> KV**):
1. Create a namespace called `GRAVEYARD_KV`.
2. Grab the KV namespace ID and update it in `wrangler.json` (under `kv_namespaces[0].id`).

### 2. Set up Environment Variables
In your Cloudflare Pages project settings:
1. Navigate to **Settings -> Environment variables**.
2. Add `GEMINI_API_KEY` as a variable in **Production** and **Preview** variables.

### 3. Deploy via Command Line
Run the deploy script:
```bash
npm run pages:deploy
```
This builds your React site and deploys it along with its Serverless API Functions automatically.
