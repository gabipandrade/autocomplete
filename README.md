# Justarter

Aplicação de autocompletar com React, GraphQL, Node.js e PostgreSQL.

## Rodando o banco de dados

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

O PostgreSQL fica disponível em `localhost:5434`, com estas credenciais:

```text
Banco: justarter
Usuário: postgres
Senha: postgres
```

## Consultando os dados

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
