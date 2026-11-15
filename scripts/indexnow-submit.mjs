// Submits the docs pages changed by a push to IndexNow, once Mintlify has
// deployed them. Port of landing-page/scripts/indexnow-submit.mjs.
//
// Mintlify stamps every sitemap <lastmod> with the deploy time, so a sitemap
// diff would resubmit all pages on every deploy. The changed pages come from
// git instead; the sitemap only tells us the deploy is live and which pages
// Mintlify actually publishes.
//
// Usage: node scripts/indexnow-submit.mjs <base-ref> <head-ref> [--dry-run]

import { execFileSync } from "node:child_process";
import { appendFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

const HOST = "docs.social-api.ai";
const ORIGIN = `https://${HOST}`;
const ENDPOINT = "https://api.indexnow.org/indexnow";
// Same key as the landing page; IndexNow only needs it served on each host.
const KEY = "da05966f77cb431ba58254feae63d3af";
const TIMEOUT_MS = 30_000;
const DEPLOY_WAIT_MS = 15 * 60_000;
const POLL_MS = 30_000;

const LOC_RE = /<loc>\s*([^<]+?)\s*<\/loc>\s*<lastmod>\s*([^<]+?)\s*<\/lastmod>/g;

/**
 * Maps a repo path to its docs URL, or null when it is not a page.
 * @param {string} path e.g. "guides/webhooks.mdx"
 * @returns {string | null}
 */
export function pageUrl(path) {
  if (!path.endsWith(".mdx")) return null;
  const slug = path.slice(0, -".mdx".length).replace(/(^|\/)index$/, "");
  return slug ? `${ORIGIN}/${slug}` : ORIGIN;
}

/**
 * URLs to submit for one push. Deleted files are skipped: IndexNow has no
 * delete semantic. An openapi.json change touches every generated endpoint
 * page, so it selects the whole api-reference section of the sitemap.
 * @param {string} nameStatus output of `git diff --name-status`
 * @param {Map<string, string>} sitemap live loc -> lastmod
 * @returns {string[]}
 */
export function changedUrls(nameStatus, sitemap) {
  const urls = new Set();
  for (const line of nameStatus.split("\n")) {
    const parts = line.split("\t");
    if (!parts[0] || parts[0].startsWith("D")) continue;
    const path = parts[parts.length - 1]; // renames list old then new
    if (path === "api-reference/openapi.json") {
      for (const loc of sitemap.keys()) if (loc.startsWith(`${ORIGIN}/api-reference/`)) urls.add(loc);
    }
    const url = pageUrl(path);
    if (url) urls.add(url);
  }
  // Drafts, ignored files and snippets are not in the sitemap: not published.
  return [...urls].filter((url) => sitemap.has(url));
}

/**
 * @param {string} xml
 * @returns {Map<string, string>} loc -> lastmod
 */
export function parseSitemap(xml) {
  const entries = new Map();
  for (const [, loc, lastmod] of xml.matchAll(LOC_RE)) entries.set(loc.replace(/\/$/, "") || ORIGIN, lastmod);
  return entries;
}

/** @param {string} message */
function warn(message) {
  console.error(`[indexnow] ${message}`);
  summary(`⚠️ IndexNow: ${message}`);
}

/** @param {string} markdown */
function summary(markdown) {
  const file = process.env.GITHUB_STEP_SUMMARY;
  if (!file) return;
  try {
    appendFileSync(file, `${markdown}\n`);
  } catch {
    // The summary is a nicety; losing it must not affect the exit code.
  }
}

/** @param {string} url */
async function get(url) {
  const response = await fetch(url, {
    headers: { "Cache-Control": "no-cache" },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  return { ok: response.ok, status: response.status, text: await response.text() };
}

/**
 * Polls the live sitemap until Mintlify has deployed `head`: every lastmod is
 * a deploy timestamp, so the newest one passing the commit time means live.
 * @param {string} commitIso commit time of head
 * @returns {Promise<Map<string, string> | null>}
 */
async function waitForDeploy(commitIso) {
  const commitMs = Date.parse(commitIso);
  const deadline = Date.now() + DEPLOY_WAIT_MS;
  while (Date.now() < deadline) {
    try {
      const { ok, text } = await get(`${ORIGIN}/sitemap.xml`);
      if (ok) {
        const sitemap = parseSitemap(text);
        const newest = Math.max(...[...sitemap.values()].map(Date.parse));
        if (newest >= commitMs) return sitemap;
      }
    } catch {
      // Transient; poll again.
    }
    await new Promise((resolve) => setTimeout(resolve, POLL_MS));
  }
  warn(`deploy of ${commitIso} not seen in sitemap after ${DEPLOY_WAIT_MS / 60_000} min; nothing submitted`);
  return null;
}

/** @param {string[]} urls */
async function submit(urls) {
  const keyLocation = `${ORIGIN}/${KEY}.txt`;
  const key = await get(keyLocation).catch(() => null);
  if (!key?.ok || key.text.trim() !== KEY) {
    warn(`key file not served at ${keyLocation} (HTTP ${key?.status ?? "error"}); nothing submitted`);
    return;
  }

  let response;
  try {
    response = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({ host: HOST, key: KEY, keyLocation, urlList: urls }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (error) {
    warn(`submission failed: ${error instanceof Error ? error.message : String(error)}`);
    return;
  }

  // 202 means accepted with key validation pending — still a success.
  if (response.status !== 200 && response.status !== 202) {
    warn(`endpoint returned HTTP ${response.status}: ${(await response.text().catch(() => "")).slice(0, 500)}`);
    return;
  }
  console.log(`[indexnow] submitted ${urls.length} URL(s) — HTTP ${response.status}`);
  summary([`### IndexNow`, ``, `Submitted ${urls.length} URL(s) — HTTP ${response.status}`, ``, ...urls.map((u) => `- ${u}`)].join("\n"));
}

/** @param {string[]} argv */
async function main(argv) {
  const dryRun = argv.includes("--dry-run");
  const [base, head] = argv.filter((arg) => !arg.startsWith("--"));
  if (!base || !head) {
    warn("usage: node scripts/indexnow-submit.mjs <base-ref> <head-ref> [--dry-run]");
    return;
  }

  const git = (...args) => execFileSync("git", args, { encoding: "utf8" });
  const nameStatus = git("diff", "--name-status", "-M", base, head);
  if (!/\.mdx$|openapi\.json$/m.test(nameStatus)) {
    console.log("[indexnow] no page changes in this push");
    return;
  }

  // Dry runs check the current live sitemap instead of waiting for a deploy.
  const sitemap = dryRun
    ? parseSitemap((await get(`${ORIGIN}/sitemap.xml`)).text)
    : await waitForDeploy(git("show", "-s", "--format=%cI", head).trim());
  if (sitemap === null) return;

  const urls = changedUrls(nameStatus, sitemap);
  if (urls.length === 0) {
    console.log("[indexnow] changed files are not published pages; nothing submitted");
    return;
  }
  if (dryRun) {
    console.log(`[indexnow] dry run — would submit ${urls.length} URL(s):\n${urls.join("\n")}`);
    return;
  }
  await submit(urls);
}

// Run only when invoked directly, so importing this module in tests is inert.
const entry = process.argv[1];
if (entry && import.meta.url === pathToFileURL(entry).href) {
  await main(process.argv.slice(2));
}
