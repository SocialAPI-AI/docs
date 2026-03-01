# SocialAPI.AI Mintlify Documentation Design

**Date:** 2026-03-01
**Status:** Approved
**Scope:** Replace all placeholder Mintlify boilerplate with real SocialAPI.AI documentation

---

## 1. Context

The `docs/` directory currently contains Mintlify framework boilerplate — quickstart about the Mintlify CLI, `essentials/` with design system pages, `ai-tools/` for unrelated third-party IDEs, and a "Plant Store" placeholder OpenAPI spec. All of this will be replaced with real API documentation.

The API (`core/api/`) is a unified social media inbox — it lets developers read and respond to comments, DMs, reviews, and mentions across Instagram, Facebook, Google Reviews, TikTok, YouTube, X/Twitter, Trustpilot, and LinkedIn through a single REST API. The Go server has 24 endpoints fully mapped; the Swagger 2.0 spec lives at `core/api/docs/swagger.json`.

---

## 2. Decisions

| Decision | Choice |
|---|---|
| Existing content | Replace everything (clean slate) |
| Spec format | OpenAPI 3.0 (converted from Swagger 2.0 `core/api/docs/swagger.json`) |
| Navigation | 3 tabs: Guides / API Reference / Connectors |
| Onboarding | Dashboard-based (sign up at web app → connect social account → copy API key) |
| Public API coverage | 20 endpoints (billing + provision endpoints excluded — internal use) |

---

## 3. Navigation Structure

### Tab: Guides
```
Introduction (index.mdx)
Quickstart (quickstart.mdx)
Authentication (guides/authentication.mdx)
Rate Limits & Plans (guides/rate-limits.mdx)
Connecting Social Accounts / OAuth (guides/oauth.mdx)
Interaction IDs (guides/interaction-ids.mdx)
Error Handling (guides/errors.mdx)
```

### Tab: API Reference
```
Overview (api-reference/introduction.mdx)
[All 20 endpoints auto-rendered from openapi.json]
```
OpenAPI spec: `docs/api-reference/openapi.json`

### Tab: Connectors
```
Overview (connectors/overview.mdx)   — feature matrix table + platform comparison
Instagram (connectors/instagram.mdx) — fully available
Facebook (connectors/facebook.mdx)   — coming soon
Google Reviews (connectors/google-reviews.mdx) — coming soon
TikTok (connectors/tiktok.mdx)       — coming soon
X / Twitter (connectors/twitter.mdx) — coming soon
YouTube (connectors/youtube.mdx)     — coming soon
LinkedIn (connectors/linkedin.mdx)   — coming soon
Trustpilot (connectors/trustpilot.mdx) — coming soon
```

---

## 4. Guides Tab Content

### index.mdx — Introduction
- What SocialAPI.AI is and what problem it solves
- The "unified inbox" concept (one API key, all platforms)
- Feature highlights: comments, DMs, reviews, mentions, moderation
- Supported platforms overview
- Call to action: Quickstart link

### quickstart.mdx — Quickstart
Three steps:
1. **Sign up** — create account at dashboard, verify email
2. **Create an API key** — in dashboard Keys section, copy `sk_live_...` key (shown once)
3. **Connect a social account** — click "Connect" in dashboard, complete OAuth for Instagram
4. **Make your first API call** — `GET /v1/accounts` then `GET /v1/accounts/:id/comments` with curl example

### guides/authentication.mdx — Authentication
- API key format: `sk_live_` + 64-char hex string
- How to pass the key: `Authorization: Bearer <key>` header
- Creating keys: dashboard UI or `POST /v1/keys`
- Revoking keys: dashboard UI or `DELETE /v1/keys/:id`
- Security best practices: never expose in frontend code, use environment variables
- Keys are shown once at creation time

### guides/rate-limits.mdx — Rate Limits & Plans
- Daily call window (midnight UTC reset)
- Response headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`
- 429 response and retry guidance
- Plan tier table:
  | Tier | Calls/day | Max platforms | DMs | Multi-tenant |
  |---|---|---|---|---|
  | free | 100 | 2 | No | No |
  | starter | 1,000 | 5 | Yes | No |
  | pro | 5,000 | 15 | Yes | No |
  | business | 20,000 | 50 | Yes | Yes |
  | enterprise | unlimited | unlimited | Yes | Yes |

### guides/oauth.mdx — Connecting Social Accounts
- Overview of the connect flow: `POST /accounts/connect` → redirect user → `POST /oauth/exchange`
- Step-by-step with request/response examples for Instagram
- State token (CSRF protection) explanation
- Direct auth (API key/credentials) for platforms that support it
- How to list connected accounts

### guides/interaction-ids.mdx — Interaction IDs
- SocAPI's stable, opaque ID format: `socapi_{type}_{base64-encoded-platform-id}`
- Prefixes: `socapi_cmt_` (comment), `socapi_rev_` (review), `socapi_dm_` (DM), `socapi_mnt_` (mention)
- Why IDs are stable and can be stored by the caller
- How to use IDs in reply, moderate, get-replies endpoints

### guides/errors.mdx — Error Handling
- All errors return `{ "error": "...", "code": "..." }`
- Error code table:
  | HTTP | Code | When |
  |---|---|---|
  | 400 | `missing_metadata` | Required field missing |
  | 400 | `unsupported_platform` | Platform not recognized |
  | 401 | `unauthorized` | Invalid or missing API key |
  | 401 | `invalid_token` | OAuth token expired/revoked |
  | 401 | `invalid_credentials` | Platform rejected credentials |
  | 404 | `account_not_found` | Account ID doesn't belong to user |
  | 404 | `not_found` | Resource not found |
  | 409 | `account_already_linked` | Account already connected |
  | 429 | `rate_limit_exceeded` | Daily limit hit |
  | 429 | `platform_rate_limit` | Upstream platform limit |
  | 501 | `not_supported` | Platform doesn't support this operation |

---

## 5. API Reference

### OpenAPI 3.0 Spec
Location: `docs/api-reference/openapi.json`

Converted from `core/api/docs/swagger.json` (Swagger 2.0) to OpenAPI 3.0.

**Info:**
- Title: SocialAPI.AI
- Version: 1.0.0
- Base URL: `https://api.social-api.ai/v1`
- Auth: HTTP Bearer (`sk_live_...`)

