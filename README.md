# Creator Growth Analytics

AI-powered creator analytics SaaS for Instagram creators. The platform helps creators register and verify email, connect Instagram through Meta OAuth, sync analytics when Meta returns data, enter manual fallback metrics when Meta data is limited, calculate a Creator Score, generate insights and recommendations, chat with an AI assistant, manage notes, track creator-market news, and receive public contact submissions.

This README is the final deployment handoff for the backend and frontend.

---

## Current Status

Overall status: pre-production ready for final manual E2E and live deployment.

Completed:

- Full backend API with auth, OTP verification, Instagram OAuth, analytics, Creator Score, AI insights, recommendations, AI chat, notes, contact, manual metrics, and creator news.
- Full React frontend with public landing page, product story page, auth pages, protected app shell, dashboard, Instagram workspace, analytics, Creator Score, insights, recommendations, AI chat, notes, profile/settings, and Creator News.
- Manual metrics fallback for cases where Meta does not return follower/following/media values.
- Manual metrics graph on dashboard, analytics, and Creator Score pages.
- Creator News feed using 29 public no-key source paths: GDELT category searches plus RSS/Atom feeds.
- Creator News cover extraction from RSS media fields, article `og:image`, and Twitter image metadata.
- Optional Cloudinary upload for extracted Creator News covers.
- Daily backend cron job for creator-market news refresh.
- Email OTP and resend OTP flow.
- Public contact form with backend email delivery.
- Frontend lint and production build passing.
- Backend Jest tests passing.

Production-dependent:

- Meta app live mode / app review for public Instagram OAuth.
- Production MongoDB, Redis, SMTP, Cloudinary, and AI provider credentials.
- Production CORS and OAuth redirect URLs.
- Live smoke testing after deployment.

---

## Tech Stack

Backend:

- Node.js
- Express 5
- MongoDB / Mongoose
- Redis / ioredis
- BullMQ
- JWT
- Zod
- Nodemailer
- Cloudinary
- Meta Graph API
- AI providers
- GDELT public news API
- RSS/Atom feeds
- fast-xml-parser
- node-cron
- Jest / Supertest

Frontend:

- React 19
- Vite
- React Router
- TanStack Query
- Axios
- Recharts
- MUI
- lucide-react
- react-hot-toast
- Tailwind/PostCSS CSS pipeline

---

## Repository Structure

```text
social-media-analytics-dashboard/
  backend/
    app.js
    server.js
    config/
    controllers/
    jobs/
    middlewares/
    models/
    routes/
    services/
    tests/
    utils/
    validators/
    workers/
  frontend/
    src/
      api/
      components/
      config/
      context/
      features/
      hooks/
      layouts/
      pages/
      routes/
      services/
      theme/
      utils/
  README.md
  FINAL_DEPLOYMENT_MANUAL_CHECKLIST.md
  FINAL_REPOSITORY_READINESS_REPORT.md
  DEAD_CODE_CLEANUP_REPORT.md
```

Important backend folders:

- `backend/config`: environment loading, validation, security, Redis, MongoDB, Cloudinary, mail setup.
- `backend/controllers`: HTTP request handlers.
- `backend/routes`: Express API route contracts.
- `backend/services`: business logic and external integrations.
- `backend/models`: MongoDB schemas.
- `backend/middlewares`: auth, validation, rate limiting, logging, error handling.
- `backend/jobs`: cron jobs and email queue/worker logic.
- `backend/tests`: Jest test suite.

Important frontend folders:

- `frontend/src/pages`: route-level app pages.
- `frontend/src/routes`: React Router tree and auth guards.
- `frontend/src/services`: API service wrappers.
- `frontend/src/components`: reusable UI components.
- `frontend/src/features`: feature-specific UI/hooks.
- `frontend/src/config`: frontend env/config helpers.
- `frontend/src/utils`: formatting, API error, metrics, SSE helpers.

---

## Local Development

Run backend:

```bash
cd ~/Downloads/social-media-analytics-dashboard/backend
npm install
npm run dev
```

Backend local URL:

```text
http://localhost:5000
```

Run frontend:

```bash
cd ~/Downloads/social-media-analytics-dashboard/frontend
npm install
npm run dev -- --host 0.0.0.0 --port 5173 --strictPort
```

Frontend local URL:

```text
http://localhost:5173
```

Optional ngrok for local Instagram OAuth:

```bash
ngrok http 5000
```

Then set the backend callback URL in both `.env` and Meta Developer Dashboard:

```env
INSTAGRAM_REDIRECT_URI=https://your-ngrok-url.ngrok-free.app/api/instagram/oauth/callback
```

---

## Backend Environment Variables

Create `backend/.env` from `backend/.env.example`.

Required core:

