# Creator Growth Analytics

AI-powered creator analytics SaaS for Instagram creators. The app helps users register, verify email, connect Instagram through Meta OAuth, sync available creator data, manually add missing Instagram metrics when Meta does not return them, calculate creator score, generate insights/recommendations, chat with an AI assistant, manage personal notes, and submit public contact requests.

This README is written as a deployment handoff document for both backend and frontend.

---

# Tech Stack

- Backend: Node.js, Express 5, MongoDB/Mongoose, Redis/ioredis, BullMQ, JWT, Zod, Nodemailer, Cloudinary, Meta Graph API, AI providers.
- Frontend: React 19, Vite, React Router, TanStack Query, Axios, Recharts, MUI, lucide-react, react-hot-toast, Tailwind/PostCSS CSS pipeline.
- Testing: Jest, Supertest, mongodb-memory-server, oxlint, Vite production build.
- External services: MongoDB Atlas, Redis, Gmail/SMTP app password, Meta Instagram OAuth, Cloudinary, AI provider keys.

---

# Current Project Status

Overall status: pre-production ready after local QA.

Completed:

- Backend authentication with email OTP verification and resend OTP.
- JWT protected API flow.
- Frontend authentication pages and protected route handling.
- SaaS dashboard shell and product pages.
- AI chat workspace with conversation CRUD and streaming-ready SSE flow.
- Analytics, creator score, creator insights, recommendations, notes, profile/settings UI.
- Instagram OAuth connection flow.
- Instagram media sync and analytics snapshot flow.
- Manual Instagram metrics fallback when Meta does not return metrics.
- Public SaaS landing page with contact form.
- Public contact API with email delivery.
- Light/dark compatible UI states, loading states, empty states, and error states.
- Backend and frontend README/report documentation.
- Dead placeholder backend files removed.

In progress / deployment validation:

- Real hosted OAuth redirect URI validation.
- Production domain CORS validation.
- Real Meta app review/live-mode verification.
- Production email delivery verification.

Pending:

- Final deployment to hosting providers.
- Production smoke test on live URL.
- Optional payment/subscription backend if the SaaS becomes paid.
- Optional sync-status polling endpoint for long-running Instagram jobs.
- Optional backend disconnect route for Instagram.

---

# Folder Structure

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
      features/
      hooks/
      layouts/
      pages/
      routes/
      services/
      utils/
  README.md
  *_REPORT.md
  *_CHECKLIST.md
