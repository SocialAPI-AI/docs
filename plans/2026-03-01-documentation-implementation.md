# SocialAPI.AI Documentation Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace all Mintlify boilerplate in `docs/` with accurate, developer-ready SocialAPI.AI documentation covering 20 public endpoints across 3 navigation tabs.

**Architecture:** Static MDX pages for Guides and Connectors tabs; OpenAPI 3.0 JSON spec (converted from existing Swagger 2.0) auto-rendered by Mintlify for the API Reference tab. All content derived from verified source code — no invented information.

**Tech Stack:** Mintlify (MDX + docs.json config), OpenAPI 3.0 JSON, green brand (#16A34A). Mintlify CLI for local preview (`npm i -g mintlify` then `mintlify dev` in the `docs/` directory).

**Source of truth for all schemas:** `core/api/endpoints/types.go` and `core/api/connectors/base/connector.go`. Do NOT invent fields — only document what is in those files.

---

## Before Starting

Read the design doc: `docs/plans/2026-03-01-documentation-design.md`

The `docs/` directory has a `.git` subdirectory — it is a git submodule. **All commits in this plan are made inside `docs/` using that repository.** The parent repo (`core/`) has its own git history. Run `cd docs` before any git commands.

---

### Task 1: Remove placeholder files

**Files:**
- Delete: `docs/essentials/` (entire directory)
- Delete: `docs/ai-tools/` (entire directory)
- Delete: `docs/development.mdx`
- Delete: `docs/api-reference/endpoint/` (entire directory)
- Delete: `docs/snippets/` (entire directory, if it exists)

**Step 1: Remove directories and files**

```bash
cd "docs"
rm -rf essentials ai-tools snippets
rm -f development.mdx
rm -rf api-reference/endpoint
```

**Step 2: Create new directories**

```bash
mkdir -p guides connectors
```

**Step 3: Commit**

```bash
cd "docs"
git add -A
git commit -m "chore: remove Mintlify boilerplate placeholder content"
```

---

### Task 2: Write the OpenAPI 3.0 spec

**Files:**
- Modify: `docs/api-reference/openapi.json` (replace Plant Store placeholder)

This is the most important task. The spec must match the actual Go types exactly.
Source: `core/api/endpoints/types.go` and `core/api/connectors/base/connector.go`.

**Step 1: Write the spec**

Replace the entire contents of `docs/api-reference/openapi.json` with:

```json
{
  "openapi": "3.0.3",
  "info": {
    "title": "SocialAPI.AI",
    "description": "Unified social media inbox API. Read and respond to comments, DMs, reviews, and mentions across Instagram, Facebook, Google Reviews, TikTok, YouTube, X/Twitter, Trustpilot, and LinkedIn through a single REST API.",
    "version": "1.0.0",
    "contact": {
      "name": "SocialAPI.AI Support",
      "email": "support@social-api.ai"
    }
  },
  "servers": [
    {
      "url": "https://api.social-api.ai/v1",
      "description": "Production"
    }
  ],
  "security": [
    { "BearerAuth": [] }
  ],
  "components": {
    "securitySchemes": {
      "BearerAuth": {
        "type": "http",
        "scheme": "bearer",
        "description": "Pass your API key as a Bearer token. Keys have the format `sk_live_...` and are created in the dashboard."
      }
    },
    "schemas": {
      "ErrorResponse": {
        "type": "object",
        "required": ["error", "code"],
        "properties": {
          "error": {
            "type": "string",
            "description": "Human-readable error message.",
            "example": "account not found"
          },
          "code": {
            "type": "string",
            "description": "Machine-readable error code.",
            "example": "account_not_found"
          }
        }
      },
      "Author": {
        "type": "object",
        "required": ["id", "name", "avatar_url"],
        "properties": {
          "id": {
            "type": "string",
            "description": "Platform-native user ID.",
            "example": "17841405793187218"
          },
          "name": {
            "type": "string",
            "description": "Display name of the author.",
            "example": "Jane Smith"
          },
          "avatar_url": {
            "type": "string",
            "description": "URL of the author's profile photo.",
            "example": "https://example.com/avatar.jpg"
          }
        }
      },
      "Media": {
        "type": "object",
        "required": ["url", "type"],
        "properties": {
          "url": {
            "type": "string",
            "description": "Direct URL to the media asset.",
            "example": "https://cdn.example.com/photo.jpg"
          },
          "type": {
            "type": "string",
            "description": "Media type (image, video, etc.).",
            "example": "image"
          }
        }
      },
      "Content": {
        "type": "object",
        "required": ["text"],
        "properties": {
          "text": {
            "type": "string",
            "description": "Text content of the interaction.",
            "example": "Love this product! Really glad I found it."
          },
          "media": {
            "type": "array",
            "description": "Attached media, if any.",
            "items": { "$ref": "#/components/schemas/Media" }
          }
        }
      },
      "Interaction": {
        "type": "object",
        "required": ["id", "platform", "type", "author", "content", "metadata", "created_at", "account_id", "platform_id"],
        "properties": {
          "id": {
            "type": "string",
            "description": "Stable SocialAPI ID. Prefix encodes type: `socapi_cmt_` (comment), `socapi_rev_` (review), `socapi_dm_` (DM), `socapi_mnt_` (mention).",
            "example": "socapi_cmt_aW5zdGFncmFtOjE3ODQxNDA1"
          },
          "platform": {
            "type": "string",
            "description": "Social platform name.",
            "example": "instagram"
          },
          "type": {
            "type": "string",
            "enum": ["comment", "review", "dm", "mention"],
            "description": "Interaction type.",
            "example": "comment"
          },
          "author": { "$ref": "#/components/schemas/Author" },
          "content": { "$ref": "#/components/schemas/Content" },
          "metadata": {
            "type": "object",
            "description": "Platform-specific extra fields (post ID, star rating, etc.).",
            "additionalProperties": true
          },
          "created_at": {
            "type": "string",
            "format": "date-time",
            "description": "When the interaction was created on the platform.",
            "example": "2026-02-15T14:30:00Z"
          },
          "account_id": {
            "type": "string",
            "description": "ID of the connected account this interaction belongs to.",
            "example": "acc_01HZ9X3Q4R5M6N7P8V2K0W1J"
          },
          "platform_id": {
            "type": "string",
            "description": "The platform's own native ID for this interaction.",
            "example": "17841405793187218"
          }
        }
      },
      "Account": {
        "type": "object",
        "required": ["id", "platform", "name", "username"],
        "properties": {
          "id": {
            "type": "string",
            "description": "SocialAPI account ID. Use this as the `:id` path parameter.",
            "example": "acc_01HZ9X3Q4R5M6N7P8V2K0W1J"
          },
          "platform": {
            "type": "string",
            "description": "Social platform name.",
            "example": "instagram"
          },
          "name": {
            "type": "string",
            "description": "Display name of the connected account.",
            "example": "Acme Corp"
          },
          "username": {
            "type": "string",
            "description": "Handle or username on the platform.",
            "example": "acmecorp"
          }
        }
      },
      "AccountsListResponse": {
        "type": "object",
        "required": ["data", "count"],
        "properties": {
          "data": {
            "type": "array",
            "items": { "$ref": "#/components/schemas/Account" }
          },
          "count": {
            "type": "integer",
            "description": "Total number of active connected accounts.",
            "example": 2
          }
        }
      },
      "InteractionsListResponse": {
        "type": "object",
        "required": ["data", "count"],
        "properties": {
          "data": {
            "type": "array",
            "items": { "$ref": "#/components/schemas/Interaction" }
          },
          "count": {
            "type": "integer",
            "description": "Number of interactions returned.",
            "example": 42
          }
        }
      },
      "Reply": {
        "type": "object",
        "required": ["id", "created_at"],
        "properties": {
          "id": {
            "type": "string",
            "description": "SocialAPI ID for the newly created reply.",
            "example": "socapi_cmt_cmVwbHk6MTIzNDU2Nzg5"
          },
          "created_at": {
            "type": "string",
            "format": "date-time",
            "description": "When the reply was created.",
            "example": "2026-02-15T14:35:00Z"
          }
        }
      },
      "ReplyRequest": {
        "type": "object",
        "required": ["text"],
        "properties": {
          "text": {
            "type": "string",
            "description": "Reply text content.",
            "example": "Thanks for your feedback! We're glad you enjoyed it."
          },
          "private": {
            "type": "boolean",
            "description": "Send the reply as a private/direct message when the platform supports it. Ignored for review replies.",
            "default": false,
            "example": false
          }
        }
      },
      "SendDMRequest": {
        "type": "object",
        "required": ["text"],
        "properties": {
          "text": {
            "type": "string",
            "description": "Message text content.",
            "example": "Hi! How can we help you today?"
          }
        }
      },
      "ModerateCommentRequest": {
        "type": "object",
        "required": ["action"],
        "properties": {
          "action": {
            "type": "string",
            "enum": ["hide", "unhide", "delete"],
            "description": "Moderation action to apply.",
            "example": "hide"
          }
        }
      },
      "TogglePostCommentsRequest": {
        "type": "object",
        "required": ["enabled"],
        "properties": {
          "enabled": {
            "type": "boolean",
            "description": "Set to `true` to enable comments on the post, `false` to disable.",
            "example": false
          }
        }
      },
      "UsageResponse": {
        "type": "object",
        "required": ["calls_used", "daily_limit", "period_start"],
        "properties": {
          "calls_used": {
            "type": "integer",
            "description": "Number of API calls made in the current daily window.",
            "example": 247
          },
          "daily_limit": {
            "type": "integer",
            "description": "Maximum calls allowed per day on your plan. -1 means unlimited.",
            "example": 1000
          },
          "period_start": {
            "type": "string",
            "format": "date-time",
            "description": "Start of the current billing period.",
            "example": "2026-02-01T00:00:00Z"
          }
        }
      },
      "UsageLimitsResponse": {
        "type": "object",
        "description": "Platform-specific quota keys mapping to remaining counts. Keys are platform-defined (e.g. Instagram returns `posts_remaining`). Platforms without usage limits return an empty object.",
        "additionalProperties": {
          "type": "integer"
        },
        "example": { "posts_remaining": 198 }
      },
      "DMThreadResponse": {
        "type": "object",
        "required": ["thread_id"],
        "properties": {
          "thread_id": {
            "type": "string",
            "description": "Platform thread ID for this DM conversation.",
            "example": "t_17841405793187218"
          }
        }
      },
      "OKResponse": {
        "type": "object",
        "required": ["ok"],
        "properties": {
          "ok": {
            "type": "boolean",
            "example": true
          }
        }
      },
      "KeyListItem": {
        "type": "object",
        "required": ["id", "name", "preview", "rate_limit", "is_active", "created_at"],
        "properties": {
          "id": {
            "type": "string",
            "description": "Key UUID. Use this as the `:id` parameter when revoking.",
            "example": "e4f2a1b3-0c5d-4e6f-a789-1b2c3d4e5f6a"
          },
          "name": {
            "type": "string",
            "description": "Friendly name for the key.",
            "example": "Production App"
          },
          "preview": {
            "type": "string",
            "description": "Truncated preview of the key (suffix only). The full key is only shown at creation.",
            "example": "sk_live_a1b2..."
          },
          "rate_limit": {
            "type": "integer",
            "description": "Daily call limit for this key (based on plan tier).",
            "example": 1000
          },
          "is_active": {
            "type": "boolean",
            "description": "Whether the key is currently active.",
            "example": true
          },
          "last_used_at": {
            "type": "string",
            "format": "date-time",
            "nullable": true,
            "description": "When this key was last used. Null if never used.",
            "example": "2026-02-28T12:00:00Z"
          },
          "created_at": {
            "type": "string",
            "format": "date-time",
            "description": "When this key was created.",
            "example": "2026-02-28T12:00:00Z"
          }
        }
      },
      "KeysListResponse": {
        "type": "object",
        "required": ["data", "count"],
        "properties": {
          "data": {
            "type": "array",
            "items": { "$ref": "#/components/schemas/KeyListItem" }
          },
          "count": {
            "type": "integer",
            "example": 3
          }
        }
      },
      "CreateKeyRequest": {
        "type": "object",
        "required": ["name"],
        "properties": {
          "name": {
            "type": "string",
            "description": "Friendly label for this key.",
            "example": "My App"
          }
        }
      },
      "CreateKeyResponse": {
        "type": "object",
        "required": ["id", "name", "raw_key", "message"],
        "properties": {
          "id": {
            "type": "string",
            "description": "Key UUID.",
            "example": "e4f2a1b3-0c5d-4e6f-a789-1b2c3d4e5f6a"
          },
          "name": {
            "type": "string",
            "example": "My App"
          },
          "raw_key": {
            "type": "string",
            "description": "The full API key. Shown only once — store it securely.",
            "example": "sk_live_a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1"
          },
          "message": {
            "type": "string",
            "example": "Store this key securely. It will not be shown again."
          }
        }
      },
      "ConnectAccountRequest": {
        "type": "object",
        "required": ["platform"],
        "properties": {
          "platform": {
            "type": "string",
            "description": "Platform slug. One of: `instagram`, `facebook`, `google`, `tiktok`, `youtube`, `twitter`, `linkedin`, `trustpilot`.",
            "example": "instagram"
          },
          "metadata": {
            "type": "object",
            "description": "Platform-specific metadata. For OAuth2 platforms, pass `redirect_uri` (the URL to redirect back to after authorization).",
            "additionalProperties": true,
            "example": { "redirect_uri": "https://app.example.com/oauth/callback" }
          }
        }
      },
      "ConnectOAuthResponse": {
        "type": "object",
        "required": ["auth_url", "state"],
        "properties": {
          "auth_url": {
            "type": "string",
            "description": "Redirect your user to this URL to complete the OAuth authorization flow.",
            "example": "https://www.instagram.com/oauth/authorize?client_id=...&state=..."
          },
          "state": {
            "type": "string",
            "description": "CSRF state token. Pass this in the `metadata.state` field when calling `/oauth/exchange`.",
            "example": "4a8f2c1e9b3d7f06a5c2e8b4d1f3a7e2"
          }
        }
      },
      "ConnectDirectResponse": {
        "type": "object",
        "required": ["account_id", "platform", "username"],
        "properties": {
          "account_id": {
            "type": "string",
            "description": "The SocialAPI account ID. Use this as `:id` in all subsequent requests.",
            "example": "acc_01HZ9X3Q4R5M6N7P8V2K0W1J"
          },
          "platform": {
            "type": "string",
            "example": "instagram"
          },
          "username": {
            "type": "string",
            "description": "The connected account's username on the platform.",
            "example": "acmecorp"
          }
        }
      },
      "OAuthExchangeRequest": {
        "type": "object",
        "required": ["platform", "code", "metadata"],
        "properties": {
          "platform": {
            "type": "string",
            "description": "Platform slug matching the one used in `/accounts/connect`.",
            "example": "instagram"
          },
          "code": {
            "type": "string",
            "description": "The authorization code received in the OAuth callback.",
            "example": "AQDtbPB9X..."
          },
          "metadata": {
            "type": "object",
            "description": "Must include `state` (from connect response) and `redirect_uri` (must match the one used in connect).",
            "required": ["state", "redirect_uri"],
            "properties": {
              "state": {
                "type": "string",
                "description": "The state value from the `POST /accounts/connect` response.",
                "example": "4a8f2c1e9b3d7f06a5c2e8b4d1f3a7e2"
              },
              "redirect_uri": {
                "type": "string",
                "description": "Must exactly match the redirect_uri used in the connect request.",
                "example": "https://app.example.com/oauth/callback"
              }
            },
            "additionalProperties": true
          }
        }
      }
    },
    "parameters": {
      "accountId": {
        "name": "id",
        "in": "path",
        "required": true,
        "description": "Connected account ID (from `GET /accounts`).",
        "schema": { "type": "string", "example": "acc_01HZ9X3Q4R5M6N7P8V2K0W1J" }
      },
      "interactionId": {
        "name": "iid",
        "in": "path",
        "required": true,
        "description": "SocialAPI interaction ID (prefix encodes the type).",
        "schema": { "type": "string", "example": "socapi_cmt_aW5zdGFncmFtOjE3ODQxNDA1" }
      },
      "since": {
        "name": "since",
        "in": "query",
        "description": "Return interactions created after this timestamp (RFC3339).",
        "schema": { "type": "string", "format": "date-time", "example": "2026-02-01T00:00:00Z" }
      },
      "limit": {
        "name": "limit",
        "in": "query",
        "description": "Maximum number of results to return (1–100, default 50).",
        "schema": { "type": "integer", "minimum": 1, "maximum": 100, "default": 50 }
      },
      "cursor": {
        "name": "cursor",
        "in": "query",
        "description": "Pagination cursor returned in the previous response.",
        "schema": { "type": "string" }
      }
    },
    "responses": {
      "Unauthorized": {
        "description": "Invalid or missing API key.",
        "content": {
          "application/json": {
            "schema": { "$ref": "#/components/schemas/ErrorResponse" },
            "example": { "error": "invalid or missing API key", "code": "unauthorized" }
          }
        }
      },
      "RateLimited": {
        "description": "Daily API call limit exceeded for your plan.",
        "content": {
          "application/json": {
            "schema": { "$ref": "#/components/schemas/ErrorResponse" },
            "example": { "error": "daily API call limit exceeded for your plan", "code": "rate_limit_exceeded" }
          }
        }
      },
      "NotFound": {
        "description": "Resource not found.",
        "content": {
          "application/json": {
            "schema": { "$ref": "#/components/schemas/ErrorResponse" },
            "example": { "error": "account not found", "code": "account_not_found" }
          }
        }
      },
      "NotSupported": {
        "description": "This operation is not supported on the connected platform.",
        "content": {
          "application/json": {
            "schema": { "$ref": "#/components/schemas/ErrorResponse" },
            "example": { "error": "operation not supported for this platform", "code": "not_supported" }
          }
        }
      }
    }
  },
  "tags": [
    { "name": "Accounts", "description": "Manage connected social accounts and OAuth flows." },
    { "name": "Comments", "description": "Read and reply to comments." },
    { "name": "DMs", "description": "Read and send direct messages." },
    { "name": "Reviews", "description": "Read and reply to reviews." },
    { "name": "Mentions", "description": "Read mentions." },
    { "name": "Moderation", "description": "Moderate comments and control post settings." },
    { "name": "Usage", "description": "Check API usage and plan limits." },
    { "name": "Keys", "description": "Manage API keys." },
    { "name": "Users", "description": "Manage your user account." },
    { "name": "Search", "description": "Cross-platform search (coming soon)." }
  ],
  "paths": {
    "/accounts": {
      "get": {
        "tags": ["Accounts"],
        "summary": "List connected accounts",
        "description": "Returns all active social media accounts connected to the authenticated API key's workspace.",
        "operationId": "listAccounts",
        "responses": {
          "200": {
            "description": "List of connected accounts.",
            "content": {
              "application/json": {
                "schema": { "$ref": "#/components/schemas/AccountsListResponse" },
                "example": {
                  "data": [
                    { "id": "acc_01HZ9X3Q4R5M6N7P8V2K0W1J", "platform": "instagram", "name": "Acme Corp", "username": "acmecorp" }
                  ],
                  "count": 1
                }
              }
            }
          },
          "401": { "$ref": "#/components/responses/Unauthorized" },
          "429": { "$ref": "#/components/responses/RateLimited" }
        }
      }
    },
    "/accounts/connect": {
      "post": {
        "tags": ["Accounts"],
        "summary": "Connect a social account",
        "description": "Initiates account connection.\n\n- **OAuth2 platforms** (Instagram, Facebook, etc.): Returns HTTP 202 with an `auth_url`. Redirect your user to that URL. After authorization, the platform redirects to your `redirect_uri` with a `code` and `state`. Call `POST /oauth/exchange` to complete the flow.\n- **Direct auth platforms** (API key / credentials): Returns HTTP 201 with the new `account_id` immediately.",
        "operationId": "connectAccount",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": { "$ref": "#/components/schemas/ConnectAccountRequest" }
            }
          }
        },
        "responses": {
          "201": {
            "description": "Account connected (direct auth platforms).",
            "content": {
              "application/json": {
                "schema": { "$ref": "#/components/schemas/ConnectDirectResponse" }
              }
            }
          },
          "202": {
            "description": "OAuth2 flow initiated. Redirect your user to `auth_url`.",
            "content": {
              "application/json": {
                "schema": { "$ref": "#/components/schemas/ConnectOAuthResponse" }
              }
            }
          },
          "400": {
            "description": "Missing or unsupported platform.",
            "content": {
              "application/json": {
                "schema": { "$ref": "#/components/schemas/ErrorResponse" },
                "examples": {
                  "missing_platform": { "value": { "error": "platform is required", "code": "missing_metadata" } },
                  "unsupported": { "value": { "error": "platform not supported", "code": "unsupported_platform" } }
                }
              }
            }
          },
          "401": { "$ref": "#/components/responses/Unauthorized" },
          "409": {
            "description": "Account already connected.",
            "content": {
              "application/json": {
                "schema": { "$ref": "#/components/schemas/ErrorResponse" },
                "example": { "error": "account already connected", "code": "account_already_linked" }
              }
            }
          }
        }
      }
    },
    "/oauth/exchange": {
      "post": {
        "tags": ["Accounts"],
        "summary": "Complete OAuth2 account connection",
        "description": "Exchanges an OAuth2 authorization code for tokens and stores the connected account.\n\nThe `state` value from the `/accounts/connect` response is one-time-use and validated server-side (CSRF protection). It expires after 10 minutes.",
        "operationId": "oauthExchange",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": { "$ref": "#/components/schemas/OAuthExchangeRequest" }
            }
          }
        },
        "responses": {
          "201": {
            "description": "Account connected successfully.",
            "content": {
              "application/json": {
                "schema": { "$ref": "#/components/schemas/ConnectDirectResponse" }
              }
            }
          },
          "400": {
            "description": "Missing/expired state or invalid request.",
            "content": {
              "application/json": {
                "schema": { "$ref": "#/components/schemas/ErrorResponse" },
                "example": { "error": "invalid or expired state", "code": "missing_metadata" }
              }
            }
          },
          "401": { "$ref": "#/components/responses/Unauthorized" },
          "403": {
            "description": "State token belongs to a different API key.",
            "content": {
              "application/json": {
                "schema": { "$ref": "#/components/schemas/ErrorResponse" },
                "example": { "error": "state does not belong to this API key", "code": "unauthorized" }
              }
            }
          }
        }
      }
    },
    "/accounts/{id}/comments": {
      "get": {
        "tags": ["Comments"],
        "summary": "List comments",
        "description": "Returns comments for the connected account, in reverse-chronological order.",
        "operationId": "getComments",
        "parameters": [
          { "$ref": "#/components/parameters/accountId" },
          { "$ref": "#/components/parameters/since" },
          { "$ref": "#/components/parameters/limit" },
          { "$ref": "#/components/parameters/cursor" }
        ],
        "responses": {
          "200": {
            "description": "Paginated list of comments.",
            "content": {
              "application/json": {
                "schema": { "$ref": "#/components/schemas/InteractionsListResponse" }
              }
            }
          },
          "401": { "$ref": "#/components/responses/Unauthorized" },
          "404": { "$ref": "#/components/responses/NotFound" },
          "429": { "$ref": "#/components/responses/RateLimited" },
          "501": { "$ref": "#/components/responses/NotSupported" }
        }
      }
    },
    "/accounts/{id}/interactions/{iid}/replies": {
      "get": {
        "tags": ["Comments"],
        "summary": "List comment replies",
        "description": "Returns the reply thread for a comment. Only valid for `socapi_cmt_` IDs.",
        "operationId": "getCommentReplies",
        "parameters": [
          { "$ref": "#/components/parameters/accountId" },
          { "$ref": "#/components/parameters/interactionId" },
          { "$ref": "#/components/parameters/since" },
          { "$ref": "#/components/parameters/limit" },
          { "$ref": "#/components/parameters/cursor" }
        ],
        "responses": {
          "200": {
            "description": "Reply thread.",
            "content": {
              "application/json": {
                "schema": { "$ref": "#/components/schemas/InteractionsListResponse" }
              }
            }
          },
          "400": {
            "description": "Invalid interaction ID format.",
            "content": { "application/json": { "schema": { "$ref": "#/components/schemas/ErrorResponse" } } }
          },
          "401": { "$ref": "#/components/responses/Unauthorized" },
          "404": { "$ref": "#/components/responses/NotFound" },
          "429": { "$ref": "#/components/responses/RateLimited" }
        }
      }
    },
    "/accounts/{id}/interactions/{iid}/reply": {
      "post": {
        "tags": ["Comments"],
        "summary": "Reply to a comment or review",
        "description": "Posts a reply to a comment (`socapi_cmt_`) or review (`socapi_rev_`).\n\nSet `private: true` to send the reply as a private message instead of a public reply (supported on some platforms, e.g. Instagram). The `private` field is ignored for reviews.",
        "operationId": "replyToInteraction",
        "parameters": [
          { "$ref": "#/components/parameters/accountId" },
          { "$ref": "#/components/parameters/interactionId" }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": { "schema": { "$ref": "#/components/schemas/ReplyRequest" } }
          }
        },
        "responses": {
          "201": {
            "description": "Reply created.",
            "content": {
              "application/json": { "schema": { "$ref": "#/components/schemas/Reply" } }
            }
          },
          "400": {
            "description": "Invalid interaction ID or missing text.",
            "content": { "application/json": { "schema": { "$ref": "#/components/schemas/ErrorResponse" } } }
          },
          "401": { "$ref": "#/components/responses/Unauthorized" },
          "404": { "$ref": "#/components/responses/NotFound" },
          "429": { "$ref": "#/components/responses/RateLimited" },
          "501": { "$ref": "#/components/responses/NotSupported" }
        }
      }
    },
    "/accounts/{id}/dms": {
      "get": {
        "tags": ["DMs"],
        "summary": "List DM threads",
        "description": "Returns direct message conversations for the connected account.",
        "operationId": "getDMs",
        "parameters": [
          { "$ref": "#/components/parameters/accountId" },
          { "$ref": "#/components/parameters/since" },
          { "$ref": "#/components/parameters/limit" },
          { "$ref": "#/components/parameters/cursor" }
        ],
        "responses": {
          "200": {
            "description": "Paginated list of DM conversations.",
            "content": {
              "application/json": { "schema": { "$ref": "#/components/schemas/InteractionsListResponse" } }
            }
          },
          "401": { "$ref": "#/components/responses/Unauthorized" },
          "404": { "$ref": "#/components/responses/NotFound" },
          "429": { "$ref": "#/components/responses/RateLimited" },
          "501": { "$ref": "#/components/responses/NotSupported" }
        }
      }
    },
    "/accounts/{id}/dms/thread": {
      "get": {
        "tags": ["DMs"],
        "summary": "Get DM thread ID for a user",
        "description": "Returns the thread ID of an existing DM conversation with a platform user. Returns 404 if no prior conversation exists. Use `POST /accounts/{id}/interactions/{iid}/reply` with `private: true` to initiate contact from a comment instead.",
        "operationId": "getDMThread",
        "parameters": [
          { "$ref": "#/components/parameters/accountId" },
          {
            "name": "user_id",
            "in": "query",
            "required": true,
            "description": "Platform-native user ID to look up.",
            "schema": { "type": "string", "example": "17841405793187218" }
          }
        ],
        "responses": {
          "200": {
            "description": "Thread ID found.",
            "content": {
              "application/json": { "schema": { "$ref": "#/components/schemas/DMThreadResponse" } }
            }
          },
          "401": { "$ref": "#/components/responses/Unauthorized" },
          "404": { "$ref": "#/components/responses/NotFound" },
          "429": { "$ref": "#/components/responses/RateLimited" },
          "501": { "$ref": "#/components/responses/NotSupported" }
        }
      }
    },
    "/accounts/{id}/dms/{tid}/send": {
      "post": {
        "tags": ["DMs"],
        "summary": "Send a direct message",
        "description": "Sends a message to an existing DM thread.",
        "operationId": "sendDM",
        "parameters": [
          { "$ref": "#/components/parameters/accountId" },
          {
            "name": "tid",
            "in": "path",
            "required": true,
            "description": "Thread ID from `GET /accounts/{id}/dms/thread` or the `id` field of a DM interaction.",
            "schema": { "type": "string", "example": "t_17841405793187218" }
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": { "schema": { "$ref": "#/components/schemas/SendDMRequest" } }
          }
        },
        "responses": {
          "201": {
            "description": "Message sent.",
            "content": {
              "application/json": { "schema": { "$ref": "#/components/schemas/Reply" } }
            }
          },
          "401": { "$ref": "#/components/responses/Unauthorized" },
          "404": { "$ref": "#/components/responses/NotFound" },
          "429": { "$ref": "#/components/responses/RateLimited" },
          "501": { "$ref": "#/components/responses/NotSupported" }
        }
      }
    },
    "/accounts/{id}/reviews": {
      "get": {
        "tags": ["Reviews"],
        "summary": "List reviews",
        "description": "Returns reviews for the connected account (e.g. Google Reviews, Trustpilot). Returns 501 for platforms that do not have a review concept (e.g. Instagram).",
        "operationId": "getReviews",
        "parameters": [
          { "$ref": "#/components/parameters/accountId" },
          { "$ref": "#/components/parameters/since" },
          { "$ref": "#/components/parameters/limit" },
          { "$ref": "#/components/parameters/cursor" }
        ],
        "responses": {
          "200": {
            "description": "Paginated list of reviews.",
            "content": {
              "application/json": { "schema": { "$ref": "#/components/schemas/InteractionsListResponse" } }
            }
          },
          "401": { "$ref": "#/components/responses/Unauthorized" },
          "404": { "$ref": "#/components/responses/NotFound" },
          "429": { "$ref": "#/components/responses/RateLimited" },
          "501": { "$ref": "#/components/responses/NotSupported" }
        }
      }
    },
    "/accounts/{id}/mentions": {
      "get": {
        "tags": ["Mentions"],
        "summary": "List mentions",
        "description": "Returns posts and comments that mention the connected account.",
        "operationId": "getMentions",
        "parameters": [
          { "$ref": "#/components/parameters/accountId" },
          { "$ref": "#/components/parameters/since" },
          { "$ref": "#/components/parameters/limit" },
          { "$ref": "#/components/parameters/cursor" }
        ],
        "responses": {
          "200": {
            "description": "Paginated list of mentions.",
            "content": {
              "application/json": { "schema": { "$ref": "#/components/schemas/InteractionsListResponse" } }
            }
          },
          "401": { "$ref": "#/components/responses/Unauthorized" },
          "404": { "$ref": "#/components/responses/NotFound" },
          "429": { "$ref": "#/components/responses/RateLimited" },
          "501": { "$ref": "#/components/responses/NotSupported" }
        }
      }
    },
    "/accounts/{id}/interactions/{iid}/moderate": {
      "post": {
        "tags": ["Moderation"],
        "summary": "Moderate a comment",
        "description": "Hides, unhides, or deletes a comment. Only valid for `socapi_cmt_` IDs.\n\nActions:\n- `hide` — hides the comment from public view\n- `unhide` — makes a hidden comment visible again\n- `delete` — permanently deletes the comment (irreversible)\n\nReturns 501 if the platform does not support the requested action.",
        "operationId": "moderateComment",
        "parameters": [
          { "$ref": "#/components/parameters/accountId" },
          { "$ref": "#/components/parameters/interactionId" }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": { "schema": { "$ref": "#/components/schemas/ModerateCommentRequest" } }
          }
        },
        "responses": {
          "200": {
            "description": "Moderation applied.",
            "content": {
              "application/json": { "schema": { "$ref": "#/components/schemas/OKResponse" } }
            }
          },
          "400": {
            "description": "Invalid action or interaction ID.",
            "content": { "application/json": { "schema": { "$ref": "#/components/schemas/ErrorResponse" } } }
          },
          "401": { "$ref": "#/components/responses/Unauthorized" },
          "404": { "$ref": "#/components/responses/NotFound" },
          "429": { "$ref": "#/components/responses/RateLimited" },
          "501": { "$ref": "#/components/responses/NotSupported" }
        }
      }
    },
    "/accounts/{id}/posts/{pid}/comments/toggle": {
      "post": {
        "tags": ["Moderation"],
        "summary": "Toggle comments on a post",
        "description": "Enables or disables the ability for users to comment on a specific post. Returns 501 if the platform does not support this setting.",
        "operationId": "togglePostComments",
        "parameters": [
          { "$ref": "#/components/parameters/accountId" },
          {
            "name": "pid",
            "in": "path",
            "required": true,
            "description": "Platform-native post ID.",
            "schema": { "type": "string", "example": "17841405793187218" }
          }
        ],
        "requestBody": {
          "required": true,
          "content": {
            "application/json": { "schema": { "$ref": "#/components/schemas/TogglePostCommentsRequest" } }
          }
        },
        "responses": {
          "200": {
            "description": "Setting applied.",
            "content": {
              "application/json": { "schema": { "$ref": "#/components/schemas/OKResponse" } }
            }
          },
          "401": { "$ref": "#/components/responses/Unauthorized" },
          "404": { "$ref": "#/components/responses/NotFound" },
          "429": { "$ref": "#/components/responses/RateLimited" },
          "501": { "$ref": "#/components/responses/NotSupported" }
        }
      }
    },
    "/usage": {
      "get": {
        "tags": ["Usage"],
        "summary": "Get API usage",
        "description": "Returns the number of API calls made in the current daily window and the limit for your plan. The window resets at midnight UTC.",
        "operationId": "getUsage",
        "responses": {
          "200": {
            "description": "Usage statistics.",
            "content": {
              "application/json": {
                "schema": { "$ref": "#/components/schemas/UsageResponse" },
                "example": { "calls_used": 247, "daily_limit": 1000, "period_start": "2026-02-01T00:00:00Z" }
              }
            }
          },
          "401": { "$ref": "#/components/responses/Unauthorized" }
        }
      }
    },
    "/accounts/{id}/limits": {
      "get": {
        "tags": ["Usage"],
        "summary": "Get platform usage limits",
        "description": "Returns platform-specific quota information for the connected account (e.g. remaining posts for Instagram). Keys are platform-defined. An empty object means the platform does not expose quota data.",
        "operationId": "getAccountLimits",
        "parameters": [
          { "$ref": "#/components/parameters/accountId" }
        ],
        "responses": {
          "200": {
            "description": "Platform quota data.",
            "content": {
              "application/json": {
                "schema": { "$ref": "#/components/schemas/UsageLimitsResponse" }
              }
            }
          },
          "401": { "$ref": "#/components/responses/Unauthorized" },
          "404": { "$ref": "#/components/responses/NotFound" },
          "429": { "$ref": "#/components/responses/RateLimited" }
        }
      }
    },
    "/keys": {
      "get": {
        "tags": ["Keys"],
        "summary": "List API keys",
        "description": "Returns all API keys in the workspace. The `preview` field shows only a truncated suffix — the full key is only available at creation time.",
        "operationId": "listKeys",
        "responses": {
          "200": {
            "description": "List of API keys.",
            "content": {
              "application/json": { "schema": { "$ref": "#/components/schemas/KeysListResponse" } }
            }
          },
          "401": { "$ref": "#/components/responses/Unauthorized" }
        }
      },
      "post": {
        "tags": ["Keys"],
        "summary": "Create an API key",
        "description": "Generates a new API key. The full key is returned **only once** in `raw_key` — store it immediately. Subsequent calls to `GET /keys` will only show a truncated preview.",
        "operationId": "createKey",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": { "schema": { "$ref": "#/components/schemas/CreateKeyRequest" } }
          }
        },
        "responses": {
          "201": {
            "description": "Key created. The `raw_key` is shown only once.",
            "content": {
              "application/json": { "schema": { "$ref": "#/components/schemas/CreateKeyResponse" } }
            }
          },
          "401": { "$ref": "#/components/responses/Unauthorized" }
        }
      }
    },
    "/keys/{id}": {
      "delete": {
        "tags": ["Keys"],
        "summary": "Revoke an API key",
        "description": "Permanently deactivates an API key. The key will immediately stop working for all requests.",
        "operationId": "revokeKey",
        "parameters": [
          {
            "name": "id",
            "in": "path",
            "required": true,
            "description": "Key ID from `GET /keys`.",
            "schema": { "type": "string" }
          }
        ],
        "responses": {
          "204": { "description": "Key revoked." },
          "401": { "$ref": "#/components/responses/Unauthorized" },
          "404": { "$ref": "#/components/responses/NotFound" }
        }
      }
    },
    "/users/me": {
      "delete": {
        "tags": ["Users"],
        "summary": "Delete your account",
        "description": "Soft-deletes your user account. All connected social accounts and API keys are also deactivated. This action is irreversible.",
        "operationId": "deleteUser",
        "responses": {
          "204": { "description": "Account deleted." },
          "401": { "$ref": "#/components/responses/Unauthorized" }
        }
      }
    },
    "/search": {
      "get": {
        "tags": ["Search"],
        "summary": "Search across all accounts",
        "description": "Fan-out search across all connected accounts and platforms. **Not yet implemented — returns 501.**",
        "operationId": "search",
        "parameters": [
          {
            "name": "q",
            "in": "query",
            "required": true,
            "description": "Search query string.",
            "schema": { "type": "string", "example": "shipping delay" }
          }
        ],
        "responses": {
          "501": { "$ref": "#/components/responses/NotSupported" },
          "401": { "$ref": "#/components/responses/Unauthorized" }
        }
      }
    }
  }
}
```

**Step 2: Commit**

```bash
cd "docs"
git add api-reference/openapi.json
git commit -m "feat: add real OpenAPI 3.0 spec (20 public endpoints)"
```

---

### Task 3: Update docs.json

**Files:**
- Modify: `docs/docs.json`

Replace the entire file with this config. Note: `"name"` is the site name shown in the browser tab and header.

**Step 1: Write docs.json**

```json
{
  "$schema": "https://mintlify.com/docs.json",
  "theme": "mint",
  "name": "SocialAPI.AI",
  "colors": {
    "primary": "#16A34A",
    "light": "#07C983",
    "dark": "#15803D"
  },
  "favicon": "/favicon.svg",
  "logo": {
    "light": "/logo/light.svg",
    "dark": "/logo/dark.svg"
  },
  "navbar": {
    "links": [
      {
        "label": "Support",
        "href": "mailto:support@social-api.ai"
      }
    ],
    "primary": {
      "type": "button",
      "label": "Dashboard",
      "href": "https://app.social-api.ai"
    }
  },
  "navigation": {
    "tabs": [
      {
        "tab": "Guides",
        "groups": [
          {
            "group": "Getting started",
            "pages": [
              "index",
              "quickstart"
            ]
          },
          {
            "group": "Core concepts",
            "pages": [
              "guides/authentication",
              "guides/rate-limits",
              "guides/oauth",
              "guides/interaction-ids",
              "guides/errors"
            ]
          }
        ]
      },
      {
        "tab": "API Reference",
        "openapi": "api-reference/openapi.json"
      },
      {
        "tab": "Connectors",
        "groups": [
          {
            "group": "Platforms",
            "pages": [
              "connectors/overview",
              "connectors/instagram",
              "connectors/facebook",
              "connectors/google-reviews",
              "connectors/tiktok",
              "connectors/twitter",
              "connectors/youtube",
              "connectors/linkedin",
              "connectors/trustpilot"
            ]
          }
        ]
      }
    ],
    "global": {
      "anchors": [
        {
          "anchor": "Support",
          "href": "mailto:support@social-api.ai",
          "icon": "envelope"
        }
      ]
    }
  },
  "contextual": {
    "options": ["copy", "view", "chatgpt", "claude", "mcp", "cursor"]
  },
  "footer": {
    "socials": {
      "x": "https://x.com/socialapiai",
      "github": "https://github.com/social-api-ai"
    }
  }
}
```

**Step 2: Commit**

```bash
cd "docs"
git add docs.json
git commit -m "feat: update docs.json for 3-tab SocialAPI.AI navigation"
```

---

### Task 4: Write index.mdx (Introduction)

**Files:**
- Modify: `docs/index.mdx`

**Step 1: Write content**

```mdx
---
title: SocialAPI.AI
description: One API to read and respond across all your social channels.
---

SocialAPI.AI is a unified social media inbox API. Connect your Instagram, Facebook, Google Reviews, TikTok, YouTube, X/Twitter, LinkedIn, and Trustpilot accounts once — then read comments, DMs, reviews, and mentions from all of them through a single REST API.

<CardGroup cols={2}>
  <Card title="Quickstart" icon="rocket" href="/quickstart">
    Get your first API response in under 5 minutes.
  </Card>
  <Card title="Authentication" icon="key" href="/guides/authentication">
    How API keys work and how to pass them.
  </Card>
  <Card title="API Reference" icon="code" href="/api-reference/introduction">
    All 20 endpoints with interactive examples.
  </Card>
  <Card title="Connectors" icon="plug" href="/connectors/overview">
    Platform-specific features and capabilities.
  </Card>
</CardGroup>

## What you can do

| Feature | Description |
|---|---|
| **Comments** | Fetch and reply to comments on posts |
| **Direct Messages** | Read and send DMs |
| **Reviews** | Fetch and reply to Google Reviews, Trustpilot reviews |
| **Mentions** | Track when your brand is mentioned |
| **Moderation** | Hide, unhide, or delete comments; toggle comments on posts |

## How it works

All social data is fetched in real-time from platform APIs — nothing is stored on our side. Your OAuth tokens are encrypted at rest. Each API call goes through authentication, rate limiting, and usage logging.

Responses follow a consistent shape across all platforms. An Instagram comment and a Google Review look the same in the API — only the `platform` field and `metadata` differ.

## Supported platforms

| Platform | Comments | DMs | Reviews | Mentions |
|---|---|---|---|---|
| Instagram | ✅ | ✅ | — | — |
| Facebook | Soon | Soon | — | — |
| Google Reviews | — | — | Soon | — |
| TikTok | Soon | — | — | — |
| YouTube | Soon | — | — | — |
| X / Twitter | Soon | Soon | — | Soon |
| LinkedIn | Soon | — | — | Soon |
| Trustpilot | — | — | Soon | — |

<Note>
  Only Instagram is fully available today. Other platforms are in active development.
</Note>
```

**Step 2: Commit**

```bash
cd "docs"
git add index.mdx
git commit -m "feat: write Introduction page"
```

---

### Task 5: Write quickstart.mdx

**Files:**
- Modify: `docs/quickstart.mdx`

**Step 1: Write content**

```mdx
---
title: Quickstart
description: Make your first API call in under 5 minutes.
---

## 1. Create your account

Sign up at [app.social-api.ai](https://app.social-api.ai). Verify your email and log in.

## 2. Get an API key

In the dashboard, go to **Keys** → **New Key**. Give it a name and click **Create**.

<Warning>
  Copy the key immediately — it is shown only once. It starts with `sk_live_`.
</Warning>

Store it in your environment:

```bash
export SOCAPI_KEY="sk_live_your_key_here"
```

## 3. Connect a social account

In the dashboard, go to **Accounts** → **Connect** and choose your platform. Complete the OAuth flow in your browser.

## 4. List your accounts

```bash
curl https://api.social-api.ai/v1/accounts \
  -H "Authorization: Bearer $SOCAPI_KEY"
```

Response:

```json
{
  "data": [
    {
      "id": "acc_01HZ9X3Q4R5M6N7P8V2K0W1J",
      "platform": "instagram",
      "name": "Acme Corp",
      "username": "acmecorp"
    }
  ],
  "count": 1
}
```

Copy the `id` — you'll use it in all account-specific requests.

## 5. Fetch comments

```bash
curl "https://api.social-api.ai/v1/accounts/acc_01HZ9X3Q4R5M6N7P8V2K0W1J/comments?limit=5" \
  -H "Authorization: Bearer $SOCAPI_KEY"
```

Response:

```json
{
  "data": [
    {
      "id": "socapi_cmt_aW5zdGFncmFtOjE3ODQxNDA1",
      "platform": "instagram",
      "type": "comment",
      "author": {
        "id": "17841405793187218",
        "name": "Jane Smith",
        "avatar_url": "https://example.com/avatar.jpg"
      },
      "content": {
        "text": "Love this product!",
        "media": []
      },
      "metadata": {},
      "created_at": "2026-02-15T14:30:00Z",
      "account_id": "acc_01HZ9X3Q4R5M6N7P8V2K0W1J",
      "platform_id": "17841405793187218"
    }
  ],
  "count": 1
}
```

## 6. Reply to a comment

Use the `id` from the comment above:

```bash
curl -X POST \
  "https://api.social-api.ai/v1/accounts/acc_01HZ9X3Q4R5M6N7P8V2K0W1J/interactions/socapi_cmt_aW5zdGFncmFtOjE3ODQxNDA1/reply" \
  -H "Authorization: Bearer $SOCAPI_KEY" \
  -H "Content-Type: application/json" \
  -d '{"text": "Thanks so much, Jane!"}'
```

Response:

```json
{
  "id": "socapi_cmt_cmVwbHk6MTIzNDU2Nzg5",
  "created_at": "2026-02-15T14:35:00Z"
}
```

## What's next

<CardGroup cols={2}>
  <Card title="Authentication" icon="key" href="/guides/authentication">
    Managing API keys and security.
  </Card>
  <Card title="Interaction IDs" icon="fingerprint" href="/guides/interaction-ids">
    How SocialAPI IDs work and what they encode.
  </Card>
  <Card title="Rate Limits" icon="gauge" href="/guides/rate-limits">
    Daily limits and how to handle 429s.
  </Card>
  <Card title="Connectors" icon="plug" href="/connectors/instagram">
    Platform-specific features and quirks.
  </Card>
</CardGroup>
```

**Step 2: Commit**

```bash
cd "docs"
git add quickstart.mdx
git commit -m "feat: write Quickstart page"
```

---

### Task 6: Write guides/authentication.mdx

**Files:**
- Create: `docs/guides/authentication.mdx`

**Step 1: Write content**

```mdx
---
title: Authentication
description: How API keys work and how to use them.
---

Every request to SocialAPI.AI requires an API key passed as a Bearer token.

## Format

API keys have the format:

```
sk_live_<64 hex characters>
```

Example: `sk_live_a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2`

## Passing the key

Include the key in the `Authorization` header of every request:

```bash
curl https://api.social-api.ai/v1/accounts \
  -H "Authorization: Bearer sk_live_your_key_here"
```

If the key is missing or invalid, the API returns:

```json
{
  "error": "invalid or missing API key",
  "code": "unauthorized"
}
```

## Creating keys

Keys are created in the dashboard under **Keys** → **New Key**, or via the API:

```bash
curl -X POST https://api.social-api.ai/v1/keys \
  -H "Authorization: Bearer $SOCAPI_KEY" \
  -H "Content-Type: application/json" \
  -d '{"name": "Production App"}'
```

The full key is returned **once** in `raw_key`. Store it immediately — subsequent reads only show a truncated preview like `sk_live_a1b2...`.

## Revoking keys

Keys are revoked in the dashboard, or via:

```bash
curl -X DELETE https://api.social-api.ai/v1/keys/<key-id> \
  -H "Authorization: Bearer $SOCAPI_KEY"
```

A revoked key stops working immediately for all requests.

## Listing keys

```bash
curl https://api.social-api.ai/v1/keys \
  -H "Authorization: Bearer $SOCAPI_KEY"
```

The response includes `preview` (suffix only), `rate_limit` (daily call limit), `is_active`, and `last_used_at`.

## Security best practices

- **Never expose keys in frontend code** — keys must only be used server-side
- **Use environment variables** — do not hardcode keys in source code
- **Create one key per service** — revoke individual keys if compromised without disrupting others
- **Monitor `last_used_at`** — unused keys should be revoked
```

**Step 2: Commit**

```bash
cd "docs"
git add guides/authentication.mdx
git commit -m "feat: write Authentication guide"
```

---

### Task 7: Write guides/rate-limits.mdx

**Files:**
- Create: `docs/guides/rate-limits.mdx`

**Step 1: Write content**

```mdx
---
title: Rate Limits & Plans
description: Daily API call limits and how to handle them.
---

## Plan limits

Every API key has a daily call limit based on your plan tier. The window resets at midnight UTC.

| Plan | Calls / day | Max platforms | DMs | Multi-tenant |
|---|---|---|---|---|
| Free | 100 | 2 | — | — |
| Starter | 1,000 | 5 | ✅ | — |
| Pro | 5,000 | 15 | ✅ | — |
| Business | 20,000 | 50 | ✅ | ✅ |
| Enterprise | Unlimited | Unlimited | ✅ | ✅ |

Upgrade your plan at [app.social-api.ai](https://app.social-api.ai) → **Billing**.

## Response headers

Every API response includes:

| Header | Description |
|---|---|
| `X-RateLimit-Limit` | Your daily call limit |
| `X-RateLimit-Remaining` | Remaining calls for today |

## When you hit the limit

The API returns HTTP `429` with:

```json
{
  "error": "daily API call limit exceeded for your plan",
  "code": "rate_limit_exceeded"
}
```

## Checking your usage

```bash
curl https://api.social-api.ai/v1/usage \
  -H "Authorization: Bearer $SOCAPI_KEY"
```

```json
{
  "calls_used": 247,
  "daily_limit": 1000,
  "period_start": "2026-02-01T00:00:00Z"
}
```

## Platform rate limits

Platforms (Instagram, Google, etc.) have their own rate limits independent of ours. When a platform rejects a request due to its own limits, you receive:

```json
{
  "error": "platform rate limit exceeded",
  "code": "platform_rate_limit"
}
```

This does **not** count against your SocialAPI daily limit. Retry after a short wait (typically a few minutes).

## Handling 429s

```python
import time
import requests

def call_with_retry(url, headers, max_retries=3):
    for attempt in range(max_retries):
        resp = requests.get(url, headers=headers)
        if resp.status_code == 429:
            time.sleep(2 ** attempt)  # exponential backoff
            continue
        return resp
    raise Exception("rate limit exceeded after retries")
```

<Tip>
  Check `X-RateLimit-Remaining` proactively to slow down before hitting the limit.
</Tip>
```

**Step 2: Commit**

```bash
cd "docs"
git add guides/rate-limits.mdx
git commit -m "feat: write Rate Limits & Plans guide"
```

---

### Task 8: Write guides/oauth.mdx

**Files:**
- Create: `docs/guides/oauth.mdx`

**Step 1: Write content**

```mdx
---
title: Connecting Social Accounts
description: How to connect social accounts via OAuth2 and direct auth.
---

Most social platforms use OAuth2. A few support direct API key or credential auth.

## OAuth2 flow

Connecting an OAuth2 platform (Instagram, Facebook, etc.) takes three steps:

### Step 1: Initiate the flow

Call `POST /accounts/connect` with your platform and a `redirect_uri`:

```bash
curl -X POST https://api.social-api.ai/v1/accounts/connect \
  -H "Authorization: Bearer $SOCAPI_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "platform": "instagram",
    "metadata": {
      "redirect_uri": "https://app.example.com/oauth/callback"
    }
  }'
