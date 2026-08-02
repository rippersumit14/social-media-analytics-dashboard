# AI-Powered Creator Analytics SaaS Backend

Backend API for an AI-powered creator analytics SaaS. It handles authentication, email verification, Instagram OAuth/data sync, analytics snapshots, creator scoring, AI chat, creator insights, personal notes, recommendations, background jobs, caching, uploads, and test coverage.

---

# Tech Stack

- Node.js + Express
- MongoDB + Mongoose
- Redis + BullMQ-ready job infrastructure
- JWT authentication
- Nodemailer email verification
- Meta / Instagram Graph API
- Cloudinary media storage
- Groq, Gemini, OpenRouter, Together AI, and OpenAI-compatible AI integrations
- Jest, Supertest, mongodb-memory-server
- Helmet, CORS, rate limiting, request logging, validation
- Docker, Docker Compose, Nginx deployment files

---

# Current Project Status

Overall completion: **93%**

Completed modules:

- Authentication, JWT, protected routes, email OTP verification
- Instagram OAuth backend, media sync, analytics snapshots
- Dashboard overview, creator score, creator insights
- Conversation-based AI chat and streaming-ready chat route
- Personal notes CRUD, pin, archive, restore, soft delete
- Recommendations module, automation scheduler, backend tests
- Temporary `/meta-test` route removed before production
- Backend production stabilization pass completed: OTP reliability, OAuth redirect, rate limits, readiness, safe logging, and repaired tests

Modules in progress:

- Production Instagram OAuth validation
- Production email delivery verification
- Deployment hardening and final frontend/backend integration testing

Pending modules:

- Final production deployment
- Production monitoring
- Live Instagram account QA
- Final API documentation refresh after frontend completion

---

# Folder Structure

```text
backend/
├── config/                 # Environment, database, Redis, CORS/security, mail, Cloudinary, Meta, AI model config
├── controllers/            # HTTP request handlers
├── deployment/             # Dockerfile, docker-compose, Nginx
├── docs/                   # API contracts, schema, deployment, roadmap, system design, testing guide
├── jobs/                   # Automation jobs for sync, analytics, score, insights
├── middlewares/            # Auth, errors, rate limits, uploads, validation, request logs
├── models/                 # Mongoose schemas
├── routes/                 # Express route definitions
├── scripts/                # Seed, reset, cleanup scripts
├── services/               # Business logic and external integrations
│   └── ai/                 # AI orchestrator and providers
├── tests/                  # Unit, route, controller, service, model, integration tests
├── utils/                  # Shared helpers and logger
├── validators/             # Request validation schemas
├── app.js                  # Express app setup
├── server.js               # Server bootstrap
├── package.json            # Scripts and dependencies
└── jest.config.js          # Test config
```

---

# Important Files

| Path | Purpose | Current Status |
|---|---|---|
| `backend/app.js` | Express app setup, middleware, route mounting | Active |
| `backend/server.js` | Startup, DB/Redis/mail checks, scheduler boot, shutdown | Active |
| `backend/package.json` | Backend scripts and dependencies | Active |
| `backend/config/security.js` | Helmet, CORS, body limits | Active |
| `backend/config/validateEnv.js` | Required environment validation | Active |
| `backend/config/mail.js` | Gmail SMTP transporter | Needs valid app password |
| `backend/models/User.js` | User, plan, usage, verification state | Active |
| `backend/models/EmailVerificationOTP.js` | OTP storage with TTL | Active |
| `backend/models/InstagramAccount.js` | Connected Instagram account | Active |
| `backend/models/InstagramMedia.js` | Synced Instagram media | Active |
| `backend/models/AnalyticsSnapshot.js` | Analytics snapshots | Active |
| `backend/models/CreatorScore.js` | Creator score history | Active |
| `backend/models/CreatorInsight.js` | Generated insights | Active |
| `backend/models/Conversation.js` | AI chat conversations | Active |
| `backend/models/Message.js` | AI chat messages | Active |
| `backend/models/PersonalNote.js` | Creator private notes | Active |
| `backend/routes/authRoutes.js` | Auth and OTP routes | Active |
| `backend/routes/instagramRoutes.js` | Instagram connect/callback routes | Active |
| `backend/routes/instagramMediaRoutes.js` | Media sync route | Active |
| `backend/routes/instagramAnalyticsRoutes.js` | Snapshot/latest/history routes | Active |
| `backend/routes/creatorScoreRoutes.js` | Creator score routes | Active |
| `backend/routes/creatorInsightsRoutes.js` | Creator insights routes | Active |
| `backend/routes/conversationRoutes.js` | Conversation/chat routes | Active |
| `backend/routes/personalNoteRoutes.js` | Personal notes routes | Active |
| `backend/services/authService.js` | Auth business logic | Active |
| `backend/services/instagramService.js` | Instagram OAuth/API logic | Active |
| `backend/services/creatorScoreService.js` | Score calculation | Active |
| `backend/services/creatorInsightsService.js` | Insight generation | Active |
| `backend/services/conversationService.js` | Conversation logic | Active |
| `backend/services/personalNoteService.js` | Notes logic | Active |
| `backend/middlewares/authMiddleware.js` | JWT protection | Active |
| `backend/middlewares/errorMiddleware.js` | Global errors | Active |
| `backend/tests/**` | Backend automated tests | Active |

