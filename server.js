const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const DATA_DIR = path.join(ROOT, 'data');
const TELEMETRY_FILE = path.join(DATA_DIR, 'telemetry.json');
const CONFIG_FILE = path.join(DATA_DIR, 'site-config.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.zip': 'application/zip',
  '.bat': 'text/plain; charset=utf-8',
  '.mobileconfig': 'application/x-apple-aspen-config'
};

// 60 seconds without heartbeat => Offline (gives plenty of buffer for tab switches)
const ONLINE_TIMEOUT_MS = 60000;

function readJson(filePath, fallback) {
  try {
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }
  } catch {}
  return fallback;
}

function writeJson(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch {}
}

function getClientIp(req, bodyIp) {
  if (bodyIp && bodyIp !== 'unknown' && bodyIp !== '127.0.0.1') return bodyIp;
  const fwd = req.headers['x-forwarded-for'];
  if (fwd) return String(fwd).split(',')[0].trim();
  const raw = req.socket.remoteAddress || '127.0.0.1';
  return raw === '::1' ? '127.0.0.1' : raw.replace(/^::ffff:/, '');
}

function parseBody(req) {
  return new Promise((resolve) => {
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
      if (data.length > 1e6) req.destroy();
    });
    req.on('end', () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch {
        resolve({});
      }
    });
  });
}

function sendJson(res, status, obj) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(JSON.stringify(obj));
}

function seedClientsIfEmpty() {
  const existing = readJson(TELEMETRY_FILE, null);
  if (Array.isArray(existing) && existing.length > 0) return existing;

  const now = Date.now();
  const seeds = [
    {
      clientId: 'seed-192-168-1-15',
      ip: '192.168.1.15',
      utility: 'AdShield Pro — Chặn Ads Nâng Cao',
      device: 'Brave Browser / Windows 11',
      firstSeen: now - 42 * 60 * 1000,
      lastSeen: now - 8 * 60 * 1000,
      downloads: 1
    },
    {
      clientId: 'seed-192-168-1-28',
      ip: '192.168.1.28',
      utility: 'CuteTube — YouTube Dark Pastel',
      device: 'Google Chrome / Windows 11',
      firstSeen: now - 20 * 60 * 1000,
      lastSeen: now - 15 * 60 * 1000,
      downloads: 1
    }
  ];
  writeJson(TELEMETRY_FILE, seeds);
  return seeds;
}

seedClientsIfEmpty();

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end();
    return;
  }

  let rawPath = req.url.split('?')[0];
  try {
    rawPath = decodeURIComponent(rawPath);
  } catch {
    rawPath = decodeURI(rawPath);
  }
  const reqPath = rawPath;

  // API: Heartbeat (Accept both GET and POST)
  if (reqPath === '/api/heartbeat') {
    let body = {};
    if (req.method === 'POST') {
      body = await parseBody(req);
    } else {
      try {
        const q = new URL(req.url, 'http://127.0.0.1:8080').searchParams;
        body = {
          utility: q.get('utility') || q.get('name') || 'Đang duyệt web',
          device: q.get('device') || 'Chrome / Windows',
          ip: q.get('ip')
        };
      } catch {
        body = {};
      }
    }

    const clients = readJson(TELEMETRY_FILE, []);
    const ip = getClientIp(req, body.ip);
    const clientId = body.clientId || `${ip}-${body.device || 'browser'}`;
    const now = Date.now();

    let entry = clients.find((c) => c.clientId === clientId || c.ip === ip);
    if (!entry && ip === '127.0.0.1') {
      entry = clients.find((c) => c.ip === '104.28.217.54' || c.ip === '127.0.0.1');
    }

    if (!entry) {
      entry = {
        clientId,
        ip,
        utility: body.utility || 'Đang sử dụng trình duyệt',
        device: body.device || 'Chrome / Windows',
        firstSeen: now,
        lastSeen: now,
        downloads: body.isDownload ? 1 : 0
      };
      clients.unshift(entry);
    } else {
      entry.clientId = clientId;
      if (entry.ip !== '104.28.217.54' || ip !== '127.0.0.1') {
        entry.ip = ip;
      }
      entry.lastSeen = now;
      if (body.utility) entry.utility = body.utility;
      if (body.device) entry.device = body.device;
      if (body.isDownload) entry.downloads = (entry.downloads || 0) + 1;
    }

    writeJson(TELEMETRY_FILE, clients.slice(0, 100));
    sendJson(res, 200, { ok: true, ip, status: 'online' });
    return;
  }

  // API: Get Clients with Live Status
  if (reqPath === '/api/admin/clients' && req.method === 'GET') {
    const clients = readJson(TELEMETRY_FILE, []);
    const now = Date.now();
    const enriched = clients.map((c) => {
      const diffMs = Math.max(0, now - (c.lastSeen || now));
      const isOnline = diffMs <= ONLINE_TIMEOUT_MS;
      return {
        ...c,
        isOnline,
        offlineSeconds: isOnline ? 0 : Math.floor(diffMs / 1000),
        activeSeconds: Math.max(1, Math.floor(((c.lastSeen || now) - (c.firstSeen || now)) / 1000))
      };
    });

    const onlineCount = enriched.filter((c) => c.isOnline).length;
    const offlineCount = enriched.length - onlineCount;
    sendJson(res, 200, {
      onlineCount,
      offlineCount,
      totalCount: enriched.length,
      clients: enriched
    });
    return;
  }

  // API: Clear Clients
  if (reqPath === '/api/admin/clients' && req.method === 'DELETE') {
    writeJson(TELEMETRY_FILE, []);
    sendJson(res, 200, { ok: true });
    return;
  }

  // API: Site Config
  if (reqPath === '/api/admin/config' && req.method === 'GET') {
    const cfg = readJson(CONFIG_FILE, {});
    sendJson(res, 200, cfg);
    return;
  }

  if (reqPath === '/api/admin/config' && req.method === 'POST') {
    const body = await parseBody(req);
    const current = readJson(CONFIG_FILE, {});
    const merged = { ...current, ...body };
    writeJson(CONFIG_FILE, merged);
    sendJson(res, 200, { ok: true, config: merged });
    return;
  }

  // Static File Serving (Hardened with path traversal containment)
  const resolvedRoot = path.resolve(ROOT);
  let filePath = path.resolve(ROOT, reqPath === '/' ? 'index.html' : (reqPath.startsWith('/') ? reqPath.slice(1) : reqPath));

  if (!path.resolve(filePath).startsWith(resolvedRoot) ||
      (path.resolve(filePath) !== resolvedRoot && !path.resolve(filePath).startsWith(resolvedRoot + path.sep))) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('403 Forbidden');
    return;
  }

  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
  }

  if (!path.resolve(filePath).startsWith(resolvedRoot) ||
      (path.resolve(filePath) !== resolvedRoot && !path.resolve(filePath).startsWith(resolvedRoot + path.sep))) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('403 Forbidden');
    return;
  }

  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not Found');
    return;
  }

  const ext = path.extname(filePath).toLowerCase();
  res.writeHead(200, {
    'Content-Type': MIME[ext] || 'application/octet-stream',
    'Access-Control-Allow-Origin': '*'
  });
  fs.createReadStream(filePath).pipe(res);
});

server.listen(8080, '127.0.0.1', () => {
  console.log('Portal + Admin Server running at http://127.0.0.1:8080');
});
