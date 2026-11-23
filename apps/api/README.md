# Softhard CMS API

Express API for the institutional blog and contact-lead workflow. Firestore access stays on the server through Firebase Admin; never commit service-account files or credentials.

## Local setup

From the monorepo root, install dependencies and copy `.env.example` to `.env` inside `apps/api`. Set `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL` and `FIREBASE_PRIVATE_KEY`. In managed deployments, configure these as encrypted environment secrets. The private key accepts escaped `\\n` sequences or real line breaks. Alternatively, `FIREBASE_SERVICE_ACCOUNT_JSON` is supported as a single deployment secret. Application Default Credentials remain available when neither service-account option is set.

```powershell
npm install
npm run dev --workspace=api
```

Set `VITE_API_URL=http://localhost:3001` in `apps/web/.env.local` when the web app needs a non-default API address. `CORS_ORIGIN` accepts a comma-separated allowlist. Set `TRUST_PROXY=true` only when the API is behind a trusted reverse proxy so rate limits use the client IP.

## Routes

| Method | Route | Access | Purpose |
|---|---|---|---|
| GET | `/api/health` | Public | API status and whether a Firebase project ID is configured |
| GET | `/api/auth/me` | Firebase ID token | Resolve the signed-in CMS user's server-side role |
| GET | `/api/posts` | Public | Published posts; optional `category` query |
| GET | `/api/posts/:slug` | Public | One published post by slug |
| GET | `/api/admin/posts` | Firebase admin/editor | List posts; optional `status=draft\|published` |
| POST | `/api/admin/posts` | Firebase admin/editor | Create a post |
| PATCH | `/api/admin/posts/:id` | Firebase admin/editor | Update a post or publish/unpublish it |
| DELETE | `/api/admin/posts/:id` | Firebase admin | Delete a post |
| POST | `/api/leads` | Public, rate-limited | Receive a contact-form request |
| GET | `/api/admin/leads` | Firebase admin | List leads; optional `status` and `limit` |
| GET | `/api/admin/leads/:id` | Firebase admin | Read a lead and its activity |
| PATCH | `/api/admin/leads/:id` | Firebase admin | Update status, assignee, next step, follow-up date, or add a note |
| POST | `/api/blob/upload?category=blog\|content\|temp` | Firebase admin/editor | Upload an image to Vercel Blob (10 MB maximum) |
| DELETE | `/api/blob/delete` | Firebase admin/editor | Delete a public Vercel Blob image |

Admin requests must send `Authorization: Bearer <Firebase ID token>`. Admins are allowlisted in the server-only `CMS_ADMIN_EMAILS` variable (verified email required); editors use the `cmsRole=editor` custom claim. Only admins can access lead records because they contain contact information.

## Firestore collections

### `blog_posts`

Posts store `title`, unique `slug`, `content`, `coverImage`, `author`, `authorId`, `category`, `tags`, `status`, `publishedAt`, `createdAt`, `updatedAt`, and optional `seo.metaTitle` / `seo.metaDescription`. Status is `draft` or `published`. Public endpoints only return published records. Content is treated as text by the public web app; rich text is not inserted as raw HTML.

### `leads`

Public submissions store name, email, optional organization and phone, interest, message, source page, status, assignment, next step, follow-up date, timestamps, and an activity log. New requests start at `new`. Supported flow: `new → contacted → qualified → proposal → won/lost`. Lead reads and updates require an admin token. The public route is limited to five submissions per IP per 15 minutes and silently discards forms that fill the hidden honeypot field.

## Configuration notes

- `FIREBASE_PROJECT_ID` is required when a Firestore operation or token verification runs. No credentials are bundled with this source.
- `CMS_ADMIN_EMAILS` accepts a comma-separated list of verified admin addresses.
- `BLOB_READ_WRITE_TOKEN` is read only by the API. Do not prefix this token with `VITE_` or put it in the CMS environment.
- `FIREBASE_CLIENT_EMAIL` and `FIREBASE_PRIVATE_KEY` are service-account fields and must be configured as secrets for deployment.
- Never commit service-account credentials or add their values to `.env.example`.
- `FIREBASE_SERVICE_ACCOUNT_JSON` is also supported as a deployment secret; Application Default Credentials are used only when neither service-account configuration is supplied.
- Firebase Admin bypasses Firestore client rules, so the Express authentication and role checks are mandatory.
- The Softhard CMS authenticates through Firebase Authentication REST and calls these API routes; Firestore access and Blob credentials remain on the server.
