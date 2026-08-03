# CreatorIQ Backend

Backend API for the CreatorIQ AI-powered creator analytics SaaS. It provides authentication, OTP verification, Instagram OAuth/data sync, analytics snapshots, manual Instagram metrics fallback, Creator Score, AI insights, recommendations, AI chat with SSE streaming, creator-market news, personal notes, contact email delivery, health/readiness checks, rate limiting, Redis/BullMQ email infrastructure, and Jest coverage.

---

# Current Status

Overall backend completion: **97%**

Completed:

- JWT authentication and protected routes.
- Register, login, current user, password update.
- Email OTP verification and resend OTP.
- Zod request validation with structured errors.
- Auth and AI/contact/manual metrics rate limiting.
- Instagram OAuth connect URL and backend callback redirect.
- Instagram media sync.
- Analytics snapshot create/latest/history.
- Manual Instagram metrics fallback with Meta/manual/unavailable source labels.
- Creator Score with manual-estimate mode and auto snapshot creation when needed.
- Creator Insights and Recommendations.
- Creator News API backed by 29 public no-key source paths: GDELT category searches plus RSS/Atom feeds.
- Creator News cover extraction from RSS media fields and article `og:image` / Twitter image metadata.
- Optional Cloudinary upload for Creator News cover images.
- Daily Creator News cron job with manual refresh endpoint.
- Conversation CRUD and AI chat.
- SSE streaming chat endpoint.
- Personal notes CRUD with pin/archive/restore/delete flows.
- Public contact API with validation and safe email delivery.
- `/api/health` and `/api/ready`.
- Graceful shutdown and safe logging improvements.
- Jest suite passing locally.

Partial / production-dependent:

- Public Instagram OAuth depends on Meta app mode, redirect URI, app review, and a supported Instagram professional account.
- Contact delivery depends on production SMTP configuration.
- AI features depend on configured AI provider keys.
- No backend Instagram disconnect endpoint exists yet.
- No sync-status polling endpoint exists yet.

---

# Folder Structure

```text
backend/
  app.js                  # Express app, middleware, route mounting, health/readiness
  server.js               # Startup, service checks, jobs, graceful shutdown
  config/                 # DB, Redis, mail, security, env validation, Cloudinary
  controllers/            # HTTP request handlers
  jobs/                   # BullMQ email queue/worker and automation scheduler
  middlewares/            # Auth, validation, rate limiting, error handling, logging
  models/                 # Mongoose models
  routes/                 # Express route contracts
  services/               # Business logic and external provider integrations
  tests/                  # Jest tests
  utils/                  # Shared helpers
  validators/             # Zod schemas
  workers/                # Worker bootstrap modules
```

---

# API Surface

Public endpoints:

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/` | API root message |
| GET | `/api/health` | Basic backend health |
| GET | `/api/ready` | MongoDB/Redis readiness |
| POST | `/api/contact` | Public contact form delivery |
| POST | `/api/auth/register` | Register and send OTP |
| POST | `/api/auth/verify-email` | Verify OTP |
| POST | `/api/auth/resend-otp` | Resend OTP |
| POST | `/api/auth/login` | Login verified user |
| GET | `/api/instagram/oauth/callback` | Meta OAuth callback |

Protected endpoints:

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/auth/me` | Current user |
| PATCH | `/api/auth/password` | Update password |
| GET | `/api/dashboard/overview` | Dashboard account/summary |
| GET | `/api/instagram/connect` | Generate OAuth URL |
| PATCH | `/api/instagram/manual-metrics` | Save manual follower/following/media metrics |
| POST | `/api/instagram/media/sync` | Sync Instagram media |
| POST | `/api/instagram/analytics/snapshot` | Create analytics snapshot |
| GET | `/api/instagram/analytics/latest` | Latest snapshot |
| GET | `/api/instagram/analytics/history` | Snapshot history |
| POST | `/api/creator-score/calculate` | Calculate score |
| GET | `/api/creator-score/latest` | Latest score |
| GET | `/api/creator-score/history` | Score history |
| POST | `/api/creator-insights/generate` | Generate insights |
| GET | `/api/creator-insights` | List insights |
| POST | `/api/recommendations/generate` | Generate recommendations |
| GET | `/api/recommendations` | List recommendations |
| GET | `/api/creator-news` | List cached creator-market news |
| POST | `/api/creator-news/refresh` | Refresh creator-market news from GDELT |
| POST | `/api/conversation` | Create conversation |
| GET | `/api/conversation` | List conversations |
| GET | `/api/conversation/:conversationId/messages` | Message history |
| POST | `/api/conversation/:conversationId/chat` | Non-streaming chat |
| POST | `/api/conversation/:conversationId/chat/stream` | SSE streaming chat |
| PATCH | `/api/conversation/:conversationId` | Rename conversation |
| PATCH | `/api/conversation/:conversationId/archive` | Archive conversation |
| DELETE | `/api/conversation/:conversationId` | Soft-delete conversation |
| PATCH | `/api/conversation/:conversationId/restore` | Restore conversation |
| POST | `/api/notes` | Create note |
| GET | `/api/notes` | List notes |
| PATCH | `/api/notes/:noteId` | Update note |
| DELETE | `/api/notes/:noteId` | Soft-delete note |
| PATCH | `/api/notes/:noteId/restore` | Restore note |
| PATCH | `/api/notes/:noteId/archive` | Archive note |
| PATCH | `/api/notes/:noteId/unarchive` | Unarchive note |
| PATCH | `/api/notes/:noteId/pin` | Pin note |
| PATCH | `/api/notes/:noteId/unpin` | Unpin note |

