---
title: Regras de Presença e Refeitório
description: Critérios exatos de elegibilidade para contagem de frequência escolar e refeições
---

## 🥗 Presenças e Refeições Homologadas

### 1. Presenças Confirmadas
- Aluno com foto cadastrada (`a.foto_id IS NOT NULL`).
- Turma e matrícula ativas (`t.situacao = true`, `m.situacao = true`).
- Contagem distinta do par `(aluno_id, data)` onde `tapm.presenca = true`.

### 2. Alimentados no Refeitório
- Tipo de câmera estritamente de refeitório (`et.tipo_camera = 'REF'`).
- Horário da batida dentro da faixa do intervalo cadastrado (`tb_quadro_intervalo`).
- **Validação Cruzada:** O aluno precisa obrigatoriamente ter presença confirmada em sala de aula no mesmo dia para ter a refeição computada nos KPIs.
