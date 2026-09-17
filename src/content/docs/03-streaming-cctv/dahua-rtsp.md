---
title: Streaming Dahua (RTSP-over-WebSocket & Sandbox)
description: Tunelamento binário RTSP-over-WebSocket, fila lock-free no backend Spring Boot e isolamento de escopo via iframe sandbox dinâmico.
---

A integração de vídeo ao vivo das câmeras **Dahua** no ecossistema utiliza o protocolo **RTSP encapsulado sobre WebSockets (RTSP-over-WebSocket)**, operando em conjunto com o proxy reverso do backend (`DahuaStreamProxyService` em `/api/ws/dahua-stream`).

Ao contrário de streams convencionais, o SDK proprietário da Dahua (`H5Player WEB SDK / PlayerControl.js`) requer interação simultânea com tags `<canvas>` e `<video>`, além de gerenciar internamente o desafio e resposta de autenticação criptográfica **Digest Authentication** com a câmera.

---

## 📊 Diagrama Interativo de Sequência (Archify)

O diagrama abaixo apresenta o fluxo temporal de negociação RTSP (OPTIONS, DESCRIBE, SETUP, PLAY) e o repasse binário dos pacotes RTP/H.264 através do proxy Spring Boot:

<div class="diagram-container">
  <div class="diagram-header">
    <div class="diagram-title">
      <span class="pulse-dot"></span>
      <span>Sequência Dahua RTSP-over-WebSocket (Archify Sequence)</span>
    </div>
    <div class="diagram-actions">
      <a href="/diagrams/dahua-stream-sequence.html" target="_blank" class="diagram-btn primary">
        ↗ Abrir em Tela Cheia (Nova Aba)
      </a>
      <button onclick="document.getElementById('frame-dah-seq').requestFullscreen()" class="diagram-btn">
        ⛶ Modo Fullscreen
      </button>
    </div>
  </div>
  <iframe id="frame-dah-seq" src="/diagrams/dahua-stream-sequence.html?embed=1" class="diagram-frame"></iframe>
</div>

---

## 🛠️ As 5 Descobertas e Soluções de Engenharia Reversa

A integração do SDK da Dahua dentro de uma SPA Angular moderna revelou cinco vulnerabilidades críticas de arquitetura que exigiram engenharia profunda:

### 1. O Bug do Webpack Scope Bleed (Isolamento via Iframe Sandbox)

* **O Problema:** O script minificado `PlayerControl.js` utiliza variáveis globais minificadas (`j`, `L`, `I`) no escopo do objeto `window` para guardar os dados da sessão RTSP e os nonces da autenticação Digest. Ao abrir mais de uma câmera na tela ou ao fechar e reabrir um modal de monitoramento, as variáveis colidiam no contexto global do Angular, gerando falhas `401 Unauthorized` repetidas ou congelamento da imagem.
* **A Solução:** Criamos um contexto de execução isolado através de um **`<iframe>` dinâmico em sandbox**:
  ```typescript
  // baseweb/src/app/core/camera/adapters/dahua-stream.adapter.ts
  private createSandboxIframe(): HTMLIFrameElement {
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = 'about:blank';
    document.body.appendChild(iframe);

    // Carrega o SDK estritamente no escopo daquele contentWindow
    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    const script = doc!.createElement('script');
    script.src = '/assets/dahua-h5player/PlayerControl.js';
    doc!.head.appendChild(script);
    return iframe;
  }
  ```
  Ao destruir o componente (`ngOnDestroy`), a simples remoção da tag `<iframe>` do DOM limpa 100% da memória alocada, Web Workers, instâncias WebAssembly e WebSockets sem nenhum risco de vazamento (*Memory Leak*) no Angular.

---

### 2. Fila Lock-Free no Backend durante `buildAsync`

* **O Problema:** No protocolo Dahua, o navegador envia o primeiro comando RTSP (`OPTIONS * RTSP/1.0`) imediatamente após o término do handshake WebSocket. No entanto, no backend Spring Boot, a abertura do socket TCP cliente com a câmera física é uma operação assíncrona (`buildAsync`). Caso a mensagem do navegador chegue enquanto o socket com a câmera ainda está abrindo, os pacotes eram perdidos, travando o handshake.
* **A Solução:** O `DahuaStreamProxyService` implementa uma **fila lock-free (Michael & Scott Queue)** no manipulador de sessão:
  ```java
  // Enfileira comandos iniciais do cliente enquanto o socket da câmera abre
  if (!cameraSocket.isOpen()) {
      pendingClientMessagesQueue.offer(message);
      return;
  }
  // Assim que o socket abre, drena a fila na ordem FIFO estrita
  drainPendingQueueToCamera();
  ```

