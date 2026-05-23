import { createServer } from 'node:http';
import http from 'node:http';
import https from 'node:https';
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { handleSiteSaasRequest } from './site-saas-server.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const distDir = path.resolve(process.env.STATIC_DIR || path.join(rootDir, 'dist'));
const port = Number(process.env.PORT || 8080);
const subrouterBase = process.env.SUBROUTER_API_BASE || 'http://localhost:3000';
const subrouterSiteHost = String(process.env.SUBROUTER_SITE_HOST || '').trim();

const hopByHopHeaders = new Set([
  'connection',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailer',
  'transfer-encoding',
  'upgrade',
]);

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.map': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
};

function sendJson(res, status, payload) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(payload));
}

function sendText(res, status, text) {
  res.writeHead(status, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end(text);
}

function filteredHeaders(headers) {
  const next = {};
  for (const [key, value] of Object.entries(headers)) {
    if (value == null || hopByHopHeaders.has(key.toLowerCase())) continue;
    next[key] = value;
  }
  return next;
}

function proxyPath(baseUrl, reqUrl, reqHost) {
  const incoming = new URL(reqUrl, `http://${reqHost || 'localhost'}`);
  const basePath = baseUrl.pathname.replace(/\/$/, '');
  return `${basePath}${incoming.pathname}${incoming.search}`;
}

function formatProxyError(error, baseUrl) {
  const parts = [
    error?.code,
    error?.message,
    error?.syscall,
    error?.address,
    error?.port,
  ].filter(Boolean);
  const detail = parts.join(' ');
  const target = baseUrl ? `${baseUrl.protocol}//${baseUrl.host}` : subrouterBase;
  return detail || error?.name || String(error) || `unknown network error while connecting to ${target}`;
}

function proxySubRouter(req, res) {
  let baseUrl;
  try {
    baseUrl = new URL(subrouterBase);
  } catch {
    return sendJson(res, 500, {
      success: false,
      message: 'SUBROUTER_API_BASE is not a valid URL',
    });
  }

  const publicHost = req.headers.host || baseUrl.host;
  const upstreamHost = subrouterSiteHost || publicHost;
  const headers = filteredHeaders(req.headers);
  delete headers.host;
  Object.assign(headers, {
    Host: upstreamHost,
    'X-Forwarded-Host': upstreamHost,
    'X-SASSAI-Public-Host': publicHost,
    'X-Forwarded-Proto': req.headers['x-forwarded-proto'] || 'https',
    'X-Forwarded-For': [req.headers['x-forwarded-for'], req.socket.remoteAddress].filter(Boolean).join(', '),
  });

  const transport = baseUrl.protocol === 'https:' ? https : http;
  const upstreamReq = transport.request(
    {
      protocol: baseUrl.protocol,
      hostname: baseUrl.hostname,
      port: baseUrl.port || undefined,
      method: req.method,
      path: proxyPath(baseUrl, req.url, publicHost),
      headers,
    },
    (upstreamRes) => {
      res.writeHead(upstreamRes.statusCode || 502, filteredHeaders(upstreamRes.headers));
      upstreamRes.pipe(res);
    },
  );

  upstreamReq.on('error', (error) => {
    const detail = formatProxyError(error, baseUrl);
    console.error('[subrouter-proxy] request failed', {
      upstream: `${baseUrl.protocol}//${baseUrl.host}`,
      upstreamHost,
      publicHost,
      method: req.method,
      path: req.url,
      code: error?.code,
      message: error?.message,
      syscall: error?.syscall,
      address: error?.address,
      port: error?.port,
    });
    if (res.headersSent) {
      res.destroy(error);
      return;
    }
    sendJson(res, 502, {
      success: false,
      message: `SubRouter proxy failed: ${detail}`,
    });
  });

  req.pipe(upstreamReq);
}

async function getStaticFilePath(urlPath) {
  let pathname;
  try {
    pathname = decodeURIComponent(urlPath);
  } catch {
    throw Object.assign(new Error('Invalid path'), { status: 400 });
  }
  if (pathname.includes('\0')) throw Object.assign(new Error('Invalid path'), { status: 400 });
  if (pathname.endsWith('/')) pathname += 'index.html';

  const candidate = path.resolve(distDir, `.${pathname}`);
  if (candidate !== distDir && !candidate.startsWith(`${distDir}${path.sep}`)) {
    throw Object.assign(new Error('Forbidden'), { status: 403 });
  }

  try {
    const info = await stat(candidate);
    if (info.isFile()) return { filePath: candidate, originalPath: pathname };
  } catch {}

  return { filePath: path.join(distDir, 'index.html'), originalPath: '/index.html' };
}

async function serveStatic(req, res, url) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return sendJson(res, 405, { success: false, message: 'Method not allowed' });
  }

  try {
    const { filePath, originalPath } = await getStaticFilePath(url.pathname);
    await stat(filePath);
    const ext = path.extname(filePath).toLowerCase();
    const headers = {
      'Content-Type': mimeTypes[ext] || 'application/octet-stream',
      'Cache-Control': originalPath.startsWith('/assets/')
        ? 'public, max-age=31536000, immutable'
        : 'no-cache',
    };
    res.writeHead(200, headers);
    if (req.method === 'HEAD') return res.end();
    return createReadStream(filePath).pipe(res);
  } catch (error) {
    return sendJson(res, error.status || 500, {
      success: false,
      message: error.status ? error.message : 'Frontend build not found. Run npm run build first.',
    });
  }
}

createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

  if (url.pathname === '/health') {
    return sendText(res, 200, 'ok');
  }

  if (url.pathname.startsWith('/api/site/')) {
    return handleSiteSaasRequest(req, res);
  }

  if (url.pathname.startsWith('/api/')) {
    return proxySubRouter(req, res);
  }

  return serveStatic(req, res, url);
}).listen(port, '0.0.0.0', () => {
  console.log(`SASSAI single-service app listening on http://0.0.0.0:${port}`);
  console.log(`Static dir: ${distDir}`);
  console.log(`SubRouter upstream: ${subrouterBase}`);
  console.log(`SubRouter site host: ${subrouterSiteHost || '(public request host)'}`);
});
