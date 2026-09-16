---
title: Streaming Hikvision (ISAPI & WASM)
description: Arquitetura de streaming ao vivo de câmeras Hikvision via WebSocket, Ticket Pattern descartável, interceptação ES6 Proxy e decodificação C++ WebAssembly.
---

A reprodução de vídeo ao vivo das câmeras Hikvision diretamente no navegador (Angular) sem transcodificação intermediária em servidores de mídia pesados (como Wowza ou MediaMTX) exige uma arquitetura de alta performance baseada em **WebSockets e WebAssembly**.

Como as câmeras Hikvision empacotam o fluxo de vídeo em um encapsulamento proprietário (**MPEG-PS contendo NALUs H.264/H.265**) e não em MP4 fragmentado padrão (fMP4), a tag `<video>` do HTML5 não consegue decodificar o stream nativamente. Por esse motivo, o sistema utiliza a biblioteca **`hikvision-h5player`**, cujo motor em C++ compilado em **WebAssembly (WASM)** decodifica os frames e renderiza diretamente em um elemento `<canvas>`.

---

## 📊 Diagrama Interativo de Sequência (Archify)

O diagrama abaixo ilustra o aperto de mão completo, a negociação de SDP e o fluxo contínuo de pacotes binários entre o Frontend Angular, o Proxy Spring Boot e a Câmera Hikvision:

<div class="diagram-container">
  <div class="diagram-header">
    <div class="diagram-title">
      <span class="pulse-dot"></span>
      <span>Sequência Hikvision ISAPI / WebSocket (Archify Sequence)</span>
    </div>
    <div class="diagram-actions">
      <a href="/diagrams/hikvision-stream-sequence.html" target="_blank" class="diagram-btn primary">
        ↗ Abrir em Tela Cheia (Nova Aba)
      </a>
      <button onclick="document.getElementById('frame-hik-seq').requestFullscreen()" class="diagram-btn">
        ⛶ Modo Fullscreen
      </button>
    </div>
  </div>
  <iframe id="frame-hik-seq" src="/diagrams/hikvision-stream-sequence.html" class="diagram-frame"></iframe>
</div>

---

## ⚙️ Os 4 Desafios de Engenharia Reversa e Soluções

O SDK oficial (`h5player.min.js`) foi projetado para ambientes controlados e apresenta graves limitações quando executado dentro de SPAs modernas protegidas por HTTPS e proxies reversos. Para viabilizar a solução, desenvolvemos quatro contramedidas arquiteturais:

### 1. O Padrão de Ticket Descartável (Zero Credenciais na URL)

* **Problema:** Abrir conexões WebSocket passando tokens JWT ou senhas em *query strings* (`?token=...` ou `?auth=...`) expõe credenciais em logs de acesso do Nginx, histórico do navegador e proxies intermediários.
* **Solução:** O frontend primeiro faz um `POST /api/dispositivos/{id}/solicitar-ticket-streaming`. O backend gera um ticket criptográfico de uso único (UUID) com validade curta (ex: 60 segundos), armazenado em cache. O frontend conecta enviando apenas o ticket:
  ```
  ws://host:8025/api/ws/hikvision-stream?ticket=f47ac10b-58cc-4372-a567-0e02b2c3d479
  ```
  O handshake interceptor do Spring Boot consome e invalida o ticket no primeiro aperto de mão, estabelecendo a ponte com o IP da câmera.

---

### 2. Interceptador de Protocolo via ES6 Proxy (`hikvision-protocol.interceptor.ts`)

