---
title: Motor de Presença (Agendador de 10 Minutos)
description: Lógica de reconciliação de horários entre batidas de portaria e grade escolar
---

## ⏱️ O Agendador de Presença em Sala de Aula

A presença escolar **não é marcada no momento do consumo da fila RabbitMQ**. Ela é processada por um agendador (*cron*) a cada 10 minutos em `educacao-api` (`ConfiguracaoTimerService.realizarProcessamentoPresencaHoje()`), que aciona o serviço:

`RealizarPresencaComDadosEventoTratadoService`

### Lógica SQL de Cruzamento de Intervalos

O serviço lê os eventos do dia em `base.tb_evento_tratado` e monta a tabela temporária `tmp_intervalos_ajustados`:
- **Entrada:** `MIN(e.data_match) FILTER (WHERE e.tipo_camera IN ('IN', 'REF'))`
- **Saída:** `MAX(e.data_match) FILTER (WHERE e.tipo_camera = 'OUT')` (ou saída máxima da grade)

Em seguida, executa o UPDATE de presença na grade:

```sql
UPDATE alunopresente.tb_turma_aula_presenca_matricula m
SET presenca = true
FROM tmp_intervalos_ajustados ia,
     alunopresente.tb_matricula mat,
     alunopresente.tb_unidade_escolar unidade,
     alunopresente.tb_aluno a,
     alunopresente.tb_turma_aula_presenca tp
WHERE mat.id = m.matricula_id
  AND unidade.id = mat.unidade_escolar_id
  AND a.id = mat.aluno_id
  AND tp.id = m.turma_aula_presenca_id
  AND unidade.inep = ia.inep
  AND a.codigoaluno = ia.matricula
  AND tp.data = ia.data_presenca
  AND tp.inicio <= ia.saida::time
  AND tp.termino >= ia.entrada::time
  AND COALESCE(m.presenca, false) = false;
```
