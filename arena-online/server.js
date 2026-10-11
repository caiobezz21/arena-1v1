'use strict';

const http = require('node:http');
const path = require('node:path');
const crypto = require('node:crypto');
const fs = require('node:fs');
const { WebSocketServer, WebSocket } = require('ws');

const ROOT = __dirname;
const PORT = Number(process.env.PORT) || 3000;
const ROOMS = new Map();
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

const server = http.createServer((req, res) => {
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  } catch {
    res.writeHead(400).end('Bad request');
    return;
  }

  const requested = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
  const file = path.resolve(ROOT, requested);
  if (file !== ROOT && !file.startsWith(ROOT + path.sep)) {
    res.writeHead(403).end('Forbidden');
    return;
  }

  fs.stat(file, (err, stat) => {
    if (err || !stat.isFile()) {
      res.writeHead(404).end('Not found');
      return;
    }
    res.writeHead(200, {
      'Content-Type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream',
      'X-Content-Type-Options': 'nosniff',
      'Cache-Control': path.extname(file) === '.html' ? 'no-cache' : 'public, max-age=3600',
    });
    fs.createReadStream(file).pipe(res);
  });
});

const wss = new WebSocketServer({ noServer: true, maxPayload: 64 * 1024 });

server.on('upgrade', (req, socket, head) => {
  let pathname;
  try {
    pathname = new URL(req.url, 'http://localhost').pathname;
  } catch {
    socket.destroy();
    return;
  }
  if (pathname !== '/ws') {
    socket.destroy();
    return;
  }

  const origin = req.headers.origin;
  const host = req.headers.host;
  if (origin && host) {
    try {
      if (new URL(origin).host !== host) {
        socket.write('HTTP/1.1 403 Forbidden\r\n\r\n');
        socket.destroy();
        return;
      }
    } catch {
      socket.destroy();
      return;
    }
  }
  wss.handleUpgrade(req, socket, head, ws => wss.emit('connection', ws, req));
});

function send(ws, message) {
  if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(message));
}

function roomPeers(room) {
  return [...room.values()].map(peer => ({ id: peer.id, presence: peer.presence }));
}

function publishPeers(roomName) {
  const room = ROOMS.get(roomName);
  if (!room) return;
  const message = { type: 'peers', peers: roomPeers(room) };
  for (const peer of room.values()) send(peer.ws, message);
}

function removePeer(ws) {
  const roomName = ws.roomName;
  if (!roomName) return;
  const room = ROOMS.get(roomName);
  if (!room) return;
  room.delete(ws);
  ws.roomName = null;
  if (room.size === 0) ROOMS.delete(roomName);
  else publishPeers(roomName);
}

wss.on('connection', ws => {
  ws.id = crypto.randomUUID();
  ws.roomName = null;

  ws.on('message', raw => {
    let message;
    try {
      message = JSON.parse(raw.toString());
    } catch {
      send(ws, { type: 'error', message: 'Mensagem inválida.' });
      return;
    }
    if (!message || typeof message !== 'object' || Array.isArray(message)) return;

    if (message.type === 'join') {
      if (ws.roomName) removePeer(ws);
      const roomName = String(message.room || '').toLowerCase();
      if (!/^arena-[a-z0-9]{1,12}$/.test(roomName)) {
        send(ws, { type: 'error', message: 'Código de sala inválido.' });
        return;
      }
      let room = ROOMS.get(roomName);
      if (!room) {
        room = new Map();
        ROOMS.set(roomName, room);
      }
      if (room.size >= 2) {
        if (room.size === 0) ROOMS.delete(roomName);
        send(ws, { type: 'error', message: 'A sala já está cheia.' });
        return;
      }
      ws.roomName = roomName;
      room.set(ws, { id: ws.id, ws, presence: null });
      send(ws, { type: 'joined', id: ws.id });
      publishPeers(roomName);
      return;
    }

    if (message.type === 'presence') {
      const room = ws.roomName && ROOMS.get(ws.roomName);
      const peer = room && room.get(ws);
      if (!peer || !message.presence || typeof message.presence !== 'object' || Array.isArray(message.presence)) return;
      peer.presence = message.presence;
      publishPeers(ws.roomName);
      return;
    }

    if (message.type === 'leave') removePeer(ws);
  });

  ws.on('close', () => removePeer(ws));
  ws.on('error', () => removePeer(ws));
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Arena Isométrica disponível na porta ${PORT}`);
});