```

Response (HTTP 202):

```json
{
  "auth_url": "https://www.instagram.com/oauth/authorize?client_id=...&state=...",
  "state": "4a8f2c1e9b3d7f06a5c2e8b4d1f3a7e2"
}
```

### Step 2: Redirect the user

Send your user to `auth_url`. They log in and grant permissions. The platform redirects back to your `redirect_uri` with `?code=...&state=...` query parameters.

Store the `state` value from Step 1 — you need it in Step 3.

### Step 3: Exchange the code

```bash
curl -X POST https://api.social-api.ai/v1/oauth/exchange \
  -H "Authorization: Bearer $SOCAPI_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "platform": "instagram",
    "code": "AQDtbPB9X...",
    "metadata": {
      "state": "4a8f2c1e9b3d7f06a5c2e8b4d1f3a7e2",
      "redirect_uri": "https://app.example.com/oauth/callback"
    }
  }'
```

Response (HTTP 201):

```json
{
  "account_id": "acc_01HZ9X3Q4R5M6N7P8V2K0W1J",
  "platform": "instagram",
  "username": "acmecorp"
}
```

The `account_id` is now ready to use in all account endpoints.

<Warning>
  The `state` token is one-time-use and expires after 10 minutes. If the exchange fails with `invalid or expired state`, restart from Step 1.
</Warning>

## State token security

The `state` value is a CSRF token. It:
1. Is generated server-side as 16 random bytes (not guessable)
2. Is stored in Redis with a 10-minute TTL
3. Is deleted immediately on exchange (prevents replay attacks)
4. Is tied to your API key — another key cannot use your state

If your `/oauth/exchange` call returns `403 state does not belong to this API key`, it means the key used in Step 3 is different from the one used in Step 1.

## Listing connected accounts

```bash
curl https://api.social-api.ai/v1/accounts \
  -H "Authorization: Bearer $SOCAPI_KEY"
