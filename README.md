# Creator Growth Analytics

AI-powered creator analytics SaaS for Instagram creators.

Creator Growth Analytics helps creators connect Instagram, understand available performance data, add manual fallback metrics when Meta does not return complete values, calculate a Creator Score, generate AI insights and recommendations, chat with an AI assistant, manage personal notes, and follow creator-market news.

## Features

- Google sign-in with JWT sessions plus email/password fallback
- JWT-protected dashboard and app routes
- Instagram OAuth connection flow
- Instagram media sync and analytics snapshots
- Manual metrics fallback for limited Meta data
- Creator Score calculation with manual-estimate mode
- AI-generated creator insights and recommendations
- ChatGPT-style AI chat workspace with SSE streaming support
- Personal notes with pin, archive, delete, and restore flows
- Reddit-style Creator News feed using public GDELT and RSS/Atom sources
- Public SaaS landing page and product story page
- Public contact form with backend email delivery
- Responsive React UI with loading, empty, and error states

## Tech Stack

### Backend

- Node.js
- Express
- MongoDB and Mongoose
- Redis
- JWT
- Zod
- Resend email API
- Cloudinary
- Meta Graph API
- AI provider integrations
- GDELT and RSS/Atom news feeds
- Jest and Supertest

### Frontend

- React
- Vite
- React Router
- TanStack Query
- Axios
- Recharts
- MUI
- lucide-react
- react-hot-toast
- Tailwind/PostCSS styling

## Project Structure

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
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm
- MongoDB
- Redis
- Google OAuth web client ID
- Resend API key for contact email
- Meta developer app for Instagram OAuth
- At least one configured AI provider key

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

The backend runs on:

```text
http://localhost:5000
```

### Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
npm run dev -- --host 0.0.0.0 --port 5173 --strictPort
```

The frontend runs on:

```text
http://localhost:5173
```

## Environment Configuration

Do not commit real environment values. Keep real secrets only in local `.env` files or deployment-provider secret settings.

Use these example files as references:

- `backend/.env.example`
- `frontend/.env.example`

### Backend Environment Variables

| Variable | Purpose |
|---|---|
| `PORT` | Backend server port |
| `NODE_ENV` | Runtime environment |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | JWT signing secret |
| `JWT_EXPIRES_IN` | JWT expiry window |
| `REDIS_URL` | Redis connection URL |
| `GOOGLE_CLIENT_ID` | Google OAuth web client ID used by backend token verification |
| `RESEND_API_KEY` | Resend API key for contact emails |
| `EMAIL_FROM` | Verified Resend sender identity for emails |
| `CONTACT_RECEIVER_EMAIL` | Receiver for public contact form |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `INSTAGRAM_APP_ID` | Meta app ID |
| `INSTAGRAM_APP_SECRET` | Meta app secret |
| `INSTAGRAM_REDIRECT_URI` | Backend OAuth callback URL |
| `INSTAGRAM_FRONTEND_CALLBACK_URL` | Frontend OAuth callback route |
| `META_GRAPH_VERSION` | Meta Graph API version |
| `FRONTEND_URL` | Public frontend URL |
| `FRONTEND_ALLOWED_ORIGINS` | Allowed CORS origins |
| `CREATOR_NEWS_REFRESH_CRON` | Creator News refresh schedule |
| `CREATOR_NEWS_COVER_FETCH_LIMIT` | Max article pages inspected for cover images |
| `CREATOR_NEWS_UPLOAD_IMAGES` | Enables optional Cloudinary news-cover upload |
| `CREATOR_NEWS_IMAGE_FOLDER` | Cloudinary folder for news covers |
| AI provider keys | Configure at least one supported provider key |

### Frontend Environment Variables

| Variable | Purpose |
|---|---|
| `VITE_API_BASE_URL` | Backend API base URL |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth web client ID used by the browser sign-in button |
| `VITE_CONTACT_EMAIL` | Public contact email shown in UI |
| `VITE_CONTACT_PHONE_DISPLAY` | Human-readable contact phone |
| `VITE_CONTACT_PHONE_LINK` | Clickable `tel:` phone link |

## Main Routes

### Public Frontend Routes

- `/`
- `/product`
- `/privacy`
- `/terms`
- `/login`
- `/register`

### Protected Frontend Routes

- `/dashboard`
- `/instagram`
- `/analytics`
- `/creator-score`
- `/insights`
- `/recommendations`
- `/creator-news`
- `/ai-chat`
- `/notes`
- `/profile`
- `/settings`

## API Overview

### Public APIs

| Method | Endpoint |
|---|---|
| `GET` | `/api/health` |
| `GET` | `/api/ready` |
| `POST` | `/api/contact` |
| `POST` | `/api/auth/register` |
| `POST` | `/api/auth/login` |
| `POST` | `/api/auth/google` |
| `GET` | `/api/instagram/oauth/callback` |

### Protected APIs

Protected APIs require a bearer token.

| Method | Endpoint |
|---|---|
| `GET` | `/api/auth/me` |
| `PATCH` | `/api/auth/password` |
| `GET` | `/api/dashboard/overview` |
| `GET` | `/api/instagram/connect` |
| `PATCH` | `/api/instagram/manual-metrics` |
| `POST` | `/api/instagram/media/sync` |
| `POST` | `/api/instagram/analytics/snapshot` |
| `GET` | `/api/instagram/analytics/latest` |
| `GET` | `/api/instagram/analytics/history` |
| `POST` | `/api/creator-score/calculate` |
| `GET` | `/api/creator-score/latest` |
| `GET` | `/api/creator-score/history` |
| `POST` | `/api/creator-insights/generate` |
| `GET` | `/api/creator-insights` |
| `POST` | `/api/recommendations/generate` |
| `GET` | `/api/recommendations` |
| `GET` | `/api/creator-news` |
| `POST` | `/api/creator-news/refresh` |
| `POST` | `/api/conversation` |
| `GET` | `/api/conversation` |
| `GET` | `/api/conversation/:conversationId/messages` |
| `POST` | `/api/conversation/:conversationId/chat` |
| `POST` | `/api/conversation/:conversationId/chat/stream` |
| `PATCH` | `/api/conversation/:conversationId` |
| `DELETE` | `/api/conversation/:conversationId` |
| `POST` | `/api/notes` |
| `GET` | `/api/notes` |
| `PATCH` | `/api/notes/:noteId` |
| `DELETE` | `/api/notes/:noteId` |

## Testing

Run backend tests:

```bash
cd backend
npm test -- --runInBand
```

Run frontend lint:

```bash
cd frontend
npm run lint
```

Build frontend:

```bash
cd frontend
npm run build
```

Check Git whitespace:

```bash
git diff --check
```

## Deployment Notes

Deploy the backend first, then deploy the frontend.

Backend deployment requires:

- MongoDB connection
- Redis connection
- Google OAuth web client ID
- Resend API key for contact email
- Meta OAuth credentials
- Cloudinary credentials
- AI provider key
- Production CORS origin

Frontend deployment requires:

- `VITE_API_BASE_URL` pointing to the deployed backend `/api`
- SPA fallback routing configured to serve `index.html`

Meta OAuth production callback:

```text
https://your-backend-domain.com/api/instagram/oauth/callback
```

Frontend OAuth callback:

```text
https://your-frontend-domain.com/instagram/callback
```

## GitHub Safety

Before pushing:

```bash
git status --short
git diff --check
```

Make sure real `.env` files, `node_modules`, build output, and IDE folders are not staged.

Only example environment files should be committed.

## Known Limitations

- Public Instagram OAuth requires valid Meta app configuration and review.
- Meta may not return every metric for every connected Instagram account.
- Manual metrics are estimates and are labeled as manual values.
- Creator News depends on public news/RSS source availability.
- Optional Cloudinary upload for news covers is disabled unless configured.

## License

MIT
