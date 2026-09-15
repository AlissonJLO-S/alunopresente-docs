---
title: Multi-Schema PostgreSQL & Cache Redis
description: Organização dos 6 schemas lógicos no PostgreSQL 16 e deduplicação no Redis
---

## 🗄️ PostgreSQL 16 Multi-Schema

Todas as APIs e bibliotecas utilizam **uma única instância física do PostgreSQL**, dividida em 6 schemas lógicos com isolamento estrito:

| Schema | Módulo Proprietário | Conteúdo & Tabelas |
|---|---|---|
| `base` | `base-service` | Dispositivos de campo, servidores TCP, logs brutos (`tb_evento`) e tratados (`tb_evento_tratado`) |
| `alunopresente` | `alunopresente-service` | Alunos, turmas, matrículas, presenças (`tb_turma_aula_presenca_matricula`), Busca Ativa e transportes |
| `auth` | `auth-service` | Usuários, tenants, contas, perfis e permissões |
| `cadastro` | `cadastro-service` | Cidades, estados, feriados e tabelas auxiliares |
| `storage` | `storage-service` | Metadados de arquivos, fotos faciais e repositórios locais |
| `integracao` | `integracao-sql` | Views SQL analíticas e sincronização de dados externos |

---

## 🔴 Camada de Cache Redis

- **Deduplicação de Biometria:** TTL de 300 segundos (5 minutos) com a chave `evento:aluno:{inep}:{matricula}`.
- **Sessões e Tokens:** Validação de tokens de autenticação e controle de limites de taxa.
