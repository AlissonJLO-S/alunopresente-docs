---
title: Ambiente de Desenvolvimento & Onboarding
description: Instruções de compilação, scripts utilitários e regras de execução do monorepo
---

## 🛠️ Stack Tecnológica

| Camada | Tecnologia | Versão Homologada |
|---|---|---|
| **Backend** | Java + Spring Boot | Java 17/21 / Spring Boot 3.2.2 & 3.4.5 |
| **Frontend** | Angular + TailwindCSS | Angular 19 |
| **Rede & Baixa Latência** | Netty TCP Server | 4.1.x (Porta 50000) |
| **Banco de Dados** | PostgreSQL | 16 (Multi-Schema) |
| **Mensageria** | RabbitMQ | 3.12+ (AMQP 0-9-1) |
| **Cache & Deduplicação** | Redis | 7.x (TTL 300s) |
| **Decodificação de Vídeo** | WebAssembly (C++) + WebGL | Emscripten / Canvas 2D |

---

## ⚙️ Scripts de Compilação Padronizados

Para garantir que a árvore de dependências Maven seja respeitada sem erros de classpath, utilize sempre os scripts em `.agents/`:

```bash
# Cenário A: Compilação das dependências e da API educacional
./.agents/build-educacao.sh

# Cenário B: Compilação das dependências e da API base
./.agents/build-base.sh

# Cenário Completo: Compilação de todos os 14 módulos
./.agents/build-all.sh
```

> **Aviso de Processos Travados:**  
> Caso a aplicação Spring Boot trave a porta TCP ou o debug remoto, destrave imediatamente com:
> ```bash
> ./.agents/kill-base-api.sh
> ```
