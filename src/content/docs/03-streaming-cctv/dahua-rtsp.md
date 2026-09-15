---
title: Streaming Dahua (RTSP-over-WebSocket & Sandbox)
description: Tunelamento binário RTSP e isolamento de escopo via iframe sandbox dinâmico
---

## 📹 Arquitetura Dahua RTSP-over-WebSocket

1. **O Bug do Webpack Scope Bleed:** O arquivo `PlayerControl.js` utilizava variáveis globais minificadas (`j`, `L`, `I`) para armazenar nonces e credenciais Digest. Ao abrir mais de uma câmera, ocorriam colisões fatais.
   - **Solução:** Instanciação em `<iframe>` sandbox dinâmico com `contentWindow` limpo. Ao fechar o modal (`ngOnDestroy`), o iframe é removido do DOM liberando 100% da memória e WebSockets.
2. **Fila Lock-Free no Backend:** O Spring Boot enfileira o comando `OPTIONS` enviado pelo navegador enquanto o socket TCP com a câmera ainda está abrindo via `buildAsync`, drenando a fila assim que o aperto de mão for concluído.
3. **Formato Binário Obrigatório:** Todas as mensagens retornadas para o navegador devem ser enviadas como `BinaryMessage`, pois o decodificador Dahua descarta respostas em `TextMessage`.
