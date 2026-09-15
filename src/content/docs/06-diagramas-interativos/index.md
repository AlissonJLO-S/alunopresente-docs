---
title: Suíte Oficial de Diagramas Interativos (Archify)
description: Visualizador interativo em alta resolução dos diagramas arquiteturais compilados
tableOfContents: false
---

<div class="diagram-toolbar-tabs">
  <a href="/06-diagramas-interativos/01-topologia-monorepo/" class="diag-tab active">
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
  <a href="/06-diagramas-interativos/05-streaming-cftv/" class="diag-tab">
    📹 5. Streaming CFTV
  </a>
</div>

<div class="diagram-container">
  <div class="diagram-header">
    <div class="diagram-title">
      <span class="pulse-dot"></span>
      <span>Topologia Geral Não-Linear (14 Módulos, Netty :50000, RabbitMQ & Multi-Schema)</span>
    </div>
    <div class="diagram-actions">
      <a href="/diagrams/monorepo-architecture.html" target="_blank" class="diagram-btn primary">
        ↗ Abrir em Tela Cheia (Nova Aba)
      </a>
      <button onclick="document.getElementById('main-diagram-frame').requestFullscreen()" class="diagram-btn">
        ⛶ Modo Fullscreen
      </button>
    </div>
  </div>
  <iframe id="main-diagram-frame" src="/diagrams/monorepo-architecture.html" class="diagram-frame"></iframe>
</div>

<div class="diagram-tips">
  💡 <strong>Controles do Archify:</strong> Arraste com o botão esquerdo para mover (Pan), use a roda do mouse ou <code>+</code> / <code>-</code> para Zoom, e pressione <code>0</code> para resetar o enquadramento.
</div>
