# Backend Manual Retest Checklist

Use this checklist before considering the backend ready for final frontend integration or production deployment.

---

# Setup

- [ ] Confirm current branch is `fix/backend-production-stabilization`.
- [ ] Confirm no backend secrets are committed.
- [ ] Confirm `.env` contains valid local values.
- [ ] Start MongoDB.
- [ ] Start Redis.
- [ ] Use a valid SMTP app password or production SMTP credentials.
- [ ] Use valid Instagram OAuth credentials if testing Instagram.

---

# Install And Test

```bash
cd ~/Downloads/social-media-analytics-dashboard/backend
npm install
npm test -- --runInBand
```

Expected result:

- [ ] Jest passes.
- [ ] No empty test suite failures.
- [ ] No Redis/Mongo open handle warnings after tests.

---

# Start Backend

```bash
cd ~/Downloads/social-media-analytics-dashboard/backend
npm run dev
```

Expected result:

- [ ] Environment validation succeeds.
- [ ] MongoDB connects.
- [ ] Redis connects.
- [ ] Mail verification logs safe status without exposing credentials.
- [ ] Email queue worker starts when `REDIS_URL` is configured.
- [ ] Automation scheduler starts.

---

# Health And Readiness

```bash
curl http://localhost:5000/api/health
curl http://localhost:5000/api/ready
```

Expected result:

- [ ] `/api/health` returns `200`.
- [ ] `/api/ready` returns `200` when MongoDB and Redis are connected.
- [ ] `/api/ready` returns `503` if MongoDB or Redis is unavailable.

---

# Authentication And OTP

- [ ] Register a new account.
- [ ] Confirm registration returns success only after verification email delivery succeeds.
- [ ] Confirm failed email delivery does not leave a newly created unusable user.
- [ ] Confirm duplicate verified email returns `409`.
- [ ] Confirm duplicate unverified email triggers resend/recovery flow.
- [ ] Confirm resend OTP works after cooldown.
- [ ] Confirm resend OTP is blocked during cooldown with `429`.
- [ ] Confirm valid OTP verifies the account.
- [ ] Confirm used OTP records are deleted after verification.
- [ ] Confirm login fails before email verification with `403`.
- [ ] Confirm login succeeds after verification.

---

# Rate Limits

- [ ] Repeated auth attempts eventually return `429`.
- [ ] Repeated chat/AI generation attempts eventually return `429`.
- [ ] Rate limit responses use the standard API response shape.

---

# Instagram OAuth

- [ ] Frontend requests `GET /api/instagram/connect`.
- [ ] Backend returns an OAuth URL.
- [ ] Meta redirects to `GET /api/instagram/oauth/callback`.
- [ ] On success, backend redirects back to frontend callback URL.
- [ ] On provider/user cancellation, backend redirects with a safe `oauth_cancelled` error.
- [ ] Invalid or expired OAuth state redirects with a safe `invalid_state` error.
- [ ] Backend logs do not expose OAuth state, auth URL, provider payloads, or access tokens.

---

# Debug Route And Logging

- [ ] `GET /meta-test` is not available.
- [ ] Backend logs do not print `JWT_SECRET`.
- [ ] Backend logs do not print `EMAIL_PASSWORD`.
- [ ] Backend logs do not print Instagram access tokens.
- [ ] Backend logs do not print OAuth callback raw query payloads.

---

# Graceful Shutdown

While backend is running:

```bash
Ctrl+C
```

Expected result:

- [ ] HTTP server closes.
- [ ] Email worker closes.
- [ ] Email queue connections close.
- [ ] Redis connection closes.
- [ ] MongoDB connection closes.
- [ ] Process exits cleanly.

---

# Final Release Gate

- [ ] Backend tests pass.
- [ ] Frontend tests/build pass.
- [ ] Full login/register/verify/login flow works locally.
- [ ] Instagram connect flow returns to frontend.
- [ ] No backend secrets committed.
- [ ] No unrelated frontend source changes included in backend stabilization commit.
