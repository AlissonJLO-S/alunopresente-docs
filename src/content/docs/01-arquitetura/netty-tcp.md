---
title: Servidor Netty TCP na Porta 50000
description: Ingestão de eventos de hardware em tempo real (MinMoe Hikvision e Catracas Control iD)
---

## ⚡ Servidor Netty de Baixa Latência

Em `base-api`, um servidor Netty escuta na porta TCP `50000` (`tcp.server.startPort=50000`), recebendo conexões diretas de campo:
- Terminais de reconhecimento facial MinMoe (Hikvision)
- Catracas eletrônicas com leitor facial (Control iD)

### Pipeline Netty & Proteção de CPU

O pipeline de handlers do Netty em `base-service` possui:
1. **CPU Throttling:** Proteção para descartar ou atrasar pacotes caso a CPU do servidor ultrapasse os limites configurados.
2. **Multipart Extractor:** Extrai o payload JSON de metadados biométricos e a foto JPG anexada na requisição multipart/form-data.
3. **Despacho Assíncrono:** O evento extraído é despachado imediatamente para a exchange do RabbitMQ (`AP_HOM_EVENTO`), liberando a thread de I/O do Netty.
