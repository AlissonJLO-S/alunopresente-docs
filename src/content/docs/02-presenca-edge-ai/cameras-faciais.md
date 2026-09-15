---
title: Reconhecimento Facial no Hardware (Edge AI)
description: Inteligência Artificial embarcada exclusivamente nas câmeras IP Hikvision e Dahua
---

## 🎯 Quem Pega a Presença é a Própria Câmera!

> **Regra Fundamental:** O backend **NÃO** processa visão computacional centralizada de vídeo em servidores caros. Todo o reconhecimento facial é executado na borda (*Edge AI*), no hardware das próprias câmeras IP.

### Topologia Exclusiva de Câmeras IP por Escola
O sistema **não utiliza terminais MinMoe nem catracas eletrônicas**. O ecossistema é baseado 100% em câmeras IP (Hikvision ou Dahua) instaladas em 3 pontos críticos de cada unidade escolar:

| Ponto de Instalação | Quantidade | Finalidade de Negócio |
|---|---|---|
| **Acesso de Entrada** | **2 Câmeras** | Registram a chegada do aluno, presença no turno escolar e acionam push aos pais. |
| **Acesso de Saída** | **2 Câmeras** | Registram a saída do aluno, audição de permanência e detecção precoce de evasão. |
| **Refeitório** | **2 Câmeras** | Registram o consumo de merenda/refeições, alimentando o Dashboard de Refeitório Diário. |

### Fluxo de Reconhecimento no Hardware
1. **Processador Neural Embarcado (NPU SoC):** As câmeras Hikvision e Dahua possuem aceleradores neurais dedicados que processam múltiplos fluxos de vídeo em tempo real.
2. **Biblioteca Facial Interna (FDLib):** O backend sincroniza os templates e fotos dos alunos para a memória flash interna das câmeras através de endpoints de gerenciamento ISAPI/HTTP.
3. **Matching 1:N Ultra Rápido (&lt; 200ms):** Ao transitar na entrada, saída ou refeitório, a própria câmera detecta o rosto e compara contra sua biblioteca interna de alunos.
4. **Disparo Imediato do Alarme:** Ao confirmar o match com similaridade acima do limiar (ex: 80%), a câmera dispara o evento via TCP para a porta `50000` de `base-api`, contendo matrícula, similaridade, timestamp e recorte da face.