```env
PORT=5000
NODE_ENV=production
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_long_random_jwt_secret
JWT_EXPIRES_IN=7d
REDIS_URL=your_redis_url
```

AI provider keys:

```env
GROQ_API_KEY=your_groq_key
OPENAI_API_KEY=your_openai_key
GEMINI_API_KEY=your_gemini_key
OPENROUTER_API_KEY=your_openrouter_key
TOGETHER_API_KEY=your_together_key
```

At least one supported AI provider key must be configured.

Cloudinary:

```env
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
CLOUDINARY_AI_CHAT_FOLDER=creator-growth/ai-chat
```

Email / OTP / contact:

```env
EMAIL_USER=your_smtp_username
EMAIL_PASSWORD=your_smtp_app_password
EMAIL_FROM="Creator Growth Analytics <no-reply@your-domain.com>"
CONTACT_RECEIVER_EMAIL=your_receiver_email
EMAIL_QUEUE_CONCURRENCY=3
EMAIL_DELIVERY_TIMEOUT_MS=15000
OTP_RESEND_COOLDOWN_MS=60000
```

Meta / Instagram OAuth:

```env
INSTAGRAM_APP_ID=your_meta_app_id
INSTAGRAM_APP_SECRET=your_meta_app_secret
INSTAGRAM_REDIRECT_URI=https://api.your-domain.com/api/instagram/oauth/callback
INSTAGRAM_FRONTEND_CALLBACK_URL=https://your-frontend-domain.com/instagram/callback
META_GRAPH_VERSION=v23.0
```

Frontend and CORS:

```env
FRONTEND_URL=https://your-frontend-domain.com
FRONTEND_ALLOWED_ORIGINS=https://your-frontend-domain.com
```

Creator News:

```env
CREATOR_NEWS_REFRESH_CRON="15 8 * * *"
CREATOR_NEWS_COVER_FETCH_LIMIT=4
CREATOR_NEWS_UPLOAD_IMAGES=false
CREATOR_NEWS_IMAGE_FOLDER=creator-growth/news-covers
```

Set `CREATOR_NEWS_UPLOAD_IMAGES=true` only if you want extracted news cover images uploaded to Cloudinary. Leave it `false` to use external image URLs directly and avoid Cloudinary upload usage.

Never commit real `.env` files.

---

## Frontend Environment Variables

Create `frontend/.env` from `frontend/.env.example`.

```env
VITE_API_BASE_URL=https://api.your-domain.com/api
VITE_CONTACT_EMAIL=your_public_contact_email
VITE_CONTACT_PHONE_DISPLAY=+91 70076 28757
VITE_CONTACT_PHONE_LINK=tel:+917007628757
```

Do not put backend secrets, SMTP credentials, OAuth secrets, JWT secrets, Cloudinary secrets, or AI provider keys in frontend env.

---

## Public Frontend Pages

| Route | Purpose |
|---|---|
| `/` | Public SaaS landing page |
| `/product` | Dynamic product story/demo page for resume and portfolio links |
| `/privacy` | Privacy page |
| `/terms` | Terms page |
| `/login` | Login |
| `/register` | Register |
| `/verify-email` | OTP verification |

---

## Protected Frontend Pages

| Route | Purpose |
|---|---|
| `/dashboard` | SaaS dashboard overview |
| `/instagram` | Instagram connection, sync, manual metrics |
| `/instagram/callback` | Frontend OAuth callback result page |
| `/analytics` | Analytics dashboard and metric graphs |
| `/creator-score` | Creator Score calculation and breakdown |
| `/insights` | Creator insights |
| `/recommendations` | AI recommendations |
| `/creator-news` | Reddit-style creator-market news feed |
| `/ai-chat` | AI chat workspace |
| `/notes` | Personal notes |
| `/profile` | User profile |
| `/settings` | Settings, password, theme, plan/usage UI |

---

