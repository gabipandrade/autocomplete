## Planejamento — decisão de stack do backend

**Prompt utilizado:**

> Assuma o papel de um Arquiteto de Software sênior. Estou participando do
> desafio técnico Justarter para o Jusbrasil e preciso de ajuda para decidir
> a stack de tecnologias do backend. As regras e restrições do desafio são
> as seguintes: o frontend deve ser feito obrigatoriamente em ReactJS; o
> frontend deve se comunicar obrigatoriamente com uma camada GraphQL; o
> GraphQL deve se comunicar com o backend; a linguagem do backend é de
> minha preferência; o armazenamento das sugestões é livre (banco open
> source, JSON, etc.), mas precisa ser populado de forma automatizada; o
> ambiente deve ser orquestrado preferencialmente de maneira simples usando
> `docker compose up`; o sistema é um autocompletar dinâmico — as sugestões
> devem ser exibidas na mesma velocidade que o usuário digita (alta
> necessidade de performance de leitura). Com base nesse cenário, quais
> linguagens e frameworks você me aconselha a utilizar para construir o
> backend e a interface GraphQL?

**Resposta obtida:**

```
Frontend: React + Vite + Apollo Client (ou urql)
GraphQL:  Apollo Server / GraphQL Yoga (Node + TS)
Backend:  a própria camada de resolvers do Apollo Server, consultando o
          banco diretamente — ou separado em serviço próprio, se eu
          quisesse demonstrar a separação GraphQL → Backend
DB:       SQLite
Testes:   Vitest / Jest
CI:       GitHub Actions
```

**O que aceitei:**
- Frontend com React + Vite + Apollo Client.
- GraphQL com Apollo Server em Node/TypeScript.
- Vitest para testes e GitHub Actions para CI.

**O que alterei:**
- Troquei o banco sugerido (SQLite) por **PostgreSQL**. Motivo: SQLite
  resolve bem o escopo atual, mas Postgres abre mais possibilidades de
  evolução futura sem reescrever a camada de dados, por exemplo, um
  autocomplete tolerante a erro de digitação usando a extensão
  `pg_trgm`, algo que SQLite não oferece nativamente.

**O que rejeitei:**
- Usar o próprio GraphQL como camada de Backend, resolvendo direto no
  banco. Essa era a sugestão original da IA e cheguei a aceitá-la
  inicialmente por simplicidade, mas reconsiderei ao revisar o diagrama do
  desafio (`Frontend → GraphQL → Backend`), que trata as duas como camadas
  distintas. Separei em dois serviços: um `graphql-gateway`, responsável
  apenas por traduzir a query GraphQL em uma chamada HTTP, e um `backend`
  próprio, implementado com Express, responsável pelas regras de negócio e
  pelo acesso ao banco. Essa separação deixa mais clara a responsabilidade
  de cada camada.

---

## Etapa 2 — Banco de dados PostgreSQL

Após configurar o ambiente e a estrutura do repositório, implementei a
persistência das sugestões com PostgreSQL. O objetivo desta etapa foi criar uma
tabela simples e adequada ao escopo do autocomplete, com migration, índice para
busca por prefixo, seed automatizado e pool de conexões.

### Uso de IA

#### Prompt utilizado

> Analise o desafio técnico, o TASKS.md e a estrutura existente do projeto.
> Implemente somente as tarefas relacionadas ao banco de dados, seguindo a ordem
> planejada. A tabela deve conter identificador, texto e uma forma de ordenar os
> dados. Configure PostgreSQL, migration inicial, índice para busca por prefixo,
> seed idempotente e pool de conexões. Preserve as decisões e os padrões
> existentes no projeto e valide a migration e o seed em um banco vazio.

#### O que aceitei

- A criação de uma migration SQL inicial para manter o esquema versionado.
- A separação entre os comandos de migration e seed:
  - `npm run migrate`
  - `npm run seed`
  - `npm run db:setup`
- O uso de `ON CONFLICT DO NOTHING` no seed, tornando sua execução idempotente.
- A criação de um índice B-tree funcional com
  `lower(term) text_pattern_ops`, adequado para buscas por prefixo sem
  diferenciar letras maiúsculas de minúsculas.
- O uso de sugestões relacionadas ao domínio jurídico, mantendo coerência com ocontexto do Jusbrasil.

Essas decisões permitem recriar e popular o banco automaticamente.

#### O que alterei após revisar a implementação

