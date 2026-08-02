# Deployment-Day Release Report

## Scope

This release-preparation pass focuses on final deployment blockers:

- Instagram public profile metrics.
- Honest sparse-data states.
- AI chat SSE streaming.
- Public contact form delivery.
- Landing/contact polish.
- Release validation artifacts.

## Backend Changes

- Instagram profile fetch now requests real profile metrics from Meta:
  - `followers_count`
  - `follows_count`
  - `media_count`
  - `profile_picture_url`
  - `name`
- Instagram accounts now store metric availability flags so the frontend can distinguish `0` from unavailable data.
- OAuth reconnect for the same user refreshes the saved token/profile instead of failing as an already-connected account.
- Dashboard account payload includes metric availability.
- AI creator context no longer converts missing analytics/score values into zero.
- SSE chat stream uses a newline-safe event writer and returns friendly stream errors.
- Instagram media sync and analytics snapshot logging are structured and avoid raw provider dumps.
- Public contact endpoint added at `POST /api/contact`.
- Contact submission uses backend email delivery and returns success only after the send call completes.
- Contact form is rate limited.
- Production env validation now requires `CONTACT_RECEIVER_EMAIL`.

## Frontend Changes

- Chat workspace now consumes `POST /api/conversation/:conversationId/chat/stream`.
- SSE chunks render live in the assistant message bubble.
- Chat input supports stopping an active stream.
- Stream model, cancellation, and error states are visible.
- Instagram and analytics metric cards show `Unavailable` for missing provider data.
- Dashboard and Creator Score cards avoid fake zero states when no real score exists.
- Contact form now posts to the backend contact endpoint.
- Contact success is shown only after backend-confirmed delivery.
- Contact failure shows a public email fallback.
- Public contact email and optional phone are read from frontend env config.

## Tests Added

- Contact validator tests.
- Contact email builder tests.

## Required Environment Variables

Backend:

- `CONTACT_RECEIVER_EMAIL`

Frontend:

- `VITE_CONTACT_EMAIL`
- `VITE_CONTACT_PHONE`

## External Dependencies To Verify Manually

- Gmail SMTP or production SMTP delivery.
- Meta OAuth app role/tester/live-mode access.
- Instagram professional account permissions.
- Meta returning profile metric fields for the connected account.
- AI provider availability for SSE streaming.

## Known Limitations

- Meta may not return every metric for every account or permission state.
- Instagram insights and media depth depend on granted scopes and account type.
- Contact delivery depends on SMTP provider health.
- SSE streaming depends on the active AI provider and network stability.

## Release Readiness Notes

The code is structured for deployment-day validation. Before deploying, execute `DEPLOYMENT_DAY_MANUAL_CHECKLIST.md` against the real production environment and verify email delivery, Instagram metrics, SSE streaming, and contact delivery manually.
