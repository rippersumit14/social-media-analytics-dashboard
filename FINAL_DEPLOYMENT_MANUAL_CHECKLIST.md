# Final Deployment Manual Checklist

## Environment

- [ ] Development database confirmed.
- [ ] Redis running and reachable.
- [ ] Backend starts without missing environment variables.
- [ ] Frontend starts with production API base configured.
- [ ] Email worker starts.
- [ ] `/api/health` returns `200`.
- [ ] `/api/ready` returns ready status.
- [ ] Logs do not expose secrets, tokens, OTP values, or OAuth codes.

## Auth

- [ ] Invalid register request returns `400`.
- [ ] Register succeeds for a new email.
- [ ] OTP email arrives.
- [ ] Email verification succeeds.
- [ ] Resend OTP works.
- [ ] Login succeeds after verification.
- [ ] Password update works for authenticated user.
- [ ] Logout clears session and redirects.

## Instagram

- [ ] OAuth connect starts from the Instagram page.
- [ ] Meta redirects back to the backend callback.
- [ ] Backend redirects to frontend `/instagram/callback`.
- [ ] Account appears as connected.
- [ ] Meta-provided metrics show `Meta` source badge.
- [ ] Missing provider metrics show `Unavailable`.
- [ ] Manual metric entry appears when required fields are unavailable.
- [ ] Manual metric save requires confirmation.
- [ ] Manual metrics show `Manual estimate` source badge.
- [ ] Manual values can be removed.
- [ ] Sync works.
- [ ] Zero-post state is understandable.
- [ ] Low-data state is understandable.

## Creator Score

- [ ] Score uses provider data when available.
- [ ] Score is labeled estimated when manual metrics are used.
- [ ] Insufficient data does not show a misleading confident score.
- [ ] Score explanation is visible.

## AI

- [ ] General guidance mode works with sparse data.
- [ ] Account-aware mode works with synchronized data.
- [ ] Manual-estimate mode labels manual values.
- [ ] SSE streaming renders chunks incrementally.
- [ ] Stop generation works.
- [ ] Retry/error UX is clear.
- [ ] Usage limits still apply.
- [ ] Persisted history reloads after refresh.

## Contact

- [ ] Valid submission reaches the backend.
- [ ] Invalid submission returns validation errors.
- [ ] Delivered state appears only after backend confirmation.
- [ ] Provider failure shows fallback.
- [ ] Mailto fallback opens.
- [ ] Support inbox receives email.
- [ ] Email link is clickable.
- [ ] Phone link is clickable.

## Product

- [ ] Dashboard renders.
- [ ] Analytics renders.
- [ ] Insights renders.
- [ ] Recommendations renders.
- [ ] Notes renders.
- [ ] Profile renders.
- [ ] Settings renders.

## UI

- [ ] Homepage hero is centered and readable.
- [ ] Light and dark themes remain readable.
- [ ] Animations are subtle.
- [ ] Reduced motion preference is respected.
- [ ] Keyboard focus is visible.
- [ ] 320px layout has no horizontal overflow.
- [ ] 360px layout has no horizontal overflow.
- [ ] 390px layout has no horizontal overflow.
- [ ] 768px layout has no broken grids.
- [ ] 1024px layout has no clipped content.
- [ ] 1280px layout has no overlap.
- [ ] 1440px layout has no stretched/awkward sections.
- [ ] No dead buttons remain.