## Public Backend APIs

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/` | API root message |
| GET | `/api/health` | Health check |
| GET | `/api/ready` | MongoDB/Redis readiness check |
| POST | `/api/contact` | Public contact form |
| POST | `/api/auth/register` | Register user and send OTP |
| POST | `/api/auth/verify-email` | Verify OTP |
| POST | `/api/auth/resend-otp` | Resend OTP |
| POST | `/api/auth/login` | Login verified user |
| GET | `/api/instagram/oauth/callback` | Meta OAuth callback |

---

## Protected Backend APIs

Protected APIs require:

```http
Authorization: Bearer <token>
```

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/auth/me` | Current user |
| PATCH | `/api/auth/password` | Update password |
| GET | `/api/dashboard/overview` | Dashboard summary |
| GET | `/api/instagram/connect` | Generate Meta OAuth URL |
| PATCH | `/api/instagram/manual-metrics` | Save manual Instagram metrics |
| POST | `/api/instagram/media/sync` | Sync Instagram media |
| POST | `/api/instagram/analytics/snapshot` | Create analytics snapshot |
| GET | `/api/instagram/analytics/latest` | Latest analytics snapshot |
| GET | `/api/instagram/analytics/history` | Analytics history |
| POST | `/api/creator-score/calculate` | Calculate Creator Score |
| GET | `/api/creator-score/latest` | Latest Creator Score |
| GET | `/api/creator-score/history` | Creator Score history |
| POST | `/api/creator-insights/generate` | Generate insights |
| GET | `/api/creator-insights` | List insights |
| POST | `/api/recommendations/generate` | Generate recommendations |
| GET | `/api/recommendations` | List recommendations |
| GET | `/api/creator-news` | List cached creator-market news |
| POST | `/api/creator-news/refresh` | Refresh creator-market news from public sources |
| POST | `/api/conversation` | Create conversation |
| GET | `/api/conversation` | List conversations |
| GET | `/api/conversation/:conversationId/messages` | Message history |
| POST | `/api/conversation/:conversationId/chat` | Non-streaming AI chat |
| POST | `/api/conversation/:conversationId/chat/stream` | SSE AI chat stream |
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

## Database Models

- `User`: registered users, password auth, email verification, plan/usage.
- `EmailVerificationOTP`: OTP verification records.
- `InstagramAccount`: connected Instagram account, tokens, provider/manual metrics.
- `InstagramMedia`: synced Instagram media records.
- `AnalyticsSnapshot`: analytics snapshots.
- `CreatorScore`: Creator Score records and metadata.
- `CreatorInsight`: AI insight records.
- `Recommendation`: AI recommendation records.
- `Conversation`: AI chat conversation metadata.
- `Message`: AI chat user/assistant messages.
- `PersonalNote`: notes, archive, pin, delete/restore state.
- `Memory`: AI contextual memory.
- `CreatorNewsItem`: cached creator-market news articles and cover image URLs.

---

## Manual Metrics Behavior

Meta may not return all metrics for every account, especially in development mode, with new creator accounts, or before app review. The app handles this honestly.

Metric source states:

- `meta`: provider-confirmed value from Meta.
- `manual`: user-confirmed value entered manually.
- `unavailable`: no provider or manual value available.

Manual metrics support:

- Followers
- Following
- Media/post count

When manual metrics exist:

- The frontend labels values as manual estimates.
- Dashboard, Analytics, and Creator Score render a responsive graph.
- Creator Score can calculate in limited estimate mode.
- Insights, recommendations, and AI chat explain data limitations.
- Provider-confirmed Meta values are preferred over manual values when available.

---

## Creator News Feature

The Creator News system gives logged-in users daily updates about the creator economy, Instagram creators, influencer marketing, AI tools, and platform updates.

Backend behavior:

- Uses 29 public no-key source paths.
- Uses GDELT category searches.
- Uses RSS/Atom feeds.
- Parses feeds with `fast-xml-parser`.
- Caches results in MongoDB.
- Auto-warms the cache if the news collection is empty.
- Runs a daily cron job controlled by `CREATOR_NEWS_REFRESH_CRON`.
- Supports manual refresh through `POST /api/creator-news/refresh`.
- Rate limits refresh requests.
- Extracts cover images from RSS media fields and article metadata.
- Optionally uploads extracted covers to Cloudinary.

Frontend behavior:

- `/creator-news` renders a Reddit-style scrolling feed.
- Shows category sections.
- Shows source/category/date badges.
- Shows cover image thumbnails or fallback visual cards.
- Shows source engine sidebar and trending section counts.
- Supports manual refresh from the UI.

Known dependency:

- Public news source availability can vary.
- Some articles may not expose usable cover images.
- Cloudinary cover upload is optional and disabled by default.

---

## AI Chat / SSE

Streaming endpoint:

```http
POST /api/conversation/:conversationId/chat/stream
Authorization: Bearer <token>
Content-Type: application/json
```

Events:

- `start`
- `model`
- `chunk`
- `error`
- `complete`

Frontend support:

- Fetch streaming
- Auth header
- `AbortController`
- Stop generation
- Buffered SSE parsing
- Persisted message refresh after completion

---

## Deployment Order

1. Review `git status --short`.
2. Confirm no real `.env` files are staged.
3. Push code to GitHub.
4. Create production MongoDB database.
5. Create production Redis instance.
6. Configure production SMTP/app password.
7. Configure Cloudinary credentials.
8. Configure AI provider keys.
9. Configure Meta app credentials.
10. Deploy backend first.
11. Verify backend `/api/health`.
12. Verify backend `/api/ready`.
13. Configure frontend `VITE_API_BASE_URL` to production backend `/api`.
14. Deploy frontend.
15. Configure production frontend URL in backend CORS env.
16. Configure production backend OAuth callback in Meta Developer Dashboard.
17. Run live E2E tests.

