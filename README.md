# TripWise frontend

React + Vite frontend. Use Node.js 24.

## Local verification

Run npm install (or npm ci), npm run lint, npm test, and npm run build.
The API tests use Node's experimental VM module support to load the existing Vite service modules with mocked fetch; they do not contact real providers.

## Vercel

- Repository root: this client directory/repository.
- Framework: Vite.
- Install command: npm ci.
- Build command: npm run build.
- Output directory: dist.
- Node.js: 24.x.
- VITE_API_URL: required, public HTTPS backend origin; do not append /api. Trailing slashes are normalized.
- VITE_GOOGLE_CLIENT_ID: required, public Google Web client ID; must match the backend GOOGLE_CLIENT_ID.

Set variables for each intended deployment environment before building. Rebuild when they change. Only public values belong in VITE_ variables. Never put backend secrets in this repository.

Add both variables under Vercel -> Project -> Settings -> Environment Variables and tick them for **both** the Production and Preview environments. A variable added to only one environment leaves the other environment's build failing on the missing-value check, which is the usual cause of a failing PR Preview. Do not add `*.vercel.app` to the backend CORS allowlist to work around a Preview host.

The build rejects missing configuration and HTTP/localhost production API targets. Local development values live in the gitignored `.env.development.local`, which Vite loads only in development mode, so `npm run dev` can use `http://localhost:3000` while `npm run build` still resolves the production origin from `.env` or the process environment.

vercel.json provides the React Router fallback for deep links and refreshes. Preview deployment origins must match the backend FRONTEND_URL configuration; a wildcard credentialed CORS policy is not used.

Verify Google sign-in, verification/resend, password reset, refresh restoration, logout, profile, trip and payment flows in the deployed browser. Browsers that block cross-site cookies can prevent sessions across separate Vercel/Railway domains; verify the intended browser settings and domain configuration.

The audit changed request handling and auth failure/loading behavior while preserving the existing layout, styles, and routes. No deployment was performed.
