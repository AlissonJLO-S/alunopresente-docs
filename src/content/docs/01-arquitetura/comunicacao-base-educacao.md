---
title: Comunicação Base ⇄ Educação (REST vs. Views SQL)
description: Como escolher entre REST, views SQL e comandos cross-schema na integração entre educacao-api, base-api e equipamentos.
---

A integração entre os domínios de **Educação** e **Base** usa dois mecanismos complementares:

- **REST** transporta arquivos e registra comandos na fronteira do `base-api`;
- **SQL** detecta divergências, processa conjuntos e reconcilia o estado persistido.

O resultado é uma integração de **consistência eventual**: uma resposta HTTP bem-sucedida confirma que o Base aceitou a operação, enquanto a confirmação da câmera ou do terminal pode ocorrer depois, em um batch próprio.

:::tip[Regra rápida]
Use **REST** para enviar uma intenção ou um payload ao Base. Use **view SQL** para descobrir *o que* está divergente. Use **SQL cross-schema explícito** somente para sincronizações em lote já previstas pela arquitetura.
:::

## Limites de responsabilidade

| Componente | Responsabilidade | Porta / schema principal |
|---|---|---|
| `educacao-api` | Alunos, matrículas, turmas, horários, presenças e Busca Ativa | `:8021` / `alunopresente` |
| `base-api` | Faces, unidades lógicas, câmeras, terminais, Netty TCP e integrações com fabricantes | `:8025` / `base` |
| `integracao-sql` | Migrações Flyway das views que comparam os schemas | `integracaosql` |
| PostgreSQL 16 | Fonte de verdade persistida, compartilhada em schemas separados | `alunopresente`, `base`, `cadastro`, `storage`, `auth`, `integracaosql` |

Compartilhar o mesmo cluster reduz o custo de reconciliação, mas cria **acoplamento estrutural**: alterações de tabelas ou views precisam ser coordenadas entre os módulos. Por isso, o acesso cross-schema deve ficar restrito a repositórios e migrações conhecidos.

## Como escolher o canal

| Pergunta | REST HTTP | View SQL / SQL cross-schema |
|---|---|---|
| A operação expressa um comando ou efeito colateral? | **Sim.** Upload, criação de vínculo, marcação para remoção e alteração operacional. | **Não para views.** Views apenas descrevem o estado atual. |
| Há arquivo binário? | **Obrigatório.** Fotos seguem como `multipart/form-data`. | **Não.** Consulte somente IDs, metadados e caminhos. |
| O trabalho envolve muitos registros? | Use chamadas unitárias ou lotes pequenos, com retry controlado. | Prefira consulta ou escrita em lote executada pelo banco. |
| É necessária uma resposta imediata? | O chamador recebe `2xx`, `4xx` ou `5xx` do Base. | O resultado aparece no próximo ciclo do scheduler. |
| O retorno confirma o equipamento físico? | **Não necessariamente.** Em uploads e vínculos, `2xx` confirma o aceite pelo Base. | As views de status reconciliam depois o resultado gravado pelo processamento do dispositivo. |
| Qual é o tipo de acoplamento? | Contrato HTTP, autenticação, DTO e disponibilidade do `base-api`. | Estrutura de tabelas, nomes de colunas e contrato da view. |
| Como uma falha volta a ser processada? | A flag de sucesso não deve ser marcada; o item continua elegível para retry. | Enquanto a divergência existir, o registro reaparece na consulta. |

### Use REST quando

1. **Enviar uma foto:** `POST /api/faces/incluirFaceUpload-integracao` recebe `multipart/form-data` e JWT Bearer.
2. **Criar um vínculo:** `POST /api/faces/incluirFaceUnidade-integracao` associa uma face existente a uma escola ou veículo.
3. **Marcar uma remoção:** `PUT /api/faces/marcarParaRemocaoTotal` registra a intenção de expurgo.
4. **Consultar existência ou estado:** endpoints de verificação evitam recriar vínculos já presentes.
5. **Alterar uma unidade com feedback imediato:** por exemplo, `PUT /api/unidades/atualizar-status-operacional`.

Essas chamadas são implementadas por `IntegracaoBaseService`, no módulo `alunopresente-service`. O serviço obtém um token de integração, monta a requisição e chama a URL configurada em `URL_BASE_API`.

### Use views SQL quando

1. **Detectar pendências:** `vw_ap_face_nao_vinculado_no_base` lista faces ainda não aceitas pelo Base.
2. **Comparar o resultado de sincronização:** `vw_ap_alunos_com_status_divergente_da_face_falha` e `..._sucesso` expõem diferenças entre o status educacional e o status registrado no Base.
3. **Solicitar reenvio em massa:** `vw_ap_unidades_escolares_sem_faces_base` e `vw_ap_veiculos_escolares_sem_faces_base` identificam unidades que precisam recompor suas bibliotecas.
4. **Preparar uma carga em lote:** `vw_ap_unidades_para_inserir_no_base` fornece o conjunto usado no `INSERT ... SELECT` de unidades.