**Tags (endpoint groups):**
- `Accounts` — list, connect, OAuth exchange
- `Comments` — get, reply, get replies
- `DMs` — get threads, get thread ID, send message
- `Reviews` — get reviews, reply to review
- `Mentions` — get mentions
- `Moderation` — moderate comment, toggle post comments
- `Usage` — usage stats, account limits
- `Keys` — list, create, revoke

**Public endpoints (20):**

| Tag | Method | Path |
|---|---|---|
| Accounts | GET | /accounts |
| Accounts | POST | /accounts/connect |
| Accounts | POST | /oauth/exchange |
| Comments | GET | /accounts/{id}/comments |
| Comments | GET | /accounts/{id}/interactions/{iid}/replies |
| Comments | POST | /accounts/{id}/interactions/{iid}/reply |
| DMs | GET | /accounts/{id}/dms |
| DMs | GET | /accounts/{id}/dms/thread |
| DMs | POST | /accounts/{id}/dms/{tid}/send |
| Reviews | GET | /accounts/{id}/reviews |
| Reviews | POST | /accounts/{id}/interactions/{iid}/reply |
| Mentions | GET | /accounts/{id}/mentions |
| Moderation | POST | /accounts/{id}/interactions/{iid}/moderate |
| Moderation | POST | /accounts/{id}/posts/{pid}/comments/toggle |
| Usage | GET | /usage |
| Usage | GET | /accounts/{id}/limits |
| Keys | GET | /keys |
| Keys | POST | /keys |
| Keys | DELETE | /keys/{id} |
| Users | DELETE | /users/me |

**Excluded from public spec:** `POST /billing/checkout`, `POST /billing/portal`, `POST /webhooks/stripe`, `POST /users/provision`

---

## 6. Connectors Tab

### connectors/overview.mdx
- Platform capability matrix table (all 8 platforms × 5 features)
- Auth type per platform
- General note about `ErrNotSupported` (501) for unsupported features

### Per-platform pages (e.g. connectors/instagram.mdx)
Each page includes:
1. Status badge (Available / Coming soon)
2. Auth type (OAuth 2.0)
3. Feature support table with ✅/❌
4. Platform-specific quotas
5. Platform-specific notes/quirks
6. Connect code snippet (curl)
7. Sample JSON response for a real Interaction from that platform

---

## 7. docs.json Changes

Remove all existing placeholder navigation groups. Add:
```json
"tabs": [
  { "tab": "Guides", "groups": [...] },
  { "tab": "API Reference", "openapi": "api-reference/openapi.json" },
  { "tab": "Connectors", "groups": [...] }
]
```

---

## 8. Files to Delete

All existing placeholder content that will be removed:
- `essentials/` directory (all files)
- `ai-tools/` directory (all files)
- `development.mdx` (Mintlify CLI instructions)
- `api-reference/endpoint/` directory (placeholder endpoints)
- `snippets/` directory (if it contains only boilerplate)

---

## 9. Files to Create / Update

| File | Action |
|---|---|
| `docs.json` | Rewrite navigation config |
| `index.mdx` | Rewrite as SocialAPI.AI introduction |
| `quickstart.mdx` | Rewrite as API quickstart |
| `guides/authentication.mdx` | Create |
| `guides/rate-limits.mdx` | Create |
| `guides/oauth.mdx` | Create |
| `guides/interaction-ids.mdx` | Create |
| `guides/errors.mdx` | Create |
| `api-reference/introduction.mdx` | Rewrite |
| `api-reference/openapi.json` | Replace Plant Store spec with real OpenAPI 3.0 spec |
| `connectors/overview.mdx` | Create |
| `connectors/instagram.mdx` | Create |
| `connectors/facebook.mdx` | Create (coming soon) |
| `connectors/google-reviews.mdx` | Create (coming soon) |
| `connectors/tiktok.mdx` | Create (coming soon) |
| `connectors/twitter.mdx` | Create (coming soon) |
| `connectors/youtube.mdx` | Create (coming soon) |
| `connectors/linkedin.mdx` | Create (coming soon) |
| `connectors/trustpilot.mdx` | Create (coming soon) |