A estrutura inicial utilizava o nome `count` para representar a relevância
de cada sugestão. Apesar de tecnicamente funcional, o nome era ambíguo, pois
poderia ser interpretado como a quantidade de resultados retornados.

Renomeei o campo para `popularity`, deixando explícito que seu valor representa
a popularidade usada na ordenação das sugestões.

Durante a validação, identifiquei que uma instância local do PostgreSQL já
utilizava a porta `5432`. Isso fez o script executado pelo host se conectar ao
banco errado e retornar o erro de autenticação `28P01`. Para evitar o conflito,
alterei a porta publicada pelo projeto para `5434`. Dentro da rede Docker, o
PostgreSQL continua utilizando a porta padrão `5432`.

#### O que rejeitei

- Rejeitei manter uma segunda migration criada apenas para renomear `count` para
  `popularity`. Como ainda não havia uma versão publicada do banco, consolidei o
  nome correto na migration inicial.
- Rejeitei utilizar `pg_trgm` nesta etapa inicial onde os requisitos minimos não foram atingidos ainda, que serviria para uma busca que considera erros de digitação.

### Estrutura implementada

- `backend/db/migrations/001_create_suggestions.sql`
  - Cria a tabela `suggestions`, suas constraints e o índice de prefixo.
- `backend/db/seed.sql`
  - Contém 40 sugestões do domínio jurídico.
- `backend/src/migrate.ts`
  - Executa as migrations pendentes em ordem, dentro de transações, e registra
    cada execução na tabela `schema_migrations`.
- `backend/src/seed.ts`
  - Executa o seed dentro de uma transação.
- `backend/src/db.ts`
  - Configura o pool de conexões e seus timeouts.
- `docker-compose.yml`
  - Configura o PostgreSQL, o volume persistente, o healthcheck e a preparação
    automática do banco.

### Testes executados

#### Migration e seed em banco vazio

Criei o banco temporário vazio `justarter_fresh_validation` e executei:

```bash
PGHOST=localhost \
PGPORT=5434 \
PGUSER=postgres \
PGPASSWORD=postgres \
PGDATABASE=justarter_fresh_validation \
npm run db:setup
```

A migration `001_create_suggestions.sql` e o seed foram aplicados com sucesso.
Depois da validação, removi o banco temporário.

#### Verificação da estrutura

Consultei as colunas criadas na tabela:

```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'suggestions'
ORDER BY ordinal_position;
```

Resultado:

```text
 column_name |        data_type
-------------+--------------------------
 id          | bigint
 term        | character varying
 popularity  | integer
 created_at  | timestamp with time zone
```

#### Verificação dos dados inseridos

Executei a consulta abaixo para confirmar que o seed populou a tabela e para
visualizar os registros ordenados por popularidade:

```bash
docker compose exec postgres psql -U postgres -d justarter \
  -c "SELECT id, term, popularity FROM suggestions ORDER BY popularity DESC LIMIT 5;"
```

Resultado:

```text
 id |         term          | popularity
----+-----------------------+------------
 23 | danos morais          |        110
 34 | pensão alimentícia    |        108
 25 | direito do consumidor |        105
 40 | violência doméstica   |        102
  5 | ação de indenização   |        100
```

Também confirmei a quantidade total de sugestões:

```sql
SELECT count(*) AS suggestions
FROM suggestions;
```

O resultado foi `40`.


#### Uso do índice

Executei um `EXPLAIN` com uma busca por prefixo:

```sql
SET enable_seqscan = off;

EXPLAIN
SELECT id, term
FROM suggestions
WHERE lower(term) LIKE 'ação%';
```

Como a tabela de teste contém poucos registros, desabilitei temporariamente a
varredura sequencial nessa sessão para verificar se o índice era elegível para
esse formato de consulta. O plano retornado utilizou
`idx_suggestions_term_prefix`. Essa configuração foi utilizada somente no
teste e não foi aplicada ao banco da aplicação.

#### Execução com Docker Compose

Executei:

```bash
docker compose up -d --build
```

O PostgreSQL iniciou com status `healthy`, e o backend executou migration e seed
automaticamente antes de iniciar.

### Ideias para uma próxima etapa

As melhorias abaixo não foram implementadas:

- Registrar eventos de seleção das sugestões para calcular `popularity` com
  base no uso real, em vez de utilizar somente os valores definidos no seed.
- Avaliar `pg_trgm` e `unaccent` para que a busca fique mais completa e passe a suportar
  erros de digitação e buscas equivalentes com ou sem acentos.
