import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
  integrations: [
    starlight({
      title: 'Aluno Presente — Docs & Arquitetura',
      description: 'Central Técnica, Arquitetura Real e Engenharia Reversa do Ecossistema Aluno Presente / Equipe Presente',
      sidebar: [
        {
          label: 'Início',
          items: [
            { label: 'Visão Geral & Hub', slug: '' },
            { label: 'Ambiente de Desenvolvimento', slug: 'onboarding' },
          ],
        },
        {
          label: '🏛️ Arquitetura do Sistema',
          autogenerate: { directory: '01-arquitetura' },
        },
        {
          label: '🎯 Presença & Edge AI',
          autogenerate: { directory: '02-presenca-edge-ai' },
        },
        {
          label: '📹 Streaming de Câmeras CFTV',
          autogenerate: { directory: '03-streaming-cctv' },
        },
        {
          label: '📋 Regras de Negócio',
          autogenerate: { directory: '04-regras-negocio' },
        },
        {
          label: '📐 Padrões & Diretrizes',
          autogenerate: { directory: '05-padroes-desenvolvimento' },
        },
        {
          label: '📊 Diagramas Interativos (Archify)',
          autogenerate: { directory: '06-diagramas-interativos' },
        },
      ],
    }),
  ],
});
