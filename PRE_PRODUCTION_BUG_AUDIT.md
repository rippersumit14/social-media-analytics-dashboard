# CreatorIQ Pre-Production Bug Audit

Date: 2026-08-01
Branch observed: `frontend-v1`
Repository: `social-media-analytics-dashboard`
Scope: Full backend + frontend pre-production audit, reported bug investigation, root-cause analysis, security review, test verification, and production fix plan.

Important audit constraint: **No backend or frontend source code was changed.**
Only this audit report file was regenerated.

---

## 1. Executive Summary

CreatorIQ is feature-rich and the frontend currently builds successfully, but the product is **not ready for production** yet.

The biggest blockers are concentrated around onboarding, OAuth completion, backend validation, debug logging, and test-suite readiness.

Frontend status:

- The React frontend is buildable.
- Frontend lint passes.
- Auth pages, protected routing, dashboard shell, Instagram page, analytics, creator score, insights, recommendations, chat, notes, profile/settings, public landing, and theme system exist.
- Authenticated full E2E is not fully proven because OTP and Instagram OAuth are blocked by backend/configuration issues.
- No frontend test script is currently configured.

Backend status:

- Backend has broad route coverage for auth, Instagram, analytics, creator score, insights, recommendations, conversations, notes, and dashboard.
- Focused model/util backend tests pass.
- Full backend Jest suite fails because many checked-in test files are empty.
- Several production blockers remain.

Release readiness:

**Not ready for production.**

Finding count:

- P0 release blockers: 5
- P1 must fix before public launch: 8
- P2 strongly recommended: 8
- P3 future enhancements: 4

Biggest blockers:

- OTP email delivery currently fails due SMTP configuration.
- Invalid registration can return HTTP `500` instead of validation `400`.
- Instagram OAuth callback returns backend JSON and does not return the browser to the frontend app.
- Full backend test suite fails.
- Debug logs expose sensitive OAuth/configuration context and must be removed before production.

---

## 2. Environment Observed

Observed commands/environment:

- Node version: `v24.14.1`
- npm version: `11.11.0`
- Current branch: `frontend-v1`
- Backend expected URL: `http://localhost:5000`
- Backend API base: `http://localhost:5000/api`
- Frontend expected URL: `http://localhost:5173`
- Frontend API env: `VITE_API_BASE_URL=http://localhost:5000/api`

Backend environment shape:

- `NODE_ENV`: development
- `PORT`: configured as `5000`
- Database name observed from safe parsing: `social_media_analytics`
- Redis: configured
- SMTP user/password variables: present locally, but previous runtime showed authentication rejection
- Meta/Instagram app variables: present locally
- AI provider variables: 4 provider keys present locally
- Cloudinary variables: present locally

Tracked env files:

- `backend/.env.example`
- `backend/.env.test`
- `frontend/.env.example`

Local untracked env file:

- `backend/.env`

Security note:

- Secret values were not printed, copied, or stored in this audit.
- The local `backend/.env` contains sensitive configuration and must remain untracked.

---

## 3. Confirmed Bugs

### BUG-001 - Deleted user still reported as existing

Severity: P1
Area: Backend auth / MongoDB environment
Status: Likely root cause identified from source and environment shape

Files:

- `backend/services/authService.js`
- `backend/models/User.js`
- `backend/config/db.js`
- `backend/config/env.js`

Route/function:

- `POST /api/auth/register`
- `registerUser`

Approximate lines:

- `backend/services/authService.js:26-35`
- `backend/models/User.js:39-49`
- `backend/config/db.js:39-64`
- `backend/config/env.js:13`

Observed behavior:

- User records were manually deleted from MongoDB.
- Registration still returned `User already exists with this email`.

Actual code behavior:

- Registration checks only:

```js
User.findOne({ email })
```

- `User.email` is configured as:
  - `unique: true`
  - `lowercase: true`
  - `trim: true`

Root cause:

The backend reports an existing user only if a matching normalized email exists in the active backend-connected `users` collection, or if the running backend is connected to a different database/cluster than the one manually cleaned.

Most likely causes:

- User was deleted from a different MongoDB database or cluster.
- Backend is connected to MongoDB Atlas database `social_media_analytics`, while manual deletion happened elsewhere.
- Email was stored lowercased and deletion was attempted with unmatched casing or wrong collection.
- Backend was not restarted or the tester was inspecting stale UI/admin state.

Less likely causes:

- OTP records. The duplicate-user error path does not check OTP records.
- Redis cache. Registration duplicate check goes directly to MongoDB.
- Soft-deleted users. The `User` model has `isActive`, but registration does not filter it.

Expected behavior:

- If the normalized email is absent from the active users collection, registration should proceed.
- If present, API should return `409`.

Recommended minimal fix:

