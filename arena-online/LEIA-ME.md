# Arena Isométrica 1v1 — servidor online independente

Esta versão substitui a integração de salas do Claude por um servidor WebSocket próprio. O HTML e o servidor precisam ser publicados juntos. A conexão entre os jogadores é retransmitida pelo servidor, então os dois podem entrar usando o mesmo código de sala em navegadores diferentes.

## Executar localmente

1. Instale Node.js 18 ou superior.
2. Abra um terminal nesta pasta e execute `npm install`.
3. Execute `npm start`.
4. Abra `http://localhost:3000` em dois navegadores/dispositivos na mesma rede e escolha **Multiplayer online**.

Para jogadores em redes diferentes, publique esta pasta em um serviço que rode Node.js e ofereça HTTPS. O jogo usa automaticamente WSS quando aberto por HTTPS. Configure a plataforma para executar `npm start`; ela fornecerá a porta pela variável `PORT`.

## Observações

- Cada sala aceita até dois jogadores e é apagada quando ambos saem.
- O servidor retransmite presença e eventos de jogo; não usa Claude nem exige conta Claude.
- O servidor é uma base funcional para partidas casuais. Ele não implementa autenticação ou proteção contra trapaças.
