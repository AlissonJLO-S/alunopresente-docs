---
title: Fluxo de Decisão de Presença Escolar (Workflow)
description: As 4 raias de decisão (Borda, Gateway, Estado Redis e Domínio Escolar)
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
  <a href="/06-diagramas-interativos/04-workflow-decisao/" class="diag-tab active">
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
      <span>Workflow de Decisão em 4 Raias Semânticas</span>
    </div>
    <div class="diagram-actions">
      <a href="/diagrams/presence-decision-workflow.html" target="_blank" class="diagram-btn primary">
        ↗ Abrir em Tela Cheia (Nova Aba)
      </a>
      <button onclick="document.getElementById('frame-workflow').requestFullscreen()" class="diagram-btn">
        ⛶ Modo Fullscreen
      </button>
    </div>
  </div>
  <iframe id="frame-workflow" src="/diagrams/presence-decision-workflow.html" class="diagram-frame"></iframe>
</div>

<div class="diagram-tips">
  💡 <strong>Controles Interativos:</strong> Arraste para mover (Pan), use a roda do mouse ou <code>+</code> / <code>-</code> para Zoom. Pressione <code>0</code> para enquadramento 100%.
</div>

### 📌 As 4 Raias de Decisão

1. **Borda (Câmera IP / Catraca):** Captura ótica, detecção biométrica, 1:N match local.
2. **Gateway (Netty TCP :50000):** Validação de assinatura de pacote, CPU throttling, publicação no broker.
3. **Estado (Redis Cache):** Avaliação de chave de duplicata (300s) e categorização `IN`, `OUT` ou `REF`.
4. **Domínio Escolar (PostgreSQL & Grade):** Reconciliação com grade curricular e geração de alertas de Busca Ativa.