```

## Reconnecting an account

If you call `POST /accounts/connect` for an account that is already connected, the upsert updates the stored token. This is safe to call when tokens expire.

## Direct auth (non-OAuth platforms)

Some platforms accept an API key or username/password directly. For these, `POST /accounts/connect` returns HTTP 201 immediately without a redirect:

```bash
curl -X POST https://api.social-api.ai/v1/accounts/connect \
  -H "Authorization: Bearer $SOCAPI_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "platform": "trustpilot",
    "metadata": {
      "api_key": "your-trustpilot-api-key"
    }
  }'
```

Check the [Connectors](/connectors/overview) section for each platform's auth type and required metadata fields.
```

**Step 2: Commit**

```bash
cd "docs"
git add guides/oauth.mdx
git commit -m "feat: write OAuth / Connecting Accounts guide"
```

---

### Task 9: Write guides/interaction-ids.mdx

**Files:**
- Create: `docs/guides/interaction-ids.mdx`

**Step 1: Write content**

```mdx
---
title: Interaction IDs
description: How SocialAPI IDs encode type and platform.
---

Every comment, DM, review, and mention returned by the API has a stable, opaque `id` field. These IDs are designed to be stored and reused across calls.

## Format

```
socapi_{type}_{base64url(platform:platformID)}
```

The prefix tells you the interaction type:

| Prefix | Type |
|---|---|
| `socapi_cmt_` | Comment |
| `socapi_rev_` | Review |
| `socapi_dm_` | Direct message |
| `socapi_mnt_` | Mention |

Examples:
- `socapi_cmt_aW5zdGFncmFtOjE3ODQxNDA1` — an Instagram comment
- `socapi_rev_Z29vZ2xlOmNoSUpBYnVu` — a Google Review
- `socapi_dm_aW5zdGFncmFtOnQxNzg0MQ` — an Instagram DM

## Why this matters

The type prefix lets the API dispatch correctly without a database lookup:

- `POST /interactions/{iid}/reply` → checks prefix: if `socapi_cmt_`, calls `ReplyToComment`; if `socapi_rev_`, calls `ReplyToReview`
- `POST /interactions/{iid}/moderate` → only valid for `socapi_cmt_` IDs; returns 400 for others
- `GET /interactions/{iid}/replies` → only valid for `socapi_cmt_` IDs

If you pass a `socapi_rev_` ID to an endpoint that only accepts comments, you'll get a `400` error.

## Stability

IDs are deterministic — the same platform interaction always produces the same SocialAPI ID. You can safely store IDs in your database and compare them across calls.

## Using IDs

Fetch comments:

```bash
curl "https://api.social-api.ai/v1/accounts/{id}/comments" \
  -H "Authorization: Bearer $SOCAPI_KEY"
