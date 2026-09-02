// Vercel serverless function — page-view "pixel" beacon.
// Deliberately shaped like an image response (Content-Type: image/gif) so
// the request app.js fires shows up under DevTools' "Img" filter next to
// real screenshots, instead of standing out under "Fetch/XHR" as an obvious
// tracking call. Reads the real visitor IP/country from Vercel's
// edge-injected headers (never trusts anything the client sends), then
// inserts into Supabase via a plain REST call. Zero dependencies, so no
// package.json is needed for this to run on Vercel.
//
// Requires two Vercel project environment variables:
//   SUPABASE_URL         — your Supabase project URL
//   SUPABASE_ANON_KEY     — the anon public key (insert-only via RLS)

var PIXEL = Buffer.from(
  "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBTAA7",
  "base64"
);

module.exports = async function handler(req, res) {
  var country = req.headers["x-vercel-ip-country"] || null;
  var forwarded = req.headers["x-forwarded-for"];
  var ip = (forwarded ? forwarded.split(",")[0].trim() : null) ||
           (req.socket && req.socket.remoteAddress) || null;

  try {
    await fetch(process.env.SUPABASE_URL + "/rest/v1/page_views", {
      method: "POST",
      headers: {
        apikey: process.env.SUPABASE_ANON_KEY,
        Authorization: "Bearer " + process.env.SUPABASE_ANON_KEY,
        "Content-Type": "application/json",
        Prefer: "return=minimal"
      },
      body: JSON.stringify({ ip: ip, country: country })
    });
  } catch (e) {
    // Fire-and-forget: never surface a failure back to the client.
  }

  res.setHeader("Content-Type", "image/gif");
  res.setHeader("Cache-Control", "no-store");
  res.status(200).end(PIXEL);
};