---

### 3. Exigência Estrita de Formato Binário (`BinaryMessage`)

* **O Problema:** Durante a negociação RTSP, mensagens de controle são compostas por texto ASCII/UTF-8 (como `DESCRIBE`, `SETUP`, `200 OK`). O Spring Boot originalmente transmitia essas respostas como `TextMessage`. Porém, o `PlayerControl.js` define internamente `websocket.binaryType = "arraybuffer"` e sua rotina de recebimento executa estritamente `new Uint8Array(event.data)`. Mensagens do tipo `TextMessage` eram silenciosamente descartadas pelo navegador, deixando o player em tela preta indefinidamente.
* **A Solução:** O backend transmite **100% dos pacotes como `BinaryMessage`**, convertendo strings RTSP em arrays de bytes UTF-8 antes do envio para o navegador.

---

### 4. Bug da Ordem de Inicialização do SDK (`this.events = null`)

* **O Problema:** A documentação oficial da Dahua instrui chamar `player.init(...)` e posteriormente registrar os ouvintes de eventos com `player.on(...)`. A análise do código minificado revelou que o método `.init()` consome o mapa interno de eventos e o redefine como `null`. Invocar `.on()` após `.init()` causa o erro fatal:
  ```
  TypeError: Cannot set properties of null (setting 'WorkerReady')
  ```
* **A Solução:** Declarar **obrigatoriamente** todos os listeners de eventos antes de chamar `.init()`:
  ```javascript
  const player = new iframeWin.PlayerControl(options);
  // 1. Registre todos os eventos PRIMEIRO
  player.on('WorkerReady', () => { ... });
  player.on('DecodeStart', () => { ... });
  // 2. Chame o init por ÚLTIMO
  player.init(canvasElement, videoElement);
  ```

---

### 5. Patch de Caminhos Hardcoded nos Web Workers e WASM

* **O Problema:** O código fonte original da Dahua continha caminhos hardcoded como `new Worker("/module/videoWorker.worker.js")` e `importScripts("/module/libDecodeSDK.js")`. No ecossistema Angular, os arquivos estáticos ficam em `/assets/dahua-h5player/`. As requisições para `/module/...` batiam no servidor web e retornavam a página HTML da SPA, gerando falhas `SyntaxError: Unexpected token '<'`.
* **A Solução:** Patching obrigatório nos assets via script de substituição:
  ```bash
  sed -i 's|/module/|/assets/dahua-h5player/|g' baseweb/public/assets/dahua-h5player/*.js
  ```

---

## 🎛️ Motor Duplo: MSE vs. WebAssembly Canvas

O player opera com mecanismo de **Fallback Inteligente (Dual Engine)**:

| Engine | Tipo de Tag | Cenário de Uso | Vantagem |
|---|---|---|---|
| **MSE (Media Source Extensions)** | `<video>` | Codec H.264 padrão com suporte de aceleração de hardware do navegador. | Consumo ultrabaixo de CPU e renderização fluida nativa a 60 FPS. |
| **WASM (WebAssembly)** | `<canvas>` | Codec H.265 (HEVC) ou navegadores sem decodificador nativo de hardware. | Decodificação em software via C++ compilado, garantindo reprodução universal. |

---

## 🛡️ Proibição de Conexões Diretas ao IP da Câmera

> [!IMPORTANT]
> É **expressamente proibido** conectar o navegador diretamente ao IP privado da câmera (`ws://172.16.x.x:80/rtspoverwebsocket`).
>
> 1. Viola a diretiva **Private Network Access (PNA)** do Google Chrome, bloqueando a requisição por tentar acessar a rede interna a partir de domínio público.
> 2. Causa alertas bloqueantes de **Mixed Content** quando a aplicação está sob HTTPS.
> 3. Impede visualização remota fora da rede física da escola.
>
> **Toda conexão Dahua DEVE utilizar o Ticket Pattern e transitar pelo túnel reverso do backend em `/api/ws/dahua-stream?ticket=...`.**
