---
title: Busca Ativa de Alunos Infrequentes
description: Ciclo de vida contra evasão escolar e encaminhamento ao Conselho Tutelar
---

## 🔍 Ciclo de Vida da Busca Ativa

1. **Detecção:** Aluno acumula faltas consecutivas injustificadas calculadas pelo motor de presença.
2. **Abertura do Processo:** Caso registrado em `alunopresente.tb_busca_ativa`.
3. **Ações em Andamento:**
   - Contato telefônico com os responsáveis
   - Notificações push Firebase para os gestores escolares
   - Visita escolar ou domiciliar
4. **Desfechos:**
   - **Retorno às aulas:** Processo finalizado com frequência regularizada.
   - **Sem retorno:** Encaminhamento ao Conselho Tutelar com geração automática de ofício em PDF via JasperReports.
