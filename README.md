# Justarter

Aplicação de autocompletar com React, GraphQL, Fastify e PostgreSQL.

## Executando o PostgreSQL e o backend

É necessário ter Docker e Docker Compose instalados.

Entre na pasta da aplicação:

```bash
cd justarter
```

Suba o PostgreSQL e o backend:

```bash
docker compose up -d --build postgres backend
```

O backend aguarda o PostgreSQL ficar disponível e executa automaticamente:

1. As migrations do banco.
2. O seed com as sugestões iniciais.

Confira se os serviços estão rodando:

```bash
docker compose ps
```

Os serviços ficam disponíveis em:

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

## Executando os testes automatizados

```bash
cd backend
npm install
npm run build
npm test
cd ..
```

O backend possui testes do repository, do serviço de busca e das rotas Fastify.

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
docker compose logs -f backend
```

## Encerrando

Pare os serviços sem apagar os dados:

```bash
docker compose down
```

Para apagar o banco e recriá-lo do zero:

```bash
docker compose down -v
docker compose up -d --build postgres backend
```

O comando `docker compose down -v` remove permanentemente o volume local do PostgreSQL.
