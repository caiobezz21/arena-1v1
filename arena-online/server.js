const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { randomUUID } = require('node:crypto');
const { WebSocketServer, WebSocket } = require('ws');

const port = Number(process.env.PORT || 3000);
const rootDir = __dirname;
const rooms = new Map();
const allowedImages = new Set([
  'necromante.jpg',
  'atirador.jpg',
  'guerreiro.jpg',
  'samurai.jpg',
]);

const server = http.createServer((req, res) => {
  const pathname = new URL(req.url, 'http://localhost').pathname;

  // Serve only the four expected image files. This avoids path traversal and
  // avoids the malformed regular expression that prevented Render from booting.
  const imageName = pathname.startsWith('/assets/')
    ? pathname.slice('/assets/'.length)
    : '';

  if (allowedImages.has(imageName)) {
    const imagePath = path.join(rootDir, 'assets', imageName);
    fs.stat(imagePath, (statError, stat) => {
      if (statError || !stat.isFile()) {
        res.writeHead(404);
        res.end('Not found');
        return;
      }
      res.writeHead(200, {
        'Content-Type': 'image/jpeg',
        'Content-Length': stat.size,
        'Cache-Control': 'public, max-age=3600',
      });
      fs.createReadStream(imagePath).pipe(res);
    });
    return;
  }

  if (pathname === '/' || pathname === '/index.html') {
    const htmlPath = path.join(rootDir, 'index.html');
    fs.createReadStream(htmlPath)
      .on('error', () => {
        if (!res.headersSent) res.writeHead(500);
        res.end('Could not load index.html');
      })
      .on('open', () => {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      })
      .pipe(res);
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('Not found');
});

const wss = new WebSocketServer({ server, path: '/ws', maxPayload: 65536 });

function publishPeers(roomName) {
  const room = rooms.get(roomName);
  if (!room) return;
  const peers = [...room].map((client) => ({
    id: client.id,
    presence: client.presence || null,
  }));
  const payload = JSON.stringify({ type: 'peers', peers });
  for (const client of room) {
    if (client.readyState === WebSocket.OPEN) client.send(payload);
  }
}

function removeFromRoom(client) {
  if (!client.room) return;
  const roomName = client.room;
  const room = rooms.get(roomName);
  if (room) {
    room.delete(client);
    if (room.size === 0) rooms.delete(roomName);
    else publishPeers(roomName);
  }
  client.room = null;
  client.presence = null;
}

wss.on('connection', (client) => {
  client.id = randomUUID();
  client.room = null;
  client.presence = null;

  client.on('message', (raw) => {
    let message;
    try {
      message = JSON.parse(raw.toString());
    } catch {
      return;
    }
    if (!message || typeof message !== 'object') return;

    if (message.type === 'join') {
      const roomName = String(message.room || '')
        .replace(/[^a-z0-9-]/gi, '')
        .slice(0, 40);
      if (!roomName) {
        client.send(JSON.stringify({ type: 'error', message: 'Invalid room name' }));
        return;
      }

      removeFromRoom(client);
      let room = rooms.get(roomName);
      if (!room) {
        room = new Set();
        rooms.set(roomName, room);
      }
      if (room.size >= 2) {
        client.send(JSON.stringify({ type: 'error', message: 'Room is full' }));
        if (room.size === 0) rooms.delete(roomName);
        return;
      }

      client.room = roomName;
      room.add(client);
      client.send(JSON.stringify({ type: 'joined', id: client.id }));
      publishPeers(roomName);
      return;
    }

    if (message.type === 'presence' && client.room) {
      client.presence = message.presence && typeof message.presence === 'object'
        ? message.presence
        : null;
      publishPeers(client.room);
      return;
    }

    if (message.type === 'leave') removeFromRoom(client);
  });

  client.on('close', () => removeFromRoom(client));
  client.on('error', () => removeFromRoom(client));
});

server.listen(port, '0.0.0.0', () => {
  console.log(`Arena online listening on port ${port}`);
});
