---
title: Pipeline de Mensageria RabbitMQ em 2 Estágios (Dataflow)
description: Fluxo de eventos biométricos brutos e tratados via exchanges Fanout, Quorum Queues e deduplicação no Redis
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
  <a href="/06-diagramas-interativos/05-streaming-cftv/" class="diag-tab">
    📹 5. Streaming CFTV
  </a>
  <a href="/06-diagramas-interativos/06-pipeline-rabbitmq/" class="diag-tab active">
    📬 6. Pipeline RabbitMQ
  </a>
</div>

<div class="diagram-container">
  <div class="diagram-header">
    <div class="diagram-title">
      <span class="pulse-dot"></span>
      <span>Pipeline de Mensageria RabbitMQ em 2 Estágios (Archify Dataflow)</span>
    </div>
    <div class="diagram-actions">
      <a href="/diagrams/rabbitmq-pipeline.html" target="_blank" class="diagram-btn primary">
        ↗ Abrir em Tela Cheia (Nova Aba)
      </a>
      <button onclick="document.getElementById('frame-rmq-full').requestFullscreen()" class="diagram-btn">
        ⛶ Modo Fullscreen
      </button>
    </div>
  </div>
  <iframe id="frame-rmq-full" src="/diagrams/rabbitmq-pipeline.html" class="diagram-frame"></iframe>
</div>

---

### 📖 Como Explorar este Diagrama Interativo
* **Guided Views (Controles no Topo):** Clique nas visões guiadas `1. Ingestão & Estágio Bruto`, `2. Redis & Estágio Tratado` ou `3. Persistência & Push aos Pais` para destacar os nós e conexões de cada fase do pipeline.
* **Play Story:** Reproduza automaticamente o percurso das mensagens desde o socket Netty TCP até o disparo Firebase FCM.
* **Zoom & Pan:** Utilize o scroll do mouse ou pinça do trackpad para navegar pelos estágios com precisão vetorial.
* **Fullscreen:** Clique em `⛶ Modo Fullscreen` para expandir a visualização ocupando todo o monitor.
