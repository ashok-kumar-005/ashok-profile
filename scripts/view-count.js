#!/usr/bin/env node
// Prints total page_views count, plus last-24h/7d/30d breakdowns.
// Zero dependencies (Node 18+ for native fetch) — no package.json needed.
//
// Usage:
//   node scripts/view-count.js
//
// Requires a .env file (gitignored, not committed) in the repo root:
//   SUPABASE_URL=https://YOUR-PROJECT.supabase.co
//   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

var fs = require("fs");
var path = require("path");

function loadEnv(file) {
  var full = path.resolve(__dirname, "..", file);
  if (!fs.existsSync(full)) return;
  var lines = fs.readFileSync(full, "utf8").split("\n");
  lines.forEach(function (line) {
    var trimmed = line.trim();
    if (!trimmed || trimmed.indexOf("#") === 0) return;
    var eq = trimmed.indexOf("=");
    if (eq === -1) return;
    var key = trimmed.slice(0, eq).trim();
    var value = trimmed.slice(eq + 1).trim();
    if (!(key in process.env)) process.env[key] = value;
  });
}

loadEnv(".env");

var SUPABASE_URL = process.env.SUPABASE_URL;
var SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error(
    "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.\n" +
    "Create a .env file in the repo root with:\n\n" +
    "  SUPABASE_URL=https://YOUR-PROJECT.supabase.co\n" +
    "  SUPABASE_SERVICE_ROLE_KEY=your-service-role-key\n"
  );
  process.exit(1);
}

// HEAD-style count via Prefer: count=exact — reads the total straight out
// of the Content-Range response header, no row bodies fetched.
function countSince(sinceISO) {
  var url = SUPABASE_URL + "/rest/v1/page_views?select=id&limit=1";
  if (sinceISO) url += "&viewed_at=gte." + encodeURIComponent(sinceISO);

  return fetch(url, {
    headers: {
      apikey: SERVICE_KEY,
      Authorization: "Bearer " + SERVICE_KEY,
      Prefer: "count=exact"
    }
  }).then(function (res) {
    if (!res.ok) {
      throw new Error("Supabase request failed: " + res.status + " " + res.statusText);
    }
    var range = res.headers.get("content-range") || "";
    var total = range.split("/")[1];
    return total === undefined ? 0 : parseInt(total, 10);
  });
}

function isoSinceMs(ms) {
  return new Date(Date.now() - ms).toISOString();
}

Promise.all([
  countSince(null),
  countSince(isoSinceMs(24 * 60 * 60 * 1000)),
  countSince(isoSinceMs(7 * 24 * 60 * 60 * 1000)),
  countSince(isoSinceMs(30 * 24 * 60 * 60 * 1000))
])
  .then(function (results) {
    var total = results[0], day = results[1], week = results[2], month = results[3];
    console.log("Total views:     " + total);
    console.log("Last 24h:        " + day);
    console.log("Last 7 days:     " + week);
    console.log("Last 30 days:    " + month);
  })
  .catch(function (err) {
    console.error("Failed to fetch view counts:", err.message);
    process.exit(1);
  });