```

Reply using the returned `id`:

```bash
curl -X POST \
  "https://api.social-api.ai/v1/accounts/{id}/interactions/socapi_cmt_aW5zdGFncmFtOjE3ODQxNDA1/reply" \
  -H "Authorization: Bearer $SOCAPI_KEY" \
  -H "Content-Type: application/json" \
  -d '{"text": "Thank you!"}'
```

Moderate using the same `id`:

```bash
curl -X POST \
  "https://api.social-api.ai/v1/accounts/{id}/interactions/socapi_cmt_aW5zdGFncmFtOjE3ODQxNDA1/moderate" \
  -H "Authorization: Bearer $SOCAPI_KEY" \
  -H "Content-Type: application/json" \
  -d '{"action": "hide"}'
```
```

**Step 2: Commit**

```bash
cd "docs"
git add guides/interaction-ids.mdx
git commit -m "feat: write Interaction IDs guide"
```

---

### Task 10: Write guides/errors.mdx

**Files:**
- Create: `docs/guides/errors.mdx`

**Step 1: Write content**

```mdx
---
title: Error Handling
description: Error response format and all error codes.
---

All errors return JSON with a consistent shape:

```json
{
  "error": "human-readable message",
  "code": "machine_readable_code"
}
```

Use `code` for programmatic error handling; use `error` for logging and display.

## Error codes

| HTTP | Code | When it occurs |
|---|---|---|
| 400 | `missing_metadata` | A required field is missing in the request body or query |
| 400 | `unsupported_platform` | The `platform` value is not recognized |
| 401 | `unauthorized` | API key is missing, invalid, or revoked |
| 401 | `invalid_token` | The connected account's OAuth token is expired or revoked |
| 401 | `invalid_credentials` | The platform rejected the stored credentials |
| 403 | `unauthorized` | The OAuth state token belongs to a different API key |
| 404 | `account_not_found` | The account ID does not belong to your workspace |
| 404 | `not_found` | The requested resource does not exist |
| 409 | `account_already_linked` | This social account is already connected |
| 429 | `rate_limit_exceeded` | Your daily API call limit is exceeded |
| 429 | `platform_rate_limit` | The upstream platform's own rate limit was hit |
| 500 | — | Internal server error (contact support) |
| 501 | `not_supported` | This operation is not supported on this platform |

## Handling specific cases

### 401 invalid_token

The user's OAuth token expired. Your app should reconnect the account by re-running the [OAuth flow](/guides/oauth).

```python
if error["code"] == "invalid_token":
    # Trigger reconnect flow for this account_id
    redirect_to_reconnect(account_id)
