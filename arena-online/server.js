const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { randomUUID } = require('node:crypto');
const { WebSocketServer, WebSocket } = require('ws');
const port = Number(process.env.PORT || 3000);
const htmlPath = path.join(__dirname, 'index.html');
const rooms = new Map();
const server = http.createServer((req, res) => {
  const pathname = new URL(req.url, 'http://localhost').pathname;
  const image = /^\\/assets\\/(necromante|atirador|guerreiro|samurai)\\.jpg$/.exec(pathname);
  if (image) {
    res.writeHead(200, { 'content-type': 'image/jpeg', 'cache-control': 'public, max-age=86400' });
    fs.createReadStream(path.join(__dirname, 'assets', image[1] + '.jpg')).pipe(res);
  } else if (pathname === '/' || pathname === '/index.html') {
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' });
    fs.createReadStream(htmlPath).pipe(res);
  } else { res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' }); res.end('Not found'); }
});
const wss = new WebSocketServer({ server, path: '/ws', maxPayload: 65536 });
function send(ws, data) { if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(data)); }
function publish(name) { const room=rooms.get(name); if(!room)return; const peers=[...room].map(([id,ws])=>({id,presence:ws.presence||null})); for(const ws of room.values())send(ws,{type:'peers',peers}); if(!room.size)rooms.delete(name); }
function remove(ws) { if(!ws.room)return; const name=ws.room,room=rooms.get(name); if(room)room.delete(ws.id); ws.room=null; publish(name); }
wss.on('connection',ws=>{ws.id=randomUUID();ws.room=null;ws.presence=null;ws.on('message',raw=>{let msg;try{msg=JSON.parse(raw.toString())}catch{return}
 if(msg.type==='join'){const name=String(msg.room||'').replace(/[^a-z0-9-]/gi,'').slice(0,40);if(!name)return send(ws,{type:'error',message:'Código de sala inválido'});if(ws.room)remove(ws);let room=rooms.get(name);if(!room)rooms.set(name,room=new Map());if(room.size>=2)return send(ws,{type:'error',message:'Sala cheia'});ws.room=name;room.set(ws.id,ws);send(ws,{type:'joined',id:ws.id});publish(name)}
 else if(msg.type==='presence'&&ws.room){ws.presence=msg.presence&&typeof msg.presence==='object'?msg.presence:null;publish(ws.room)}else if(msg.type==='leave')remove(ws)});ws.on('close',()=>remove(ws));ws.on('error',()=>remove(ws))});
server.listen(port,'0.0.0.0',()=>console.log(`Arena online ouvindo na porta ${port}`));

