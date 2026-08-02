# CreatorIQ Frontend

Frontend for the AI-powered Creator Analytics SaaS. It provides the authenticated SaaS app experience and the public SaaS website for creator analytics, AI chat, creator score, insights, notes, and account workflows.

---

# Tech Stack

- React 19 + Vite
- React Router
- TanStack React Query
- Axios
- Tailwind CSS
- MUI + Emotion
- Lucide React icons
- Recharts
- React Hot Toast
- Oxlint

---

# Current Project Status

Overall completion: **97%**

Completed modules:

- Fresh frontend scaffold and project foundation
- Shared API client, endpoint map, route map, environment config
- Authentication with register, login, logout, OTP verification
- Token storage, Axios auth headers, unauthorized handling
- Protected/public routes
- SaaS app shell with sidebar, topbar and mobile layout
- Dashboard overview foundation
- AI chat workspace with conversation sidebar and message UI
- Analytics dashboard and creator score UI
- Creator insights workspace
- Personal notes workspace
- Public SaaS landing page
- Light/dark theme system with persistence and system preference
- Public CTA contract, FAQ, pricing preview, contact mailto flow
- Instagram account management page
- Instagram OAuth frontend start and backend-redirect callback result handling
- Instagram connection state, sync workflow, reconnect flow and disconnect limitation UI
- Frontend-backend contract audit documentation
- Shared API client multipart/form-data hardening
- Read-only profile page using real current-user and Instagram account data
- Settings page with supported password update, theme preference, and unavailable-state sections
- AI usage and plan display based only on user fields returned by the backend
- Recommendations page and service integration
- Recently deleted note restore UI for the backend restore endpoint
- Final frontend polish pass across shared UI, app shell, auth shell, chat, insights and notes surfaces
- Final frontend release alignment with stabilized backend auth, OTP, OAuth redirect and rate-limit behavior
- Local lint/build verification after each completed milestone

Modules in progress:

- Subscription/plan UI based on existing backend capabilities
- End-to-end verification with real connected backend data
- Final manual responsive and accessibility QA

Pending modules:

- Final responsive QA with real browser/device coverage
- Final E2E testing with a real connected Instagram account
- Frontend SSE streaming consumption for backend chat stream route
- Production deployment integration

---

# Folder Structure

```text
frontend/
├── public/                 # Static public assets
├── src/
│   ├── api/                # Axios client and backend endpoint constants
│   ├── assets/             # Frontend asset notes/placeholders
│   ├── components/
│   │   ├── common/         # Shared page helpers
│   │   ├── instagram/      # Instagram account management and OAuth UI
│   │   ├── landing/        # Public SaaS landing sections and interactions
│   │   ├── layout/         # Authenticated app shell navigation
│   │   ├── theme/          # Theme toggle components
│   │   └── ui/             # Shared UI primitives
│   ├── config/             # Env config and landing content config
│   ├── context/            # Auth and theme providers
│   ├── features/           # Feature-specific components and hooks
│   ├── hooks/              # Shared hooks
│   ├── layouts/            # AppLayout and AuthLayout
│   ├── pages/              # Route-level pages
│   ├── routes/             # Router, route constants, guards, lazy imports
│   ├── services/           # API service layer
│   ├── theme/              # Design tokens and MUI theme factory
│   ├── utils/              # Error, auth storage, formatting helpers
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── package.json
└── README.md
```

Important folder notes:

- `api/` and `services/` define the stable frontend/backend contract surface.
- `context/` owns auth and theme state.
- `routes/` owns public/protected routing and lazy page imports.
- `components/landing/` owns the public SaaS website.
- `components/instagram/` owns the Instagram account management experience.
- `features/` keeps logged-in product modules modular.
- `theme/` centralizes reusable design tokens and MUI overrides.

---

# Stable Frontend Contracts

## Runtime

