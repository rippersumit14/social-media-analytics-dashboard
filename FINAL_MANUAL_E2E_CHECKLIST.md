# CreatorIQ Final Manual E2E Checklist

Use a fresh user and development services. Fill in Actual result, Pass/fail, and Notes during manual testing.

---

# Environment

Expected result: local development services are running with safe logs and no production secrets printed.

| Check | Actual result | Pass/fail | Notes |
|---|---|---|---|
| [ ] MongoDB points to development DB |  |  |  |
| [ ] Redis running |  |  |  |
| [ ] Backend starts |  |  |  |
| [ ] Email worker starts |  |  |  |
| [ ] Frontend starts |  |  |  |
| [ ] `/api/health` returns 200 |  |  |  |
| [ ] `/api/ready` returns 200 |  |  |  |
| [ ] No secrets in logs |  |  |  |

---

# Public Website

Expected result: public routes are usable in light/dark mode and responsive without authentication.

| Check | Actual result | Pass/fail | Notes |
|---|---|---|---|
| [ ] Landing page |  |  |  |
| [ ] Light/dark toggle |  |  |  |
| [ ] Theme persistence |  |  |  |
| [ ] Navigation anchors |  |  |  |
| [ ] Login/register CTAs |  |  |  |
| [ ] Tutorial |  |  |  |
| [ ] FAQ |  |  |  |
| [ ] Contact mailto |  |  |  |
| [ ] Privacy |  |  |  |
| [ ] Terms |  |  |  |
| [ ] Mobile navbar |  |  |  |

---

# Auth

Expected result: auth follows backend validation, OTP, rate-limit, and token behavior safely.

| Check | Actual result | Pass/fail | Notes |
|---|---|---|---|
| [ ] Invalid register -> 400 UI |  |  |  |
| [ ] Valid registration |  |  |  |
| [ ] Email queued/sent message |  |  |  |
| [ ] OTP arrives |  |  |  |
| [ ] Wrong OTP |  |  |  |
| [ ] Expired OTP |  |  |  |
| [ ] Correct OTP |  |  |  |
| [ ] Resend OTP |  |  |  |
| [ ] Resend cooldown |  |  |  |
| [ ] Duplicate verified email |  |  |  |
| [ ] Existing unverified user recovery |  |  |  |
| [ ] Invalid login |  |  |  |
| [ ] Login before verification |  |  |  |
| [ ] Successful login |  |  |  |
| [ ] Protected route refresh |  |  |  |
| [ ] Logout |  |  |  |
| [ ] Expired token |  |  |  |

---

# Instagram

Expected result: backend owns OAuth callback processing and frontend reads only safe result params.

| Check | Actual result | Pass/fail | Notes |
|---|---|---|---|
| [ ] Connect button |  |  |  |
| [ ] Meta authorization |  |  |  |
| [ ] Backend callback |  |  |  |
| [ ] Frontend redirect |  |  |  |
| [ ] Success state |  |  |  |
| [ ] Cancellation |  |  |  |
| [ ] Expired state |  |  |  |
| [ ] Invalid state |  |  |  |
| [ ] Connected account card |  |  |  |
| [ ] Media sync |  |  |  |
| [ ] Analytics snapshot |  |  |  |
| [ ] Reconnect |  |  |  |
| [ ] Disconnect limitation |  |  |  |

---

# Dashboard

Expected result: dashboard uses real backend data or honest no-account/loading/error states.

| Check | Actual result | Pass/fail | Notes |
|---|---|---|---|
| [ ] No account |  |  |  |
| [ ] Connected account |  |  |  |
| [ ] Loading |  |  |  |
| [ ] Error |  |  |  |
| [ ] Real data |  |  |  |
| [ ] Usage display |  |  |  |

---

# Analytics

Expected result: analytics routes work after Instagram data exists and degrade cleanly before that.

| Check | Actual result | Pass/fail | Notes |
|---|---|---|---|
| [ ] No data |  |  |  |
| [ ] Latest |  |  |  |
| [ ] History |  |  |  |
| [ ] Charts |  |  |  |
| [ ] Responsive |  |  |  |
| [ ] Dark/light |  |  |  |

