# Arena Isométrica 1v1

Jogo de arena 1v1 com modo contra CPU e salas multiplayer via WebSocket.

## Arquivos

- `index.html`: estrutura da página e telas do jogo.
- `styles.css`: estilos e layout responsivo.
- `game.js`: lógica da partida, personagens, arenas, controles e cliente multiplayer.
- `server.js`: servidor HTTP e salas WebSocket.
- `atirador.jpg`, `guerreiro.jpg`, `necromante.jpg` e `samurai.jpg`: retratos dos campeões, na mesma pasta que os arquivos do jogo.

## Executar localmente

Requer Node.js 18 ou superior.

```sh
npm install
npm start
```

Abra `http://localhost:3000`. Para multiplayer, os dois jogadores precisam acessar o mesmo endereço público e usar o mesmo código de sala. Em hospedagem como Render, configure o diretório raiz como `arena-online`, o comando de build como `npm install` e o comando de início como `npm start`.
