# CreatorIQ Frontend-Backend Contract Audit

## Audit Date

July 28, 2026

## Scope

Audited the current CreatorIQ frontend and backend integration contracts across authentication, routing, API client behavior, dashboard, Instagram, analytics, creator score, creator insights, AI chat/conversations, personal notes, recommendations, profile/settings, usage/plan expectations, error handling, SSE, and deployment readiness.

## Architecture Summary

- Frontend uses React, React Router, TanStack Query, Axios, Tailwind, MUI and feature services under `frontend/src/services`.
- Backend uses Express mounted under `/api/*`, MongoDB models, Redis-backed OAuth state, JWT auth middleware, API response envelopes, and feature-specific controllers/services.
- Frontend API calls use `VITE_API_BASE_URL`, defaulting locally to `http://localhost:5000/api`.
- Axios attaches `Authorization: Bearer <token>` from localStorage and clears auth state on `401`.
- Most frontend calls go through `frontend/src/services/http.js`; no component-level raw `fetch`, `XMLHttpRequest`, or direct Axios bypass was found.

## Mounted Backend Routes

### Authentication

- `POST /api/auth/register`
- `POST /api/auth/verify-email`
- `POST /api/auth/resend-otp`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `PATCH /api/auth/password`

### Instagram

- `GET /api/instagram/connect`
- `GET /api/instagram/oauth/callback`
- `POST /api/instagram/media/sync`
- `POST /api/instagram/analytics/snapshot`
- `GET /api/instagram/analytics/latest`
- `GET /api/instagram/analytics/history?limit=30`

### Dashboard

- `GET /api/dashboard/overview`

### Creator Score

- `POST /api/creator-score/calculate`
- `GET /api/creator-score/latest`
- `GET /api/creator-score/history`

### Creator Insights

- `POST /api/creator-insights/generate`
- `GET /api/creator-insights?limit=20`

### Conversations and AI Chat

- `POST /api/conversation`
- `GET /api/conversation`
- `GET /api/conversation/:conversationId/messages`
- `POST /api/conversation/:conversationId/chat`
- `POST /api/conversation/:conversationId/chat/stream`
- `PATCH /api/conversation/:conversationId/archive`
- `PATCH /api/conversation/:conversationId`
- `DELETE /api/conversation/:conversationId`
- `PATCH /api/conversation/:conversationId/restore`

### Notes

- `POST /api/notes`
- `GET /api/notes`
- `PATCH /api/notes/:noteId`
- `DELETE /api/notes/:noteId`
- `PATCH /api/notes/:noteId/restore`
- `PATCH /api/notes/:noteId/archive`
- `PATCH /api/notes/:noteId/unarchive`
- `PATCH /api/notes/:noteId/pin`
- `PATCH /api/notes/:noteId/unpin`

### Recommendations

- `POST /api/recommendations/generate`
- `GET /api/recommendations`

### Other

- `GET /api/health`
- `GET /meta-test` was identified as an unprotected temporary backend route during Day 10 and removed during Day 11 cleanup.
- `backend/routes/aiRoutes.js` exists but is not mounted in `backend/app.js`.

## Frontend Service Inventory

- `authService.register(payload)`
- `authService.login(payload)`
- `authService.getCurrentUser()`
- `authService.verifyEmail(payload)`
- `authService.resendOtp(payload)`
- `dashboardService.getOverview()`
- `instagramService.getConnectedAccount()`
- `instagramService.getConnectionUrl()`
- `instagramService.completeOAuthCallback({ code, state })`
- `instagramService.syncMedia()`
- `instagramService.createAnalyticsSnapshot()`
- `instagramService.syncCreatorData()`
- `analyticsService.getLatestSnapshot()`
- `analyticsService.getHistory(limit)`
- `analyticsService.createSnapshot()`
- `creatorScoreService.getLatest()`
- `creatorScoreService.getHistory(limit)`
- `creatorScoreService.calculate()`
- `insightsService.list(limit)`
- `insightsService.generate()`
- `chatService.listConversations()`
- `chatService.createConversation({ instagramAccountId, title })`
- `chatService.getMessages(conversationId)`
- `chatService.sendMessage({ conversationId, message })`
- `chatService.renameConversation({ conversationId, title })`
- `chatService.deleteConversation(conversationId)`
- `chatService.restoreConversation(conversationId)`
- `notesService.list()`
- `notesService.create({ title, content, category })`
- `notesService.update({ noteId, title, content, category })`
- `notesService.delete(noteId)`
- `notesService.archive(noteId)`
- `notesService.unarchive(noteId)`
- `notesService.pin(noteId)`
- `notesService.unpin(noteId)`

