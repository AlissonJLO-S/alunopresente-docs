---
title: Pipeline de Streaming CFTV em Tempo Real
description: Fluxo fim-a-fim da câmera IP até a GPU WebGL do navegador
tableOfContents: false
---

<div class="diagram-toolbar-tabs">
  <a href="/06-diagramas-interativos/01-topologia-monorepo/" class="diag-tab">
    🏛️ 1. Topologia Monorepo
  </a>
  <a href="/06-diagramas-interativos/02-pipeline-presenca-dataflow/" class="diag-tab">
    🎯 2. Pipeline Presença (Dataflow)
  </a>
  <a href="/06-diagramas-interativos/03-sequencia-facial/" class="diag-tab">
    ⏱️ 3. Sequência Facial
  </a>
  <a href="/06-diagramas-interativos/04-workflow-decisao/" class="diag-tab">
    🔀 4. Workflow de Decisão
  </a>
  <a href="/06-diagramas-interativos/05-streaming-cftv/" class="diag-tab active">
    📹 5. Streaming CFTV
  </a>
</div>

<div class="diagram-container">
  <div class="diagram-header">
    <div class="diagram-title">
      <span class="pulse-dot"></span>
      <span>Pipeline de Transmissão de Vídeo CFTV ao Vivo</span>
    </div>
    <div class="diagram-actions">
      <a href="/diagrams/camera-streaming-pipeline.html" target="_blank" class="diagram-btn primary">
        ↗ Abrir em Tela Cheia (Nova Aba)
      </a>
      <button onclick="document.getElementById('frame-stream').requestFullscreen()" class="diagram-btn">
        ⛶ Modo Fullscreen
      </button>
    </div>
  </div>
  <iframe id="frame-stream" src="/diagrams/camera-streaming-pipeline.html" class="diagram-frame"></iframe>
</div>

<div class="diagram-tips">
  💡 <strong>Controles Interativos:</strong> Arraste para mover (Pan), use a roda do mouse ou <code>+</code> / <code>-</code> para Zoom. Pressione <code>0</code> para enquadramento 100%.
</div>

### 📌 Destaques do Streaming ao Vivo

- **Transmissão Direta:** Latência &lt; 200ms sem necessidade de servidores de re-encodificação.
- **Java NIO Epoll:** Gestão assíncrona de WebSockets e backpressure no Tomcat.
- **Aceleração por Hardware:** MSE para H.264 e WebAssembly C++ com Canvas WebGL para H.265.
