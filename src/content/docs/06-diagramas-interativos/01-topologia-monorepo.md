---
title: Topologia Geral do Monorepo
description: Arquitetura completa não-linear dos 14 módulos, Spring Boot APIs, RabbitMQ e PostgreSQL
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
      <span>Topologia Não-Linear dos 14 Módulos & Barramento AMQP</span>
    </div>
    <div class="diagram-actions">
      <a href="/diagrams/monorepo-architecture.html" target="_blank" class="diagram-btn primary">
        ↗ Abrir em Tela Cheia (Nova Aba)
      </a>
      <button onclick="document.getElementById('frame-topo').requestFullscreen()" class="diagram-btn">
        ⛶ Modo Fullscreen
      </button>
    </div>
  </div>
  <iframe id="frame-topo" src="/diagrams/monorepo-architecture.html" class="diagram-frame"></iframe>
</div>

<div class="diagram-tips">
  💡 <strong>Controles Interativos:</strong> Arraste para mover (Pan), use a roda do mouse ou <code>+</code> / <code>-</code> para Zoom. Pressione <code>0</code> para enquadramento 100%.
</div>

### 📌 Destaques Arquiteturais deste Diagrama

- **Executáveis vs Bibliotecas JAR:** As 4 APIs (`base-api`, `educacao-api`, `cadastro-face-api`, `saude-api`) são as únicas com método `main`. As 8 bibliotecas (`commons-lib`, `base-service`, `alunopresente-service`, etc.) são acopladas via classpath.
- **Ingestão de Hardware:** Terminais MinMoe Hikvision e Catracas Control iD conectam via TCP direto na porta `50000` de `base-api`.
- **Barramento Assíncrono:** RabbitMQ em 2 estágios (`AP_HOM_EVENTO` bruto e tratado) com janela de 5 minutos no Redis para deduplicação.
