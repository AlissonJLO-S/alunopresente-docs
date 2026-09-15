---
title: Pipeline de Presença & Edge AI (Dataflow)
description: Fluxo de dados desde o match 1:N no hardware até as tabelas do PostgreSQL
tableOfContents: false
---

<div class="diagram-toolbar-tabs">
  <a href="/06-diagramas-interativos/01-topologia-monorepo/" class="diag-tab">
    🏛️ 1. Topologia Monorepo
  </a>
  <a href="/06-diagramas-interativos/02-pipeline-presenca-dataflow/" class="diag-tab active">
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
      <span>Pipeline de Ingestão de Presença & Edge AI (Archify Dataflow)</span>
    </div>
    <div class="diagram-actions">
      <a href="/diagrams/presence-facial-pipeline.html" target="_blank" class="diagram-btn primary">
        ↗ Abrir em Tela Cheia (Nova Aba)
      </a>
      <button onclick="document.getElementById('frame-dataflow').requestFullscreen()" class="diagram-btn">
        ⛶ Modo Fullscreen
      </button>
    </div>
  </div>
  <iframe id="frame-dataflow" src="/diagrams/presence-facial-pipeline.html" class="diagram-frame"></iframe>
</div>

<div class="diagram-tips">
  💡 <strong>Controles Interativos:</strong> Arraste para mover (Pan), use a roda do mouse ou <code>+</code> / <code>-</code> para Zoom. Pressione <code>0</code> para enquadramento 100%.
</div>

### 📌 Destaques do Pipeline de Dados

1. **Edge AI na Câmera:** O reconhecimento facial ocorre localmente na NPU da câmera em &lt; 200ms.
2. **Netty Ingestion:** `base-api` consome o stream TCP :50000 e publica na exchange bruta `AP_HOM_EVENTO`.
3. **Sliding Window no Redis:** `base-service` descarta leituras repetidas dentro de 300s.
4. **Duplo Destino Tratado:**
   - Fila 01: PostgreSQL `COPY` em `base.tb_evento_tratado` (> 5.000 evt/s).
   - Fila 02: Push instantâneo aos pais via Firebase Cloud Messaging.
