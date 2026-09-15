---
title: Servidor Netty TCP na Porta 50000
description: Ingestão de eventos de câmeras IP faciais em tempo real (Hikvision e Dahua)
---

## ⚡ Servidor Netty de Baixa Latência

Em `base-api`, um servidor Netty de alto desempenho escuta na porta TCP `50000` (`tcp.server.startPort=50000`), recebendo conexões diretas das **Câmeras IP com IA de Reconhecimento Facial** (Hikvision e Dahua).

### Topologia Canônica por Unidade Escolar (6 Câmeras)
A infraestrutura física de cada escola é composta estritamente por câmeras IP (sem terminais MinMoe ou catracas), distribuídas estrategicamente por finalidade:
- **2 Câmeras de Entrada:** Monitoram o acesso principal e registram a chegada e presença dos alunos no início do turno.
- **2 Câmeras de Saída:** Monitoram o portão de saída para auditoria de evasão e encerramento de turno.
- **2 Câmeras de Refeitório:** Monitoram a área de refeições para controle de alimentação diária, métricas nutricionais e contagem de pratos servidos.

### Pipeline Netty & Proteção de CPU

O pipeline de handlers do Netty (`br.com.base.listenernetty`) possui:
1. **CPU Throttling Dinâmico (`startCpuLimiter`):** Monitora a carga da CPU da máquina hospedeira. Se o uso ultrapassar 70%, reduz automaticamente o pool de threads; se cair abaixo de 40%, eleva a concorrência até o teto máximo.
2. **Multipart Extractor (`MultipartPayloadConsumer`):** Analisa pacotes binários e multipart das câmeras (`isDadosHikivision` e `isDadosDahua` + `isActionStop`), extraindo instantaneamente o JSON com ID do aluno, matrícula, similaridade % e foto facial.
3. **Despacho Assíncrono Ultra Rápido:** O evento identificado é despachado de imediato via `MultiRabbitMQProducer.enviarEventoAlunoPresenteMQ` para o broker RabbitMQ, liberando as threads de I/O do Netty em microssegundos.