- Add a safe dev-only diagnostic script to show active database name, collection names, and email existence count without printing secrets.
- Always normalize email before duplicate lookup.
- Add tests for uppercase/lowercase duplicate registration.
- Decide whether inactive users should block re-registration.

Regression test:

- Register `Test@Example.com`, assert stored email is `test@example.com`.
- Register `test@example.com`, assert `409`.
- Delete test user in active test DB, assert registration succeeds again.

Production risk:

- Support/debugging confusion around user deletion.
- Potential accidental operations against the wrong database.

---

### BUG-002 - OTP email is not working

Severity: P0
Area: Backend email verification / SMTP configuration
Status: Confirmed from previous runtime behavior and source flow

Files:

- `backend/config/mail.js`
- `backend/services/emailService.js`
- `backend/services/authService.js`
- `backend/server.js`

Routes/functions:

- `POST /api/auth/register`
- `POST /api/auth/resend-otp`
- `verifyMailConnection`
- `sendVerificationEmail`
- `registerUser`
- `resendOTP`

Approximate lines:

- `backend/config/mail.js:17-24`
- `backend/config/mail.js:34-64`
- `backend/services/emailService.js:13-72`
- `backend/services/authService.js:37-67`
- `backend/services/authService.js:163-184`
- `backend/server.js:96-99`

Observed behavior:

- Registration was blocked because OTP email did not arrive.
- Backend SMTP previously returned Gmail authentication rejection.
- Manual database verification was used to continue testing.

Current flow:

1. Backend validates register payload.
2. Backend checks existing user.
3. Backend creates user.
4. Backend deletes stale OTP records.
5. Backend creates new OTP record.
6. Backend sends email through Nodemailer.
7. If email send fails, the error propagates.

Root cause:

The backend uses Gmail SMTP with:

- `service: "gmail"`
- `EMAIL_USER`
- `EMAIL_PASSWORD`

Gmail SMTP usually requires a valid Gmail app password or OAuth-compatible configuration. The local credentials are present but rejected.

Code-level issue:

The user and OTP are created before email delivery succeeds. If email sending fails, the backend may leave:

- an unverified user
- an OTP record that the user never received
- a blocked login state

Expected behavior:

- OTP email should send successfully.
- If email delivery fails, the API should return a safe, useful error and avoid inconsistent onboarding state.

Recommended minimal fix:

- Replace current Gmail password with a valid Gmail app password, or preferably use a production email provider.
- Use `EMAIL_FROM` for sender identity instead of hardcoding `EMAIL_USER`.
- Add rollback/compensation when email send fails.
- Return a safe `502`/`503` delivery failure response without exposing SMTP internals.
- Add resend OTP reliability tests.

Recommended production provider:

- SendGrid
- Resend
- AWS SES
- Mailgun
- Postmark

Safe development approach:

- Use Mailtrap, Ethereal, local SMTP capture, or a dev-only OTP capture command.
- Do not rely on manually flipping `isEmailVerified` except for local emergency debugging.

Regression tests:

- Registration succeeds when mail send succeeds.
- Registration fails safely when mail send fails.
- Failed mail send does not leave unusable state.
- Resend OTP replaces old OTP only when send succeeds, or rolls back on failure.
- Expired OTP returns `400`.
- Already verified email returns `400`.

Production risk:

- Users cannot onboard.
- Login remains blocked because `isEmailVerified` stays false.
- Manual DB verification bypasses intended auth security.

---

### BUG-003 - Invalid registration returned HTTP 500

Severity: P0
Area: Backend validation middleware
Status: Root cause confirmed

Files:

- `backend/middlewares/validateRequest.js`
- `backend/validators/authValidators.js`
- `backend/routes/authRoutes.js`

Route/function:

- `POST /api/auth/register`
- `validateRequest(registerSchema)`

Approximate lines:

- `backend/middlewares/validateRequest.js:7-22`
- `backend/validators/authValidators.js:9-26`
- `backend/routes/authRoutes.js:51-55`

Observed behavior:

- Invalid registration payload returned HTTP `500`.

Expected behavior:

- Invalid registration payload should return `400` with validation message.

Root cause:

The project uses `zod@4.4.3`.

For invalid input, Zod returns:

- `result.success === false`
- `result.error`
- `result.error.issues`

But the middleware reads:

```js
result.errors.errors
```

That property does not exist. So validation failure itself throws a TypeError before the intended `AppError(400)` is created.

Minimal production fix:

- Replace `result.errors.errors` with `result.error.issues`.
- Return a normalized validation response.
- Include field names safely.

Expected response:

- Status: `400`
- Body should include safe message such as `Please provide a valid email address`.

Regression tests:

- Invalid email returns `400`.
- Missing name returns `400`.
- Weak password returns `400`.
- Valid payload reaches auth service.
- Sanitized lowercased email is passed to service.

Production risk:

- Normal user input causes internal server errors.
- Client shows poor error state.
- Logs become noisy and misleading.

