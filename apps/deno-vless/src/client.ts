async function serveClient(req: Request, basePath: string) {
  const url = new URL(req.url);
  let targetUrl: string;
  let contentType: string;

  // If the path is exactly the basePath (userID), serve index.html
  if (url.pathname === `/${basePath}`) {
    targetUrl = `https://raw.githubusercontent.com/x1058811/edgetunnel/main/apps/cf-page-vless/index.html`;
    contentType = 'text/html; charset=utf-8';
  }
  // If the path starts with /assets/ or /src/ or is a direct file from the cf-page-vless app's public folder
  else if (url.pathname.startsWith('/assets/') || url.pathname.startsWith('/src/') || url.pathname === '/favicon.ico' || url.pathname === '/401.html') {
    targetUrl = `https://raw.githubusercontent.com/x1058811/edgetunnel/main/apps/cf-page-vless${url.pathname}`;
    if (url.pathname.endsWith('.js') || url.pathname.endsWith('.mjs') || url.pathname.endsWith('.ts') || url.pathname.endsWith('.tsx')) {
      contentType = 'application/javascript';
    } else if (url.pathname.endsWith('.css')) {
      contentType = 'text/css';
    } else if (url.pathname.endsWith('.html')) {
      contentType = 'text/html; charset=utf-8';
    } else if (url.pathname.endsWith('.ico')) {
      contentType = 'image/x-icon';
    } else {
      // Default to a generic binary type or infer from fetch response
      contentType = 'application/octet-stream';
    }
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

  console.log(`Fetching: ${targetUrl} with Content-Type: ${contentType}`);
  const resp = await fetch(targetUrl);
  const modifiedHeaders = new Headers(resp.headers);
  modifiedHeaders.delete('content-security-policy');
  modifiedHeaders.set('content-type', contentType); // Set the determined content type

  return new Response(
    resp.body,
    {
      status: resp.status,
      headers: modifiedHeaders
    }
  );
}

export { serveClient };