```

### 429 rate_limit_exceeded

Back off and retry tomorrow, or upgrade your plan.

### 429 platform_rate_limit

The platform (not SocialAPI) is throttling. This does **not** count against your daily limit. Wait a few minutes and retry.

### 501 not_supported

The operation is not available on this platform. For example, Instagram does not have reviews — calling `GET /accounts/{id}/reviews` on an Instagram account returns 501. Check the [Connectors](/connectors/overview) section for each platform's supported operations.

## Example error handling

```typescript
const resp = await fetch(`https://api.social-api.ai/v1/accounts/${accountId}/comments`, {
  headers: { Authorization: `Bearer ${apiKey}` }
});

if (!resp.ok) {
  const err = await resp.json();
  switch (err.code) {
    case "invalid_token":
      await reconnectAccount(accountId);
      break;
    case "rate_limit_exceeded":
      throw new Error("Daily limit hit — retry tomorrow");
    case "platform_rate_limit":
      await sleep(60_000);
      return retry();
    case "not_supported":
      console.warn(`Platform does not support this operation: ${err.error}`);
      return null;
    default:
      throw new Error(`API error: ${err.error} (${err.code})`);
  }
}
```
```

**Step 2: Commit**

```bash
cd "docs"
git add guides/errors.mdx
git commit -m "feat: write Error Handling guide"
```

