# TripWise frontend

React + Vite frontend. Use Node.js 24.

## Local verification

Run npm install (or npm ci), npm run lint, npm test, and npm run build.
The API tests use Node's experimental VM module support to load the existing Vite service modules with mocked fetch; they do not contact real providers.

## API routing

Every browser API request is same-origin and relative, for example `/api/auth/me`. The frontend never calls the backend origin directly, so the `tripwise.sid` session cookie is first-party and the browser sends it without any cross-site cookie exception.

Two proxies resolve that relative path:

- Development: the Vite dev server proxies `/api` to `VITE_API_URL` from `.env.development.local`, normally `http://localhost:3000`.
- Production: the `/api/:path*` rewrite in `vercel.json` proxies to the Railway backend before the SPA fallback.

`VITE_API_URL` is therefore a development-only proxy target and is never bundled into a production build. `npm run build` does not require it.

## Vercel

- Repository root: this client directory/repository.
- Framework: Vite.
- Install command: npm ci.
- Build command: npm run build.
- Output directory: dist.
- Node.js: 24.x.
- VITE_GOOGLE_CLIENT_ID: required, public Google Web client ID; must match the backend `GOOGLE_CLIENT_ID`.

Add VITE_GOOGLE_CLIENT_ID under Vercel -> Project -> Settings -> Environment Variables and tick it for **both** the Production and Preview environments. A variable added to only one environment leaves the other environment's build failing on the missing-value check, which is the usual cause of a failing PR Preview.

`VITE_API_URL` is no longer read during a build, so it can be removed from the Vercel dashboard. The backend origin lives in the `vercel.json` rewrite instead, which keeps the deployed origin in one reviewable place rather than split between a dashboard setting and application code.

`vercel.json` sets `Cache-Control: no-store` on `/api/:path*` so the CDN cannot cache an authenticated response and leak it to another visitor.

Because the browser now only ever talks to the Vercel origin, the backend's `FRONTEND_URL` must be the exact Vercel production origin. Do not add `*.vercel.app` to the CORS allowlist: the proxy means Preview hosts are not cross-site callers, but a wildcard would still let any Vercel deployment make credentialed requests.

Verify Google sign-in, verification/resend, password reset, refresh restoration, logout, profile, trip and payment flows in the deployed browser.

The audit changed request handling and auth failure/loading behavior while preserving the existing layout, styles, and routes. No deployment was performed.