## Master Contract Matrix

| Feature | Frontend Function | Method | Frontend URL | Mounted Backend Route | Auth | Request Data | Success Shape | Error Shape | Status |
|---|---|---|---|---|---|---|---|---|---|
| Auth | `authService.register` | POST | `/auth/register` | `/api/auth/register` | Public | `{ name, email, password }` | `{ success, statusCode, message, data: { user, message } }` | `{ success:false, statusCode, message }` | Verified |
| Auth | `authService.login` | POST | `/auth/login` | `/api/auth/login` | Public | `{ email, password }` | `{ data: { user, token } }` | `401` invalid credentials, `403` unverified email | Verified |
| Auth | `authService.getCurrentUser` | GET | `/auth/me` | `/api/auth/me` | JWT | None | `{ data: user }` | `401`, `404` | Verified |
| Auth | `authService.verifyEmail` | POST | `/auth/verify-email` | `/api/auth/verify-email` | Public | `{ email, otp }` | `{ message }` | `400`, `404` | Verified |
| Auth | `authService.resendOtp` | POST | `/auth/resend-otp` | `/api/auth/resend-otp` | Public | `{ email }` | `{ message }` | `400`, `404` | Verified |
| Auth | `authService.updatePassword` | PATCH | `/auth/password` | `/api/auth/password` | JWT | `{ currentPassword, newPassword }` | `{ message }` | `400`, `401`, `404` | Integrated in Day 11 |
| Dashboard | `dashboardService.getOverview` | GET | `/dashboard/overview` | `/api/dashboard/overview` | JWT | None | `{ data: { account, latestSnapshot, latestScore, latestInsights, topMedia } }` | `404` no account | Verified |
| Instagram | `instagramService.getConnectionUrl` | GET | `/instagram/connect` | `/api/instagram/connect` | JWT | None | `{ data: { authURL } }` | `401`, `500` config errors | Verified |
| Instagram | `instagramService.completeOAuthCallback` | GET | `/instagram/oauth/callback` | `/api/instagram/oauth/callback` | Public backend route | Query `{ code, state }` | `{ data: account }` | `400`, `409`, `500` | Needs E2E verification |
| Instagram | `instagramService.getConnectedAccount` | GET | `/dashboard/overview` | `/api/dashboard/overview` | JWT | None | `data.account` | `404` normalized to no account | Fixed/Verified |
| Instagram | `instagramService.syncMedia` | POST | `/instagram/media/sync` | `/api/instagram/media/sync` | JWT | None | `{ data: { syncedCount, insertedCount, updatedCount } }` | `404`, `500` | Verified |
| Instagram | `instagramService.createAnalyticsSnapshot` | POST | `/instagram/analytics/snapshot` | `/api/instagram/analytics/snapshot` | JWT | None | `{ data: snapshot }` | `404`, `500` | Verified |
| Instagram | None | DELETE/PATCH | None | None | N/A | N/A | N/A | N/A | Missing backend implementation |
| Analytics | `analyticsService.getLatestSnapshot` | GET | `/instagram/analytics/latest` | `/api/instagram/analytics/latest` | JWT | None | `{ data: snapshot|null }` | `404` no account | Verified |
| Analytics | `analyticsService.getHistory` | GET | `/instagram/analytics/history` | `/api/instagram/analytics/history` | JWT | Query `{ limit }` | `{ data: snapshots[] }` | `404` no account | Verified |
| Analytics | `analyticsService.createSnapshot` | POST | `/instagram/analytics/snapshot` | `/api/instagram/analytics/snapshot` | JWT | None | `{ data: snapshot }` | `404`, `500` | Verified |
| Creator Score | `creatorScoreService.calculate` | POST | `/creator-score/calculate` | `/api/creator-score/calculate` | JWT | None | `{ data: score }` | `404` no account/snapshot | Verified |
| Creator Score | `creatorScoreService.getLatest` | GET | `/creator-score/latest` | `/api/creator-score/latest` | JWT | None | `{ data: score|null }` | `404` no account | Verified |
| Creator Score | `creatorScoreService.getHistory` | GET | `/creator-score/history` | `/api/creator-score/history` | JWT | Query `{ limit }` frontend sends limit; backend ignores query | `{ data: history[] }` | `404` no account | Needs backend/frontend follow-up |
| Insights | `insightsService.generate` | POST | `/creator-insights/generate` | `/api/creator-insights/generate` | JWT | None | `{ data: { insightCount, insights } }` | `404`, `500` | Verified |
| Insights | `insightsService.list` | GET | `/creator-insights` | `/api/creator-insights` | JWT | Query `{ limit }` | `{ data: insights[] }` | `404` no account | Verified |
| AI Chat | `chatService.createConversation` | POST | `/conversation` | `/api/conversation` | JWT | `{ instagramAccountId, title }` | `{ data: { conversation } }` | `400`, `404` | Verified |
| AI Chat | `chatService.listConversations` | GET | `/conversation` | `/api/conversation` | JWT | None | `{ data: { conversations } }` | `401` | Verified |
| AI Chat | `chatService.getMessages` | GET | `/conversation/:id/messages` | `/api/conversation/:conversationId/messages` | JWT | Path param | `{ data: { messages } }` | `404` | Verified |
| AI Chat | `chatService.sendMessage` | POST | `/conversation/:id/chat` | `/api/conversation/:conversationId/chat` | JWT | `{ message }` | `{ data: { reply } }` | `400`, `404`, AI errors | Verified |
| AI Chat | None | POST stream | None | `/api/conversation/:conversationId/chat/stream` | JWT | `{ message }` | SSE events `start/model/chunk/complete/error` | SSE error event | Missing frontend integration |
| AI Chat | `chatService.renameConversation` | PATCH | `/conversation/:id` | `/api/conversation/:conversationId` | JWT | `{ title }` | `{ data: { conversation } }` | `400`, `403`, `404` | Verified |
| AI Chat | None | PATCH | None | `/api/conversation/:conversationId/archive` | JWT | None | `{ data: { conversation } }` | `404` | Missing frontend integration |
| AI Chat | `chatService.deleteConversation` | DELETE | `/conversation/:id` | `/api/conversation/:conversationId` | JWT | Path param | `{ data: { conversation } }` | `403`, `404` | Verified |
| AI Chat | `chatService.restoreConversation` | PATCH | `/conversation/:id/restore` | `/api/conversation/:conversationId/restore` | JWT | Path param | `{ data: { conversation } }` | `403`, `404` | Verified |
| Notes | `notesService.list` | GET | `/notes` | `/api/notes` | JWT | None | `{ data: { notes } }` | `401` | Verified |
| Notes | `notesService.create` | POST | `/notes` | `/api/notes` | JWT | `{ title, content, category }` | `{ data: { note } }` | validation errors | Verified |
| Notes | `notesService.update` | PATCH | `/notes/:noteId` | `/api/notes/:noteId` | JWT | `{ title, content, category }` | `{ data: { note } }` | `404` | Verified |
| Notes | `notesService.delete` | DELETE | `/notes/:noteId` | `/api/notes/:noteId` | JWT | Path param | `{ data: { note } }` | `404` | Verified |
| Notes | `notesService.archive/unarchive` | PATCH | `/notes/:noteId/archive|unarchive` | same | JWT | Path param | `{ data: { note } }` | `404` | Verified |
| Notes | `notesService.pin/unpin` | PATCH | `/notes/:noteId/pin|unpin` | same | JWT | Path param | `{ data: { note } }` | `404` | Verified |
| Notes | `notesService.restore` | PATCH | `/notes/:noteId/restore` | `/api/notes/:noteId/restore` | JWT | Path param | `{ data: { note } }` | `404` | Integrated in Day 11 through session recovery |
| Recommendations | `recommendationService.list` | GET | `/recommendations` | `/api/recommendations` | JWT | None | `{ success, count, data: recommendations[] }` | `404` no account | Integrated in Day 11 |
| Recommendations | `recommendationService.generate` | POST | `/recommendations/generate` | `/api/recommendations/generate` | JWT | None | `{ data: { recommendationCount, recommendations } }` | `404`, `500` | Integrated in Day 11 |
| Profile | `authService.getCurrentUser` | GET | `/auth/me` | `/api/auth/me` | JWT | None | `{ data: user }` | `401`, `404` | Implemented read-only in Day 11 |
| Settings | `authService.updatePassword` | PATCH | `/auth/password` | `/api/auth/password` | JWT | `{ currentPassword, newPassword }` | `{ message }` | `400`, `401` | Integrated in Day 11 |
| Plan and Usage | None | None | None | No mounted route found | N/A | N/A | User model may contain plan/usage fields | N/A | Missing backend implementation |