---

### Task 11: Write api-reference/introduction.mdx

**Files:**
- Modify: `docs/api-reference/introduction.mdx`

**Step 1: Write content**

```mdx
---
title: API Reference
description: All 20 public SocialAPI.AI endpoints.
---

## Base URL

```
https://api.social-api.ai/v1
```

## Authentication

All endpoints require a Bearer token:

```bash
Authorization: Bearer sk_live_your_key_here
```

See the [Authentication guide](/guides/authentication) for how to create and manage keys.

## Request format

- All request bodies must be JSON with `Content-Type: application/json`
- All timestamps are RFC3339 (e.g. `2026-02-15T14:30:00Z`)
- Paginated endpoints accept `since`, `limit` (1–100, default 50), and `cursor` query parameters

## Response format

All successful responses are JSON. All errors use:

```json
{
  "error": "human-readable message",
  "code": "machine_readable_code"
}
```

## Endpoints

Use the sidebar to browse all endpoints. Each endpoint includes an interactive **Try It** playground — click it to make live API calls from your browser.

<CardGroup cols={2}>
  <Card title="Accounts" icon="link" href="/api-reference/accounts/list-connected-accounts">
    Connect and list social accounts.
  </Card>
  <Card title="Comments" icon="message" href="/api-reference/comments/list-comments">
    Read, reply to, and fetch replies for comments.
  </Card>
  <Card title="DMs" icon="envelope" href="/api-reference/dms/list-dm-threads">
    Read and send direct messages.
  </Card>
  <Card title="Reviews" icon="star" href="/api-reference/reviews/list-reviews">
    Read and reply to reviews.
  </Card>
</CardGroup>
```

