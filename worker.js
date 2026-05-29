/**
 * Cloudflare Worker — generic CORS proxy for the Headcorn manifest wallboard.
 *
 * Forwards a GET request to an arbitrary `?url=` target, passes the caller's
 * Authorization header through to the origin, handles the CORS preflight, and
 * returns the response with permissive CORS headers. This exists because the
 * GoSkydive API (dz.goskydive.com) sends no CORS headers of its own, so a
 * browser can't read it directly.
 *
 * Deploy:
 *   npx wrangler deploy worker.js --name headcorn-proxy --compatibility-date 2024-01-01
 *
 * Then paste this into the wallboard's Settings → Proxy field (keep the trailing
 * ?url= — the wallboard appends the URL-encoded target after it):
 *   https://headcorn-proxy.<your-subdomain>.workers.dev/?url=
 */

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, Content-Type',
  'Access-Control-Max-Age': '86400'
};

export default {
  async fetch(request) {
    // CORS preflight.
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    const target = new URL(request.url).searchParams.get('url');
    if (!target) {
      return new Response('Missing ?url= parameter', { status: 400, headers: CORS_HEADERS });
    }

    // Forward to the target, preserving the Authorization (Basic) header.
    const fwdHeaders = new Headers({ 'Accept': 'application/json' });
    const auth = request.headers.get('Authorization');
    if (auth) fwdHeaders.set('Authorization', auth);

    let originRes;
    try {
      originRes = await fetch(target, { method: 'GET', headers: fwdHeaders });
    } catch (err) {
      return new Response('Upstream fetch failed: ' + err.message, { status: 502, headers: CORS_HEADERS });
    }

    // Relay status + body, overlaying our CORS headers.
    const headers = new Headers(originRes.headers);
    for (const [key, value] of Object.entries(CORS_HEADERS)) headers.set(key, value);
    return new Response(originRes.body, {
      status: originRes.status,
      statusText: originRes.statusText,
      headers
    });
  }
};