---

## Backend Deployment Notes

Backend start command:

```bash
npm install
npm start
```

Backend production health checks:

```text
https://api.your-domain.com/api/health
https://api.your-domain.com/api/ready
```

Backend host must support:

- Node.js 18+
- Long-running process
- Outbound HTTPS requests
- MongoDB access
- Redis access
- SMTP access
- Meta Graph API access
- Public RSS/GDELT requests

If using a platform with sleeping/free instances, first requests may be slow.

---

## Frontend Deployment Notes

Frontend build command:

```bash
npm install
npm run build
```

Frontend output:

```text
frontend/dist
```

Frontend host must configure:

```env
VITE_API_BASE_URL=https://api.your-domain.com/api
```

For single-page app routing, configure rewrite fallback:

```text
/* -> /index.html
```

Without SPA fallback, routes like `/dashboard`, `/creator-news`, and `/ai-chat` may 404 on browser refresh.

---

## Meta OAuth Production Setup

In Meta Developer Dashboard:

1. Set app domains.
2. Configure Instagram product.
3. Configure valid OAuth redirect URI:

```text
https://api.your-domain.com/api/instagram/oauth/callback
```

4. Ensure backend env matches exactly:

```env
INSTAGRAM_REDIRECT_URI=https://api.your-domain.com/api/instagram/oauth/callback
INSTAGRAM_FRONTEND_CALLBACK_URL=https://your-frontend-domain.com/instagram/callback
```

5. In development mode, only app admins/developers/testers can complete OAuth.
6. For public users, switch app to Live mode and complete Meta app review for required permissions.
7. Users need an Instagram professional/creator/business account for meaningful Graph API data.

---

## Validation Commands

Backend tests:

```bash
cd ~/Downloads/social-media-analytics-dashboard/backend
npm test -- --runInBand
```

Frontend lint:

```bash
cd ~/Downloads/social-media-analytics-dashboard/frontend
npm run lint
```

Frontend production build:

```bash
cd ~/Downloads/social-media-analytics-dashboard/frontend
npm run build
```

Git whitespace check:

```bash
cd ~/Downloads/social-media-analytics-dashboard
git diff --check
```

Direct Creator News service check:

```bash
cd ~/Downloads/social-media-analytics-dashboard/backend
node --check services/creatorNewsService.js
```

---

## Manual E2E Checklist

Before deployment:

- Register user.
- Verify OTP.
- Resend OTP.
- Login.
- Logout.
- Confirm protected routes redirect when logged out.
- Connect Instagram with test/admin account.
- Confirm OAuth callback returns to frontend.
- Sync media.
- Create analytics snapshot.
- Enter manual metrics if Meta data is missing.
- Confirm manual metrics graph renders.
- Calculate Creator Score.
- Generate insights.
- Generate recommendations.
- Open AI Chat.
- Create conversation.
- Send streaming AI message.
- Stop streaming message.
- Create/edit/archive/pin/restore/delete notes.
- Open Creator News.
- Refresh Creator News.
- Confirm news category sections render.
- Confirm news cover images or fallback visuals render.
- Submit contact form.
- Confirm email delivery.
- Check light/dark theme.
- Check mobile responsive layout.

After deployment:

- Verify live `/`.
- Verify live `/product`.
- Verify live auth/OTP/login.
- Verify live `/dashboard`.
- Verify live Instagram OAuth.
- Verify live manual metrics.
- Verify live `/analytics`.
- Verify live `/creator-score`.
- Verify live `/creator-news`.
- Verify live AI chat.
- Verify live contact delivery.

---

## Known Limitations

- Public Instagram OAuth depends on Meta app review/live mode.
- Meta may not return every metric for every account.
- Manual metrics are estimates and are labeled as such.
- No backend Instagram disconnect endpoint exists yet.
- No sync-status polling endpoint exists yet.
- Public news source availability and cover-image quality can vary.
- Cloudinary news-cover upload is optional and off by default.
- Production email delivery depends on SMTP configuration.
- AI features depend on provider keys and rate limits.

---

## Suggested Production Smoke Test Accounts

Use:

- One verified app user.
- One Instagram professional/creator/business account that is allowed in Meta app mode.
- One contact-form receiver email.
- One AI provider key with enough quota.

Do not use real customer accounts for first deployment tests.

---

## Deployment Chat Prompt

Paste this README into the deployment chat and ask it to:

1. Review backend and frontend deployment requirements.
2. Choose hosting platforms.
3. Create production env-variable checklist.
4. Deploy backend first.
5. Verify backend health/readiness.
6. Deploy frontend second.
7. Configure CORS and OAuth redirect URLs.
8. Verify SPA route fallback.
9. Run live E2E smoke tests.
10. Prepare final production launch checklist.