**Step 2: Commit**

```bash
cd "docs"
git add api-reference/introduction.mdx
git commit -m "feat: write API Reference introduction"
```

---

### Task 12: Write connectors/overview.mdx

**Files:**
- Create: `docs/connectors/overview.mdx`

**Step 1: Write content**

```mdx
---
title: Connectors Overview
description: Platform capabilities and feature matrix.
---

SocialAPI.AI uses a connector pattern — each platform implements the same interface. If a platform doesn't support a feature, the API returns `501` with `code: "not_supported"`. Your code doesn't need to branch per platform; just handle the 501.

## Feature matrix

| Platform | Auth | Comments | DMs | Reviews | Mentions | Private reply |
|---|---|---|---|---|---|---|
| Instagram | OAuth 2.0 | ✅ | ✅ | — | — | ✅ |
| Facebook | OAuth 2.0 | Soon | Soon | — | — | — |
| Google Reviews | OAuth 2.0 | — | — | Soon | — | — |
| TikTok | OAuth 2.0 | Soon | — | — | — | — |
| YouTube | OAuth 2.0 | Soon | — | — | — | — |
| X / Twitter | OAuth 2.0 | Soon | Soon | — | Soon | — |
| LinkedIn | OAuth 2.0 | Soon | — | — | Soon | — |
| Trustpilot | API Key | — | — | Soon | — | — |

**Legend:** ✅ Available · Soon = In development · — = Not supported by platform

## What "not supported" means

When a platform doesn't support a feature (e.g. Instagram has no reviews), calling that endpoint returns:

```json
{
  "error": "operation not supported for this platform",
  "code": "not_supported"
}
```

This is expected behavior, not a bug. Design your app to handle `501` gracefully.

## Auth types

| Type | How it works |
|---|---|
| `oauth2` | `POST /accounts/connect` returns an `auth_url` to redirect your user to. After authorization, call `POST /oauth/exchange` with the code. |
| `apikey` | Pass the platform API key in `metadata` in `POST /accounts/connect`. Returns account ID immediately. |

## Private replies

On Instagram, posting a reply with `"private": true` sends a DM to the commenter instead of a public reply. This is the platform's native "Send Private Reply" feature. The `private` field is silently ignored on platforms that don't support it.
```

**Step 2: Commit**

```bash
cd "docs"
git add connectors/overview.mdx
git commit -m "feat: write Connectors Overview page"
```

---

### Task 13: Write connectors/instagram.mdx

**Files:**
- Create: `docs/connectors/instagram.mdx`

**Step 1: Write content**

