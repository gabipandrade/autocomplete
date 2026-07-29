# Decisões e histórico

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

- Migration SQL e registro das execuções em `schema_migrations`.
- Migration e seed executados separadamente e dentro de transações.
- `ON CONFLICT DO NOTHING` para impedir duplicações no seed.
- Índice B-tree em `lower(term) text_pattern_ops` para buscas por prefixo.
- Sugestões do domínio jurídico.

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
- Seed inicial confirmado com 40 sugestões, sem duplicações.
- Índice validado como elegível para a consulta por prefixo.
- Inicialização automática validada com Docker Compose.

### Melhorias futuras

- Calcular `popularity` com base no uso real.
- Avaliar `pg_trgm` e `unaccent` para erros de digitação e busca sem acentos.

---

## Etapa 3 — Backend Fastify

Implementei o backend usando Fastify e separei domínio,
repository, serviço e rotas.

### Uso de IA

**Pergunta:** como implementar o backend Fastify com healthcheck, repository,
serviço de busca, normalização, limite de 20 resultados, validação e testes?

**O que aceitei:**

- Função `buildApp` com injeção de dependências para facilitar testes.
- JSON Schema do Fastify para validar `q`, `limit` e a resposta.
- Normalização Unicode, remoção de espaços excedentes e conversão para
  minúsculas.
- Lista vazia para termos com menos de 4 caracteres.
- Ordenação por popularidade e, em caso de empate, por ordem alfabética.
- Escape de curingas do `LIKE` e mensagens seguras para erros internos.
- Encerramento controlado do servidor e do pool de conexões.

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
- 11 testes aprovados entre repository, serviço e rotas.
- Healthcheck e busca validados com Fastify, Docker e PostgreSQL reais.
- Termo curto retornou lista vazia.
- Limite acima de 20 retornou HTTP 400.

### Melhorias futuras

- Automatizar testes de integração com PostgreSQL no CI.

---

## Etapa 4 — GraphQL Gateway

### Uso de IA

**Pergunta:** como estruturar o Apollo Server, o cliente HTTP, os resolvers e os
testes mantendo o limite de 20 sugestões e um timeout adequado ao autocomplete?

**O que aceitei:**

- Adotar `suggestions(query: String!, limit: Int = 20)`.
- Manter no tipo `Suggestion` os campos `id`, `term`, `popularity` e
  `createdAt`.
- Utilizar timeout configurável, com padrão de 2 segundos.
- Separar a criação do Apollo Server para permitir testes da query sem abrir
  uma porta de rede.
- Criar um cliente HTTP injetável.
- Normalizar o termo e limitar o valor solicitado a 20 antes de chamar o
  backend.

**O que alterei:**

- Substituí o argumento `q` por `query` e adicionei `limit` com padrão 20.
- Alterei o cliente para usar a rota canônica `/suggestions`.
- Reduzi o log de falhas HTTP para código e mensagem, evitando imprimir o
  objeto completo do Axios.
- Decidi antecipar uma parte da etapa de CI para validar o gateway durante esta entrega.

**O que rejeitei:**

- A IA sugeriu retornar um erro GraphQL quando o backend estivesse
  indisponível. Decidi retornar `[]`.
- A IA sugeriu remover `suggestionById` e `createSuggestion` por não fazerem
  parte do autocomplete. Decidi mantê-los temporariamente.

### Validações executadas

- Build TypeScript concluído sem erros.
- 10 testes aprovados entre cliente HTTP, resolvers e query GraphQL.
- Validação do gateway na CI concluída com sucesso.
- Query com termo e limite validada no fluxo GraphQL → Fastify → PostgreSQL.
- Termo com menos de 4 caracteres retornou uma lista vazia.
- Com o backend interrompido, o gateway também retornou uma lista vazia.

---

## Etapa 5 — Frontend React
Implementei a parte visual da interface de autocomplete

### Uso de IA

**Pergunta:** como implementar o autocomplete com React e Apollo Client,
seguindo a referência visual e evitando consultas e respostas desnecessárias?

**O que aceitei:**

- Debounce de 250 ms.
- Proteção contra respostas antigas e navegação por teclado.

**O que alterei:**

- Do código `starter/suggestions.js`, mantive apenas a regra dos quatro
  caracteres. A lista terá até 20 itens, com cerca de 10 visíveis antes do
  scroll, em vez de descartar os demais com `slice(0, 10)`.
- Após o teste manual com `acao`, tornei a busca do backend indiferente a
  acentos e mantive o termo original na resposta.

**O que rejeitei:**

- A IA sugeriu manter o layout escuro existente. Preferi uma interface clara e simples, semelhante à referência do desafio.

### Validações executadas

- Lint e build concluídos sem erros.
- 9 testes aprovados, incluindo debounce, limite, seleção e resposta antiga.
- 12 testes do backend aprovados e novo índice confirmado na busca sem acento.
- Layout conferido em dimensões desktop e mobile.
- Digitação, atualização e seleção validadas no Chrome com os serviços em
  Docker.
- Seed ampliado para 75 termos; a busca por `acao` renderizou 20 opções, com 10
  visíveis antes do scroll.