Uma view **não é uma fila** e não executa trabalho sozinha. Ela recalcula um conjunto a partir do estado atual; o scheduler é quem consulta esse conjunto e inicia o processamento.

:::caution[Views são somente leitura]
Não execute `INSERT`, `UPDATE` ou `DELETE` contra `integracaosql.vw_*`. Escritas devem atingir as tabelas canônicas. As rotinas cross-schema existentes fazem isso explicitamente em repositórios auditáveis.
:::

## Fluxo de sincronização e reconciliação

<div class="diagram-container">
  <div class="diagram-header">
    <div class="diagram-title">
      <span class="pulse-dot"></span>
      <span>Base ⇄ Educação: aceite no serviço e confirmação no equipamento</span>
    </div>
    <div class="diagram-actions">
      <a href="/diagrams/base-educacao-sync.html" target="_blank" class="diagram-btn primary">
        ↗ Abrir em nova aba
      </a>
      <button onclick="document.getElementById('frame-base-educacao').requestFullscreen()" class="diagram-btn">
        ⛶ Modo fullscreen
      </button>
    </div>
  </div>
  <iframe id="frame-base-educacao" src="/diagrams/base-educacao-sync.html?embed=1" class="diagram-frame"></iframe>
</div>

<div class="diagram-tips">
  <strong>Leitura recomendada:</strong> acompanhe as quatro fases no eixo vertical. No visualizador, use zoom, busca e destaque de participantes para isolar REST, banco ou equipamento.
</div>

O ciclo possui duas confirmações diferentes:

1. **Aceite pelo Base:** o scheduler encontra uma pendência, chama o `base-api` por REST e atualiza a flag de envio somente após uma resposta bem-sucedida.
2. **Aplicação no equipamento:** um batch do Base processa o estado pendente, conversa com a câmera ou terminal e persiste sucesso, falha ou timeout.
3. **Reconciliação:** views comparam o status operacional do Base com o status educacional; outro ciclo atualiza `status_foto`.

Essa separação impede que um `HTTP 200` seja interpretado incorretamente como confirmação de gravação na memória física do dispositivo.

## Schedules do `educacao-api`

Todos os intervalos abaixo foram conferidos em `ConfiguracaoTimerAlunoPresenteBaseService`. Em `fixedDelay`, a contagem recomeça **depois que o método retorna**; não é uma grade de horário fixa.

### Envio e vínculos

| Método | Intervalo | Descoberta / origem | Efeito | Proteção adicional |
|---|---:|---|---|---|
| `enviarFotosParaObase()` | 20 s | `vw_ap_face_nao_vinculado_no_base` | Upload REST da face; marca o envio somente em `2xx` | `AtomicBoolean` |
| `envioVinculoUnidadeEscolarAluno()` | 20 s | Repositório de aluno ⇄ escola | Verifica a face e cria o vínculo por REST | `AtomicBoolean` + trava por INEP no serviço |
| `enviarFotosParaOsVeiculos()` | 20 s | Repositório de aluno ⇄ veículo | Verifica a face e cria o vínculo com o veículo por REST | `AtomicBoolean` + trava por placa no serviço |

### Cadastro, reenvio e reconciliação

| Método | Intervalo | Mecanismo | Resultado |
|---|---:|---|---|
| `marcarFotosDaUnidadeEscolarParaReenvioPeloStatusDaUnidade()` | 25 s | View de unidades sem faces | Reabre pendências e retorna o controle da unidade para `MANTER` |
| `marcarFotosDoVeiculoEscolarParaReenvioPeloStatusDaUnidade()` | 25 s | View de veículos sem faces | Reabre pendências do veículo e retorna o controle para `MANTER` |
| `sincronizarCondicaoOperacional()` | 30 s | `UPDATE ... FROM` cross-schema | Copia a condição operacional do Base para Educação |
| `cadastrarUnidadesNaoCadastradas()` | 60 s | View + `INSERT ... SELECT` | Insere no Base as unidades escolares ausentes |
| `cadastrarVeiculosNaoCadastrados()` | 60 s | `INSERT ... SELECT` cross-schema | Insere no Base os veículos ausentes |
| `scheduleAtualizacaoStatusAlunos()` | 120 s | Views de divergência de sucesso e falha | Atualiza `status_foto` no domínio educacional |
| `enviarEventosRefeicao()` | 60 s | Redis + serviço educacional | Processa eventos de refeição de unidades ativas |

### Remoção de faces e vínculos

| Método | Intervalo | Etapa | Proteção adicional |
|---|---:|---|---|
| `marcarFotosParaRemocaoCompletaNoBase()` | 60 s | Envia ao Base a intenção de remover a face da escola | `AtomicBoolean` |
| `verificarSeFacesMarcadasParaRemocaoForamRemovidasBase()` | 10 min | Consulta se a remoção física foi concluída | — |
| `executarExclusaoDoRegistrosDeFacesTotalmenteRemovidas()` | 60 s | Exclui o vínculo educacional já confirmado como removido | `AtomicBoolean` |
| `marcarVinculosFaceOnibusParaRemocaoCompletaNoBase()` | 60 s | Envia a intenção de remover o vínculo com o veículo | `AtomicBoolean` |
| `verificarSeVinculosFaceOnibusMarcadasParaRemocaoForamRemovidasBase()` | 10 min | Consulta a conclusão da remoção no veículo | — |
| `executarExclusaoDoRegistrosDeAlunoVeiculoEscolarTotalmenteRemovidos()` | 60 s | Exclui o vínculo aluno ⇄ veículo já confirmado | `AtomicBoolean` |

