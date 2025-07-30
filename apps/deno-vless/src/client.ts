import { serveDir } from 'https://deno.land/std@0.170.0/http/file_server.ts';

async function serveClient(req: Request, basePath: string) {
  const url = new URL(req.url);

  // If the path is exactly the basePath (userID), serve index.html
  if (url.pathname === `/${basePath}`) {
    const resp = await serveDir(req, {
      fsRoot: `${Deno.cwd()}/dist/apps/cf-page-vless`,
      index: 'index.html',
    });
    resp.headers.set('cache-control', 'public, max-age=2592000');
    return resp;
  }
  // If the path starts with /assets/ or /src/ or is a direct file from the cf-page-vless app's public folder
  else if (url.pathname.startsWith('/assets/') || url.pathname.startsWith('/src/') || url.pathname === '/favicon.ico' || url.pathname === '/401.html') {
    const resp = await serveDir(req, {
      fsRoot: `${Deno.cwd()}/dist/apps/cf-page-vless`,
    });
    resp.headers.set('cache-control', 'public, max-age=2592000');
    return resp;
  }
  // Handle basic auth redirect
  else {
    const basicAuth = req.headers.get('Authorization') || '';
    const authString = basicAuth.split(' ')?.[1] || '';
    if (atob(authString).includes(basePath)) {
      console.log('302');
      return new Response(``, {
        status: 302,
        headers: {
          'content-type': 'text/html; charset=utf-8',
          Location: `./${basePath}`,
        },
      });
    } else {
      return new Response(``, {
        status: 401,
        headers: {
          'content-type': 'text/html; charset=utf-8',
          'WWW-Authenticate': 'Basic',
        },
      });
    }
  }
}

export { serveClient };