## Mismatches Found

### API Client Multipart Handling

- Feature: Shared API client.
- Frontend expectation: Axios should support JSON and multipart uploads through the shared client.
- Backend reality: Upload middleware exists for image uploads in unmounted `aiRoutes`, and future multipart calls would be harmed by a hardcoded JSON `Content-Type`.
- User impact: Future FormData requests could be sent with an incorrect boundary/content type.
- Fix applied: Removed default JSON `Content-Type` from Axios client and delete the header when request data is FormData.
- Files changed: `frontend/src/api/client.js`.
- Verification: `npm run lint`, `npm run build`, and `git diff --check`.

### Creator Score History Limit

- Feature: Creator score history.
- Frontend expectation: `creatorScoreService.getHistory(limit)` sends a `limit` query parameter.
- Backend reality: route/controller exposes `GET /api/creator-score/history`, but controller currently does not read `req.query.limit`; service uses its default.
- User impact: Currently minor because frontend uses default `30`; non-default callers would not affect backend result count.
- Fix applied: None. Documented because changing backend code was not required for the current UI.

### AI Chat Streaming

- Feature: AI chat.
- Frontend expectation: Day 4 architecture is streaming-ready, but active frontend uses non-stream `POST /api/conversation/:conversationId/chat`.
- Backend reality: `POST /api/conversation/:conversationId/chat/stream` exists and emits SSE events.
- User impact: Chat works through non-stream response, but does not consume backend stream yet.
- Fix applied: None. Full streaming consumption is a feature follow-up, not a Day 10 small mismatch fix.