```mdx
---
title: Instagram
description: Connect and interact with Instagram accounts via the Meta Graph API.
---

<Badge>Available</Badge>

Instagram is the first fully supported connector. It uses the Meta Graph API for comments and DMs.

## Details

| Field | Value |
|---|---|
| Platform slug | `instagram` |
| Auth type | OAuth 2.0 (Meta) |
| API | Meta Graph API |

## Feature support

| Feature | Supported | Notes |
|---|---|---|
| Comments | ✅ | |
| Reply to comment | ✅ | |
| Private reply | ✅ | Sends a DM to the commenter |
| Comment replies (thread) | ✅ | |
| Moderate comment (hide/unhide/delete) | ✅ | |
| Toggle post comments | ✅ | |
| DMs | ✅ | |
| Send DM | ✅ | |
| Get DM thread by user | ✅ | |
| Reviews | — | Instagram has no review feature |
| Mentions | — | |

## Connecting

```bash
curl -X POST https://api.social-api.ai/v1/accounts/connect \
  -H "Authorization: Bearer $SOCAPI_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "platform": "instagram",
    "metadata": {
      "redirect_uri": "https://app.example.com/oauth/callback"
    }
  }'
```

Response:

```json
{
  "auth_url": "https://www.instagram.com/oauth/authorize?client_id=...&state=...",
  "state": "4a8f2c1e9b3d7f06a5c2e8b4d1f3a7e2"
}
```

Redirect your user to `auth_url`. After they authorize, Instagram redirects to your `redirect_uri` with `?code=...&state=...`. Then call:

```bash
curl -X POST https://api.social-api.ai/v1/oauth/exchange \
  -H "Authorization: Bearer $SOCAPI_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "platform": "instagram",
    "code": "AQDtbPB9X...",
    "metadata": {
      "state": "4a8f2c1e9b3d7f06a5c2e8b4d1f3a7e2",
      "redirect_uri": "https://app.example.com/oauth/callback"
    }
  }'
```

## Sample: List comments

```bash
curl "https://api.social-api.ai/v1/accounts/{id}/comments?limit=10" \
  -H "Authorization: Bearer $SOCAPI_KEY"
```

Sample response:

```json
{
  "data": [
    {
      "id": "socapi_cmt_aW5zdGFncmFtOjE3ODQxNDA1NzkzMTg3MjE4",
      "platform": "instagram",
      "type": "comment",
      "author": {
        "id": "17841405793187218",
        "name": "Jane Smith",
        "avatar_url": "https://example.com/avatar.jpg"
      },
      "content": {
        "text": "Love this product!",
        "media": []
      },
      "metadata": {
        "post_id": "17841405793100001"
      },
      "created_at": "2026-02-15T14:30:00Z",
      "account_id": "acc_01HZ9X3Q4R5M6N7P8V2K0W1J",
      "platform_id": "17841405793187218"
    }
  ],
  "count": 1
}
```

## Sample: List DMs

```bash
curl "https://api.social-api.ai/v1/accounts/{id}/dms?limit=10" \
  -H "Authorization: Bearer $SOCAPI_KEY"
```

Sample response:

```json
{
  "data": [
    {
      "id": "socapi_dm_aW5zdGFncmFtOnQxNzg0MTA1NzkzMTg3MjE4",
      "platform": "instagram",
      "type": "dm",
      "author": {
        "id": "17841405793187218",
        "name": "Jane Smith",
        "avatar_url": "https://example.com/avatar.jpg"
      },
      "content": {
        "text": "Hi, I have a question about my order",
        "media": []
      },
      "metadata": {
        "thread_id": "t_17841405793187218"
      },
      "created_at": "2026-02-15T15:00:00Z",
      "account_id": "acc_01HZ9X3Q4R5M6N7P8V2K0W1J",
      "platform_id": "t_17841405793187218"
    }
  ],
  "count": 1
}
```

## Notes

- **Private replies** — Replying to a comment with `"private": true` sends a DM to the commenter. This is Instagram's native "Send Private Reply" feature, not a SocialAPI workaround.
- **Token expiry** — Instagram access tokens can expire. If you receive `401` with `code: "invalid_token"`, reconnect the account using the OAuth flow.
- **Required permissions** — Your Meta App must have `instagram_manage_comments` and `instagram_manage_messages` permissions approved.
```

**Step 2: Commit**

```bash
cd "docs"
git add connectors/instagram.mdx
git commit -m "feat: write Instagram connector page"
```

---

### Task 14: Write remaining connector pages (coming soon)

**Files:**
- Create: `docs/connectors/facebook.mdx`
- Create: `docs/connectors/google-reviews.mdx`
- Create: `docs/connectors/tiktok.mdx`
- Create: `docs/connectors/twitter.mdx`
- Create: `docs/connectors/youtube.mdx`
- Create: `docs/connectors/linkedin.mdx`
- Create: `docs/connectors/trustpilot.mdx`

Each "coming soon" page follows this template. Fill in the platform-specific details (auth type, what features are planned):

**Template (use for each platform):**

```mdx
---
title: {Platform Name}
description: {Platform Name} connector for SocialAPI.AI.
---

<Badge>Coming soon</Badge>

{Platform Name} support is in active development.

## Planned features

| Feature | Planned |
|---|---|
| Comments | {✅ or —} |
| DMs | {✅ or —} |
| Reviews | {✅ or —} |
| Mentions | {✅ or —} |

## Auth type

{OAuth 2.0 / API Key / Credentials}

## Notify me

[Contact us](mailto:support@social-api.ai) to be notified when {Platform Name} support launches.
```

**Concrete content per platform:**

**facebook.mdx:**
- Badge: Coming soon
- Planned: Comments ✅, DMs ✅, Reviews —, Mentions —
- Auth: OAuth 2.0 (Meta, same app as Instagram)
- Note: Shares Meta Graph API authentication with Instagram

**google-reviews.mdx:**
- Badge: Coming soon
- Planned: Comments —, DMs —, Reviews ✅, Mentions —
- Auth: OAuth 2.0 (Google)

**tiktok.mdx:**
- Badge: Coming soon
- Planned: Comments ✅, DMs —, Reviews —, Mentions —
- Auth: OAuth 2.0 (TikTok)

**twitter.mdx:**
- Badge: Coming soon
- Planned: Comments ✅, DMs ✅, Reviews —, Mentions ✅
- Auth: OAuth 2.0 (X/Twitter v2)

**youtube.mdx:**
- Badge: Coming soon
- Planned: Comments ✅, DMs —, Reviews —, Mentions —
- Auth: OAuth 2.0 (Google)

**linkedin.mdx:**
- Badge: Coming soon
- Planned: Comments ✅, DMs —, Reviews —, Mentions ✅
- Auth: OAuth 2.0 (LinkedIn)

**trustpilot.mdx:**
- Badge: Coming soon
- Planned: Comments —, DMs —, Reviews ✅, Mentions —
- Auth: API Key

**Step 1: Create each file** with the template above, filled in per-platform.

**Step 2: Commit**

```bash
cd "docs"
git add connectors/
git commit -m "feat: write coming-soon connector pages for all 7 planned platforms"
```

---

### Task 15: Verify with Mintlify

**Step 1: Install Mintlify CLI (if not installed)**

```bash
npm i -g mintlify
```

**Step 2: Start local preview**

```bash
cd "docs"
mintlify dev
```

Open http://localhost:3000. Verify:
- [ ] 3 tabs visible: Guides, API Reference, Connectors
- [ ] Guides tab: Introduction, Quickstart, and 5 guide pages all render
- [ ] API Reference tab: All 20 endpoints auto-rendered from openapi.json
- [ ] Connectors tab: Overview + 8 platform pages (1 available, 7 coming soon)
- [ ] No broken navigation links

**Step 3: Check for broken links**

```bash
cd "docs"
mintlify broken-links
```

Fix any broken links that are reported.

**Step 4: Final commit**

```bash
cd "docs"
git add -A
git commit -m "docs: complete SocialAPI.AI documentation — all pages verified"
```

---

## Summary of files created/modified

| Action | File |
|---|---|
| Delete | `docs/essentials/` (directory) |
| Delete | `docs/ai-tools/` (directory) |
| Delete | `docs/development.mdx` |
| Delete | `docs/api-reference/endpoint/` (directory) |
| Delete | `docs/snippets/` (directory) |
| Modify | `docs/docs.json` |
| Modify | `docs/index.mdx` |
| Modify | `docs/quickstart.mdx` |
| Modify | `docs/api-reference/introduction.mdx` |
| Modify | `docs/api-reference/openapi.json` |
| Create | `docs/guides/authentication.mdx` |
| Create | `docs/guides/rate-limits.mdx` |
| Create | `docs/guides/oauth.mdx` |
| Create | `docs/guides/interaction-ids.mdx` |
| Create | `docs/guides/errors.mdx` |
| Create | `docs/connectors/overview.mdx` |
| Create | `docs/connectors/instagram.mdx` |
| Create | `docs/connectors/facebook.mdx` |
| Create | `docs/connectors/google-reviews.mdx` |
| Create | `docs/connectors/tiktok.mdx` |
| Create | `docs/connectors/twitter.mdx` |
| Create | `docs/connectors/youtube.mdx` |
| Create | `docs/connectors/linkedin.mdx` |
| Create | `docs/connectors/trustpilot.mdx` |
