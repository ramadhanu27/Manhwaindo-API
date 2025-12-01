/**
 * Cloudflare Worker - Otakudesu Episode Proxy
 *
 * This worker acts as a proxy to fetch Otakudesu episode pages
 * and bypass IP blocking that affects Vercel.
 *
 * Deploy this to Cloudflare Workers and use it as a proxy endpoint.
 */

addEventListener("fetch", (event) => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  // CORS headers
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  // Handle CORS preflight
  if (request.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get target URL from query parameter
    const url = new URL(request.url);
    const targetUrl = url.searchParams.get("url");

    if (!targetUrl) {
      return new Response(
        JSON.stringify({
          error: "Missing url parameter",
          usage: "https://your-worker.workers.dev/?url=https://otakudesu.best/episode/...",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        }
      );
    }

    // Validate URL is from Otakudesu
    if (!targetUrl.includes("otakudesu.best")) {
      return new Response(
        JSON.stringify({
          error: "Invalid URL - must be from otakudesu.best",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        }
      );
    }

    // Fetch from Otakudesu with browser-like headers
    const response = await fetch(targetUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9,id;q=0.8",
        "Accept-Encoding": "gzip, deflate, br",
        Referer: "https://otakudesu.best/",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "same-origin",
      },
    });

    // Get HTML content
    const html = await response.text();

    // Return HTML with CORS headers
    return new Response(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, max-age=1800", // Cache for 30 minutes
        ...corsHeaders,
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error.message,
        stack: error.stack,
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  }
}
