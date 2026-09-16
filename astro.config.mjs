import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
  integrations: [
    starlight({
      title: 'Aluno Presente — Docs & Arquitetura',
      description: 'Central Técnica, Arquitetura Real e Engenharia Reversa do Ecossistema Aluno Presente / Equipe Presente',
      customCss: ['./src/styles/custom.css'],
      sidebar: [
        {
          label: '🚀 Início & Onboarding',
          items: [
            { label: 'Visão Geral & Hub', slug: '' },
            { label: 'Ambiente de Desenvolvimento', slug: 'onboarding' },
          ],
        },
        {
          label: '🏛️ Arquitetura do Sistema',
          items: [
            { label: '1. Topologia & 14 Módulos', slug: '01-arquitetura/visao-geral' },
            { label: '2. Servidor Netty TCP :50000', slug: '01-arquitetura/netty-tcp' },
            { label: '3. Mensageria RabbitMQ (2 Estágios)', slug: '01-arquitetura/mensageria-rabbitmq' },
            { label: '4. Multi-Schema PostgreSQL & Redis', slug: '01-arquitetura/persistencia-cache' },
            { label: '5. Comunicação Base ⇄ Educação (REST vs Views)', slug: '01-arquitetura/comunicacao-base-educacao' },
          ],
        },
        {
          label: '🎯 Presença & Edge AI',
          items: [
            { label: '1. Reconhecimento Facial na Câmera', slug: '02-presenca-edge-ai/cameras-faciais' },
            { label: '2. Motor de Presença (Timer 10m)', slug: '02-presenca-edge-ai/motor-presenca' },
            { label: '3. Push Notifications (Firebase FCM)', slug: '02-presenca-edge-ai/push-notificacoes' },
          ],
        },
        {
          label: '📹 Streaming de Câmeras CFTV',
          items: [
            { label: '1. Hikvision (ISAPI & WASM)', slug: '03-streaming-cctv/hikvision-isapi' },
            { label: '2. Dahua (RTSP-over-WS & Iframe)', slug: '03-streaming-cctv/dahua-rtsp' },
          ],
        },
        {
          label: '📋 Regras de Negócio',
          items: [
            { label: '1. Presença & Refeitório', slug: '04-regras-negocio/presenca-refeitorio' },
            { label: '2. Busca Ativa de Alunos', slug: '04-regras-negocio/busca-ativa' },
            { label: '3. Transporte Escolar nos Ônibus', slug: '04-regras-negocio/transporte-escolar' },
          ],
        },
        {
          label: '📐 Padrões & Regras de Ouro',
          items: [
            { label: 'Backend (Java & Spring Boot)', slug: '05-padroes-desenvolvimento/backend-spring' },
            { label: 'Frontend (Angular 19 & Tailwind)', slug: '05-padroes-desenvolvimento/frontend-angular' },
          ],
        },
        {
          label: '📊 Diagramas Interativos (Archify)',
          items: [
            { label: '🏛️ 1. Topologia do Monorepo', slug: '06-diagramas-interativos/01-topologia-monorepo' },
            { label: '🎯 2. Pipeline de Presença (Dataflow)', slug: '06-diagramas-interativos/02-pipeline-presenca-dataflow' },
            { label: '⏱️ 3. Sequência Facial (Sequence)', slug: '06-diagramas-interativos/03-sequencia-facial' },
            { label: '🔀 4. Workflow de Decisão (Workflow)', slug: '06-diagramas-interativos/04-workflow-decisao' },
            { label: '📹 5. Streaming CFTV (Pipeline)', slug: '06-diagramas-interativos/05-streaming-cftv' },
          ],
        },
      ],
    }),
  ],
});