---

### BUG-004 - Instagram OAuth never returns to the frontend

Severity: P0
Area: Instagram OAuth / browser redirect / security
Status: Confirmed from source flow

Files:

- `backend/controllers/instagramController.js`
- `backend/services/instagramService.js`
- `backend/services/oauthStateService.js`
- `frontend/src/hooks/useInstagramAccount.js`
- `frontend/src/pages/Instagram.jsx`
- `frontend/src/pages/InstagramCallback.jsx`
- `frontend/src/services/instagramService.js`

Routes/functions:

- `GET /api/instagram/connect`
- `GET /api/instagram/oauth/callback`
- `connectInstagram`
- `instagramOAuthCallback`
- `startConnection`
- `completeOAuthCallback`

Approximate lines:

- `backend/controllers/instagramController.js:43-75`
- `backend/controllers/instagramController.js:107-257`
- `backend/services/instagramService.js:14-75`
- `backend/services/oauthStateService.js:45-99`
- `frontend/src/hooks/useInstagramAccount.js:49-52`
- `frontend/src/pages/InstagramCallback.jsx:70-84`

Observed behavior:

- User clicks Connect Instagram.
- Instagram/Meta authorization happens.
- Browser lands on backend callback.
- Backend returns JSON.
- Main frontend app does not automatically reopen.

Current browser journey:

1. Frontend calls `/instagram/connect`.
2. Backend creates Redis OAuth state.
3. Backend returns `authURL`.
4. Frontend does `window.location.assign(authURL)`.
5. Meta redirects to backend callback.
6. Backend exchanges code, fetches profile, saves account.
7. Backend returns JSON.

Root cause:

The backend callback ends with:

```js
res.status(200).json(...)
```

It does not redirect the browser back to the frontend.

The frontend callback page exists, but the current configured OAuth redirect URI points to the backend, not the frontend. Therefore the frontend callback page is not reached unless the backend redirects to it.

Expected behavior:

- Backend callback should process OAuth.
- Backend should redirect to a safe frontend URL after success/failure.

Recommended minimal fix:

- Add a strict configured frontend callback/result URL.
- On success redirect to:

```txt
http://localhost:5173/instagram?connected=success
```

or:

```txt
http://localhost:5173/instagram/callback?success=connected
```

- On failure redirect with safe error code:

```txt
/instagram/callback?error=oauth_failed
```

Security requirements:

- Do not include OAuth code in frontend URL.
- Do not include access token in frontend URL.
- Do not include raw provider error in frontend URL.
- Do not support arbitrary redirect URLs from query params.
- Use an allowlisted frontend origin only.
- Keep backend callback unprotected because Meta calls it without JWT.
- Continue using Redis state for user mapping.

Regression tests:

- Valid callback returns `302` to frontend success URL.
- Missing code/state returns safe redirect.
- Expired state returns safe redirect.
- Duplicate Instagram account returns safe redirect.
- No token/code appears in logs or redirect URL.

Production risk:

- Instagram connection appears broken to every user.
- OAuth codes and state may be logged in development.
- User experience stops outside the app.

---

### BUG-005 - Full backend test suite fails

Severity: P0
Area: Backend test suite / CI readiness
Status: Confirmed by test command

Command:

```bash
cd backend
npm test -- --runInBand
```

Actual result:

- 5 suites passed.
- 31 suites failed.
- 51 tests passed.
- Failing suites fail because they contain no tests.

Exact failure message:

```txt
Your test suite must contain at least one test.
```

Passing test suites:

- `backend/tests/models/userModel.test.js`
- `backend/tests/models/emailVerificationOTPModel.test.js`
- `backend/tests/utils/ApiResponse.test.js`
- `backend/tests/utils/AppError.test.js`
- `backend/tests/utils/generateOTP.test.js`

Empty failing suites:

- `backend/tests/controllers/ai/aiController.test.js`
- `backend/tests/controllers/analytics/analyticsController.test.js`
- `backend/tests/controllers/auth/authController.test.js`
- `backend/tests/controllers/conversation/conversationController.test.js`
- `backend/tests/controllers/creator-insights/creatorInsightsController.test.js`
- `backend/tests/controllers/creator-score/creatorScoreController.test.js`
- `backend/tests/controllers/dashboard/dashboardController.test.js`
- `backend/tests/controllers/instagram/instagramController.test.js`
- `backend/tests/controllers/notes/personalNoteController.test.js`
- `backend/tests/integration/fullSystem.test.js`
- `backend/tests/routes/ai/aiRoutes.test.js`
- `backend/tests/routes/analytics/analyticsRoutes.test.js`
- `backend/tests/routes/auth/authRoutes.test.js`
- `backend/tests/routes/conversation/conversationRoutes.test.js`
- `backend/tests/routes/creator-insights/creatorInsightsRoutes.test.js`
- `backend/tests/routes/creator-score/creatorScoreRoutes.test.js`
- `backend/tests/routes/dashboard/dashboardRoutes.test.js`
- `backend/tests/routes/instagram/instagramRoutes.test.js`
- `backend/tests/routes/notes/personalNoteRoutes.test.js`
- `backend/tests/services/ai/aiService.test.js`
- `backend/tests/services/ai/orchestrator.test.js`
- `backend/tests/services/ai/provider.test.js`
- `backend/tests/services/analytics/analyticsService.test.js`
- `backend/tests/services/auth/authService.test.js`
- `backend/tests/services/conversation/conversationService.test.js`
- `backend/tests/services/creator-insights/creatorInsightsService.test.js`
- `backend/tests/services/creator-score/creatorScoreService.test.js`
- `backend/tests/services/dashboard/dashboardService.test.js`
- `backend/tests/services/instagram/instagramService.test.js`
- `backend/tests/services/instagram/mediaService.test.js`
- `backend/tests/services/notes/personalNoteService.test.js`

Root cause:

- Empty placeholder `*.test.js` files are checked into the repo.
- Jest treats empty test files as failed suites.

Expected behavior:

- Full backend test command should pass when real assertions pass.

Recommended minimal fix:

- Remove empty placeholder test files, or implement real tests.
- Do not add meaningless tests like `expect(true).toBe(true)`.

Regression test:

- CI must run `npm test -- --runInBand`.
- Command must pass without empty-suite failures.

Production risk:

- CI cannot provide reliable release confidence.
- Real regressions may be hidden behind test-suite noise.

---

### BUG-006 - Temporary `/meta-test` route

Severity: P1 if present in a production branch; current worktree shows it removed but uncommitted
Area: Backend debug route / external provider test
Status: Removed in current worktree, but backend file remains modified

File:

- `backend/app.js`

Route:

- `GET /meta-test`

Observed diff:

- Current git diff shows the `/meta-test` route and its `axios` import were removed.
- The removed route used Meta client credentials to call Meta token endpoint.

Risk if present:

- Exposes provider behavior.
- Uses app secret in a debug route.
- Could leak sensitive error metadata.
- Was mounted before normal security section in `app.js`.

Expected behavior:

- Debug route should not exist in production.

Recommended minimal fix:

- Keep it removed.
- Commit the removal as a separate backend security cleanup.
- Add a smoke test that `/meta-test` returns `404`.

Production risk:

- If accidentally reintroduced, it is a release-blocking debug exposure.

---

### BUG-007 - Backend files already modified

Severity: P1
Area: Git/release hygiene
Status: Confirmed

Modified backend files:

- `backend/app.js`
- `backend/controllers/recommendationController.js`
- `backend/README.md`

Current backend diff summary:

- `backend/app.js`: removes temporary `/meta-test` route and `axios` import.
- `backend/controllers/recommendationController.js`: removes temporary debug logs.
- `backend/README.md`: documentation changes.

Expected behavior:

- Backend changes should be intentionally reviewed and committed separately from frontend work.

Root cause:

- Backend cleanup changes remain mixed in a dirty worktree with frontend milestone work.

Recommended minimal fix:

- Review backend diff.
- Commit backend cleanup separately if intentional.
- Keep frontend feature work separate.
- Do not merge a mixed dirty branch without review.

Production risk:

- Unreviewed backend changes could be merged accidentally.
- Important backend cleanup could be lost or reverted accidentally.

---

### BUG-008 - Frontend authenticated E2E incomplete

Severity: P1
Area: Frontend + backend integration
Status: Confirmed by blockers and source contracts

Main files:

- `frontend/src/routes/router.jsx`
- `frontend/src/context/AuthContext.jsx`
- `frontend/src/api/client.js`
- `frontend/src/services/authService.js`
- `frontend/src/services/instagramService.js`
- `frontend/src/hooks/useInstagramAccount.js`
- `frontend/src/features/chat/hooks/useChatWorkspace.js`

Implemented:

- Registration page
- OTP verification page
- Login page
- Token storage
- Axios auth header
- 401 cleanup
- Protected routes
- Dashboard shell
- Instagram connect UI
- Analytics UI
- Creator Score UI
- Insights UI
- Recommendations UI
- AI Chat workspace
- Notes module
- Profile/settings
- Password update UI
- Logout support
- Public landing pages
- Light/dark theme

Blocked:

- Full register -> OTP -> login flow due SMTP failure.
- Instagram OAuth success flow due backend JSON callback.
- Instagram-dependent features until account connection succeeds.
- Full authenticated E2E due missing stable verified test user/test OTP flow.

Not configured:

- Frontend unit tests.
- Frontend browser E2E tests.

Recommended minimal fix:

- Fix OTP.
- Fix OAuth callback redirect.
- Add safe dev/test OTP capture.
- Add Playwright/Cypress E2E flow.