```

Important folders:

- `backend/config`: environment validation, security, Redis, MongoDB, Cloudinary, AI provider setup.
- `backend/controllers`: request handlers for auth, Instagram, analytics, chat, notes, contact, and scoring.
- `backend/middlewares`: auth protection, validation, rate limiting, logging, error handling.
- `backend/models`: MongoDB schemas for users, Instagram accounts, snapshots, scores, insights, conversations, notes, and recommendations.
- `backend/routes`: Express API contracts mounted from `backend/app.js`.
- `backend/services`: business logic and external service integration.
- `backend/tests`: backend unit/integration tests.
- `backend/validators`: Zod request validation.
- `frontend/src/components`: reusable UI components.
- `frontend/src/features`: feature-specific modules such as analytics and chat.
- `frontend/src/pages`: route-level product pages.
- `frontend/src/services`: frontend API wrappers.
- `frontend/src/routes`: React Router route tree and auth guards.
- `frontend/src/utils`: formatting, API error handling, metric source helpers, SSE parser.

---

# Application Pages

Public frontend pages:

- `/` landing page
- `/privacy`
- `/terms`
- `/login`
- `/register`
- `/verify-email`

Protected frontend pages:

- `/dashboard`
- `/analytics`
- `/creator-score`
- `/insights`
- `/recommendations`
- `/ai-chat`
- `/notes`
- `/instagram`
- `/instagram/callback`
- `/profile`
- `/settings`

---

# Public API Endpoints

These endpoints do not require a JWT:

| Method | Endpoint | Purpose | Status |
|---|---|---|---|
| GET | `/` | API root health message | Complete |
| GET | `/api/health` | Basic service health | Complete |
| GET | `/api/ready` | MongoDB and Redis readiness check | Complete |
| POST | `/api/contact` | Public landing-page contact form | Complete |
| POST | `/api/auth/register` | Register user and send OTP | Complete |
| POST | `/api/auth/verify-email` | Verify email OTP | Complete |
| POST | `/api/auth/resend-otp` | Resend email OTP | Complete |
| POST | `/api/auth/login` | Login after email verification | Complete |
| GET | `/api/instagram/oauth/callback` | Meta OAuth callback URL | Complete |

Protected endpoints require `Authorization: Bearer <token>`:

| Method | Endpoint | Purpose | Status |
|---|---|---|---|
| GET | `/api/auth/me` | Get current user | Complete |
| PATCH | `/api/auth/password` | Update user password | Complete |
| GET | `/api/dashboard/overview` | Dashboard summary | Complete |
| GET | `/api/instagram/connect` | Create Meta OAuth URL | Complete |
| PATCH | `/api/instagram/manual-metrics` | Add manual fallback metrics | Complete |
| POST | `/api/instagram/media/sync` | Sync Instagram media | Complete |
| POST | `/api/instagram/analytics/snapshot` | Create analytics snapshot | Complete |
| GET | `/api/instagram/analytics/latest` | Latest analytics snapshot | Complete |
| GET | `/api/instagram/analytics/history` | Analytics history | Complete |
| POST | `/api/creator-score/calculate` | Calculate creator score | Complete |
| GET | `/api/creator-score/latest` | Latest creator score | Complete |
| GET | `/api/creator-score/history` | Creator score history | Complete |
| POST | `/api/creator-insights/generate` | Generate AI insights | Complete |
| GET | `/api/creator-insights` | List insights | Complete |
| POST | `/api/recommendations/generate` | Generate recommendations | Complete |
| GET | `/api/recommendations` | List recommendations | Complete |
| POST | `/api/conversation` | Create conversation | Complete |
| GET | `/api/conversation` | List conversations | Complete |
| GET | `/api/conversation/:conversationId/messages` | Load message history | Complete |
| POST | `/api/conversation/:conversationId/chat` | Send normal AI chat message | Complete |
| POST | `/api/conversation/:conversationId/chat/stream` | Stream AI chat response over SSE | Complete |
| PATCH | `/api/conversation/:conversationId` | Rename conversation | Complete |
| PATCH | `/api/conversation/:conversationId/archive` | Archive conversation | Complete |
| DELETE | `/api/conversation/:conversationId` | Soft-delete conversation | Complete |
| PATCH | `/api/conversation/:conversationId/restore` | Restore conversation | Complete |
| POST | `/api/notes` | Create note | Complete |
| GET | `/api/notes` | List notes | Complete |
| PATCH | `/api/notes/:noteId` | Update note | Complete |
| DELETE | `/api/notes/:noteId` | Soft-delete note | Complete |
| PATCH | `/api/notes/:noteId/restore` | Restore note | Complete |
| PATCH | `/api/notes/:noteId/archive` | Archive note | Complete |
| PATCH | `/api/notes/:noteId/unarchive` | Unarchive note | Complete |
| PATCH | `/api/notes/:noteId/pin` | Pin note | Complete |
| PATCH | `/api/notes/:noteId/unpin` | Unpin note | Complete |

---

# Data Availability Policy

Meta may not return every Instagram metric for every connected account, especially in development mode, with newly converted creator accounts, or without the required app permissions/review.

The app now handles this honestly:

- Meta-confirmed values are labeled as provider data.
- User-entered values are labeled as manual data.
- Missing values show a clear unavailable message instead of fake zeros.
- Manual metrics can support limited estimates, but the UI and AI responses explain when analytics are limited.
- Creator score and insights avoid claiming precision when engagement data is unavailable.

---

# Environment Variables

Backend variables in `backend/.env`:

- `PORT`: backend port, usually `5000`.
- `NODE_ENV`: `development`, `test`, or `production`.
- `MONGO_URI`: MongoDB connection string.
- `JWT_SECRET`: JWT signing secret.
- `JWT_EXPIRES_IN`: JWT expiry, for example `7d`.
- `REDIS_URL`: Redis connection URL.
- `GROQ_API_KEY`: Groq AI key if used.
- `OPENAI_API_KEY`: OpenAI key if configured in backend providers.
- `GEMINI_API_KEY`: Gemini key if configured in backend providers.
- `CLOUDINARY_CLOUD_NAME`: Cloudinary cloud name.
- `CLOUDINARY_API_KEY`: Cloudinary API key.
- `CLOUDINARY_API_SECRET`: Cloudinary API secret.
- `CLOUDINARY_AI_CHAT_FOLDER`: Cloudinary folder for chat uploads.
- `EMAIL_USER`: SMTP username.
- `EMAIL_PASSWORD`: SMTP app password.
- `EMAIL_FROM`: sender label and address.
- `CONTACT_RECEIVER_EMAIL`: contact-form receiver email.
- `EMAIL_QUEUE_CONCURRENCY`: email worker concurrency.
- `EMAIL_DELIVERY_TIMEOUT_MS`: email send timeout.
- `OTP_RESEND_COOLDOWN_MS`: OTP resend cooldown.
- `INSTAGRAM_APP_ID`: Meta app ID.
- `INSTAGRAM_APP_SECRET`: Meta app secret.
- `INSTAGRAM_REDIRECT_URI`: backend OAuth callback URL.
- `INSTAGRAM_FRONTEND_CALLBACK_URL`: frontend callback route.
- `META_GRAPH_VERSION`: Meta Graph API version.
- `FRONTEND_URL`: frontend app origin.
- `FRONTEND_ALLOWED_ORIGINS`: comma-separated CORS origins.

Frontend variables in `frontend/.env`:

- `VITE_API_BASE_URL`: backend API base, for example `http://localhost:5000/api`.
- `VITE_CONTACT_EMAIL`: public contact email shown in the landing page.
- `VITE_CONTACT_PHONE`: public contact phone shown in the landing page.

