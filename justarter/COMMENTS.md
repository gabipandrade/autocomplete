
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
  evolução futura sem reescrever a camada de dados — por exemplo, um
  autocomplete tolerante a erro de digitação usando a extensão
  `pg_trgm`, algo que SQLite não oferece nativamente.

**O que rejeitei:**
- Usar o próprio GraphQL como camada de Backend, resolvendo direto no
  banco. Essa era a sugestão original da IA e cheguei a aceitá-la
  inicialmente por simplicidade, mas reconsiderei ao revisar o diagrama do
  desafio (`Frontend → GraphQL → Backend`), que trata as duas como camadas
  distintas. Separei em dois serviços: um `graphql-gateway`, responsável
  apenas por traduzir a query GraphQL em uma chamada HTTP, e um `backend`
  próprio (Express/Fastify), dono da regra de negócio e do acesso ao banco.
  Isso deixa mais clara a responsabilidade de cada camada, e na minha opinião facilitaria o desenvolvimento.