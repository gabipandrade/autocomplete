# Decisões e histórico

## Visão geral

Este projeto implementa um autocomplete de termos jurídicos com quatro
camadas:

```text
Frontend React
      ↓ GraphQL
Apollo Gateway
      ↓ HTTP
Backend Fastify
      ↓ SQL
PostgreSQL
```

O ambiente completo pode ser iniciado com Docker Compose. As principais
decisões foram separar o gateway do backend, usar PostgreSQL para persistência,
realizar buscas por prefixo sem diferenciar maiúsculas de minúsculas nem
acentos e automatizar migrations e seed.

## Organização das entregas

| Etapa do `TASKS.md` | Pull Request | Resultado |
| --- | --- | --- |
| PostgreSQL | [PR #10](https://github.com/gabipandrade/autocomplete/pull/10) | Migration, seed, índice e pool |
| Backend Fastify | [PR #11](https://github.com/gabipandrade/autocomplete/pull/11) | API, repository, serviço e testes |
| GraphQL Gateway | [PR #12](https://github.com/gabipandrade/autocomplete/pull/12) | Schema, resolver, cliente HTTP e testes |
| Frontend React | [PR #13](https://github.com/gabipandrade/autocomplete/pull/13) | Interface e autocomplete |
| Docker Compose | [PR #14](https://github.com/gabipandrade/autocomplete/pull/14) | Integração e inicialização dos serviços |
| CI e validação final | [PR #15](https://github.com/gabipandrade/autocomplete/pull/15) | Esteira completa e validação do fluxo |

Os Pull Requests acompanharam as etapas principais do `TASKS.md`, mas algumas
microtarefas relacionadas foram agrupadas na mesma entrega. Em uma próxima
implementação, eu separaria melhor alterações de infraestrutura, regras de
negócio e testes.

## Planejamento da stack

### Uso de IA

**Pergunta:** qual stack utilizar para um autocomplete com React, GraphQL,
backend separado, persistência automatizada e execução com Docker Compose?

**O que aceitei:**

- React, Vite e Apollo Client no frontend.
- Apollo Server com Node.js e TypeScript no gateway.
- Vitest para testes e GitHub Actions para CI.

**O que alterei:**

- Substituí o SQLite sugerido por PostgreSQL, pensando em possíveis evoluções
  de busca e mantendo uma tecnologia adequada para produção.

**O que rejeitei:**

- Rejeitei acessar o banco diretamente pelo GraphQL. Mantive o fluxo solicitado
  no desafio: frontend → GraphQL → backend → PostgreSQL.

---

## Etapa 2 — PostgreSQL

Implementei a tabela de sugestões, migration, seed idempotente, índice para
prefixo, pool de conexões e preparação automática do banco.

### Uso de IA

**Pergunta:** como estruturar PostgreSQL, migration, índice de prefixo, seed
idempotente e pool de conexões respeitando a arquitetura existente?

**O que aceitei:**

- Migration SQL e registro das execuções em `schema_migrations`, para manter um
  histórico das versões já aplicadas.
- Migration e seed executados separadamente e dentro de transações, evitando
  alterações parciais em caso de falha.
- `ON CONFLICT DO NOTHING`, para permitir a repetição do seed sem duplicar
  sugestões.
- Índice B-tree em `lower(term) text_pattern_ops`, adequado à busca por prefixo
  usada pela aplicação.
- Sugestões do domínio jurídico, porque representam melhor o uso esperado do
  autocomplete.

**O que alterei:**

- Renomeei `count` para `popularity`, pois o nome anterior não deixava clara a
  finalidade do campo.
- Consolidei a renomeação na migration inicial, pois o banco ainda não havia
  sido publicado.
- Alterei a porta externa do PostgreSQL para `5434` após encontrar outra
  instância local utilizando `5432`.

**O que rejeitei:**

- A IA criou uma segunda migration para renomear `count` para `popularity`.
  Decidi não mantê-la porque ainda não existia uma versão publicada do banco e
  consolidei o nome correto na migration inicial.
- Diante do erro de autenticação, a IA sugeriu alterar manualmente a senha do
  PostgreSQL ou recriar o volume. Não mantive essas soluções porque o problema
  real era um conflito com outra instância na porta `5432`; corrigi a porta do
  projeto para `5434`.

### Validações executadas

- Migration e seed aplicados em banco temporário vazio.
- Estrutura da tabela conferida.
- Seed inicial confirmado com 40 sugestões, sem duplicações. Durante os testes
  do frontend, ele foi ampliado para 75 termos para validar o limite de
  resultados e o scroll.
- Índice validado como elegível para a consulta por prefixo.
- Inicialização automática validada com Docker Compose.

### Melhorias futuras

- Calcular `popularity` com base no uso real.
- Avaliar `pg_trgm` para tolerar erros de digitação.

---

## Etapa 3 — Backend Fastify

Implementei o backend usando Fastify e separei domínio,
repository, serviço e rotas.

### Uso de IA

**Pergunta:** como implementar o backend Fastify com healthcheck, repository,
serviço de busca, normalização, limite de 20 resultados, validação e testes?

**O que aceitei:**

- Função `buildApp` com injeção de dependências, porque permite testar a
  aplicação sem depender de um banco real em todos os casos.
- JSON Schema do Fastify para validar `q`, `limit` e a resposta na própria
  fronteira da API.
- Normalização Unicode, remoção de espaços excedentes e conversão para
  minúsculas, garantindo um termo consistente para a busca.
- Lista vazia para termos com menos de 4 caracteres, evitando uma consulta
  desnecessária ao banco.
- Ordenação por popularidade e, em caso de empate, por ordem alfabética, para
  manter resultados relevantes e previsíveis.
- Escape de curingas do `LIKE` e mensagens seguras para erros internos, para
  evitar que a entrada altere o padrão de busca ou exponha detalhes internos.
- Encerramento controlado do servidor e do pool de conexões, evitando conexões
  abertas durante o desligamento.

**O que alterei:**

- Removi SQL e regras de negócio das rotas, movendo cada responsabilidade para
  o repository ou para o serviço.
- Substituí testes antigos que não exercitavam a API por testes com
  `app.inject`.
- Ajustei o TypeScript para compilar somente `src`.
- Converti o `BIGINT` retornado pelo PostgreSQL para número e a data para ISO.

**O que rejeitei:**

- A IA sugeriu, como melhoria opcional, fazer o healthcheck consultar também o
  PostgreSQL. Decidi não incluir essa verificação nesta etapa porque a tarefa
  solicita apenas o healthcheck da aplicação, enquanto o banco já possui seu
  próprio healthcheck no Docker Compose.
- Não houve outras sugestões relevantes da IA rejeitadas nesta etapa. As demais
  foram aceitas ou ajustadas durante a revisão.

### Validações executadas

- Build TypeScript concluído sem erros.
- 12 testes aprovados entre repository, serviço e rotas.
- Healthcheck e busca validados com Fastify, Docker e PostgreSQL reais.
- Termo curto retornou lista vazia.
- Limite acima de 20 retornou HTTP 400.

### Melhorias futuras

- Ampliar os testes de integração para falhas de conexão com o PostgreSQL.

---

## Etapa 4 — GraphQL Gateway

### Uso de IA

**Pergunta:** como estruturar o Apollo Server, o cliente HTTP, os resolvers e os
testes mantendo o limite de 20 sugestões e um timeout adequado ao autocomplete?

**O que aceitei:**

- Adotar `suggestions(query: String!, limit: Int = 20)`, deixando explícitos o
  termo obrigatório e o limite padrão.
- Manter no tipo `Suggestion` os campos `id`, `term`, `popularity` e
  `createdAt`, acompanhando o contrato já oferecido pelo backend.
- Utilizar timeout configurável, com padrão de 2 segundos, para evitar que uma
  falha no backend deixe o autocomplete aguardando indefinidamente.
- Separar a criação do Apollo Server para permitir testes da query sem abrir
  uma porta de rede.
- Criar um cliente HTTP injetável, facilitando o isolamento dos resolvers nos
  testes.
- Normalizar o termo e limitar o valor solicitado a 20 antes de chamar o
  backend, evitando encaminhar entradas desnecessárias ou inválidas.

**O que alterei:**

- Substituí o argumento `q` por `query` e adicionei `limit` com padrão 20.
- Alterei o cliente para usar a rota canônica `/suggestions`.
- Reduzi o log de falhas HTTP para código e mensagem, evitando imprimir o
  objeto completo do Axios.
- Decidi antecipar uma parte da etapa de CI para validar o gateway durante esta entrega.

**O que rejeitei:**

- A IA sugeriu retornar um erro GraphQL quando o backend estivesse
  indisponível. Para esta implementação, decidi retornar `[]` para não
  interromper o autocomplete com uma mensagem a cada falha temporária.
  Reconheço que isso não diferencia indisponibilidade de ausência de
  resultados. Em produção, registraria a falha em logs e métricas e avaliaria
  um estado específico de indisponibilidade.
- A IA sugeriu remover `suggestionById` e `createSuggestion` por não fazerem
  parte do autocomplete. Decidi mantê-los temporariamente porque já faziam
  parte da estrutura inicial e a remoção aumentaria o escopo dessa etapa. Antes
  da produção, eu os removeria para reduzir a superfície da API.

### Validações executadas

- Build TypeScript concluído sem erros.
- 10 testes aprovados entre cliente HTTP, resolvers e query GraphQL.
- Validação do gateway na CI concluída com sucesso.
- Query com termo e limite validada no fluxo GraphQL → Fastify → PostgreSQL.
- Termo com menos de 4 caracteres retornou uma lista vazia.
- Com o backend interrompido, o gateway também retornou uma lista vazia.

---

## Etapa 5 — Frontend React

Implementei a parte visual da interface de autocomplete.

### Uso de IA

**Pergunta:** como implementar o autocomplete com React e Apollo Client,
seguindo a referência visual e evitando consultas e respostas desnecessárias?

**O que aceitei:**

- Debounce de 250 ms, porque reduz requisições durante a digitação sem gerar
  uma espera perceptível.
- Proteção contra respostas antigas, porque uma requisição lenta não deve
  substituir os resultados de uma pesquisa mais recente.
- Navegação por teclado, porque o autocomplete não deve depender somente do
  mouse.

**O que alterei:**

- Do código `starter/suggestions.js`, mantive apenas a regra dos quatro
  caracteres. A lista terá até 20 itens, com cerca de 10 visíveis antes do
  scroll, em vez de descartar os demais com `slice(0, 10)`.
- Após o teste manual com `acao`, tornei a busca do backend indiferente a
  acentos e mantive o termo original na resposta.

**O que rejeitei:**

- A IA sugeriu manter o layout escuro existente. Preferi uma interface clara e
  simples, semelhante à referência do desafio.

### Análise do `starter/suggestions.js`

#### O que eu manteria

Manteria o retorno antecipado para termos com menos de quatro caracteres. Além
de evitar uma requisição desnecessária, `setSuggestions([])` remove da tela os
resultados da pesquisa anterior.

#### O que eu faria diferente

Não usaria `fetch` diretamente nesse arquivo. Como o projeto utiliza GraphQL,
preferi centralizar a comunicação no Apollo Client e enviar o termo como
variável da query. Também não manteria `slice(0, 10)`, pois ele descarta
resultados que deveriam continuar disponíveis pelo scroll.

Acrescentei um debounce para não fazer uma requisição a cada tecla digitada.

#### O que eu mudaria antes da produção

Trataria erros de rede e respostas inválidas e impediria que uma resposta lenta
de uma pesquisa antiga substituísse a atual. Também incluiria estado de
carregamento, testes automatizados, navegação por teclado e atributos ARIA.

---

## Etapa 6 — Docker Compose

Configurei healthchecks, dependências, volume e variáveis. Mantive públicas
somente as portas do frontend e do gateway.

### Uso de IA

- **Pergunta:** como fazer o Compose iniciar todos os serviços com segurança?
- **Aceitei:** healthchecks, dependências saudáveis e integração na CI.
- **Alterei:** removi do host as portas do backend e do banco.
- **Rejeitei:** não houve sugestão relevante rejeitada nesta correção.

O ambiente limpo subiu com migrations, seed e 75 sugestões. O fluxo completo
retornou 20 resultados para `acao`.

### Validação final

- 31 testes, lints e builds aprovados.
- Backend Fastify: 12 testes.
- GraphQL Gateway: 10 testes.
- Frontend React: 9 testes, incluindo termo mínimo, atualização dinâmica,
  seleção, destaque do prefixo e ausência de resultados.
- Docker, migrations, seed e fluxo completo aprovados.
- Comportamentos do autocomplete validados em desktop e mobile.

### O que eu faria se tivesse tempo

- Melhoraria o algoritmo de busca para identificar erros de digitação e sugerir
  termos semelhantes.
- Aprimoraria o frontend com funcionalidades adicionais, como modo noturno.
- Adicionaria mais campos ao banco de dados para apresentar informações mais
  completas nos resultados da pesquisa.

### O que eu faria diferente

- Faria commits menores e mais frequentes para facilitar a leitura do histórico.
  Embora os pull requests tenham sido detalhados,  fiz apenas um
  commit depois de concluir cada etapa principal.
