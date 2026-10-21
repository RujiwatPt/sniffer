export interface Env {
  OPENROUTER_API_KEY?: string;
  ASSETS: {
    fetch: (request: Request) => Promise<Response>;
  };
}

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // API Route: Secure OpenRouter Chat Completion Proxy
    if (url.pathname === '/api/openrouter/chat/completions' && request.method === 'POST') {
      try {
        const authHeader = request.headers.get('Authorization');
        // Extract client-provided token or fallback to server-side Worker secret
        let apiKey = env.OPENROUTER_API_KEY;
        if (authHeader && authHeader.startsWith('Bearer ')) {
          const userKey = authHeader.replace(/^Bearer\s+/i, '').trim();
          if (userKey) {
            apiKey = userKey;
          }
        }

        if (!apiKey) {
          return new Response(
            JSON.stringify({ error: 'No OpenRouter API key configured on server or in request' }),
            { status: 401, headers: { 'Content-Type': 'application/json' } }
          );
        }

        const body = await request.text();

        const openRouterResponse = await fetch(OPENROUTER_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
            'HTTP-Referer': request.headers.get('HTTP-Referer') || url.origin,
            'X-Title': 'Sniffer AI Roleplay Social Simulation',
          },
          body,
        });

        const data = await openRouterResponse.text();
        return new Response(data, {
          status: openRouterResponse.status,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : 'Internal Server Error';
        return new Response(JSON.stringify({ error: errorMsg }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    // CORS preflight
    if (request.method === 'OPTIONS' && url.pathname.startsWith('/api/')) {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      });
    }

    // Serve static assets and handle SPA routing
    return env.ASSETS.fetch(request);
  },
};
