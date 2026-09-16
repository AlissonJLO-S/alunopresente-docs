---
title: Mensageria RabbitMQ em 2 Estágios
description: Detalhamento exaustivo do pipeline assíncrono de biometria, exchanges Fanout, Quorum Queues, máquina de estados em Redis e consumidores desacoplados.
---

O barramento de mensageria **RabbitMQ** é a espinha dorsal de alta performance e desacoplamento do ecossistema **Aluno Presente / Equipe Presente**. Ele foi projetado para absorver rajadas intensas de tráfego nos horários de pico (entrada e saída de milhares de alunos simultaneamente), garantindo **zero perda de eventos**, **tolerância a falhas transitórias** e **latência sub-segundo** para notificações aos pais.

---

## 📊 Arquitetura Geral do Pipeline em 2 Estágios

O fluxo é estruturado em **dois estágios assíncronos**:
* **Estágio 1 (Eventos Brutos):** Absorve os alarmes biométricos brutos disparados pelo Netty TCP, persiste log forense e alimenta a máquina de estados no Redis.
* **Estágio 2 (Eventos Tratados):** Distribui em leque (*Fanout*) os eventos já classificados (`IN`, `OUT`, `REF`) para ingestão massiva no banco e envio instantâneo de Push via Firebase FCM.

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
      <button onclick="document.getElementById('frame-rmq-pipeline').requestFullscreen()" class="diagram-btn">
        ⛶ Modo Fullscreen
      </button>
    </div>
  </div>
  <iframe id="frame-rmq-pipeline" src="/diagrams/rabbitmq-pipeline.html" class="diagram-frame"></iframe>
</div>

---

## ⏱️ Ciclo de Vida Passo a Passo: Do Alarme na Câmera à Notificação

Abaixo está o ciclo de vida completo de uma leitura facial, detalhando o comportamento assíncrono desde a detecção em borda até o fechamento da chamada no diário escolar:

1. **Passagem na Câmera de Entrada (`00:00.000`):**
   * O aluno transita pela portaria. A câmera IP (Hikvision ou Dahua) executa matching biométrico 1:N local contra a biblioteca `FDLib` em sua NPU em menos de 200ms.
   * A câmera dispara alarme TCP Socket com payload JSON contendo `{ inep, matricula, timestamp, similaridade, canal }`.
2. **Ingestão Netty & Publicação Bruta (`+ 30ms`):**
   * O servidor Netty TCP na porta `:50000` (`base-api`) recebe os bytes e valida a integridade do cabeçalho.
   * `MultiRabbitMQProducer` publica o `EventoDTO` imediatamente na exchange Fanout `AP_HOM_EVENTO`.
3. **Consumo em Lote & Máquina de Estados no Redis (`+ 100ms`):**
   * `RabbitMQEventoConsumer` (`base-service`) consome lotes da fila Quorum `HOM_EVENTO_BRUTO_01`.
   * Registra a chave temporária `alunos:{inep}:{matricula}:{tipo}` com TTL de 5 minutos (300 segundos). Oscilações ópticas sucessivas no mesmo portão são descartadas.
   * Envia os eventos para o buffer em memória (`EventoBufferService`) para gravação forense periódica (5s) em `base.tb_evento`.
4. **Disparo da Exchange Tratada (`+ 150ms`):**
   * O evento validado (`EventoMetchEducacionalDTO`) com classificação `IN` (Entrada), `OUT` (Saída) ou `REF` (Refeitório) é publicado na exchange Fanout `AP_HOM_EVENTO_TRATADO`.
5. **Fanout Paralelo: Banco & Notificação Mobile (`+ 250ms`):**
   * **Fila 01 (`base-service`):** O `RabbitMQEventoTratadoConsumer` recebe o evento, agrupa no `EventoTratadoBufferService` e executa ingestão massiva via PostgreSQL `COPY` na tabela `base.tb_evento_tratado` (**> 5.000 eventos/s** sem locks).
   * **Fila 02 (`alunopresente-service`):** O `RabbitMQNotificacaoAlunoConsumer` entrega ao `AppPessoaBufferService` que aciona a API do **Firebase Cloud Messaging (FCM)**. O responsável recebe push instantâneo no smartphone: *"Seu filho entrou na escola às 07:05"*.
