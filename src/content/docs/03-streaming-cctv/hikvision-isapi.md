---
title: Streaming Hikvision (ISAPI & WASM)
description: Soluções de engenharia reversa para o SDK H5Player e decodificador WebAssembly
---

## 📹 Arquitetura Hikvision WebSockets

Para visualização ao vivo no navegador sem servidores intermediários de re-encodificação:

1. **Ticket Pattern Descartável:** O frontend solicita um token temporário via `POST /api/dispositivos/{id}/solicitar-ticket-streaming` e conecta em `ws://.../api/ws/hikvision-stream?ticket=UUID`.
2. **Interceptor ES6 Proxy:** O SDK Hikvision sobrescrevia a rota WebSocket para `/media?sessionID=...`. O interceptor com `Proxy` restaura a URL original registrada.
3. **Correção do Crash StatusCode 1:** Em firmwares antigos, a câmera responde `statusCode: 1` em vez de `0`. O proxy reescreve no ar para `0`, preservando 100% dos parâmetros SDP essenciais para a inicialização do decodificador C++ WebAssembly.
4. **Detecção de Renderização (`firstFrameDisplay`):** A Promise de play não resolve confiavelmente em streaming ao vivo. O callback `firstFrameDisplay` do H5Player é registrado para remover a cortina de carregamento assim que o primeiro frame for pintado no Canvas.