---

# Development Timeline

## Milestone 1 - Backend Foundation

- Express app, health route, route mounting.
- Helmet, CORS, body limits, request logger, global rate limiter.
- Environment loading and validation.
- Standard `ApiResponse` and `AppError` utilities.
- Jest/Supertest test structure added.

## Milestone 2 - Authentication + Email Verification

- Register, login, current user, password update.
- Email OTP verification and resend OTP.
- JWT token generation and protect middleware.
- `User` and `EmailVerificationOTP` models.
- Auth validators, controller, service, route tests.

## Milestone 3 - Instagram Integration

- Instagram connect URL and OAuth callback.
- Redis OAuth state handling.
- Instagram account and media sync models/services.
- Media sync endpoint.
- Pending live OAuth frontend flow and production Meta QA.

## Milestone 4 - Analytics + Creator Score

- Analytics snapshot create/latest/history.
- Creator score calculate/latest/history.
- Dashboard overview aggregation.
- Snapshot and score jobs.
- Analytics and score tests.

## Milestone 5 - AI Chat + Conversations

- Conversation create/list/rename/archive/delete/restore.
- Message history and AI chat endpoint.
- Streaming-ready chat route.
- AI provider orchestration and provider adapters.
- AI/conversation tests.

## Milestone 6 - Creator Insights + Recommendations

- Generate/list creator insights.
- Generate/list recommendations.
- `CreatorInsight` and `Recommendation` models.
- Creator insights job.
- Insight tests.

## Milestone 7 - Personal Notes

- Notes create/list/update/delete.
- Pin/unpin, archive/unarchive, restore.
- Soft delete behavior.
- `PersonalNote` model, service, controller, routes.
- Notes tests.

## Milestone 8 - Integration Debugging

- Confirmed CORS requires `http://localhost:5173`.
- Confirmed Gmail SMTP app password required for OTP delivery.
- Confirmed deleted notes can be restored but are not listable through current list endpoint.
- Frontend contracts verified against backend routes/controllers/models.

## Milestone 9 - Backend Production Stabilization

- Fixed Zod v4 validation handling so invalid requests return structured 400 errors instead of server failures.
- Hardened email OTP flow with normalized email lookup, resend cooldown, rollback on failed first-email delivery, and cleanup of stale OTP records.
- Added BullMQ-backed verification email queue with direct delivery fallback and graceful queue/worker shutdown.
- Changed Instagram OAuth callback to redirect back to the frontend with safe success/error query params.
- Removed sensitive debug logging from auth, mail, Redis, Mongo, Instagram OAuth, and recommendation paths.
- Mounted auth and AI-specific rate limiters on high-risk auth, chat, insight, and recommendation routes.
- Added `/api/ready` readiness checks for MongoDB and Redis.
- Repaired Jest by removing empty placeholder suites and adding focused auth, validation, email queue, and debug-route tests.
- Testing completed: backend Jest suite passing, 9 suites and 61 tests.

