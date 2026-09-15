---
title: Notificações Push aos Pais (Firebase FCM)
description: Desacoplamento entre o envio de alertas no app mobile e a chamada escolar
---

## 📱 Notificação Imediata aos Pais

Enquanto a presença na grade curricular é consolidada em lotes a cada 10 minutos, a **notificação para o aplicativo dos pais é disparada imediatamente**:

- **Consumidor:** `RabbitMQNotificacaoAlunoConsumer` em `alunopresente-service`.
- **Fila:** Consome diretamente de `AP_HOM_EVENTO_TRATADO` (Fila 02).
- **Ação:** Aciona `AppPessoaBufferService.addNotificacoes(eventos)`, enviando a notificação push via Firebase Admin SDK.
- **Mensagem Recebida:** *"O aluno Joãozinho entrou na escola às 07:15"* ou *"O aluno Joãozinho almoçou no refeitório às 12:10"*.
