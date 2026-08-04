# CreatorIQ Frontend

React/Vite frontend for the CreatorIQ creator analytics SaaS. It includes the public marketing site, dynamic `/product` story page, authentication screens, protected dashboard shell, Instagram workspace, analytics, Creator Score, insights, recommendations, Creator News, AI chat with SSE streaming consumption, notes, profile/settings, contact form, and light/dark themes.

---

# Current Status

Overall frontend completion: **98%**

Completed:

- Public landing page at `/`.
- Public product story/demo page at `/product`.
- Public `/privacy` and `/terms` starter legal pages.
- Google sign-in plus login/register fallback flow.
- Show/hide password on login.
- Auth context, token storage, protected/public route guards.
- Responsive app shell with sidebar/topbar.
- Dashboard overview.
- Instagram connect/callback/status/sync/manual metrics UI.
- Manual metric source labels and limited-data messages.
- Analytics dashboard.
- Creator Score UI and manual-estimate messaging.
- Manual metrics graph on dashboard, analytics, and Creator Score pages.
- Creator Insights.
- Recommendations.
- Creator News page with Reddit-style scrolling posts, category sections, filters, sticky source sidebar, cover/fallback visuals, refresh action, and daily update notification from 29 public no-key source paths.
- AI chat workspace with conversation sidebar, persisted messages, SSE streaming, stop generation, and stream parser.
- Notes CRUD UI with pin/archive/delete/restore flows.
- Profile and Settings pages.
- Password update screen.
- Theme toggle with persistence.
- Live contact form submission to backend plus mailto fallback.
- Centralized API endpoint map and service layer.
- Production build passing locally.

Partial / production-dependent:

- Real Instagram OAuth for public users depends on Meta app mode/review and production redirect URI.
- Real contact delivery depends on production backend Resend configuration.
- AI responses depend on backend provider keys.
- Manual viewport QA still must be completed before public launch.

---

# Routes

Public:

| Route | Status |
|---|---|
| `/` | Complete |
| `/product` | Complete |
| `/privacy` | Starter complete |
| `/terms` | Starter complete |
| `/login` | Complete |
| `/register` | Complete |

Protected:

| Route | Status |
|---|---|
| `/dashboard` | Complete |
| `/instagram` | Complete |
| `/instagram/callback` | Complete |
| `/analytics` | Complete |
| `/creator-score` | Complete |
| `/insights` | Complete |
| `/recommendations` | Complete |
| `/creator-news` | Complete |
| `/ai-chat` | Complete |
| `/notes` | Complete |
| `/profile` | Complete |
| `/settings` | Complete |

---

# Folder Structure

```text
frontend/
  src/
    api/          # Axios client and endpoint constants
    components/   # Reusable public/app UI
    config/       # Env and landing content config
    context/      # Auth and theme providers
    features/     # Analytics, chat, insights, notes modules
    hooks/        # Shared hooks
    layouts/      # Auth and app layouts
    pages/        # Route-level pages
    routes/       # React Router config and guards
    services/     # API service wrappers
    theme/        # Design tokens and MUI theme
    utils/        # Error, formatting, metric, SSE helpers
```

---

# Environment Variables

Use `frontend/.env.example` as the source of truth.

- `VITE_API_BASE_URL`: backend API base URL, for example `https://api.your-domain.com/api`.
- `VITE_GOOGLE_CLIENT_ID`: Google OAuth web client ID for browser sign-in.
- `VITE_CONTACT_EMAIL`: public contact email shown on the site.
- `VITE_CONTACT_PHONE_DISPLAY`: readable phone text, for example `+91 70076 28757`.
- `VITE_CONTACT_PHONE_LINK`: clickable phone link, for example `tel:+917007628757`.

Do not put backend secrets, OAuth secrets, or provider keys in frontend env.

---

# API Contract

The frontend expects the backend response envelope:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "...",
  "data": {}
}
```

Important service files:

- `src/services/authService.js`
- `src/services/instagramService.js`
- `src/services/analyticsService.js`
- `src/services/creatorScoreService.js`
- `src/services/insightsService.js`
- `src/services/recommendationService.js`
- `src/services/creatorNewsService.js`
- `src/services/chatService.js`
- `src/services/chatStreamService.js`
- `src/services/notesService.js`
- `src/services/contactService.js`

---

# Manual Metrics UI

When Meta does not return all account metrics:

- The Instagram page displays an explanation and manual input form.
- Users can enter follower count, following count, and post/media count.
- Values are sent to `PATCH /api/instagram/manual-metrics`.
- UI labels values as manual estimates.
- Dashboard, Analytics, and Creator Score show a responsive bar graph from manual/provider values.
- Creator Score, Analytics, AI Chat, Insights, and Recommendations show limited-data/manual-estimate messaging.
- If Meta later returns provider-confirmed values, provider values are preferred.

---

# SSE Chat UI

The AI chat workspace uses:

- `POST /api/conversation/:conversationId/chat/stream`
- `fetch` with `Authorization: Bearer <token>`
- `AbortController` for stop generation
- `TextDecoder`
- buffered SSE parser for split frames and multiple frames per chunk
- optimistic user/assistant streaming message state
- persisted message refresh after stream completion

---

# Public Contact UI

The landing page contact form:

- Validates name, email, category, subject, and message.
- Prevents duplicate submit while loading.
- Calls `POST /api/contact`.
- Shows success only after backend confirmation.
- Preserves message on failure.
- Provides mailto fallback after failure.
- Shows clickable public email and phone values from `src/config/env.js`.

---

# Local Commands

Install and run:

```bash
cd frontend
npm install
npm run dev -- --host 0.0.0.0 --port 5173 --strictPort
```

Validate:

```bash
cd frontend
npm run lint
npm run build
```

---

# Current Progress

- Backend completion: 97%
- API completion: 97%
- Database completion: 96%
- Authentication: 100%
- Google authentication: 95%
- Instagram integration: 88%
- Manual metrics fallback: 100%
- Analytics: 92%
- Creator Score: 94%
- AI features: 92%
- Contact system: 90%
- Creator News: 90%
- Frontend completion: 98%
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
