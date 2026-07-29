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

- [x] Criar aplicação Fastify
- [x] Criar rota de healthcheck
- [x] Criar camada de repository
- [x] Criar serviço de busca de sugestões
- [x] Normalizar termo pesquisado
- [x] Aplicar mínimo de 4 caracteres
- [x] Aplicar limite máximo de 20 resultados
- [x] Ordenar por popularidade e ordem alfabética
- [x] Criar rota `GET /suggestions`
- [x] Validar parâmetros de entrada
- [x] Tratar erros
- [x] Criar testes do repository, do serviço e da rota

---

## 4. GraphQL Gateway

- [x] Configurar Apollo Server
- [x] Criar tipo `Suggestion`
- [x] Criar query GraphQL de sugestões
- [x] Criar cliente HTTP para chamar o backend
- [x] Criar resolver GraphQL
- [x] Aplicar mínimo de 4 caracteres e limite 20
- [x] Configurar timeout e tratamento de erros
- [x] Criar testes do cliente HTTP
- [x] Criar testes do resolver
- [x] Criar teste da query GraphQL
- [x] Validar lint, testes e build do gateway na CI

### Schema implementado

```graphql
type Suggestion {
  id: ID!
  term: String!
  popularity: Int!
  createdAt: String!
}

type Query {
  suggestions(query: String!, limit: Int = 20): [Suggestion!]!
  suggestionById(id: ID!): Suggestion
}

type Mutation {
  createSuggestion(term: String!): Suggestion
}
```

---

## 5. Frontend React

- [x] Criar aplicação React com Vite
- [x] Configurar Apollo Client
- [x] Criar layout responsivo da página de busca
- [x] Criar componente com campo de pesquisa
- [x] Não realizar consulta com menos de 4 caracteres
- [x] Implementar debounce para evitar requisições excessivas
- [x] Criar query para o GraphQL Gateway
- [x] Tratar carregamento, erros e ausência de resultados
- [x] Ignorar respostas de pesquisas antigas
- [x] Renderizar no máximo 20 sugestões
- [x] Exibir cerca de 10 itens e permitir acesso aos demais por scroll
- [x] Destacar em negrito o trecho correspondente ao termo pesquisado
- [x] Destacar a sugestão ao passar o mouse ou tocar no item
- [x] Atualizar o campo de busca ao selecionar uma sugestão
- [x] Ocultar a lista quando não houver sugestões
- [x] Criar testes dos principais comportamentos

---

## 6. Docker Compose e integração

- [x] Configurar os serviços:
  - [x] `frontend`
  - [x] `graphql-gateway`
  - [x] `backend`
  - [x] `database`
- [x] Configurar variáveis de ambiente entre os serviços
- [x] Criar volume persistente para o PostgreSQL
- [x] Criar healthcheck do banco de dados
- [x] Criar healthcheck do backend
- [x] Criar healthcheck do GraphQL Gateway
- [x] Configurar `depends_on` e ordem de inicialização
- [x] Executar migrations automaticamente
- [x] Executar seed automaticamente
- [x] Garantir que migrations e seed sejam idempotentes
- [x] Expor somente as portas necessárias
- [x] Validar configuração com `docker compose config`
- [x] Testar execução com `docker compose up --build`
- [x] Testar o projeto em ambiente limpo
- [x] Confirmar o fluxo React → GraphQL → Backend → PostgreSQL

---

## 7. CI, documentação e validação final

### CI e qualidade

- [x] Executar CI em cada Pull Request
- [x] Rodar lint no frontend
- [x] Rodar lint no GraphQL Gateway
- [x] Rodar lint no backend
- [x] Rodar testes de cada serviço
- [x] Rodar build de cada serviço
- [x] Validar o `docker-compose.yml`
- [x] Configurar o CI como verificação obrigatória da branch `main`

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
