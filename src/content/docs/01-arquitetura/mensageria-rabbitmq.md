---
title: Mensageria RabbitMQ em 2 Estágios
description: Detalhamento de exchanges, filas, deduplicação em Redis e consumidores desacoplados
---

## 📬 Pipeline de Mensageria em 2 Estágios

O RabbitMQ atua como o barramento assíncrono garantindo tolerância a falhas e desacoplamento:

```
[Hardware] ──(TCP:50000)──> [base-api]
                               │
            ┌──────────────────┴──────────────────┐
            ▼                                     │
   Exchange: AP_HOM_EVENTO (Bruto)                │
            │                                     │
            ▼ (Fila: evento-bruto-01)             │
     [base-service] ──(Redis Janela 5m)           │
            │                                     │
            ▼                                     │
   Exchange: AP_HOM_EVENTO_TRATADO                │
            │                                     │
    ┌───────┴───────────────────────┐             │
    ▼                               ▼             │
 Fila Tratado 01             Fila Tratado 02      │
 (base-service)              (alunopresente-svc)  │
    │                               │             │
    ▼                               ▼             │
 PostgreSQL COPY            Firebase Push FCM     │
 (> 5.000 evt/s)            (Alerta Pais)         │
```

### Detalhamento das Filas e Consumidores

1. **Exchange Bruta `AP_HOM_EVENTO` (Fila `evento-bruto-01`):**
   - Consumida por `RabbitMQEventoConsumer` em `base-service`.
   - Persiste o log bruto na tabela de auditoria `base.tb_evento`.
   - Consulta o Redis: se a chave do aluno naquela câmera/acesso (Entrada, Saída ou Refeitório) foi registrada há menos de 300 segundos (5 minutos), descarta a duplicata para evitar reprocessamentos sucessivos.
   - Eventos válidos são categorizados em `IN`, `OUT` ou `REF`.
2. **Exchange Tratada `AP_HOM_EVENTO_TRATADO`:**
   - **Fila Tratado 01 (`base-service`):** `RabbitMQEventoTratadoConsumer` acumula os eventos em lotes e realiza ingestão em massa via PostgreSQL `COPY` na tabela `base.tb_evento_tratado` (> 5.000 registros/s).
   - **Fila Tratado 02 (`alunopresente-service`):** `RabbitMQNotificacaoAlunoConsumer` despacha mensagens push instantâneas aos pais via Firebase Cloud Messaging (`AppPessoaBufferService`).

