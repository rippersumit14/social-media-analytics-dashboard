// Mirrors the stable backend route groups without implementing feature behavior on Day 1.
export const apiEndpoints = {
  auth: {
    register: "/auth/register",
    verifyEmail: "/auth/verify-email",
    resendOtp: "/auth/resend-otp",
    login: "/auth/login",
    me: "/auth/me",
    password: "/auth/password",
  },
  instagram: {
    connect: "/instagram/connect",
    callback: "/instagram/oauth/callback",
    mediaSync: "/instagram/media/sync",
    analyticsSnapshot: "/instagram/analytics/snapshot",
    analyticsLatest: "/instagram/analytics/latest",
    analyticsHistory: "/instagram/analytics/history",
  },
  dashboard: {
    overview: "/dashboard/overview",
  },
  creatorScore: {
    calculate: "/creator-score/calculate",
    latest: "/creator-score/latest",
    history: "/creator-score/history",
  },
  creatorInsights: {
    generate: "/creator-insights/generate",
    list: "/creator-insights",
  },
  conversations: {
    list: "/conversation",
  },
  notes: {
    list: "/notes",
  },
  recommendations: {
    list: "/recommendations",
  },
};
