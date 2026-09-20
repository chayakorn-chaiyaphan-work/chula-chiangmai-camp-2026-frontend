# Chula Chiang Mai Camp 2026 Frontend

English-first LINE LIFF web app for camp participants, staff, and administrators. It uses the Go Fiber API in the sibling backend repository and keeps authentication in a backend-issued `HttpOnly` cookie.

## Stack

- React 19, TypeScript, and Vite
- React Router with History API routes
- TanStack Query for API state
- React Hook Form and Zod for registration validation
- LINE LIFF SDK for login only
- Lucide icons and a custom responsive CSS system

## Security Model

The frontend never sends or stores a LINE user ID as identity. When no backend session exists, it initializes LIFF, obtains the raw LINE ID token, and sends only that token to `POST /auth/line`. The backend verifies it with LINE and sets `camp_session` as an `HttpOnly` cookie.

- API requests use `credentials: "include"`.
- No JWT is exposed to JavaScript, local storage, or console output.
- Bearer authentication is not used.
- Admin routes are hidden in the UI and independently enforced by the backend.
- Production frontend and API hosts should be same-site, for example `camp.example.org` and `api.camp.example.org`, because the session cookie uses `SameSite=Lax`.

## Environment

Copy `.env.example` to `.env.local`:

```env
VITE_LIFF_ID=1234567890-AbCdEfGh
VITE_API_BASE_URL=/api
VITE_BACKEND_PROXY_TARGET=http://localhost:8080
```

`VITE_BACKEND_PROXY_TARGET` is used only by the Vite development proxy. In production, set `VITE_API_BASE_URL` to the public API origin, such as `https://api.camp.example.org`, or route `/api` to the backend at the load balancer/CDN.

Do not put a LINE channel access token, channel secret, JWT secret, or database credential in a `VITE_*` variable. Vite values are public browser configuration.

## Local Development

Start the backend on port `8080`, then run:

```powershell
npm ci
Copy-Item .env.example .env.local
npm run dev
```

Open `http://localhost:5173`. The dev server proxies `/api/*` to the backend and removes the `/api` prefix.

For local LIFF testing, expose port `5173` through an HTTPS tunnel and add that exact tunnel origin to the backend `CORS_ALLOWED_ORIGINS`. Keep the backend private on port `8080`; requests reach it through the Vite proxy.

## LINE LIFF Setup

Create one LIFF app in the LINE Login channel:

1. Set the Endpoint URL to `https://YOUR_FRONTEND_HOST/`.
2. Use the `Full` LIFF app size.
3. Enable the `openid` and `profile` scopes.
4. Link the LINE Login channel to the Official Account used by the Messaging API.
5. Put the LIFF ID in `VITE_LIFF_ID` at frontend build time.

The app uses History API routes. Rich Menu links append these paths to the same LIFF ID:

- `/home`
- `/group`
- `/scoreboard`
- `/buddy`
- `/activities`
- `/profile`

Your CDN or web server must return `index.html` for unknown paths. The included Nginx configuration already does this.

## Screens

Participant experience:

- Home summary, latest announcement, and next activity
- Registration and profile editing
- Group members and mentors
- Live scoreboard
- Latest Buddy/Budder pairing
- Published activity schedule

Admin workspace:

- Operational dashboard
- Group creation and member assignment
- Append-only score events
- Separate participant and staff/admin buddy generation
- Activity drafting, publishing, and cancellation
- Targeted LINE announcements and delivery history

## Rich Menu

The production-ready image is [public/rich-menu.png](public/rich-menu.png), exactly `2500x1686` and split into a 2x3 action grid. Its editable renderer is `rich-menu.html` with `src/rich-menu.tsx` and `src/styles/rich-menu.css`.

To create, upload, and set the menu as the OA default after reviewing the image:

```powershell
$env:LINE_CHANNEL_ACCESS_TOKEN = "YOUR_MESSAGING_API_TOKEN"
$env:LINE_LIFF_ID = "YOUR_LIFF_ID"
npm run rich-menu:publish
```

The publishing script reads secrets only from the process environment. It does not store them in the repository.

## Checks

```powershell
npm run build
npm test
npm run lint
```

## Container Deployment

Build the Nginx image with public build-time configuration:

```powershell
docker build `
  --build-arg VITE_LIFF_ID="YOUR_LIFF_ID" `
  --build-arg VITE_API_BASE_URL="https://api.camp.example.org" `
  -t chula-camp-frontend .
docker run --rm -p 5173:8080 chula-camp-frontend
```

The container listens on `8080` and works with AWS App Runner. Static hosting on S3 and CloudFront is also suitable; configure a fallback from 403/404 to `/index.html` for SPA routes.
