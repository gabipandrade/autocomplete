# Justarter

Aplicação de autocompletar com React, GraphQL, Fastify e PostgreSQL.

## Executando o PostgreSQL, o backend e o GraphQL

É necessário ter Docker e Docker Compose instalados.

Entre na pasta da aplicação:

```bash
cd justarter
```

Suba o PostgreSQL, o backend Fastify e o GraphQL Gateway:

```bash
docker compose up -d --build postgres backend graphql-gateway
```

O backend aguarda o PostgreSQL ficar disponível e executa automaticamente:

1. As migrations do banco.
2. O seed com as sugestões iniciais.

Confira se os serviços estão rodando:

```bash
docker compose ps
```

Os serviços ficam disponíveis em:

- GraphQL Gateway: `http://localhost:4000`
- Backend Fastify: `http://localhost:3001`
- PostgreSQL: `localhost:5434`

Credenciais do PostgreSQL:

```text
Banco: justarter
Usuário: postgres
Senha: postgres
```

## Testando o backend

### Healthcheck

```bash
curl http://localhost:3001/health
```

Resposta esperada:

```json
{"status":"ok"}
```

### Buscar sugestões

```bash
curl "http://localhost:3001/suggestions?q=danos"
```

O parâmetro `q` é obrigatório. A busca:

- normaliza espaços e letras maiúsculas;
- retorna uma lista vazia para termos com menos de 4 caracteres;
- busca termos pelo prefixo informado;
- ordena por popularidade e, em caso de empate, por ordem alfabética;
- retorna no máximo 20 sugestões.

Também é possível informar um limite entre 1 e 20:

```bash
curl "http://localhost:3001/suggestions?q=danos&limit=1"
```

Exemplo de resposta:

```json
[
  {
    "id": 23,
    "term": "danos morais",
    "popularity": 110,
    "createdAt": "2026-07-28T16:33:48.183Z"
  }
]
```

### Casos de validação

Termos com menos de 4 caracteres retornam uma lista vazia:

```bash
curl "http://localhost:3001/suggestions?q=abc"
```

Parâmetros ausentes ou inválidos retornam HTTP 400:

```bash
curl -i "http://localhost:3001/suggestions"
curl -i "http://localhost:3001/suggestions?q=danos&limit=21"
```

## Testando o GraphQL Gateway

O frontend deve acessar o GraphQL Gateway, que consulta o backend Fastify.

Fluxo:

```text
Frontend → GraphQL Gateway → Backend Fastify → PostgreSQL
```

### Query de sugestões

```graphql
type Suggestion {
  id: ID!
  term: String!
  popularity: Int!
  createdAt: String!
}

type Query {
  suggestions(query: String!, limit: Int = 20): [Suggestion!]!
}
```

O argumento `query` é obrigatório. `limit` é opcional e nunca ultrapassa 20.

Teste a query:

```bash
curl http://localhost:4000/ \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query($query: String!, $limit: Int) { suggestions(query: $query, limit: $limit) { id term popularity createdAt } }",
    "variables": {
      "query": "danos",
      "limit": 2
    }
  }'
```

Exemplo de resposta:

```json
{
  "data": {
    "suggestions": [
      {
        "id": "23",
        "term": "danos morais",
        "popularity": 110,
        "createdAt": "2026-07-28T16:33:48.183Z"
      },
      {
        "id": "22",
        "term": "danos materiais",
        "popularity": 96,
        "createdAt": "2026-07-28T16:33:48.183Z"
      }
    ]
  }
}
```

Termos com menos de 4 caracteres retornam uma lista vazia. Se o backend estiver
indisponível ou exceder o timeout, o gateway também retorna uma lista vazia.

O timeout padrão da comunicação com o backend é de 2 segundos e pode ser
alterado pela variável `BACKEND_TIMEOUT_MS`.

O schema mantém temporariamente `suggestionById` e `createSuggestion`, mas o
backend atual não oferece essas operações. Elas retornam `null` até serem
implementadas ou removidas.

## Executando os testes automatizados

### Backend

```bash
cd backend
npm install
npm run lint
npm run build
npm test
cd ..
```

O backend possui 11 testes do repository, do serviço e das rotas Fastify.

### GraphQL Gateway

```bash
cd graphql-gateway
npm install
npm run lint
npm run build
npm test
cd ..
```

O gateway possui 10 testes do cliente HTTP, dos resolvers e da query GraphQL.

### Frontend

```bash
cd frontend
npm install
npm run lint
npm run build
npm test
cd ..
```

O frontend possui lint, teste de componente e build de produção configurados.

## Integração contínua

O workflow `.github/workflows/ci.yml` é executado em:

- todo Pull Request;
- todo push na branch `main`.

A CI cria jobs independentes para backend, GraphQL Gateway e frontend. Cada job
instala as dependências pelo lockfile e executa lint, testes e build. Um job
adicional valida o arquivo `docker-compose.yml`.

Para tornar a CI obrigatória antes de integrar um Pull Request, configure a
proteção da branch `main` no GitHub e selecione os jobs da CI como verificações
obrigatórias.

## Consultando o PostgreSQL

Liste as sugestões ordenadas por popularidade:

```bash
docker compose exec postgres psql -U postgres -d justarter \
  -c "SELECT id, term, popularity FROM suggestions ORDER BY popularity DESC LIMIT 20;"
```

Abra o terminal interativo do PostgreSQL:

```bash
docker compose exec postgres psql -U postgres -d justarter
```

Para sair do terminal, digite:

```text
\q
```

## Logs

Para acompanhar a inicialização, as migrations e as requisições:

```bash
docker compose logs -f backend graphql-gateway
```

## Encerrando

Pare os serviços sem apagar os dados:

```bash
docker compose down
```

Para apagar o banco e recriá-lo do zero:

```bash
docker compose down -v
docker compose up -d --build postgres backend graphql-gateway
```

O comando `docker compose down -v` remove permanentemente o volume local do PostgreSQL.