Production risk:

- Critical logged-in user journeys remain manually tested only and partially blocked.

---

## 4. OTP and Email Verification Analysis

Current backend OTP flow:

1. `POST /api/auth/register`
2. Validate body with Zod.
3. Check duplicate user.
4. Create user.
5. Delete stale OTP records for email.
6. Generate OTP.
7. Create OTP record.
8. Send OTP email.
9. User verifies OTP through `/api/auth/verify-email`.

Current resend flow:

1. `POST /api/auth/resend-otp`
2. Validate email.
3. Find user.
4. Reject if already verified.
5. Delete old OTP records.
6. Create new OTP record.
7. Send email.

Exact failure point:

- Email sending through Gmail SMTP fails because SMTP authentication is rejected.

Configuration findings:

- `EMAIL_USER` exists locally.
- `EMAIL_PASSWORD` exists locally.
- `EMAIL_FROM` exists locally.
- `emailService.js` currently uses `EMAIL_USER` in `from`, not `EMAIL_FROM`.
- SMTP connection verification logs whether credentials are loaded.

Code-quality findings:

- Email failure happens after DB writes.
- Registration can leave an unverified user when email sending fails.
- Resend can create OTP records that may not be delivered.
- Provider error details may be exposed in development responses/logs.

Expected production behavior:

- Email provider should be reliable.
- User should not be left in broken intermediate state after delivery failure.
- Errors should be safe and user-friendly.

Production email recommendation:

- Use verified-domain provider:
  - SendGrid
  - Resend
  - AWS SES
  - Postmark
  - Mailgun

Safe development testing:

- Mailtrap
- Ethereal
- local SMTP capture
- dev-only OTP retrieval endpoint/script guarded by `NODE_ENV !== production`

Required tests:

- register success with mocked mail
- register email failure rollback
- resend success
- resend mail failure
- invalid OTP
- expired OTP
- already verified user
- login blocked when unverified

---

## 5. Registration and Authentication Analysis

Duplicate behavior:

- Registration duplicate check is in `authService.js`.
- It checks only `User.findOne({ email })`.
- OTP records do not cause `User already exists with this email`.

Email normalization:

- Zod schema uses `.trim().toLowerCase().email(...)`.
- Mongoose field also uses `lowercase: true` and `trim: true`.

Unique index:

- `User.email` has `unique: true`.
- Duplicate key errors are handled in `errorMiddleware.js`.

Validation errors:

- Validation schemas are present.
- Validation middleware currently breaks on invalid input due wrong property.

Login behavior:

- Login checks:
  - user exists
  - password matches
  - email is verified
- Unverified user gets `403`.

Token behavior:

- Backend JWT payload stores user id only.
- Frontend stores JWT in localStorage.
- Axios attaches `Authorization: Bearer <token>`.
- 401 clears token and auth state.

Security note:

- localStorage token is vulnerable to XSS token theft.
- Production may prefer httpOnly secure cookie auth.

---

## 6. Instagram OAuth Analysis

Current connect flow:

1. Frontend calls backend connect endpoint.
2. Backend creates UUID OAuth state.
3. Backend stores `oauth:<uuid> -> userId` in Redis for 10 minutes.
4. Backend returns Meta/Instagram auth URL.
5. Frontend navigates browser to auth URL.

Current callback flow:

1. Meta redirects browser to backend callback.
2. Backend reads `code` and `state`.
3. Backend resolves state to user id from Redis.
4. Backend exchanges code for token.
5. Backend fetches Instagram profile.
6. Backend creates `InstagramAccount`.
7. Backend deletes OAuth state.
8. Backend returns JSON.

Why frontend does not reopen:

- Backend owns callback URL and never redirects to frontend.
- Frontend callback page exists but is not reached in this current flow.

Current frontend callback route:

- `frontend/src/pages/InstagramCallback.jsx` can process `code` and `state`.
- But that only works if the browser lands on the frontend callback route.
- Current backend redirect URI flow lands on backend.

Recommended redirect architecture:

- Keep Meta redirect URI as backend callback.
- Backend processes code/state.
- Backend redirects to frontend.
- Frontend reads success/error status and clears query params.

Safe success URL:

```txt
/instagram?connected=success
```

Safe error URL:

```txt
/instagram/callback?error=oauth_failed
```

Security requirements:

- Never expose access token to frontend.
- Never expose OAuth code to frontend after backend processing.
- Never log full query params.
- Never log auth URL containing state.
- Never accept arbitrary redirect target from query params.
- Use configured allowlisted frontend URL.

State behavior:

- State TTL is 600 seconds.
- Invalid/expired state should redirect to frontend with a safe error message.

Callback authentication:

- Backend callback should not require JWT because Meta calls it directly.
- Redis state provides user association.

---

## 7. Frontend Findings