Never commit real `.env` values.

---

# Local Development

Run backend:

```bash
cd ~/Downloads/social-media-analytics-dashboard/backend
npm install
npm run dev
```

Run frontend:

```bash
cd ~/Downloads/social-media-analytics-dashboard/frontend
npm install
npm run dev -- --host 0.0.0.0 --port 5173 --strictPort
```

Local URLs:

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000/api`
- Backend health: `http://localhost:5000/api/health`
- Backend readiness: `http://localhost:5000/api/ready`

For local Instagram OAuth with a real phone/browser flow, expose the backend with ngrok and set:

- `INSTAGRAM_REDIRECT_URI=https://your-ngrok-url.ngrok-free.app/api/instagram/oauth/callback`
- Meta app Valid OAuth Redirect URI to the same backend callback.
- `FRONTEND_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173`
- `FRONTEND_URL=http://localhost:5173`
- `INSTAGRAM_FRONTEND_CALLBACK_URL=http://localhost:5173/instagram/callback`

---

# Validation Commands

Backend:

```bash
cd ~/Downloads/social-media-analytics-dashboard/backend
npm test -- --runInBand
```

Frontend:

```bash
cd ~/Downloads/social-media-analytics-dashboard/frontend
npm run lint
npm run build
```

Git whitespace check:

```bash
cd ~/Downloads/social-media-analytics-dashboard
git diff --check
```

Recent local QA status:

- Backend tests passed: 13 test suites, 71 tests.
- Frontend lint passed.
- Frontend production build passed.
- Backend `/api/health` smoke test passed.
- Frontend `/` smoke test passed.

---

# Deployment Notes

Before deployment:

1. Create production MongoDB, Redis, Cloudinary, SMTP, Meta, and AI provider credentials.
2. Set backend production env variables on the backend host.
3. Set frontend `VITE_API_BASE_URL` to the production backend `/api` URL before building.
4. Set backend `FRONTEND_ALLOWED_ORIGINS` to the production frontend domain.
5. Set Meta OAuth redirect URI to the production backend callback:
   `https://api.your-domain.com/api/instagram/oauth/callback`
