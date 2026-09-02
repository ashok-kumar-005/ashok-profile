// Vercel serverless function — logs one page_views row per call.
// Reads the real visitor IP/country from Vercel's edge-injected headers
// (never trusts anything the client sends), then inserts into Supabase via
// a plain REST call. Zero dependencies, so no package.json is needed for
// this to run on Vercel.
//
// Requires two Vercel project environment variables:
//   SUPABASE_URL         — your Supabase project URL
//   SUPABASE_ANON_KEY     — the anon public key (insert-only via RLS)

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).end();
    return;
  }

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

  res.status(204).end();
};
