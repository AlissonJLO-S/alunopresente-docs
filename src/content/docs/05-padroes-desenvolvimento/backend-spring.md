---
title: Padrões Backend (Spring Boot)
description: Regras de ouro do monorepo, commons-lib e tenant isolation
---

## ⚖️ Regras de Ouro do Backend

1. **`commons-lib` é Lei:** Todo código DEVE usar `br.com.commons`. Não duplique utilitários.
2. **Tenant Isolation:** Consultas em módulos de negócio devem filtrar por `WHERE a.conta.id = :idConta` quando não houver outro filtro de domínio forte.
3. **Separação API / Service:** APIs (`*-api`) nunca contêm entidades JPA ou regras de negócio; apenas controllers e DTOs.
4. **Proibições Rígidas:**
   - Proibido `@RequiredArgsConstructor` (use construtor explícito).
   - Proibido criar interfaces vazias com sufixo `ServiceImpl`.
   - Proibido MapStruct / ModelMapper.
   - Proibido `ex.printStackTrace()` (use SLF4J `LoggerFactory`).
   - Proibido lançar `RuntimeException` genérico (use `RegraDeNegocioException`).
5. **Integração Base ⇄ Educação:** Proibido `@ManyToOne` entre entidades de schemas diferentes (`alunopresente` e `base`). Use REST HTTP (`IntegracaoBaseService`) para envio de mídias e comandos em hardware, e Views SQL (`integracaosql`) com Timers agendados para reconciliação contínua. Consulte [Comunicação Base ⇄ Educação](/01-arquitetura/comunicacao-base-educacao/).
