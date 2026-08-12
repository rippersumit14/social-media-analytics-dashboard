# Xquik Integration

Use Xquik tweet search data as an optional X/Twitter source for creator
analytics. The mapper in `backend/services/xquikAnalyticsMapper.js` converts a
`GET /api/v1/x/tweets/search` response into the daily engagement rows and summary
totals used by the dashboard layer.

## Source Route

```text
GET https://xquik.com/api/v1/x/tweets/search?q=from:creator&max_results=50
Authorization: Bearer $XQUIK_API_KEY
```

Keep the API key in environment configuration or a secret manager. Do not store
it in analytics documents, logs, fixtures, or client-side code.

## Usage

```js
import {
  buildXquikDashboardSummary,
} from "../services/xquikAnalyticsMapper.js";

const summary =
  buildXquikDashboardSummary(
    xquikTweetSearchResponse,
    { username: "creator" }
  );
```

The summary includes:

- `dailyEngagement` rows sorted by date
- total likes, comments, reposts, quotes, views, and engagement
- average likes, comments, and engagement per tweet
- `source: "xquik"` metadata for downstream dashboards