---

# Manual Metrics Contract

Meta metrics are handled with three explicit source states:

- `meta`: provider-confirmed value returned by Meta.
- `manual`: user-confirmed value entered because Meta did not return the metric.
- `unavailable`: no provider or manual value is available.

Safety rules:

- Manual values require JWT ownership through the authenticated Instagram account lookup.
- Manual values must be non-negative integers up to `1_000_000_000`.
- User must send `confirmedByUser: true`.
- Provider-confirmed values are preferred over manual values.
- Manual values cannot replace provider-confirmed values.
- Missing values are not silently converted into fake zeroes.
- Creator Score stores `manual-estimate` metadata when manual values are used.

---

# SSE Chat Contract

Endpoint:

```http
POST /api/conversation/:conversationId/chat/stream
Authorization: Bearer <token>
Content-Type: application/json
```

Request body:

```json
{
  "message": "What should I post next?"
}
```

Events:

- `start`
- `model`
- `chunk`
- `error`
- `complete`

Response headers:

- `Content-Type: text/event-stream`
- `Cache-Control: no-cache`
- `Connection: keep-alive`

Known limitation: streaming provider fallback is not fully generalized; current SSE implementation is tied to the configured streaming provider path.

---

# Environment Variables

Use `backend/.env.example` as the source of truth.

- `PORT`
- `NODE_ENV`
- `MONGO_URI`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `REDIS_URL`
- `GROQ_API_KEY`
- `OPENAI_API_KEY`
- `GEMINI_API_KEY`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `CLOUDINARY_AI_CHAT_FOLDER`
- `EMAIL_USER`
- `EMAIL_PASSWORD`
- `EMAIL_FROM`
- `CONTACT_RECEIVER_EMAIL`
- `EMAIL_QUEUE_CONCURRENCY`
- `EMAIL_DELIVERY_TIMEOUT_MS`
- `OTP_RESEND_COOLDOWN_MS`
- `INSTAGRAM_APP_ID`
- `INSTAGRAM_APP_SECRET`
- `INSTAGRAM_REDIRECT_URI`
- `INSTAGRAM_FRONTEND_CALLBACK_URL`
- `META_GRAPH_VERSION`
- `FRONTEND_URL`
- `FRONTEND_ALLOWED_ORIGINS`
- `CREATOR_NEWS_REFRESH_CRON`

Never commit real `.env` values.

---

# Local Commands

Install and run:

```bash
cd backend
npm install
npm run dev
```

Test:

```bash
cd backend
npm test -- --runInBand
```

Health checks:

```text
http://localhost:5000/api/health
http://localhost:5000/api/ready
```

---

# Current Progress

- Backend completion: 97%
- API completion: 97%
- Database completion: 96%
- Authentication: 100%
- Email/OTP: 100% locally verified, production depends on SMTP
- Instagram integration: 88%, production depends on Meta app configuration/review
- Manual metrics fallback: 100%
- Analytics: 92%
- Creator Score: 94%
- AI features: 92%
- Contact system: 90%, production depends on SMTP
- Creator News: 92%, production depends on public GDELT/RSS availability and cover-image extraction quality
- Testing: 92%
- Documentation: 96%
- Deployment readiness: 89%

---

# Next Tasks

1. Run final backend tests and frontend lint/build.
2. Execute the complete manual E2E checklist.
3. Review Git diffs and remove accidental files.
4. Commit backend and frontend work logically.
5. Merge approved branches into `main`.
6. Push committed `main`.
7. Configure production backend environment.
8. Configure production database and Redis.
9. Configure production email delivery.
10. Configure production Meta OAuth redirect URI.
11. Deploy backend.
12. Verify `/api/health` and `/api/ready`.
13. Configure `VITE_API_BASE_URL`.
14. Deploy frontend.
15. Run live production smoke tests.
16. Complete Meta app review/live-mode work if public Instagram access is required.
