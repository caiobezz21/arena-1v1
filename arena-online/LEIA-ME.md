# Arena Isométrica 1v1

Jogo de arena 1v1 com modo contra CPU e salas multiplayer via WebSocket.

## Arquivos

- `index.html`: estrutura da página e telas do jogo.
- `styles.css`: estilos e layout responsivo.
- `game.js`: lógica da partida, personagens, arenas, controles e cliente multiplayer.
- `server.js`: servidor HTTP e salas WebSocket.
- `atirador.jpg`, `condutor.jpg`, `guerreiro.jpg`, `necromante.jpg`, `samurai.jpg`, `miragem.jpg`, `lobisomem.jpg` e `gorgrath.jpg`: retratos dos campeões, na mesma pasta que os arquivos do jogo.

## Executar localmente

Requer Node.js 18 ou superior.

```sh
npm install
npm start
```

Abra `http://localhost:3000`. Para multiplayer, os dois jogadores precisam acessar o mesmo endereço público e usar o mesmo código de sala. Em hospedagem como Render, configure o diretório raiz como `arena-online`, o comando de build como `npm install` e o comando de início como `npm start`.


## Multiplayer local

No menu, escolha **Multiplayer local** e confirme um campeão. Conecte dois controles antes ou durante a partida: o primeiro controla o Jogador 1 e o segundo controla o Jogador 2. Cada controle fica associado a apenas um personagem. Analógico esquerdo move, analógico direito mira, A ataca e LB/RB/LT/RT ativam as habilidades. O segundo campeão é escolhido aleatoriamente entre os demais.


Na seleção local, cada jogador escolhe seu próprio campeão e confirma a escolha. Durante a partida, os HUDs de habilidades e recargas dos dois jogadores aparecem separados na parte inferior da tela.

Nas partidas contra a CPU e multiplayer local, pause com Esc, Start no controle ou pelo botão na tela. O menu permite continuar ou voltar ao menu principal. No modo local, círculos ciano e dourado identificam os personagens dos jogadores 1 e 2.