---

# Creator Score

Expected result: score generation and display follow backend data availability.

| Check | Actual result | Pass/fail | Notes |
|---|---|---|---|
| [ ] Generate |  |  |  |
| [ ] Latest |  |  |  |
| [ ] History |  |  |  |
| [ ] Breakdown |  |  |  |
| [ ] No account |  |  |  |
| [ ] Error |  |  |  |

---

# Insights

Expected result: insights list/generation handle empty, rate-limit, no-account, and error states.

| Check | Actual result | Pass/fail | Notes |
|---|---|---|---|
| [ ] Generate |  |  |  |
| [ ] List |  |  |  |
| [ ] Rate limit |  |  |  |
| [ ] Empty |  |  |  |
| [ ] Error |  |  |  |

---

# Recommendations

Expected result: recommendations list/generation match backend fields and dependencies.

| Check | Actual result | Pass/fail | Notes |
|---|---|---|---|
| [ ] Generate |  |  |  |
| [ ] List |  |  |  |
| [ ] Empty |  |  |  |
| [ ] Rate limit |  |  |  |
| [ ] Error |  |  |  |

---

# AI Chat

Expected result: non-stream chat remains stable; streaming is not enabled in frontend yet.

| Check | Actual result | Pass/fail | Notes |
|---|---|---|---|
| [ ] Create conversation |  |  |  |
| [ ] Send message |  |  |  |
| [ ] Streaming if implemented | Not implemented |  | Backend route exists; frontend uses non-stream endpoint. |
| [ ] Stop generation | Not applicable |  | Needed when streaming is implemented. |
| [ ] Non-stream fallback if applicable |  |  |  |
| [ ] Rename |  |  |  |
| [ ] Delete |  |  |  |
| [ ] Restore |  |  |  |
| [ ] Refresh persistence |  |  |  |
| [ ] Error |  |  |  |
| [ ] Rate limit |  |  |  |
| [ ] Usage limit |  |  |  |

---

# Notes

Expected result: notes CRUD, archive, pin, and session restore work with backend soft-delete behavior.

| Check | Actual result | Pass/fail | Notes |
|---|---|---|---|
| [ ] Create |  |  |  |
| [ ] Edit |  |  |  |
| [ ] Pin |  |  |  |
| [ ] Unpin |  |  |  |
| [ ] Archive |  |  |  |
| [ ] Unarchive |  |  |  |
| [ ] Delete |  |  |  |
| [ ] Restore behavior |  |  |  |
| [ ] Search/filter |  |  |  |
| [ ] Refresh persistence |  |  |  |

---

# Profile / Settings

Expected result: supported account settings work; unsupported controls are honest and non-interactive.

| Check | Actual result | Pass/fail | Notes |
|---|---|---|---|
| [ ] User info |  |  |  |
| [ ] Verified status |  |  |  |
| [ ] Plan |  |  |  |
| [ ] Usage |  |  |  |
| [ ] Password validation |  |  |  |
| [ ] Password update |  |  |  |
| [ ] Theme preference |  |  |  |
| [ ] Unsupported controls |  |  |  |

---

# Responsive

Expected result: no horizontal overflow, clipped controls, or broken navigation.

| Check | Actual result | Pass/fail | Notes |
|---|---|---|---|
| [ ] 320px |  |  |  |
| [ ] 360px |  |  |  |
| [ ] 390px |  |  |  |
| [ ] 768px |  |  |  |
| [ ] 1024px |  |  |  |
| [ ] 1280px |  |  |  |
| [ ] 1440px |  |  |  |

---

# Security / Quality

Expected result: no sensitive data leaks, dead routes, broken buttons, or blocking accessibility issues.

| Check | Actual result | Pass/fail | Notes |
|---|---|---|---|
| [ ] No console secrets |  |  |  |
| [ ] No access token in UI |  |  |  |
| [ ] No OAuth code in frontend URL |  |  |  |
| [ ] No raw stack trace |  |  |  |
| [ ] No broken button |  |  |  |
| [ ] No dead route |  |  |  |
| [ ] No horizontal overflow |  |  |  |
| [ ] No accessibility-blocking issue |  |  |  |