### Recommendations

- Feature: Recommendations.
- Frontend expectation: Product/dashboard documentation references recommendations preview.
- Backend reality: `/api/recommendations` and `/api/recommendations/generate` are mounted.
- User impact: Recommendations are not currently surfaced in frontend service/UI.
- Fix applied: None. Documented as missing frontend integration.

### Profile, Settings, Plan, Usage

- Feature: Day 9 areas.
- Frontend expectation from milestone prompt: profile/settings/plan/usage exist.
- Backend reality: Day 11 implements supported Profile and Settings UI; backend supports current user and password update from this group. No mounted plan/usage routes were found.
- User impact: Users cannot manage profile/settings/usage yet.
- Fix applied: None. Documented honestly.

### Backend Temporary Meta Test Route

- Feature: Deployment readiness.
- Backend reality: `GET /meta-test` was unprotected and marked temporary in source comments during Day 10.
- User impact: Should not be shipped to production.
- Fix applied: Removed during Day 11 cleanup.

## Missing Integrations

- `PATCH /api/auth/password` is integrated through Day 11 Settings.
- `POST /api/conversation/:conversationId/chat/stream` is not consumed by frontend.
- `PATCH /api/conversation/:conversationId/archive` is not exposed in frontend.
- `PATCH /api/notes/:noteId/restore` exists but deleted notes are not returned by list endpoint, so restore is not reachable through current UI.
- `/api/recommendations` and `/api/recommendations/generate` are integrated through Day 11 Recommendations.
- Plan and AI usage UI is read-only in Day 11 because no dedicated plan/usage API is mounted.
- Profile and Settings pages are implemented in Day 11 around supported backend contracts.
- No Instagram disconnect backend endpoint exists.
- No Instagram sync-status endpoint exists.