:::note[Sobre concorrência]
Nem todos os schedules usam `AtomicBoolean`. As travas aparecem nas rotinas em que o código exige exclusão explícita. Os fluxos assíncronos de escola e veículo também usam `ConcurrentHashMap` para impedir processamento simultâneo do mesmo INEP ou da mesma placa.
:::

## Processamento no `base-api`

Depois do aceite REST, o Base ainda precisa aplicar a mudança nos equipamentos:

| Rotina | Agendamento verificado | Função |
|---|---:|---|
| `EnviarFotoBatchConfig.executarBatch()` | `fixedDelay = 60.000 ms` | Envia faces pendentes aos dispositivos; possui `AtomicBoolean` próprio |
| `RemoverFotoBatchConfig.executarBatch()` | `fixedDelay = 65.000 ms`, `initialDelay = 5.000 ms` | Processa remoções de face pendentes; possui `AtomicBoolean` próprio |
| `RemocaoCompletaFaceBatchConfig.executarBatch()` | `fixedDelay = 3.670.000 ms`, `initialDelay = 10.000 ms` | Executa e consolida a remoção completa; possui `AtomicBoolean` próprio |
| `EventoBufferService.flushBuffer()` | `fixedRate = 5.000 ms` | Persiste em lote eventos brutos acumulados |
| `EventoTratadoBufferService.flushBuffer()` | `fixedDelay = 5.000 ms` | Persiste em lote eventos tratados acumulados |

Os valores acima descrevem a configuração atual do código. Se um intervalo mudar, atualize esta página no mesmo pull request.

## Semântica de falha e retry

- **Falha antes do `2xx`:** a flag educacional não deve ser marcada como enviada; a pendência volta no próximo ciclo.
- **`2xx` com dispositivo ainda pendente:** o Base aceitou o comando, mas o status físico continua em processamento.
- **Falha ou timeout no equipamento:** o Base registra o resultado; as views de divergência permitem refletir a falha em `status_foto`.
- **Reenvio de biblioteca:** o controle da unidade ou veículo reabre os vínculos para processamento.
- **Remoção:** primeiro marca-se a intenção, depois confirma-se o expurgo e somente então o registro educacional é excluído.

Não existe uma transação distribuída entre Educação, Base e equipamento. A segurança do fluxo depende de operações repetíveis, estados intermediários explícitos e reconciliação periódica.

## Regras para novas integrações

1. **Não crie relacionamentos JPA entre schemas.** Uma entidade de `alunopresente` não deve usar `@ManyToOne` para uma entidade de `base`.
2. **Não trate uma view como fila persistente.** O registro deixa de aparecer somente quando as tabelas de origem convergem.
3. **Não marque sucesso físico ao receber `HTTP 2xx`.** Diferencie aceite pelo Base de confirmação pelo dispositivo.
4. **Projete endpoints para retry.** O scheduler pode repetir uma operação após falha de rede ou resposta perdida.
5. **Atualize apenas tabelas canônicas.** Novas views devem ser versionadas no módulo `integracao-sql`.
6. **Escolha a trava pelo escopo.** Use `AtomicBoolean` para exclusão do job inteiro e uma chave por INEP, placa ou dispositivo quando houver paralelismo interno.
7. **Registre duração e resultado.** Logs devem distinguir: pendência encontrada, aceite HTTP, processamento físico e reconciliação.

### Checklist de implementação

- Qual sistema é a fonte de verdade para este campo?
- A operação é uma consulta, um comando ou uma reconciliação?
- O `2xx` significa aceite ou conclusão?
- A repetição da chamada produz o mesmo resultado?
- Qual estado mantém o item elegível para retry?
- O processamento assíncrono pode sobreviver ao retorno do método agendado?
- Existe uma view e uma migração Flyway cobrindo a nova divergência?
- Há logs suficientes para localizar o item por aluno, INEP, placa ou dispositivo?

## Referências no monorepo

```text
educacao-api/src/main/java/br/com/educacao/timers/
  ConfiguracaoTimerAlunoPresenteBaseService.java

alunopresente-service/src/main/java/br/com/alunopresenteservice/domain/integracao/service/
  IntegracaoBaseService.java

alunopresente-service/src/main/java/br/com/alunopresenteservice/domain/integracaobase/
  service/EnviarFotoAlunoBaseService.java
  repository/IEnviarFotoAlunoBaseRepository.java

base-api/src/main/java/br/com/base/batch/config/
  EnviarFotoBatchConfig.java
  RemoverFotoBatchConfig.java
  RemocaoCompletaFaceBatchConfig.java

integracao-sql/src/main/resources/db/migration/integracaosqlalunopresente/view/
```