- Local frontend origin: `http://localhost:5173`
- Local backend API base: `VITE_API_BASE_URL=http://localhost:5000/api`
- Public contact email variable: `VITE_CONTACT_EMAIL`
- Avoid `127.0.0.1` or Vite fallback `5174` for backend integration because backend CORS is configured around `localhost:5173`.

## Routing

| Route | Type | Status |
|---|---|---|
| `/` | Public landing | Complete |
| `/landing` | Public alias | Redirects to `/` |
| `/privacy` | Public legal draft | Complete starter page |
| `/terms` | Public legal draft | Complete starter page |
| `/login` | Public auth | Complete |
| `/register` | Public auth | Complete |
| `/verify-email` | Public auth | Complete |
| `/dashboard` | Protected app | Complete |
| `/analytics` | Protected app | Complete |
| `/creator-score` | Protected app | Complete |
| `/insights` | Protected app | Complete |
| `/recommendations` | Protected app | Complete recommendations workspace |
| `/ai-chat` | Protected app | Complete |
| `/notes` | Protected app | Complete |
| `/instagram` | Protected app | Complete Instagram connection workspace |
| `/instagram/callback` | Protected app | Reads safe backend OAuth result params |
| `/settings` | Protected app | Complete settings and security workspace |
| `/profile` | Protected app | Complete read-only profile workspace |

## API Response Shape