---

# Features Completed

- [x] JWT Authentication
- [x] Email OTP Verification
- [x] Protect Middleware
- [x] Instagram OAuth Backend
- [x] Instagram Media Sync
- [x] Analytics Snapshots
- [x] Creator Score
- [x] Dashboard Overview
- [x] Creator Insights
- [x] AI Chat
- [x] Conversation CRUD
- [x] SSE Streaming Route
- [x] Personal Notes CRUD
- [x] Pin/Archive/Restore Notes
- [x] Recommendations
- [x] Automation Jobs
- [x] BullMQ Email Queue
- [x] Readiness Endpoint
- [x] Production-Safe OAuth Redirect
- [x] Auth and AI Route Rate Limiters
- [x] Backend Tests
- [ ] Live Instagram OAuth QA
- [ ] Production Email Verification
- [ ] Deployment
- [ ] Production Testing

---

# APIs Implemented

| Method | Endpoint | Status |
|---|---|---|
| GET | `/api/health` | Active |
| GET | `/api/ready` | Active |
| POST | `/api/auth/register` | Active |
| POST | `/api/auth/verify-email` | Active |
| POST | `/api/auth/resend-otp` | Active |
| POST | `/api/auth/login` | Active |
| GET | `/api/auth/me` | Active |
| PATCH | `/api/auth/password` | Active |
| GET | `/api/instagram/connect` | Active |
| GET | `/api/instagram/oauth/callback` | Active |
| POST | `/api/instagram/media/sync` | Active |
| POST | `/api/instagram/analytics/snapshot` | Active |
| GET | `/api/instagram/analytics/latest` | Active |
| GET | `/api/instagram/analytics/history` | Active |
| GET | `/api/dashboard/overview` | Active |
| POST | `/api/creator-score/calculate` | Active |
| GET | `/api/creator-score/latest` | Active |
| GET | `/api/creator-score/history` | Active |
| POST | `/api/creator-insights/generate` | Active |
| GET | `/api/creator-insights` | Active |
| POST | `/api/conversation` | Active |
| GET | `/api/conversation` | Active |
| GET | `/api/conversation/:conversationId/messages` | Active |
| POST | `/api/conversation/:conversationId/chat` | Active |
| POST | `/api/conversation/:conversationId/chat/stream` | Active |
| PATCH | `/api/conversation/:conversationId` | Active |
| DELETE | `/api/conversation/:conversationId` | Active |
| PATCH | `/api/conversation/:conversationId/restore` | Active |
| POST | `/api/notes` | Active |
| GET | `/api/notes` | Active |
| PATCH | `/api/notes/:noteId` | Active |
| DELETE | `/api/notes/:noteId` | Active |
| PATCH | `/api/notes/:noteId/archive` | Active |
| PATCH | `/api/notes/:noteId/unarchive` | Active |
| PATCH | `/api/notes/:noteId/pin` | Active |
| PATCH | `/api/notes/:noteId/unpin` | Active |
| PATCH | `/api/notes/:noteId/restore` | Active |

---

# Database Models

- `User` - User profile, auth, plan, usage, verification state.
- `EmailVerificationOTP` - Temporary OTP records.
- `InstagramAccount` - Connected Instagram account metadata.
- `InstagramMedia` - Synced Instagram media.
- `AnalyticsSnapshot` - Point-in-time analytics metrics.
- `CreatorScore` - Score history and breakdown.
- `CreatorInsight` - Generated insight cards.
- `Conversation` - AI chat conversations.
- `Message` - AI chat messages.
- `PersonalNote` - Private planning notes.
- `Recommendation` - Recommendation records.
- `ContentIdea` - Content idea records.
- `Note` - Legacy/general note model.
- `Reminder` - Reminder records.

---

# Environment Variables