### Auth Pages

Implemented:

- Login
- Register
- Verify email
- Resend OTP
- Validation
- Error display
- Toasts

Issues:

- Full register flow blocked by backend SMTP.
- Verify page depends on OTP arrival.

### Protected Routing

Implemented:

- `ProtectedRoute`
- `PublicRoute`
- Redirect to login when logged out
- Redirect authenticated users away from login/register

Status:

- Good foundation.

### API Client

Implemented:

- Environment-based base URL.
- Token injection.
- 401 handler.
- FormData content-type cleanup.

Issue:

- Token stored in localStorage. Consider httpOnly cookie for production.

### Dashboard

Implemented:

- Dashboard overview contract.

Issue:

- Backend returns 404 when no Instagram account exists. Frontend must consistently treat this as not-connected, not fatal.

### Instagram

Implemented:

- Connect button.
- OAuth URL flow.
- Callback helper page.
- Status UI.
- Sync workflow.
- Reconnect flow.
- Honest disconnect limitation.

Issue:

- Backend callback does not redirect to frontend.

### Analytics / Creator Score / Insights / Recommendations

Implemented:

- Frontend services and UI exist.

Blocked:

- Full E2E requires connected Instagram account and synced data.

### AI Chat

Implemented:

- Conversation list.
- Create/rename/delete/restore.
- Message send.
- Message history.

Issue:

- Frontend uses non-streaming chat endpoint.
- Backend streaming endpoint exists, but frontend SSE consumption is not implemented.
- Chat creation requires connected Instagram account from dashboard overview.

### Notes

Implemented:

- CRUD.
- Archive/unarchive.
- Pin/unpin.
- Restore.

Status:

- Source contracts exist, but authenticated E2E not completed in this audit.

### Profile / Settings

Implemented:

- User profile display.
- Account readiness.
- Theme preference.
- Password update.
- Plan/usage display.

Issue:

- Some usage values depend on backend exposing fields such as `aiUsageLimit`.

### Frontend Tests

Issue:

- No frontend test script exists.
- Lint/build pass, but no automated UI test coverage.

---

## 8. Backend Findings

### App Setup

Good:

- Helmet mounted.
- CORS mounted.
- Global rate limiter mounted.
- Request logger mounted.
- Body limit configured.
- Routes mounted clearly.

Issues:

- Health endpoint returns environment and uptime. Acceptable for dev; production should review exposure.

### CORS

Good:

- Local frontend origins allowed.

Issues:

- Production must set exact `FRONTEND_URL`.
- CORS rejection should avoid becoming noisy `500` global errors.

### Auth

Good:

- JWT auth middleware exists.
- User lookup verifies token.
- Password hashing and compare methods exist.

Issues:

- Auth middleware contains debug logs:
  - `AUTH START`
  - `TOKEN VERIFIED`
  - `USER QUERY COMPLETED`
  - `USER FOUND`
  - `AUTH NEXT`
- Auth-specific limiter exists but is not mounted on auth routes.

### Validation

Good:

- Zod schemas exist.

Issue:

- Validation middleware uses wrong Zod error property.

### Email OTP

Issue:

- SMTP is currently failing.
- DB writes happen before email send success.

### Instagram OAuth

Good:

- Redis state is used.
- State has TTL.
- Callback does not require JWT, which is correct.

Issues:

- Callback returns JSON.
- Sensitive OAuth data is logged.
- Auth URL and state are logged.

### Dashboard

Issue:

- No connected Instagram account returns 404.
- This is reasonable API behavior but frontend should treat it as expected empty/not-connected state.

### AI Chat

Good:

- Conversation routes exist.
- Streaming route exists.

Issues:

- AI-specific limiter exists but is not mounted on conversation chat routes.
- Frontend does not consume SSE yet.

### Recommendations

Current worktree:

- Recommendation controller debug logs removed.

Release concern:

- Backend change is uncommitted and mixed with frontend work.

### Graceful Shutdown

Good:

- HTTP server shutdown exists.
- Redis quit exists.

Issue:

- Mongoose disconnect is not explicitly called.

---

## 9. Test Suite Findings

Commands run:

```bash
cd frontend
npm run lint
npm run build
```

Results:

- Frontend lint: passed
- Frontend build: passed

Backend commands:

```bash
cd backend
npm test -- --runInBand
npm test -- tests/models tests/utils --runInBand
```

Results:

- Focused backend tests: passed
- Full backend tests: failed

Focused backend passing result:

- 5 suites passed
- 51 tests passed

Full backend failing result:

- 31 suites failed
- 5 suites passed
- 51 tests passed
- Fail reason: empty test suites

Missing critical tests:

- Auth route validation failures.
- Register duplicate casing.
- Register email failure rollback.
- Resend OTP failure handling.
- Login unverified user.
- OAuth valid callback redirect.
- OAuth expired state.
- OAuth duplicate account.
- Dashboard no-account behavior.
- Conversation CRUD.
- Chat message send.
- AI streaming.
- Notes CRUD/restore.
- Instagram media sync.
- Creator score calculate/history.
- Insights generate/list.
- Recommendations generate/list.
- Rate limiter mounting.

Recommendation:

- Remove or implement empty tests.
- Do not use placeholder assertions.
- Add CI command for full backend suite.
- Add frontend E2E script.

---

## 10. Security Findings

### Secrets

Findings:

- No tracked `backend/.env` file found.
- Local `backend/.env` exists and contains sensitive values.
- No secret values were printed in this audit.

Required actions:

- Keep `.env` untracked.
- Rotate secrets if any were ever committed.
- Use secret manager for production.

### Debug Routes

Finding:

- `/meta-test` is removed in current worktree.

Required action:

- Keep it removed and verify `404` before deployment.

### Sensitive Logs

Files with risky logging:

- `backend/config/db.js`
- `backend/config/mail.js`
- `backend/middlewares/authMiddleware.js`
- `backend/controllers/instagramController.js`
- `backend/services/instagramService.js`

Risky log types:

- Mongo URI prefix.
- Email credential presence.
- Auth middleware flow.
- Full OAuth callback query.
- Full callback URL.
- OAuth auth URL.
- OAuth state.
- Provider error response data.

Required action:

- Remove or mask these before production.
- Never log OAuth codes, states, tokens, provider secrets, or full callback URLs.

### CORS

Finding:

- Local CORS is configured.
- Production needs exact allowlist.

Required action:

- Set production `FRONTEND_URL`.
- Avoid wildcard origins.

### Auth

Finding:

- JWT stored in localStorage.

Risk:

- XSS can steal token.

Recommendation:

- Consider httpOnly secure cookies for production.

### Rate Limiting

Finding:

- Specialized auth and AI limiters exist but are not mounted.

Recommendation:

- Mount auth limiter on auth routes.
- Mount AI limiter on chat generation routes.

### OAuth

Finding:

- Backend OAuth state approach is good.
- Redirect architecture and logging need production hardening.

---

## 11. Production Configuration Findings

### MongoDB

- Active DB name observed: `social_media_analytics`.
- Remove/mask Mongo URI startup log.
- Ensure production DB is separate from dev/test.
- Confirm indexes before launch.

### Redis

- Required for OAuth state.
- Use authenticated/TLS Redis in production.
- Monitor Redis availability.

### SMTP

- Current Gmail setup is not production-ready.
- Use app password for development or real provider for production.
- Validate SMTP variables in production env validation.

### Meta / Instagram

- Redirect URI must exactly match Meta app settings.
- Production callback must be HTTPS.
- Permissions must be approved.
- Account must be professional/business where required.

### AI Providers

- At least one provider is required.
- Add provider fallback tests.
- Add usage-limit tests.

### Cloudinary

- Configured.
- Ensure upload folder limits and allowed types are enforced.

### Frontend Origin

- Must be exact production frontend URL.
- Must match backend CORS.

### Callback URLs

- Need explicit frontend callback/result URL.
- Must be allowlisted.
- Must avoid open redirects.

### Environment Validation

Currently validates:

- `PORT`
- `MONGO_URI`
- `JWT_SECRET`
- Cloudinary variables
- at least one AI provider

Should also validate in production:

- `REDIS_URL`
- `FRONTEND_URL`
- email provider variables
- Instagram app id/secret/redirect URI
- frontend callback URL

---

## 12. Prioritized Fix Plan

| Order | Severity | Issue | Area | Minimal Fix | Test Required | Estimated Risk |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | P0 | Invalid validation returns 500 | Backend | Use `result.error.issues` in `validateRequest.js` | Auth validation tests | Low |
| 2 | P0 | OTP email fails | Backend/config | Fix email provider and add rollback-safe flow | Mock mail success/failure tests | Medium |
| 3 | P0 | OAuth callback stops on backend JSON | Backend/frontend config | Redirect to allowlisted frontend result URL | OAuth callback redirect tests | Medium |
| 4 | P0 | Sensitive debug logs | Backend | Remove/mask OAuth/auth/Mongo/SMTP logs | Log/security review | Low |
| 5 | P0 | Full backend tests fail | Backend tests | Remove empty suites or write real tests | Full `npm test` passes | Medium |
| 6 | P1 | Dirty backend files mixed with frontend | Git/release | Review and separate backend commit | Clean status review | Low |
| 7 | P1 | Deleted-user confusion | Backend/config | Add masked active DB diagnostics and duplicate tests | Email normalization tests | Medium |
| 8 | P1 | Auth limiter not mounted | Backend | Mount `authRateLimiter` | Rate-limit route tests | Low |
| 9 | P1 | AI limiter not mounted | Backend | Mount `aiChatRateLimiter` | AI rate-limit tests | Low |
| 10 | P1 | Dashboard no-account state | Backend/frontend | Return/handle clean not-connected state | Dashboard no-account test | Medium |
| 11 | P1 | Instagram disconnect unavailable | Backend/frontend | Add disconnect route or keep informational UI | Disconnect tests | Medium |
| 12 | P1 | Authenticated E2E missing | QA/frontend | Add safe OTP capture and browser E2E | E2E test suite | Medium |
| 13 | P2 | JWT in localStorage | Auth/security | Consider httpOnly secure cookie | Auth regression tests | Medium |
| 14 | P2 | Mongoose not explicitly disconnected | Backend | Disconnect Mongoose in shutdown | Shutdown test/manual check | Low |
| 15 | P2 | SMTP env not validated | Backend config | Validate email vars in production | Env validation tests | Low |

