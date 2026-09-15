---
title: Reconhecimento Facial no Hardware (Edge AI)
description: Inteligência Artificial embarcada nas câmeras IP e terminais biométricos
---

## 🎯 Quem Pega a Presença é a Própria Câmera!

> **Regra Fundamental:** O backend **NÃO** processa visão computacional centralizada de vídeo. Todo o reconhecimento facial é executado na borda (*Edge AI*).

1. **Hardware com NPU Embarcada:** Câmeras Hikvision DeepinView, Dahua WizMind e terminais faciais MinMoe possuem processadores neurais locais.
2. **Biblioteca Facial Interna (FDLib):** O backend sincroniza os templates faciais dos alunos para a memória flash interna da câmera.
3. **Match 1:N no Hardware:** Ao transitar na portaria, a própria câmera compara o rosto com o banco local em menos de 200 milissegundos.
4. **Disparo do Evento:** A câmera gera o alarme `FaceMatch` contendo a matrícula do aluno, timestamp, inep e foto do recorte, enviando via TCP :50000 para o `base-api`.