- `PORT` - Backend port.
- `NODE_ENV` - Runtime environment.
- `FRONTEND_URL` - Allowed frontend origin.
- `FRONTEND_ALLOWED_ORIGINS` - Extra comma-separated allowed frontend origins.
- `MONGO_URI` - MongoDB connection.
- `TEST_DATABASE_NAME` - Test database name.
- `JWT_SECRET` - JWT signing secret.
- `JWT_EXPIRES_IN` - JWT expiration.
- `REDIS_URL` - Redis connection.
- `AI_QUEUE_CONCURRENCY` - Queue concurrency.
- `CLOUDINARY_CLOUD_NAME` - Cloudinary cloud.
- `CLOUDINARY_API_KEY` - Cloudinary key.
- `CLOUDINARY_API_SECRET` - Cloudinary secret.
- `CLOUDINARY_AI_CHAT_FOLDER` - Upload folder.
- `GROQ_API_KEY` - Groq key.
- `GEMINI_API_KEY` - Gemini key.
- `OPENROUTER_API_KEY` - OpenRouter key.
- `TOGETHER_API_KEY` - Together key.
- `META_APP_ID` - Meta app ID.
- `META_APP_SECRET` - Meta app secret.
- `META_GRAPH_VERSION` - Graph API version.
- `META_LOGIN_CONFIG_ID` - Meta login config.
- `INSTAGRAM_APP_ID` - Instagram app ID.
- `INSTAGRAM_APP_SECRET` - Instagram app secret.
- `INSTAGRAM_REDIRECT_URI` - OAuth callback URL.
- `INSTAGRAM_FRONTEND_CALLBACK_URL` - Frontend URL used after backend OAuth callback processing.
- `INSTAGRAM_EMBEDDED_URL` - Instagram login URL.
- `INSTAGRAM_ACCESS_TOKEN` - Generated access token.
- `EMAIL_USER` - Email account.
- `EMAIL_PASSWORD` - Email app password.
- `EMAIL_FROM` - Email sender.
- `EMAIL_QUEUE_CONCURRENCY` - Email worker concurrency.
- `EMAIL_DELIVERY_TIMEOUT_MS` - Queued email delivery wait timeout.
- `OTP_RESEND_COOLDOWN_MS` - OTP resend cooldown window.
- `LOG_LEVEL` - Logging level.

---

# Current Backend Progress

- Backend Completion: **93%**
- API Completion: **93%**
- Database Completion: **95%**
- Authentication: **97%**
- AI Features: **88%**
- Instagram Integration: **86%**
- Testing: **90%**
- Documentation: **90%**
- Deployment Readiness: **75%**

---

# Next Tasks

1. Verify SMTP credentials with a Gmail app password or production email service.
2. Complete live Instagram OAuth testing with final callback URL and a verified professional account.
3. Run final frontend-backend E2E tests after the remaining frontend milestones.
4. Add or document missing plan/usage endpoints if those UI sections become required.
5. Validate Docker/Nginx deployment locally, including SSE buffering and timeouts.
6. Add production monitoring/logging plan.
7. Run final production E2E testing.

---

# Day 10 Contract Audit Note

The Day 10 frontend-backend contract audit is documented in `../PROJECT_CONTRACT_AUDIT.md`.

Backend code was not changed during the audit. Confirmed backend follow-ups:

- Frontend currently uses non-stream chat; backend `POST /api/conversation/:conversationId/chat/stream` is available for a future frontend streaming milestone.
- Recommendations endpoints are mounted and now used by the Day 11 frontend.
- Password update endpoint is mounted and now used by the Day 11 Settings frontend.
- No Instagram disconnect or sync-status endpoint is mounted.

---

# Day 11 Cleanup Note

Day 11 included a small backend cleanup requested by the frontend completion milestone:

- Removed the temporary unprotected `GET /meta-test` route from `backend/app.js`.
- Removed the now-unused `axios` import that only supported `/meta-test`.
- Removed temporary debug logs from `backend/controllers/recommendationController.js`.
- Kept all other backend behavior unchanged.

---

# Production Stabilization Note

The production stabilization milestone is documented in `../BACKEND_PRODUCTION_STABILIZATION_REPORT.md`.

Manual release verification steps are documented in `../BACKEND_MANUAL_RETEST_CHECKLIST.md`.

---

# README Maintenance Rule

Whenever a significant backend feature is finished, update this README with the new milestone, changed files, APIs, models, middleware, services, tests, and updated completion percentages.
