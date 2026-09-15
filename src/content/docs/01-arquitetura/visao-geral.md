---
title: Topologia Real & Os 14 Módulos
description: Mapeamento detalhado das 4 APIs executáveis Spring Boot, 8 bibliotecas JAR e 2 SPAs Angular
---

## 🏛️ Topologia Não-Linear

O sistema **não opera em um pipeline linear**. Trata-se de uma arquitetura modular orientada a eventos (*Event-Driven Architecture*), combinando servidores TCP de baixa latência, mensageria RabbitMQ assíncrona em 2 estágios, deduplicação biométrica em Redis, banco de dados PostgreSQL multi-schema e integração cruzada entre SPAs Angular e APIs Spring Boot.

<div class="diagram-container">
  <div class="diagram-header">
    <div class="diagram-title">
      <span>🏛️</span> Diagrama Arquitetural Oficial (SVG Interativo Standalone)
    </div>
    <div class="diagram-actions">
      <a href="/diagrams/monorepo-architecture.html" target="_blank" class="diagram-btn">
        ↗ Abrir Isolado
      </a>
      <button onclick="document.getElementById('frame-topo-embed').requestFullscreen()" class="diagram-btn">
        ⛶ Tela Cheia
      </button>
    </div>
  </div>
  <iframe id="frame-topo-embed" src="/diagrams/monorepo-architecture.html" class="diagram-frame"></iframe>
</div>

---

### 📦 Separação Canônica de Módulos

```
laboratorio-aplicacao-java/
├── base-api/               # Spring Boot Executável (Porta 8025) - Gateway & Netty TCP :50000
├── educacao-api/           # Spring Boot Executável (Porta 8021) - Core Educacional & Dashboards
├── cadastro-face-api/      # Spring Boot Executável (Porta 8022) - API de cadastro autônomo
├── saude-api/              # Spring Boot Executável (Porta 8022) - API de profissionais de saúde
├── alunopresente-service/  # JAR Classpath - Chamadas, presenças, Busca Ativa e Firebase FCM
├── base-service/           # JAR Classpath - Drivers de câmera, Netty Handlers e Redis
├── commons-lib/            # JAR Classpath - A LEI DO PROJETO (DTOs, Tenant, Exceções)
├── auth-service/           # JAR Classpath - Autenticação, JWT e multi-tenancy
├── storage-service/        # JAR Classpath - Armazenamento de arquivos e fotos
├── cadastro-service/       # JAR Classpath - Tabelas auxiliares
├── dashbord-service/       # JAR Classpath - Configurações de relatórios
├── integracao-sql/         # JAR Classpath - Views SQL e migrações analíticas
├── baseweb/                # Frontend Angular 19 (Porta 4200) - Admin & Dispositivos
└── educacaoweb/            # Frontend Angular 19 (Porta 4201) - Gestão Escolar & Análise Diária
```

### 🎯 Princípio Fundamental: Executáveis vs Bibliotecas JAR

- As 4 APIs (`base-api`, `educacao-api`, `saude-api`, `cadastro-face-api`) são as **únicas aplicações executáveis** (Spring Boot com método `main`).
- Os outros 8 módulos de backend são **bibliotecas JAR** embutidas no classpath via Maven. NUNCA tente executá-los como processos isolados.