---

## 13. Manual E2E Retest Plan

Run this only after P0 fixes are completed.

1. Reset only development test data.
   - Expected: active dev database is confirmed and no production data is touched.

2. Register a new user.
   - Expected: valid request returns `201`.
   - Expected: invalid request returns `400`.

3. Verify OTP.
   - Expected: OTP arrives through safe provider/capture.
   - Expected: correct OTP returns `200`.
   - Expected: wrong OTP returns `400`.

4. Login.
   - Expected: verified user logs in successfully.
   - Expected: token is stored.
   - Expected: `/dashboard` becomes accessible.

5. Protected routing.
   - Expected: logged-out product routes redirect to `/login`.
   - Expected: logged-in login/register routes redirect to `/dashboard`.

6. Connect Instagram.
   - Expected: frontend starts auth flow.
   - Expected: Meta returns to backend.
   - Expected: backend redirects to frontend success URL.

7. Sync Instagram.
   - Expected: media sync completes or shows safe provider/permission error.

8. Dashboard.
   - Expected: account, stats, score, insights, and empty states render.

9. Analytics.
   - Expected: latest and history render or empty state appears.

10. Creator Score.
    - Expected: calculate/latest/history work.

11. Insights.
    - Expected: generate/list work.

12. Recommendations.
    - Expected: generate/list work after required account data exists.

13. AI Chat.
    - Expected: create conversation, send message, load history, rename, delete, restore.

14. Notes.
    - Expected: create, update, archive, unarchive, pin, unpin, delete, restore.

15. Profile/settings.
    - Expected: user fields render.
    - Expected: theme toggles work.
    - Expected: password update works.

16. Logout/login persistence.
    - Expected: logout clears token.
    - Expected: reload with valid token keeps session.
    - Expected: invalid token redirects to login.

17. Mobile/light/dark QA.
    - Expected: no horizontal overflow.
    - Expected: sidebar/drawer usable.
    - Expected: contrast and layout are acceptable.

---

## 14. Files That Should Change Later

Backend:

- `backend/middlewares/validateRequest.js`
- `backend/routes/authRoutes.js`
- `backend/services/authService.js`
- `backend/services/emailService.js`
- `backend/config/mail.js`
- `backend/config/validateEnv.js`
- `backend/controllers/instagramController.js`
- `backend/services/instagramService.js`
- `backend/services/oauthStateService.js`
- `backend/middlewares/authMiddleware.js`
- `backend/config/db.js`
- `backend/routes/conversationRoutes.js`
- `backend/server.js`
- `backend/tests/**`

Frontend:

- `frontend/src/pages/Instagram.jsx`
- `frontend/src/pages/InstagramCallback.jsx`
- `frontend/src/hooks/useInstagramAccount.js`
- `frontend/src/services/instagramService.js`
- `frontend/src/api/client.js` if auth transport changes
- frontend test config files once E2E is added

Documentation:

- `backend/README.md`
- `frontend/README.md`
- deployment docs

---

## 15. Files That Must Not Be Broadly Refactored

These areas are stable enough for targeted fixes only:

- `backend/app.js`
- `backend/server.js`
- `backend/models/User.js`
- `backend/models/InstagramAccount.js`
- `frontend/src/routes/router.jsx`
- `frontend/src/context/AuthContext.jsx`
- `frontend/src/api/client.js`
- shared frontend UI components
- main page layouts

Reason:

- Broad refactors here would increase regression risk near release.
- The needed changes are surgical and contract-focused.

---

## 16. Final Readiness Verdict

Verdict:

**Not ready for production.**

Reason:

The product is substantially implemented, but production release should wait until all P0 items are fixed and verified:

- Validation middleware returns correct `400` errors.
- OTP email delivery works reliably.
- Registration handles email failure safely.
- Instagram OAuth redirects back to frontend.
- Sensitive debug logs are removed.
- Full backend test suite passes.

After P0 fixes, complete P1 items and run the full manual E2E retest plan before public launch.