6. **Reconciliação Educacional & Busca Ativa (Timer 10min em `educacao-api`):**
   * A cada 10 minutos, o serviço `RealizarPresencaComDadosEventoTratadoService` lê os novos registros de `base.tb_evento_tratado`.
   * Cruza o horário da entrada com a grade da turma e confirma a presença no diário: `presenca = true` em `tb_turma_aula_presenca_matricula`.
   * Caso o aluno acumule faltas consecutivas injustificadas, ele é automaticamente adicionado ao módulo de **Busca Ativa** para acompanhamento pedagógico e encaminhamento ao Conselho Tutelar.

---

## 🔍 Detalhamento Técnico das Filas, Exchanges e Consumidores

### 1. Estágio 1: Barramento de Eventos Brutos

O primeiro estágio é responsável pela absorção ultra-rápida dos eventos biométricos de hardware, garantindo que o servidor Netty não sofra backpressure mesmo com centenas de câmeras transmitindo simultaneamente:

| Componente | Configuração / Nome | Tipo | Propósito |
|---|---|---|---|
| **Exchange** | `AP_HOM_EVENTO` (`${rabbitmq.exchange.evento-bruto}`) | `FanoutExchange` | Distribui o alarme bruto imediatamente sem overhead de routing key. |
| **Fila** | `HOM_EVENTO_BRUTO_01` (`${rabbitmq.queue.evento-bruto-01}`) | `Quorum Queue` (`x-queue-type: quorum`) | Fila persistente e replicada via consenso Raft, tolerante a falhas de nós RabbitMQ. |
| **Produtor** | [`MultiRabbitMQProducer.enviarEventoAlunoPresenteMQ()`](file:///home/alisson/projetos/laboratorio-aplicacao-java/base-service/src/main/java/br/com/baseservice/domain/rabbitmq/MultiRabbitMQProducer.java) | `RabbitTemplate` | Publica a string JSON serializada com o `EventoDTO`. |
| **Consumidor** | [`RabbitMQEventoConsumer`](file:///home/alisson/projetos/laboratorio-aplicacao-java/base-service/src/main/java/br/com/baseservice/domain/rabbitmq/RabbitMQEventoConsumer.java) | `@RabbitListener` em Lote | Consome listas de mensagens (`List<Message>`) utilizando o container factory `rabbitListenerBaseContainerFactory`. |

#### O que o Consumidor Bruto faz:
1. **Deduplicação no Redis (`EventoAlunoPresencaRedisService`):**
   * Cria chave com padrão `alunos:{inep}:{matricula}:{tipoDispositivo}` com TTL de 300 segundos (5 minutos).
   * Se o mesmo aluno passar 3 vezes em frente à câmera no intervalo de 30 segundos, apenas o primeiro alarme é considerado para a transição de estado, descartando oscilações ópticas.
2. **Buffer de Auditoria Forense (`EventoBufferService`):**
   * Em vez de fazer um `INSERT` a cada evento, acumula os objetos em uma fila não-bloqueante em memória e, a cada 5 segundos, executa inserção em lote na tabela `base.tb_evento`.

---

### 2. Estágio 2: Barramento de Eventos Tratados

Uma vez que a máquina de estados no Redis validou e categorizou a passagem (`IN` para Entrada, `OUT` para Saída e `REF` para Refeitório), o evento tratado (`EventoMetchEducacionalDTO`) é despachado para a segunda exchange:

| Componente | Configuração / Nome | Tipo | Propósito |
|---|---|---|---|
| **Exchange** | `AP_HOM_EVENTO_TRATADO` (`${rabbitmq.exchange.evento-tratado}`) | `FanoutExchange` | Efetua broadcast idêntico para múltiplos consumidores especializados. |
| **Fila 01** | `HOM_EVENTO_TRATADO_01` (`${rabbitmq.queue.evento-tratado-01}`) | `Quorum Queue` | Exclusiva para gravação de histórico de eventos tratados no PostgreSQL. |
| **Fila 02** | `HOM_EVENTO_TRATADO_02` (`${rabbitmq.queue.evento-tratado-02}`) | `Quorum Queue` | Exclusiva para o motor de notificações push para o aplicativo dos pais. |
| **Fila 03** | `HOM_EVENTO_TRATADO_03` (`${rabbitmq.queue.evento-tratado-03}`) | `Quorum Queue` | Fila de contingência e alimentação de métricas analíticas externas. |

#### Consumidores Especializados do Estágio 2:

1. **Consumidor de Banco (`RabbitMQEventoTratadoConsumer` em `base-service`):**
   * Escuta a fila `HOM_EVENTO_TRATADO_01`.
   * Envia os eventos para o [`EventoTratadoBufferService`](file:///home/alisson/projetos/laboratorio-aplicacao-java/base-service/src/main/java/br/com/baseservice/domain/buffer/EventoTratadoBufferService.java).
   * O buffer dispara a cada 5 segundos uma rotina de inserção via **PostgreSQL `COPY` binário** direto na tabela `base.tb_evento_tratado`. Essa abordagem atinge vazões superiores a **5.000 eventos/segundo** sem locks de tabela.

2. **Consumidor de Push Notifications (`RabbitMQNotificacaoAlunoConsumer` em `alunopresente-service`):**
   * Escuta a fila `HOM_EVENTO_TRATADO_02`.
   * Deserializa o payload em `AppEventoMetchEducacionalDTO`.
   * Alimenta o [`AppPessoaBufferService`](file:///home/alisson/projetos/laboratorio-aplicacao-java/alunopresente-service/src/main/java/br/com/alunopresenteservice/domain/aplicativo/service/AppPessoaBufferService.java).
   * Conecta à API do **Firebase Cloud Messaging (FCM)** para disparar notificações push imediatas aos smartphones dos responsáveis ("*Joãozinho registrou entrada na Escola Municipal às 07:12*").

---

### 3. Fechamento do Ciclo: Presença Escolar e Busca Ativa

A gravação dos eventos em `base.tb_evento_tratado` não finaliza a chamada escolar automaticamente. O domínio pedagógico exige validação contra grades horárias:

1. **Timer de Presença (`educacao-api`):**
   * A cada 10 minutos, o serviço [`RealizarPresencaComDadosEventoTratadoService`](file:///home/alisson/projetos/laboratorio-aplicacao-java/alunopresente-service/src/main/java/br/com/alunopresenteservice/domain/service/RealizarPresencaComDadosEventoTratadoService.java) executa uma query cross-schema lendo os registros recentes de `base.tb_evento_tratado`.
2. **Reconciliação com Grade Curricular:**
   * Cruza o timestamp da leitura biométrica com os horários de início e término das aulas da turma do aluno (`tb_quadro_horario_aula`).
   * Se o aluno entrou no período de tolerância configurado, confirma a presença no diário eletrônico:
     ```sql
     UPDATE alunopresente.tb_turma_aula_presenca_matricula 
     SET presenca = true 
     WHERE matricula_id = :matriculaId AND data = :dataHoje;
     ```
3. **Alimentação da Busca Ativa:**
   * Se um aluno matriculado não possuir evento de entrada registrado após o término do horário limite, o sistema contabiliza falta injustificada.
   * Ao atingir o limiar de faltas consecutivas (ex: 3 dias consecutivos), o aluno é automaticamente injetado na esteira do **Módulo de Busca Ativa**, notificando orientadores pedagógicos e gerando alerta para o Conselho Tutelar.

---

## 🛡️ Padrões de Resiliência Implementados

* **Quorum Queues com Consenso Raft:** Substituição das filas clássicas espelhadas por Quorum Queues (`x-queue-type: quorum`). Isso elimina riscos de split-brain e garante durabilidade estrita das mensagens em disco.
* **Consumo em Lote com Acknowledgment Tardio:** Os listeners utilizam `channel.basicAck(lastTag, true)` somente após todo o lote ser validado e entregue aos buffers em memória. Em caso de pane ou crash da JVM durante o processamento, as mensagens retornam automaticamente à fila (*nack/requeue*).
* **Buffers Não-Bloqueantes com Locks Reentrantes:** O isolamento entre consumo RabbitMQ e persistência no banco através de buffers intermediários (`EventoBufferService` e `EventoTratadoBufferService`) impede que lentidões transitórias no PostgreSQL afetem a vazão dos consumidores AMQP.