6. Set `INSTAGRAM_FRONTEND_CALLBACK_URL` to:
   `https://your-frontend-domain.com/instagram/callback`
7. Build frontend with `npm run build`.
8. Start backend with `npm start`.
9. Verify `/api/health`, `/api/ready`, register, OTP email, login, dashboard, Instagram OAuth, manual metrics, contact form, and AI chat.

Important OAuth limitation:

- In Meta development mode, only app admins/developers/testers can complete OAuth.
- External users need the app in Live mode and required permissions approved by Meta review.
- Connected Instagram accounts must be professional/creator/business accounts for meaningful Graph API data.

---

# Database Models

- `User`: registered users, email verification, password auth.
- `InstagramAccount`: connected Instagram account, tokens, account metadata, Meta metrics, manual metrics.
- `InstagramMedia`: synced media/post data.
- `AnalyticsSnapshot`: point-in-time analytics summary.
- `CreatorScore`: creator score values and metadata.
- `CreatorInsight`: AI-generated insight records.
- `Recommendation`: AI-generated recommendation records.
- `Conversation`: AI chat conversation metadata.
- `Message`: user/assistant chat messages.
- `PersonalNote`: personal creator planning notes.
- `Memory`: contextual memory for AI personalization.

---

# Important Files

- `backend/app.js`: Express app, middleware, health checks, and route mounting.
- `backend/server.js`: backend startup.
- `backend/config/security.js`: CORS, Helmet, payload limits.
- `backend/config/validateEnv.js`: required environment validation.
- `backend/routes/*.js`: backend API contracts.
- `backend/controllers/instagramController.js`: OAuth and manual metrics controller.
- `backend/services/instagramAnalyticsService.js`: snapshot and metric-source-aware analytics.
- `backend/services/creatorScoreService.js`: creator score engine.
- `backend/services/conversationService.js`: AI chat business logic and context.
- `backend/services/emailService.js`: OTP/contact email delivery.
- `backend/utils/instagramMetricSources.js`: Meta/manual/unavailable metric source logic.
- `frontend/src/routes/router.jsx`: frontend route tree.
- `frontend/src/services/*.js`: frontend API services.
- `frontend/src/pages/Instagram.jsx`: Instagram account management and manual metrics UI.
- `frontend/src/pages/AIChat.jsx`: AI chat workspace.
- `frontend/src/components/landing/LandingSections.jsx`: public landing/contact UI.
- `frontend/src/utils/metricSources.js`: frontend metric-source helpers.
- `frontend/src/utils/sseParser.js`: SSE parsing helper.

---

# Current Progress

- Backend completion: 95%
- API completion: 95%
- Database completion: 95%
- Authentication: 100%
- Email/OTP: 100% locally verified after SMTP app password setup
- AI features: 90%
- Instagram integration: 85% locally verified, production depends on Meta app/live review
- Manual metrics fallback: 100%
- Frontend completion: 95%
- Testing: 90%
- Documentation: 90%
- Deployment readiness: 85%

---

# Next Tasks

1. Push the final code to GitHub `main`.
2. Choose backend host and configure production environment variables.
3. Choose frontend host and configure `VITE_API_BASE_URL`.
4. Configure production CORS origins.
5. Configure production Meta OAuth redirect URI.
6. Run backend tests and frontend lint/build in the deployment environment.
7. Deploy backend.
8. Deploy frontend.
9. Run live smoke tests for auth, OTP, dashboard, contact, AI chat, Instagram OAuth, and manual metrics.
10. Submit Meta app review / switch to live mode when ready for public users.

---

# Suggested Deployment Chat Prompt

Paste this README into the deployment chat and ask it to:

1. Review the backend and frontend deployment requirements.
2. Select hosting targets.
3. Create production environment-variable checklist.
4. Deploy backend first.
5. Deploy frontend second.
6. Verify live CORS and OAuth redirect URLs.
7. Run the final production smoke-test checklist.
