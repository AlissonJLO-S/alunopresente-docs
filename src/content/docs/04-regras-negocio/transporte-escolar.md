---
title: Transporte Escolar nos Ônibus
description: Validação de entrada via terminal facial Hikvision DS-K1T673DX-BR e sincronização offline
---

## 🚌 Transporte Escolar & Validador Facial Embarcado

No ecossistema de Transporte Escolar, o controle de embarque dos alunos nos ônibus municipais utiliza um hardware dedicado para veículos:

### Hardware Oficial: Terminal Hikvision DS-K1T673DX-BR
- **Aplicação Exclusiva em Ônibus:** Este modelo de terminal facial é utilizado **exclusivamente na porta de entrada dos ônibus escolares** (não é utilizado dentro das escolas).
- **Finalidade:** Validar e registrar a entrada/embarque do aluno no veículo escolar, identificando a rota, o horário de subida e garantindo a segurança no trajeto.
- **Embarque Livre:** O aluno cadastrado tem direito ao embarque livre em qualquer ônibus ativo da frota escolar municipal.

### Arquitetura de Sincronização e Resiliência (Offline-First)

1. **Memória Flash com Base de Faces dos Veículos (`tb_aluno_veiculo_escolar`):**
   - Ao cadastrar a foto de um aluno no sistema escolar, o backend gera os vínculos com todos os veículos ativos da frota.
   - Os templates faciais são injetados na memória flash do terminal `DS-K1T673DX-BR` via chamadas de sincronização ISAPI.
2. **Matching 1:N Local e Imediato no Embarque:**
   - O terminal opera com NPU local embarcada. O aluno olha para o display ao subir no ônibus e o matching ocorre em menos de 200ms, liberando a passagem sem depender de conexão com a internet durante o percurso.
3. **Bufferização de Batidas e Sincronização 4G/Garagem:**
   - Durante trajetos em áreas rurais ou sem sinal de celular, os eventos de embarque ficam retidos na memória interna do terminal.
   - Assim que o ônibus entra em cobertura 4G/LTE ou conecta à rede Wi-Fi da garagem central, o terminal descarrega o lote de eventos via HTTP/TCP no `base-api`.
4. **Ciclo de Vida de Faces e Timers de Limpeza:**
   - O agendador `ConfiguracaoTimerAlunoPresenteBaseService` executa rotinas periódicas para remoção de faces de alunos transferidos ou inativos (`marcarVinculosFaceOnibusParaRemocaoCompletaNoBase`), garantindo que a memória dos terminais nos ônibus permaneça sempre otimizada.

