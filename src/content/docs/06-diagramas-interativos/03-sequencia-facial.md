---
title: Linha do Tempo e Sequência Facial (Sequence)
description: Sequência temporal de eventos entre Câmera, Netty, RabbitMQ, Redis e Agendador
tableOfContents: false
---

<div class="diagram-toolbar-tabs">
  <a href="/06-diagramas-interativos/01-topologia-monorepo/" class="diag-tab">
    🏛️ 1. Topologia Monorepo
  </a>
  <a href="/06-diagramas-interativos/02-pipeline-presenca-dataflow/" class="diag-tab">
    🎯 2. Pipeline Presença (Dataflow)
  </a>
  <a href="/06-diagramas-interativos/03-sequencia-facial/" class="diag-tab active">
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
      <span>Sequência Temporal Fim-a-Fim (Hardware até a Grade Curricular)</span>
    </div>
    <div class="diagram-actions">
      <a href="/diagrams/presence-facial-sequence.html" target="_blank" class="diagram-btn primary">
        ↗ Abrir em Tela Cheia (Nova Aba)
      </a>
      <button onclick="document.getElementById('frame-seq').requestFullscreen()" class="diagram-btn">
        ⛶ Modo Fullscreen
      </button>
    </div>
  </div>
  <iframe id="frame-seq" src="/diagrams/presence-facial-sequence.html?embed=1" class="diagram-frame"></iframe>
</div>

<div class="diagram-tips">
  💡 <strong>Controles Interativos:</strong> Arraste para mover (Pan), use a roda do mouse ou <code>+</code> / <code>-</code> para Zoom. Pressione <code>0</code> para enquadramento 100%.
</div>

### 📌 Destaques da Sequência Temporal

- **Fase 1: Reconhecimento Local na Câmera (&lt; 200ms)**
- **Fase 2: Recepção TCP Netty e Despacho Assíncrono AMQP**
- **Fase 3: Janela Deslizante de Deduplicação em Redis (5 min)**
- **Fase 4: Disparo Imediato de Push Notification (Firebase FCM)**
- **Fase 5: Agendador de 10 min em educacao-api (`RealizarPresencaComDadosEventoTratadoService`)**
