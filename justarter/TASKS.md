# Tasks — Justarter Autocomplete



## 0. Definição da stack

- [x] Escolher o frontend
- [x] Escolher o GraphQL
- [x] Escolher o backend
- [x] Escolher banco
- [x] Escolher os testes
- [x] Escolher CI
- [x] Registrar decisões e justificativas no `COMMENTS.md`

---

## 1. Repositório e estrutura inicial

- [ x] Criar repositório e publicar a branch `main`
- [x ] Proteger a `main`, exigindo Pull Request
- [ ] Criar branches para as microtasks
- [ x] Criar estrutura de pastas:
  - [x ] `frontend/`
  - [x] `graphql-gateway/`
  - [x ] `backend/`
- [x ] Criar `package.json` e `tsconfig.json` em cada serviço
- [x ] Criar `Dockerfile` inicial em cada serviço
- [x] Criar `docker-compose.yml` inicial
- [x] Criar `.env.example` e `.gitignore`
- [x] Criar `README.md`, `TASKS.md` e `COMMENTS.md`
- [x] Criar CI inicial executado em Pull Requests

---

## 2. Banco de dados

- [x] Criar tabela de sugestões
- [x] Criar índice para busca por prefixo
- [x] Criar migration inicial
- [x] Criar script para executar migrations
- [x] Criar arquivo com os dados das sugestões
- [x] Criar seed automatizado e idempotente
- [x] Configurar pool de conexões com PostgreSQL
- [x] Testar migration e seed em banco vazio
- [x] Testar exibição da tabela
---

## 3. Backend Fastify

- [ ] Criar aplicação Fastify
- [ ] Criar rota de healthcheck
- [ ] Criar camada de repository
- [ ] Criar serviço de busca de sugestões
- [ ] Normalizar termo pesquisado
- [ ] Aplicar mínimo de 4 caracteres
- [ ] Aplicar limite máximo de 20 resultados
- [ ] Ordenar por popularidade e ordem alfabética
- [ ] Criar rota `GET /suggestions`
- [ ] Validar parâmetros de entrada
- [ ] Tratar erros
- [ ] Criar testes do serviço e da rota

---

## 4. GraphQL Gateway

- [ ] Configurar Apollo Server
- [ ] Criar tipo `Suggestion`
- [ ] Criar query GraphQL de sugestões
- [ ] Criar cliente HTTP para chamar o backend
- [ ] Criar resolver GraphQL
- [ ] Aplicar mínimo de 4 caracteres e limite 20
- [ ] Configurar timeout e tratamento de erros
- [ ] Criar testes do cliente HTTP
- [ ] Criar testes do resolver
- [ ] Criar teste da query GraphQL

### Schema planejado

```graphql
type Suggestion {
  id: ID!
  text: String!
}

type Query {
  suggestions(query: String!, limit: Int = 20): [Suggestion!]!
}
```

---

## 5. Frontend React

- [ ] Criar aplicação React com Vite
- [ ] Configurar Apollo Client
- [ ] Criar layout responsivo da página de busca
- [ ] Criar componente com campo de pesquisa
- [ ] Não realizar consulta com menos de 4 caracteres
- [ ] Implementar debounce para evitar requisições excessivas
- [ ] Criar query para o GraphQL Gateway
- [ ] Tratar carregamento, erros e ausência de resultados
- [ ] Ignorar respostas de pesquisas antigas
- [ ] Renderizar no máximo 20 sugestões
- [ ] Exibir cerca de 10 itens e permitir acesso aos demais por scroll
- [ ] Destacar em negrito o trecho correspondente ao termo pesquisado
- [ ] Destacar a sugestão ao passar o mouse ou tocar no item
- [ ] Atualizar o campo de busca ao selecionar uma sugestão
- [ ] Ocultar a lista quando não houver sugestões
- [ ] Criar testes dos principais comportamentos

---

## 6. Docker Compose e integração

- [ ] Configurar os serviços:
  - [ ] `frontend`
  - [ ] `graphql-gateway`
  - [ ] `backend`
  - [ ] `database`
- [ ] Configurar variáveis de ambiente entre os serviços
- [ ] Criar volume persistente para o PostgreSQL
- [ ] Criar healthcheck do banco de dados
- [ ] Criar healthcheck do backend
- [ ] Criar healthcheck do GraphQL Gateway
- [ ] Configurar `depends_on` e ordem de inicialização
- [ ] Executar migrations automaticamente
- [ ] Executar seed automaticamente
- [ ] Garantir que migrations e seed sejam idempotentes
- [ ] Expor somente as portas necessárias
- [ ] Validar configuração com `docker compose config`
- [ ] Testar execução com `docker compose up --build`
- [ ] Testar o projeto em ambiente limpo
- [ ] Confirmar o fluxo React → GraphQL → Backend → PostgreSQL

---

## 7. CI, documentação e validação final

### CI e qualidade

- [ ] Executar CI em cada Pull Request
- [ ] Rodar lint no frontend
- [ ] Rodar lint no GraphQL Gateway
- [ ] Rodar lint no backend
- [ ] Rodar testes de cada serviço
- [ ] Rodar build de cada serviço
- [ ] Validar o `docker-compose.yml`
- [ ] Configurar o CI como verificação obrigatória da branch `main`

### Documentação

- [ ] Documentar arquitetura e responsabilidades dos serviços no `README.md`
- [ ] Documentar instalação e execução com Docker
- [ ] Documentar comandos de lint, testes e build
- [ ] Documentar variáveis de ambiente
- [ ] Analisar o arquivo `starter/suggestions.js`
- [ ] Registrar no `COMMENTS.md` o que seria mantido, alterado ou rejeitado
- [ ] Registrar decisões relevantes auxiliadas por IA
- [ ] Registrar limitações e melhorias futuras

### Validação final

- [ ] Sugestões aparecem somente após 4 caracteres
- [ ] Nenhum elemento aparece quando não há sugestões
- [ ] Backend retorna no máximo 20 sugestões
- [ ] Aproximadamente 10 sugestões ficam visíveis antes do scroll
- [ ] O trecho correspondente aparece em negrito
- [ ] Hover e touch destacam o item
- [ ] Clique atualiza o campo de busca
- [ ] Sugestões mudam dinamicamente enquanto o usuário digita
- [ ] Interface funciona corretamente em dispositivos móveis
- [ ] Frontend acessa somente o GraphQL Gateway
- [ ] GraphQL Gateway acessa somente o backend
- [ ] Backend acessa o PostgreSQL
- [ ] Banco é populado automaticamente
- [ ] Projeto sobe com `docker compose up`
- [ ] Todos os testes, lints e builds passam
- [ ] Todas as mudanças foram integradas por Pull Request