Services expect the backend response envelope:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "...",
  "data": {}
}
```

## Auth Contract

- Token is stored in `localStorage`.
- Axios automatically attaches `Authorization: Bearer <token>`.
- `401` responses clear stored token and trigger auth cleanup.
- App load checks `/api/auth/me` when a token exists.
- Logged-out users are redirected to `/login` for protected app routes.
- Logged-in users are redirected away from `/login` and `/register`.
- Public landing page remains accessible whether logged in or logged out.

---

# Public CTA Contract

| CTA | Logged-out behavior | Logged-in behavior |
| --- | ------------------- | ------------------ |
| Brand logo | Navigate to `/` and scroll top | Navigate to `/` and scroll top |
| Overview | Scroll to overview section | Scroll to overview section |
| Problems | Scroll to problems section | Scroll to problems section |
| Features | Scroll to features section | Scroll to features section |
| How It Works | Scroll to workflow section | Scroll to workflow section |
| Tutorial | Scroll to tutorial section | Scroll to tutorial section |
| Pricing | Scroll to pricing section | Scroll to pricing section |
| FAQ | Scroll to FAQ section | Scroll to FAQ section |
| Contact | Scroll to contact section | Scroll to contact section |
| Log in | Navigate to `/login` | Hidden where redundant |
| Start free | Navigate to `/register` | Replaced by Open dashboard |
| Open dashboard | Not shown | Navigate to `/dashboard` |
| See how it works | Scroll to workflow section | Scroll to workflow section |
| Explore product workflow | Navigate to `/register` | Navigate to `/dashboard` |
| View analytics | Navigate to `/register` | Navigate to `/analytics` |
| Start an AI conversation | Navigate to `/register` | Navigate to `/ai-chat` |
| Organize your strategy | Navigate to `/register` | Navigate to `/notes` |
| View Creator Score | Navigate to `/register` | Navigate to `/creator-score` |
| Open Instagram setup | Navigate to `/login` | Navigate to `/instagram` |
| Open insights | Navigate to `/register` | Navigate to `/insights` |
| Join waitlist | Opens contact dialog and preselects `Plan or waitlist` | Same |
| Send contact message | Validates form and opens `mailto:` | Same |
| Theme button | Toggles light/dark and persists choice | Same |
| Mobile menu | Opens/closes MUI Drawer | Same |
| Back to top | Smooth-scrolls to top | Same |
| Public AI prompt chips | Update local demo response only | Same |

Notes:

- Contact form currently uses `mailto:`.
- Public AI preview is demonstration-only and does not call the backend.
- Pricing is informational only and does not start payment behavior.
- Instagram production behavior still depends on backend OAuth and account configuration.

---

# Instagram Frontend-Backend Contract

Verified from current repository code during Day 8.

| Frontend Function | Method | Backend Route | Purpose |
|---|---|---|---|
| `getConnectionUrl()` | GET | `/api/instagram/connect` | Creates Redis OAuth state and returns `data.authURL` for full-page redirect. |
| `getConnectedAccount()` | GET | `/api/dashboard/overview` | Uses dashboard overview as the available account-status source; `data.account` is connected account data. |
| `syncMedia()` | POST | `/api/instagram/media/sync` | Synchronously syncs Instagram media and returns sync counts. |
| `createAnalyticsSnapshot()` | POST | `/api/instagram/analytics/snapshot` | Creates an analytics snapshot after media sync. |

Detailed contract notes:

- `/api/instagram/connect` is protected and requires `Authorization: Bearer <token>`.
- Backend success envelope returns `success`, `statusCode`, `message`, and `data`.
- Connect response uses `data.authURL`.
- Meta redirects to backend `GET /api/instagram/oauth/callback`.
- The stabilized backend processes `code/state`, stores the account, then redirects to the frontend callback URL.
- The frontend callback page reads only safe result params such as `connected=success` or `error=invalid_state`.
- The frontend no longer forwards raw OAuth `code/state` values.
- No dedicated connected-account endpoint exists; the frontend uses `/api/dashboard/overview` and treats account-related 404s as `not connected`.
- No backend disconnect/delete route exists; the frontend does not fake disconnect behavior.
- No sync-status polling endpoint exists; sync is handled as a synchronous request.

---

# Important Files

| Path | Purpose | Current Status |
|---|---|---|
| `frontend/src/main.jsx` | React root, QueryClient, AuthProvider, ThemeProvider | Active |
| `frontend/src/App.jsx` | Router and toast host | Active |
| `frontend/src/index.css` | Tailwind theme, landing CSS variables, reveal/reduced-motion styles | Active |
| `frontend/src/config/env.js` | API and contact environment config | Active |
| `frontend/src/config/landingContent.js` | Data-driven public landing content | Active |
| `frontend/src/theme/tokens.js` | Light/dark design tokens | Active |
| `frontend/src/theme/createAppTheme.js` | MUI theme and component overrides | Active |
| `frontend/src/context/ThemeContext.jsx` | Theme state, persistence, system preference | Active |
| `frontend/src/context/themeContextValue.js` | Theme context value | Active |
| `frontend/src/components/theme/ThemeToggle.jsx` | Accessible theme toggle | Active |
| `frontend/src/components/landing/PublicNavbar.jsx` | Sticky public navbar and MUI drawer | Active |
| `frontend/src/components/landing/ProductPreview.jsx` | Demo product preview and local AI prompt chips | Active |
| `frontend/src/components/landing/LandingSections.jsx` | Public landing sections, FAQ, contact, footer | Active |
| `frontend/src/components/landing/BackToTopButton.jsx` | Back-to-top control | Active |
| `frontend/src/components/landing/Reveal.jsx` | Intersection Observer reveal wrapper | Active |
| `frontend/src/components/landing/SectionContainer.jsx` | Shared landing section layout | Active |
| `frontend/src/components/instagram/InstagramAccountCard.jsx` | Connected Instagram account card | Active |
| `frontend/src/components/instagram/InstagramConnectEmptyState.jsx` | Not-connected state and connect CTA | Active |
| `frontend/src/components/instagram/InstagramStatusBanner.jsx` | Connection, sync and error status banner | Active |
| `frontend/src/components/instagram/InstagramSyncPanel.jsx` | Sync action and result summary | Active |
| `frontend/src/components/instagram/InstagramSetupGuide.jsx` | OAuth setup, security and troubleshooting guide | Active |
| `frontend/src/components/instagram/InstagramDisconnectDialog.jsx` | Documents disconnect limitation | Active |
| `frontend/src/components/instagram/InstagramCallbackStatus.jsx` | OAuth callback status UI | Active |
| `frontend/src/components/instagram/InstagramAccountSkeleton.jsx` | Instagram loading skeleton | Active |
| `frontend/src/pages/Landing.jsx` | Public landing page route | Complete |
| `frontend/src/pages/Privacy.jsx` | Starter privacy draft | Complete starter |
| `frontend/src/pages/Terms.jsx` | Starter terms draft | Complete starter |
| `frontend/src/pages/Instagram.jsx` | Instagram account management page | Complete |
| `frontend/src/pages/InstagramCallback.jsx` | OAuth callback helper page | Complete |
| `frontend/src/pages/Profile.jsx` | Read-only profile and connected-account page | Complete |
| `frontend/src/pages/Settings.jsx` | Settings, password update, AI usage and plan UI | Complete |
| `frontend/src/pages/Recommendations.jsx` | Recommendations list/generate workspace | Complete |
| `frontend/src/api/client.js` | Axios client and auth interceptors | Active |
| `frontend/src/api/endpoints.js` | Stable backend endpoint constants | Active |
| `frontend/src/routes/router.jsx` | Public/protected routing | Active |
| `frontend/src/routes/lazyPages.jsx` | Lazy route imports | Active |
| `frontend/src/context/AuthContext.jsx` | Auth session lifecycle | Active |
| `frontend/src/services/*.js` | Backend API service modules | Active |
| `frontend/src/services/recommendationService.js` | Recommendation API service | Active |
| `frontend/src/hooks/useInstagramAccount.js` | Instagram account state and mutations | Active |
| `frontend/src/utils/normalizeInstagramError.js` | Instagram error normalization | Active |
| `frontend/src/pages/Login.jsx` | Login page | Complete |
| `frontend/src/pages/Signup.jsx` | Register page | Complete |
| `frontend/src/pages/VerifyEmail.jsx` | OTP verification page | Complete |
| `frontend/src/pages/Dashboard.jsx` | Dashboard overview | Complete |
| `frontend/src/pages/AIChat.jsx` | AI chat workspace | Complete |
| `frontend/src/pages/Analytics.jsx` | Analytics dashboard | Complete |
| `frontend/src/pages/CreatorScore.jsx` | Creator score page | Complete |
| `frontend/src/pages/Insights.jsx` | Creator insights workspace | Complete |
| `frontend/src/pages/Notes.jsx` | Personal notes workspace | Complete |
| `frontend/.env.example` | Public frontend environment example | Active |

---

# Development Timeline

## Day 1 - Fresh Frontend Foundation

- Built Vite React app, Tailwind setup, route map and base layouts.
- Added API endpoint constants and HTTP service wrapper.
- Added shared UI primitives and placeholder pages.
- Added initial dashboard/auth shell structure.
- Verified lint/build.

## Day 2 - Authentication Frontend Integration

- Connected register, login, logout, current user and email verification.
- Added token storage and Axios auth headers.
- Added protected and public route guards.
- Added loading/error/toast states.
- Verified auth route rendering and protected redirects.

## Day 3 - Dashboard Foundation + App Shell

- Built logged-in SaaS shell with sidebar, topbar and mobile nav.
- Added active route highlighting and user/logout area.
- Built dashboard overview UI and quick actions.
- Added reusable page, card, badge and state components.
- Verified lint/build and protected routes.

## Day 4 - AI Chat Workspace

- Built ChatGPT-style workspace.
- Added conversation sidebar, create/list/switch/rename/delete/restore.
- Added message history, message bubbles, typing state and chat input.
- Integrated conversation and AI chat backend endpoints.
- Kept architecture ready for future SSE streaming.

## Day 5 - Analytics Dashboard + Creator Score UI

- Built analytics dashboard and creator score page.
- Added connected-account status, metrics, recent snapshot, score ring and score breakdown.
- Added Recharts score history chart.
- Added analytics action panel for sync, snapshot, score and insights.
- Added lazy route imports and verified lint/build.

## Day 6 - Creator Insights + Personal Notes

- Built creator insights workspace with list, generate, search and priority filtering.
- Built personal notes workspace with create, edit, pin, archive, restore and soft-delete UI.
- Added notes modal, confirmation dialog, card grid, toolbar and skeletons.
- Integrated insights and notes backend endpoints.
- Verified lint/build and route smoke checks.

## Day 7 - Public SaaS Landing Experience and Advanced UI

- Built public landing page at `/` and redirected `/landing` to `/`.
- Added sticky public navbar, mobile MUI drawer and auth-aware CTAs.
- Added hero, product preview, problems, solution workflow, features, tutorial, score, AI assistant, pricing, FAQ, contact and footer sections.
- Added local public AI demo prompt chips with no backend calls.
- Added `mailto:` contact form with validation and copy fallback.
- Added light/dark theme system with localStorage persistence and system preference.
- Added MUI ThemeProvider, component overrides, theme toggle, legal starter pages, reduced-motion support and reveal-on-view sections.
- Verified lint/build.

## Day 8 - Instagram Account Management and OAuth Frontend Integration

- Audited frontend routes, auth guards, API client, dashboard account state, landing CTAs and backend Instagram contracts.
- Replaced `/instagram` placeholder with a protected account-management workspace.
- Added OAuth connect flow using `GET /api/instagram/connect` and full-page redirect to returned `data.authURL`.
- Added `/instagram/callback` helper page, later aligned to backend-processed OAuth redirects.
- Added connected account card using real backend fields from `/api/dashboard/overview`.
- Added not-connected empty state, setup/security guide, troubleshooting, benefits grid and status banners.
- Added sync workflow using media sync followed by analytics snapshot creation.
- Added reconnect support through the same OAuth URL flow.
- Documented disconnect as unsupported because no backend disconnect route exists.
- Added Instagram error normalization, loading states, empty states and success/failure toast feedback.
- Updated dashboard Instagram/sync CTA to point to `/instagram`.
- Verified `npm run lint` and `npm run build`.

## Day 10 - Frontend-Backend Contract Audit and Integration Fixes

- Audited mounted backend routes against frontend endpoint constants, service modules, hooks and page usage.
- Created root-level `PROJECT_CONTRACT_AUDIT.md` with the master contract matrix and deployment findings.
- Verified that frontend API calls use the shared service/http layer with no raw component-level request bypasses.
- Hardened the Axios client so future `FormData` requests do not keep an incorrect JSON content type.
- Documented missing integrations for password update, recommendations, conversation archive, chat streaming, note restore, profile/settings and plan/usage.
- Confirmed Day 8 Instagram contracts remain aligned with backend `authURL`, dashboard account data, media sync and analytics snapshot behavior.
- Confirmed backend code was not modified for the audit.

## Day 11 - Profile, Settings, Recommendations and Final Product Feature Completion

- Replaced Profile placeholder with a read-only account page using real `/api/auth/me` user fields and dashboard account status.
- Replaced Settings placeholder with password update, theme preference, AI usage and plan visibility, and honest unavailable-state sections.
- Integrated `PATCH /api/auth/password` through `authService.updatePassword()`.
- Added `/recommendations`, `recommendationService`, sidebar navigation and dashboard shortcut for backend recommendations.
- Integrated `GET /api/recommendations` and `POST /api/recommendations/generate`.
- Exposed note restore through a session-based recently deleted recovery list using `PATCH /api/notes/:noteId/restore`.
- Preserved existing archived-note behavior and documented that deleted notes are not listable from the backend.
- Verified frontend lint/build after implementation.

## Final Frontend Polish - Product Completion Pass

- Audited the frontend product surface for visual consistency, spacing, theme compatibility, responsiveness, interaction quality and accessibility.
- Improved shared UI primitives with theme-aware surfaces, focus rings, hover states, loading semantics and responsive card headers.
- Added a subtle premium app-shell background that connects authenticated pages with the landing-page design language.
- Improved authenticated app shell, sidebar, topbar and auth layout for light/dark theme consistency.
- Polished AI Chat presentation without changing backend chat contracts or adding streaming architecture.
- Polished Notes and Insights filter bars, modals, cards, empty states and restore surfaces.
- Confirmed backend contracts by reading mounted routes/controllers and left backend code unchanged during this polish pass.
- Verified `npm run lint`, `npm run build`, and `git diff --check`.

## Final Frontend Release Alignment

- Reviewed stabilized backend auth, OTP, rate-limit, readiness and Instagram OAuth redirect contracts.
- Removed obsolete frontend OAuth callback forwarding and kept `/instagram/callback` as a safe result page.
- Added shared API error details for status-aware frontend messaging, including `429` and `Retry-After`.
- Improved register, login, verify-email, resend OTP and password-update messages against backend status codes.
- Added resend cooldown handling without uncontrolled timers or duplicate submissions.
- Kept AI chat on the stable non-stream `POST /api/conversation/:conversationId/chat` endpoint; streaming remains documented as pending because the backend SSE route writes raw text events and still needs dedicated frontend E2E.
- Re-ran frontend lint/build after contract alignment.
- Created final root-level manual E2E checklist and release readiness report.

---

# Features Completed

- [x] Fresh React frontend foundation
- [x] Tailwind theme and global styles
- [x] MUI theme infrastructure
- [x] Light/dark mode
- [x] Persistent theme preference
- [x] Shared API client
- [x] Backend endpoint constants
- [x] Auth service layer
- [x] JWT token storage
- [x] Axios auth header injection
- [x] Unauthorized response handling
- [x] Login page
- [x] Register page
- [x] Email verification page
- [x] Logout
- [x] Protected routes
- [x] Public landing route
- [x] App shell with sidebar/topbar
- [x] Dashboard overview
- [x] AI Chat workspace
- [x] Conversation sidebar and CRUD UI
- [x] Analytics dashboard
- [x] Creator Score UI
- [x] Creator Insights workspace
- [x] Personal Notes CRUD workspace
- [x] Public SaaS landing page
- [x] FAQ accordions
- [x] Contact `mailto:` fallback
- [x] Starter privacy/terms pages
- [x] Instagram account management page
- [x] Instagram OAuth authorization URL frontend flow
- [x] Instagram OAuth callback helper route
- [x] Instagram connected account card
- [x] Instagram media sync and analytics snapshot workflow
- [x] Instagram reconnect flow
- [x] Instagram disconnect limitation UI
- [x] Instagram error normalization
- [x] Frontend-backend contract audit document
- [x] API client multipart compatibility hardening
- [x] Loading/empty/error states
- [x] Lazy route imports
- [x] Recommendations UI and service integration
- [x] Password update form
- [x] Read-only profile page
- [x] Settings/preferences UI
- [x] AI usage and plan page/section
- [x] Recently deleted note restore UI
- [ ] AI chat streaming consumption
- [ ] Subscription/plan backend/payment behavior
- [ ] Final responsive QA
- [ ] Deployment

---

# APIs Integrated

| Method | Endpoint | Status |
|---|---|---|
| POST | `/api/auth/register` | Integrated |
| POST | `/api/auth/login` | Integrated |
| GET | `/api/auth/me` | Integrated |
| PATCH | `/api/auth/password` | Integrated |
| POST | `/api/auth/verify-email` | Integrated |
| POST | `/api/auth/resend-otp` | Integrated |
| GET | `/api/dashboard/overview` | Integrated |
| POST | `/api/instagram/media/sync` | Integrated |
| POST | `/api/instagram/analytics/snapshot` | Integrated |
| GET | `/api/instagram/analytics/latest` | Integrated |
| GET | `/api/instagram/analytics/history` | Integrated |
| POST | `/api/creator-score/calculate` | Integrated |
| GET | `/api/creator-score/latest` | Integrated |
| GET | `/api/creator-score/history` | Integrated |
| POST | `/api/creator-insights/generate` | Integrated |
| GET | `/api/creator-insights` | Integrated |
| POST | `/api/conversation` | Integrated |
| GET | `/api/conversation` | Integrated |
| GET | `/api/conversation/:conversationId/messages` | Integrated |
| POST | `/api/conversation/:conversationId/chat` | Integrated |
| POST | `/api/conversation/:conversationId/chat/stream` | Backend available; frontend pending |
| PATCH | `/api/conversation/:conversationId` | Integrated |
| PATCH | `/api/conversation/:conversationId/archive` | Backend available; frontend pending |
| DELETE | `/api/conversation/:conversationId` | Integrated |
| PATCH | `/api/conversation/:conversationId/restore` | Integrated |
| GET | `/api/recommendations` | Integrated |
| POST | `/api/recommendations/generate` | Integrated |
| GET | `/api/instagram/connect` | Integrated |
| GET | `/api/instagram/oauth/callback` | Backend-processed; frontend reads redirected result params |
| POST | `/api/notes` | Integrated |
| GET | `/api/notes` | Integrated |
| PATCH | `/api/notes/:noteId` | Integrated |
| DELETE | `/api/notes/:noteId` | Integrated |
| PATCH | `/api/notes/:noteId/archive` | Integrated |
| PATCH | `/api/notes/:noteId/unarchive` | Integrated |
| PATCH | `/api/notes/:noteId/pin` | Integrated |
| PATCH | `/api/notes/:noteId/unpin` | Integrated |
| PATCH | `/api/notes/:noteId/restore` | Integrated through recently deleted recovery UI |

---

# Frontend Pages

- `Landing` - Complete public SaaS landing page.
- `Privacy` - Starter privacy draft page.
- `Terms` - Starter terms draft page.
- `Login` - Auth login form.
- `Signup` - Registration form.
- `VerifyEmail` - OTP verification and resend flow.
- `Dashboard` - Main SaaS overview.
- `AIChat` - Conversation-based AI chat workspace.
- `Analytics` - Metrics, snapshots, score preview, action pipeline.
- `CreatorScore` - Score ring, breakdown and score history.
- `Insights` - AI-generated creator insights workspace.
- `Recommendations` - Backend-generated recommendation list and generate workflow.
- `Notes` - Personal creator strategy notebook.
- `Instagram` - Instagram account management, connection state, sync and setup guide.
- `InstagramCallback` - OAuth callback helper for frontend redirect configurations.
- `Profile` - Read-only current-user profile and connected-account status.
- `Settings` - Password update, theme preference, AI usage and plan visibility.

---

# Environment Variables

- `VITE_API_BASE_URL` - Backend API base URL. Local value should be `http://localhost:5000/api`.
- `VITE_CONTACT_EMAIL` - Public email address used by the landing contact `mailto:` flow.

---

# Current Frontend Progress

- Frontend Completion: **97%**
- UI Shell Completion: **94%**
- Routing Completion: **98%**
- Authentication: **98%**
- Dashboard: **87%**
- AI Chat Workspace: **88%**
- Analytics UI: **88%**
- Creator Score UI: **88%**
- Creator Insights UI: **90%**
- Personal Notes UI: **94%**
- Landing Page Completion: **92%**
- Theme System Completion: **92%**
- Responsive Completion: **88%**
- Accessibility Completion: **88%**
- Instagram Account Management: **88%**
- Recommendations UI: **86%**
- Profile/Settings: **82%**
- Plan/Subscription UI: **48%**
- Testing: **90%**
- Integration Contract Readiness: **93%**
- Deployment Readiness: **52%**

---

# Local Testing

Run backend:

```bash
cd ~/Downloads/social-media-analytics-dashboard/backend
npm run dev
```

Run frontend:

```bash
cd ~/Downloads/social-media-analytics-dashboard/frontend
npm run dev -- --host 0.0.0.0 --port 5173 --strictPort
```

Use:

```text
http://localhost:5173
```

Verify:

- `/` loads the public landing page.
- `/landing` redirects to `/`.
- Theme toggle works and persists after refresh.
- Navbar section links scroll correctly.
- Mobile drawer opens and closes.
- Public CTAs route correctly when logged out.
- Contact validation works and opens the mail client with `mailto:`.
- FAQ accordions expand/collapse.
- Public AI prompt chips update local demo response only.
- Existing `/login`, `/register`, protected app routes and authenticated pages still build.
- `/instagram` redirects to `/login` when logged out.
- `/instagram` loads the Instagram account-management workspace after login.
- `/instagram/callback?error=oauth_cancelled` displays a cancellation state.
- `/instagram/callback?connected=success` displays success and returns to `/instagram`.
- `/instagram/callback` without required query parameters displays a safe failure state.
- `/profile` shows real current-user fields and connected Instagram status.
- `/settings` changes password through the backend-supported password endpoint.
- `/settings` shows AI usage/plan data only when returned by `/api/auth/me`.
- `/recommendations` lists and generates backend recommendations after Instagram data exists.
- `/notes` can restore notes deleted during the current browser session.

---

# Known Integration Notes

- Instagram OAuth frontend flow is implemented, but production success depends on real Meta app credentials, redirect URI configuration and a supported Instagram professional account.
- Backend OAuth callback now redirects to the frontend callback URL after processing; frontend reads safe result params only.
- No dedicated backend connected-account route exists; frontend uses `/api/dashboard/overview` for account state.
- No backend disconnect route exists, so disconnect is documented as unavailable instead of being faked in frontend state.
- No sync-status polling endpoint exists; sync is handled as synchronous media sync plus analytics snapshot.
- Analytics, creator score, insights and media sync require a connected Instagram account and backend data.
- OTP email delivery depends on valid backend SMTP credentials.
- Notes work independently of Instagram after login.
- Deleted notes can be restored by backend endpoint only when the frontend still has the deleted note id; deleted notes are not returned by the list endpoint.
- Contact form uses `mailto:` because no backend contact endpoint exists.
- Public AI preview is demonstration-only.
- Pricing is informational only and does not start payment behavior.
- Privacy and Terms pages are starter drafts and require formal review before production.
- Frontend should run on `localhost:5173` for CORS compatibility.
- Backend `POST /api/conversation/:conversationId/chat/stream` exists, but the current frontend chat workspace still uses the non-stream chat endpoint.
- Recommendations are surfaced in the frontend, but they require a connected Instagram account and backend analytics/scoring/insight context.
- Password update is integrated; profile editing is unavailable because no profile update route is mounted.
- Plan and AI usage UI is read-only because no billing, subscription update or dedicated usage route is mounted.
- `PROJECT_CONTRACT_AUDIT.md` documents the Day 10 contract findings; the final release report supersedes callback behavior notes where backend stabilization changed the contract.

---

# Next Tasks

1. Manually execute `../FINAL_MANUAL_E2E_CHECKLIST.md` with a fresh verified user.
2. Run full E2E testing with backend and a real connected Instagram professional account.
3. Verify recommendations generation after real analytics, creator score and insight data exists.
4. Review scoped Git diffs and prepare clean frontend/backend commits.
5. Final responsive and accessibility QA across all pages.
6. Begin Docker and deployment preparation only after manual E2E passes.

---

# README Maintenance Rule

Whenever a significant frontend feature is finished, update this README with the new milestone, changed files, routes, API endpoints, components, services, tests and updated progress percentages.
