---
title: Central de Documentação Técnica
description: Hub Central e Visualizador de Markdown para o Ecossistema Aluno Presente / Equipe Presente
template: splash
hero:
  tagline: Arquitetura Real, Edge AI em Câmeras Faciais, Mensageria RabbitMQ e Engenharia Reversa de Streaming.
  image:
    file: ../../assets/hero.svg
  actions:
    - text: Explorar Arquitetura
      link: /01-arquitetura/visao-geral/
      icon: right-arrow
      variant: primary
    - text: Diagramas Interativos Archify
      link: /06-diagramas-interativos/suite-archify/
      icon: external
      variant: secondary
---

import { Card, CardGrid } from '@astrojs/starlight/components';

## 🧭 Pilares do Ecossistema

<CardGrid stagger>
  <Card title="🏛️ Topologia Não-Linear" icon="puzzle">
    14 módulos divididos estritamente entre 4 Spring Boot APIs executáveis e 8 bibliotecas JAR acopladas via classpath. Servidor Netty TCP na porta 50000.
  </Card>
  <Card title="🎯 Edge AI & Presença Escolar" icon="laptop">
    O reconhecimento facial ocorre <strong>direto no hardware da câmera</strong> (&lt; 200ms). Deduplicação de 5 minutos no Redis e motor de reconciliação de grade a cada 10 minutos.
  </Card>
  <Card title="📹 Streaming CFTV em Tempo Real" icon="open-book">
    Engenharia reversa dos drivers Hikvision e Dahua: Ticket Pattern descartável, WebSocket com Java NIO, WASM C++ e sandbox de isolamento em iframes.
  </Card>
  <Card title="⚡ Busca Ativa & Alertas" icon="warning">
    Monitoramento contínuo de evasão escolar, disparo instantâneo aos pais via Firebase FCM e integração de ofícios em PDF para Conselho Tutelar.
  </Card>
</CardGrid>
