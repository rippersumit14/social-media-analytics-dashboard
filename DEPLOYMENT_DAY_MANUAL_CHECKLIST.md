# Deployment-Day Manual Checklist

Use this checklist before deploying CreatorIQ to production.

## Environment

- [ ] Backend `.env` contains production `FRONTEND_URL`.
- [ ] Backend `.env` contains production `FRONTEND_ALLOWED_ORIGINS`.
- [ ] Backend `.env` contains valid `CONTACT_RECEIVER_EMAIL`.
- [ ] Backend `.env` contains valid Gmail SMTP app password or production SMTP credentials.
- [ ] Backend `.env` contains valid Instagram app id, secret, redirect URI, and frontend callback URL.
- [ ] Frontend `.env` contains production `VITE_API_BASE_URL`.
- [ ] Frontend `.env` contains public `VITE_CONTACT_EMAIL`.
- [ ] No secret values are present in frontend environment variables.

## Backend Startup

- [ ] MongoDB connects successfully.
- [ ] Redis connects successfully.
- [ ] Mail server verifies successfully.
- [ ] `/api/health` returns healthy status.
- [ ] `/api/ready` returns ready status.

## Authentication

- [ ] Register with a new email.
- [ ] Receive OTP email.
- [ ] Verify email using OTP.
- [ ] Resend OTP works when requested.
- [ ] Login works after verification.
- [ ] Protected frontend routes redirect when logged out.

## Instagram OAuth

- [ ] Meta app redirect URI matches backend `INSTAGRAM_REDIRECT_URI`.
- [ ] Frontend callback URL matches `INSTAGRAM_FRONTEND_CALLBACK_URL`.
- [ ] Test user has accepted tester invitation if app is in development mode.
- [ ] Test Instagram account is a professional creator or business account.
- [ ] OAuth redirects back to `/instagram/callback`.
- [ ] Connected account appears in the Instagram page.
- [ ] Followers and media count show real values when Meta returns them.
- [ ] Metrics show `Unavailable` when Meta does not return them.

## Analytics And Creator Score

- [ ] Media sync completes without exposing provider errors in logs.
- [ ] Analytics snapshot generates after media sync.
- [ ] Creator Score page does not show fake zero for missing data.
- [ ] Dashboard metric cards show unavailable values honestly.

## AI Chat SSE

- [ ] Create a conversation.
- [ ] Send a message.
- [ ] Assistant response streams chunk by chunk.
- [ ] Stop button cancels a running stream.
- [ ] Completed stream saves the assistant message.
- [ ] Network or provider failure shows a friendly error.
- [ ] Browser refresh loads saved message history.

## Contact Form

- [ ] Submit valid contact form.
- [ ] Backend returns success only after delivery succeeds.
- [ ] Receiver inbox gets the contact message.
- [ ] Reply-to points to the visitor email.
- [ ] Invalid contact form values show validation errors.
- [ ] Rate limit shows a friendly message after repeated submissions.
- [ ] Email fallback remains available if backend delivery fails.

## Frontend QA

- [ ] Homepage renders on desktop.
- [ ] Homepage renders on mobile.
- [ ] Login page renders on desktop and mobile.
- [ ] Register page renders on desktop and mobile.
- [ ] Dashboard renders in authenticated state.
- [ ] Sidebar/drawer works on mobile.
- [ ] No layout overlap in primary pages.
- [ ] Light and dark themes are readable.

## Final Commands

- [ ] Backend tests pass.
- [ ] Frontend lint passes.
- [ ] Frontend production build passes.
- [ ] `git diff --check` passes.
- [ ] Git status contains only intended scoped changes.