* **Problema:** O SDK Hikvision tenta internamente sobrescrever a URL do WebSocket para `/media?sessionID=...` e tenta conectar diretamente na porta padrão `7681`, violando as políticas de *Private Network Access* e quebrando rotas de proxy.
* **Solução:** Em vez de editar destrutivamente o arquivo vendor minificado, criamos um interceptor não-invasivo baseado em **ES6 `Proxy`**:
  ```typescript
  // baseweb/src/app/core/camera/hikvision-protocol.interceptor.ts
  export function initHikvisionProtocolInterceptor(): void {
    activeSessionsCount++;
    if ((window as any)._wsIntercepted) return;

    OriginalWebSocketClass = window.WebSocket;
    const wsProxyHandler: ProxyHandler<typeof WebSocket> = {
      construct(target, args: [string, ...any[]]) {
        let [url, protocols] = args;
        if (isHikvisionCameraTarget(url)) {
          // Redireciona para o túnel do backend com ticket preservado
          url = resolveInternalProxyUrl(url);
        }
        return Reflect.construct(target, [url, protocols]);
      }
    };
    window.WebSocket = new Proxy(OriginalWebSocketClass, wsProxyHandler);
  }
  ```

> [!CAUTION]
> **Proibição em `main.ts`:** O interceptor **NUNCA** deve ser inicializado no bootstrap da SPA. Ele possui contagem de referências ativas (`activeSessionsCount`) e deve ser acionado exclusivamente no construtor do `HikvisionStreamAdapter` e liberado no `disconnect()`, restaurando o `window.WebSocket` nativo.

---

### 3. Normalização de `statusCode: 1` para `0` e Preservação de SDP

* **Problema:** Em firmwares legados Hikvision, a resposta do comando de playback (`realplay`) retorna com payload XML contendo `<statusCode>1</statusCode>` (que na especificação antiga significava *Sucesso*). No entanto, versões mais recentes do decodificador C++ WASM consideram qualquer código diferente de `0` ou `200` como falha fatal, abortando o streaming.
* **Solução:** O serviço reverso no Spring Boot (`HikvisionStreamProxyService`) intercepta a mensagem de resposta, reescreve `<statusCode>1</statusCode>` para `<statusCode>0</statusCode>` no ar e preserva integralmente o bloco **SDP (Session Description Protocol)**. O SDP contém os parâmetros cruciais de SPS/PPS (Sequence Parameter Set / Picture Parameter Set), sem os quais o decodificador entra em tela preta silenciosa mesmo com os pacotes H.264 chegando.

---

### 4. Detecção de Renderização via `firstFrameDisplay`

* **Problema:** Em transmissões ao vivo sobre WebSockets, a Promise retornada pelo método `player.JS_Play(...)` não resolve de forma determinística, pois ela aguarda o fechamento do arquivo ou um sinal EOF (End of File) que nunca ocorre em live streams.
* **Solução:** O adaptador registra um callback de controle de janela escutando o evento nativo `firstFrameDisplay`:
  ```typescript
  this.player.JS_SetWindowControlCallback(0, {
    onControl: (type: string, data: any) => {
      if (type === 'firstFrameDisplay') {
        this.statusSubject.next(StreamStatus.OK);
        this.isLoadingSubject.next(false); // Remove cortina de carregamento
      }
    }
  });
  ```

---

## 🏗️ Padrão Arquitetural no Frontend Angular

O consumo do stream segue o **Adapter Pattern** orquestrado por `CameraStreamSessionService`:

```
Componente de Tela (Ex: VisualizarStreamDispositivoComponent)
                     │
                     ▼
       CameraStreamSessionService.createSession(dispositivo)
                     │
                     ▼
          HikvisionStreamAdapter
          ├── Inicia WebSocket Interceptor (refCount++)
          ├── Instancia motor H5Player WASM
          ├── Conecta em /api/ws/hikvision-stream?ticket=UUID
          ├── Escuta firstFrameDisplay no Canvas #playerContainer
          └── No ngOnDestroy: session.disconnect() ➔ releaseInterceptor()
```

### Regras de Ouro:
1. **Componentes de Tela NUNCA instanciam o SDK diretamente:** O componente de UI apenas fornece a `div` container (`#playerContainer`) e escuta o observable `status$`.
2. **Localização Canônica:** O player reside exclusivamente em `src/app/sistema/base/dispositivo/visualizar-stream-dispositivo/`, nunca aninhado em outros módulos de negócio.
3. **Passive Event Listeners:** O H5Player registra listeners de zoom (`mousewheel`). O wrapper de eventos assegura `{ passive: true }` para não bloquear a thread de composição de rolagem do navegador.