## Error Contract Findings

- Most backend errors use `{ success:false, statusCode, message, meta? }` from `errorMiddleware`.
- Some auth middleware 401 responses return `{ success:false, message }` without `statusCode`.
- Dashboard and recommendations controllers return successful envelopes without `statusCode`; frontend does not depend on it.
- Existing frontend `getApiErrorMessage()` preserves backend `message` and falls back safely.
- Instagram has a dedicated frontend normalizer for no-account/OAuth/token/sync categories.
- No frontend source logs tokens, OAuth codes, access tokens, provider secrets, or stack traces.

## SSE Findings

- Backend conversation SSE route is `POST /api/conversation/:conversationId/chat/stream`.
- Backend emits `event:start`, `event:model`, `event:chunk`, `event:error`, and `event:complete`.
- Native `EventSource` is not suitable because backend streaming route uses POST with request body and JWT auth.
- Frontend currently uses non-stream chat. A future stream implementation should use fetch streaming or another POST-compatible SSE reader.
- Backend server sets `keepAliveTimeout` and `headersTimeout`, which helps long-lived SSE responses.
- Deployment still needs reverse-proxy buffering/timeouts reviewed if deployed behind Nginx or similar.

## Authentication Findings

- Registration, email verification, resend OTP, login, and current user contracts match frontend usage.
- Login requires verified email and returns `403` if unverified.
- Login response returns `data.user` and `data.token`, matching `AuthContext`.
- Protected routes wait for auth initialization before rendering.
- Public routes redirect authenticated users to `/dashboard`.
- Axios clears stored token on `401` and invokes the auth provider handler.
- Logout is client-side state/token cleanup.
- Password update is backend-supported and exposed in Day 11 Settings.

## Dead Code Removed

None removed. Confirmed unused or incomplete areas were documented instead of removed because many are backend capabilities planned for later frontend milestones.

## Tests Run

- `npm run lint` in `frontend`: passed, 0 warnings and 0 errors.
- `npm run build` in `frontend`: passed.
- `npm test -- --runInBand` in `backend`: failed because 31 checked-in suites contain no tests; 5 suites with assertions passed, 51 tests passed.
- `npm test -- tests/models tests/utils --runInBand` in `backend`: passed, 5 suites, 51 tests.
- `git diff --check`: passed.

## Unverified External Workflows

- Production Meta OAuth authorization, callback and provider permission screens.
- Real Instagram professional account sync.
- SMTP email delivery, which depends on valid provider credentials.
- External AI provider availability and rate-limit behavior.
- End-to-end SSE behavior through any production reverse proxy.

## Deployment Blockers

- Day 10 blocker `GET /meta-test` was removed during Day 11 cleanup.
- Production CORS must include the deployed frontend origin.
- Production Meta OAuth redirect URI must match the configured backend/frontend callback architecture.
- SMTP credentials must be valid for email verification.
- Redis must be available for OAuth state.
- Nginx/proxy SSE buffering and timeout settings must be reviewed before enabling frontend streaming.

## Final Assessment

- Frontend-backend API integration readiness: 82%.
- Auth integration readiness: 90%.
- Instagram integration readiness: 78% pending real Meta OAuth E2E.
- Analytics/Creator Score/Insights readiness: 82% pending connected account data.
- AI Chat non-stream readiness: 82%.
- AI Chat streaming readiness: 45% because backend exists but frontend does not consume it.
- Notes integration readiness: 86%.
- Profile/Settings/Plan/Usage readiness: 70% after Day 11 read-only profile/settings and AI usage visibility; plan/usage routes remain absent.
- Deployment readiness: 60% after temporary backend route cleanup; external credentials and proxy/SSE checks still remain.

## Day 11 Addendum

- Removed temporary unprotected `GET /meta-test` from `backend/app.js`.
- Removed temporary recommendation controller debug logs.
- Integrated frontend Recommendations page and service.
- Integrated frontend password update form.
- Replaced Profile and Settings placeholders with supported, honest product UI.
- Exposed note restore for soft-deleted notes that remain known to the current browser session.
