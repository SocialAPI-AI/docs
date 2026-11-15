// Run: node --test scripts/indexnow-submit.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { changedUrls, pageUrl, parseSitemap } from "./indexnow-submit.mjs";

const O = "https://docs.social-api.ai";

test("pageUrl maps mdx paths to docs URLs", () => {
  assert.equal(pageUrl("index.mdx"), O);
  assert.equal(pageUrl("guides/webhooks.mdx"), `${O}/guides/webhooks`);
  assert.equal(pageUrl("guides/index.mdx"), `${O}/guides`);
  assert.equal(pageUrl("docs.json"), null);
});

test("parseSitemap reads Mintlify's sitemap and normalises the root", () => {
  const xml = `<urlset>
  <url>
    <loc>${O}/</loc>
    <lastmod>2026-11-15T16:06:49.440Z</lastmod>
  </url>
  <url>
    <loc>${O}/quickstart</loc>
    <lastmod>2026-11-15T16:06:50.000Z</lastmod>
  </url></urlset>`;
  assert.deepEqual([...parseSitemap(xml).keys()], [O, `${O}/quickstart`]);
});

test("changedUrls keeps added, modified and renamed published pages only", () => {
  const sitemap = new Map([
    [O, ""],
    [`${O}/quickstart`, ""],
    [`${O}/guides/new`, ""],
    [`${O}/api-reference/posts/create`, ""],
  ]);
  const diff = [
    "M\tindex.mdx",
    "A\tquickstart.mdx",
    "R087\tguides/old.mdx\tguides/new.mdx",
    "D\tguides/gone.mdx",
    "M\tdrafts/wip.mdx",
    "M\tdocs.json",
  ].join("\n");
  assert.deepEqual(changedUrls(diff, sitemap), [O, `${O}/quickstart`, `${O}/guides/new`]);
});

test("an openapi.json change selects every api-reference page", () => {
  const sitemap = new Map([
    [`${O}/quickstart`, ""],
    [`${O}/api-reference/posts/create`, ""],
    [`${O}/api-reference/posts/list`, ""],
  ]);
  assert.deepEqual(changedUrls("M\tapi-reference/openapi.json", sitemap), [
    `${O}/api-reference/posts/create`,
    `${O}/api-reference/posts/list`,
  ]);
});
