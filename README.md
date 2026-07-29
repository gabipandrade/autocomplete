# Justarter

Aplicação de autocompletar com React, GraphQL, Fastify e PostgreSQL.

## Arquitetura

```text
React → GraphQL Gateway → Backend Fastify → PostgreSQL
```

- O frontend renderiza o autocomplete e acessa somente o GraphQL Gateway.
- O gateway expõe o schema GraphQL e chama a API REST do backend.
- O backend aplica validações, regras de busca e acesso ao banco.
- O PostgreSQL armazena e ordena as sugestões por popularidade.

## Executando a aplicação

É necessário ter Docker e Docker Compose instalados.

Entre na pasta da aplicação:

```bash
cd justarter
```

Suba o frontend, o GraphQL Gateway, o backend Fastify e o PostgreSQL:

```bash
docker compose up -d --build
```

O backend aguarda o PostgreSQL ficar disponível e executa automaticamente:

1. As migrations do banco.
2. O seed idempotente com 75 sugestões jurídicas.

Confira se os serviços estão rodando:

```bash
docker compose ps
```

Os serviços ficam disponíveis em:

- Frontend: `http://localhost:5173`
- GraphQL Gateway: `http://localhost:4000`

O backend e o PostgreSQL ficam acessíveis somente na rede interna do Docker.

### Variáveis de ambiente

Os valores padrão funcionam sem configuração. Para personalizá-los:

```bash
cp .env.example .env
```

| Variável | Finalidade | Padrão |
| --- | --- | --- |
| `POSTGRES_DB` | Nome do banco | `justarter` |
| `POSTGRES_USER` | Usuário do banco | `postgres` |
| `POSTGRES_PASSWORD` | Senha do banco | `postgres` |
| `PGPOOL_MAX` | Máximo de conexões no pool | `10` |
| `PG_IDLE_TIMEOUT_MS` | Timeout de conexão ociosa | `30000` |
| `PG_CONNECTION_TIMEOUT_MS` | Timeout para abrir conexão | `5000` |
| `BACKEND_TIMEOUT_MS` | Timeout do gateway para o backend | `2000` |
| `GATEWAY_PORT` | Porta pública do GraphQL | `4000` |
| `FRONTEND_PORT` | Porta pública do frontend | `5173` |
| `VITE_GRAPHQL_URL` | URL GraphQL usada pelo frontend | `http://localhost:4000/` |

Credenciais do PostgreSQL:

```text
Banco: justarter
Usuário: postgres
Senha: postgres
```

## Testando o backend

### Healthcheck

```bash
docker compose exec -T backend \
  wget -qO- http://localhost:3001/health
```

Resposta esperada:

```json
{"status":"ok"}
```

### Buscar sugestões

```bash
docker compose exec -T backend \
  wget -qO- "http://localhost:3001/suggestions?q=danos"
```

O parâmetro `q` é obrigatório. A busca:

- normaliza espaços e letras maiúsculas;
- aceita a busca com ou sem acentos;
- retorna uma lista vazia para termos com menos de 4 caracteres;
- busca termos pelo prefixo informado;
- ordena por popularidade e, em caso de empate, por ordem alfabética;
- retorna no máximo 20 sugestões.

Também é possível informar um limite entre 1 e 20:

```bash
docker compose exec -T backend \
  wget -qO- "http://localhost:3001/suggestions?q=danos&limit=1"
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
docker compose exec -T backend \
  wget -qO- "http://localhost:3001/suggestions?q=abc"
```

Parâmetros ausentes ou inválidos retornam HTTP 400:

```bash
docker compose exec -T backend \
  wget -S -O- "http://localhost:3001/suggestions"

docker compose exec -T backend \
  wget -S -O- "http://localhost:3001/suggestions?q=danos&limit=21"
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

## Testando o frontend

Acesse `http://localhost:5173` e digite pelo menos quatro caracteres, como
`ação`, `acao` ou `danos`. As sugestões aparecem automaticamente após 250 ms.

A lista exibe aproximadamente 10 itens antes do scroll e recebe no máximo 20
resultados. É possível selecionar uma sugestão com mouse, toque ou com as teclas
`↑`, `↓` e `Enter`. A tecla `Escape` fecha a lista.

## Executando os testes automatizados

### Backend

```bash
cd backend
npm ci
npm run lint
npm run build
npm test
cd ..
```

O backend possui 12 testes do repository, do serviço e das rotas Fastify.

### GraphQL Gateway

```bash
cd graphql-gateway
npm ci
npm run lint
npm run build
npm test
cd ..
```

O gateway possui 10 testes do cliente HTTP, dos resolvers e da query GraphQL.

### Frontend

```bash
cd frontend
npm ci
npm run lint
npm run build
npm test
cd ..
```

O frontend possui 9 testes dos principais comportamentos do autocomplete.

## Integração contínua

O workflow `.github/workflows/ci.yml` é executado em:

- todo Pull Request;
- todo push na branch `main`.

A CI cria jobs independentes para backend, GraphQL Gateway e frontend. Cada job
instala as dependências pelo lockfile e executa lint, testes e build. O job de
integração constrói o Compose, aguarda os healthchecks e valida migrations,
seed idempotente, frontend e query GraphQL.

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
docker compose up -d --build
```

O comando `docker compose down -v` remove permanentemente o volume local do PostgreSQL.
