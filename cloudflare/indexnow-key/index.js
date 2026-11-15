// Must match KEY in scripts/indexnow-submit.mjs.
const KEY = "da05966f77cb431ba58254feae63d3af";

export default {
  fetch() {
    return new Response(KEY, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
  },
};
