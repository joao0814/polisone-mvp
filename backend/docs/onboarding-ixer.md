# IXER Manager System

## Arquitetura Backend

### Guia de Onboarding Técnico

Documento Confidencial — Uso Interno

# 1. Arquitetura do Backend

O backend do IXER Manager System segue Clean Architecture. Na prática, isso significa que o código é organizado em camadas, e cada camada tem uma única responsabilidade.

> 🍽 **Analogia: pense num restaurante**
>
> O garçom (Controller) recebe o pedido do cliente. Ele passa pra cozinha (Use Case) que decide o que fazer.
>
> A cozinha segue a receita (Entity / regras de negócio). E quem busca os ingredientes na geladeira é o estoquista (Repository).
>
> O garçom não sabe cozinhar. O cozinheiro não sabe de onde vem o ingrediente. Cada um faz só o seu trabalho.
>
> Se a gente trocar a geladeira (banco de dados), o garçom e o cozinheiro nem ficam sabendo.

> 📋 **Princípio fundamental**
>
> Cada parte muda por um motivo diferente. Mudou a regra de negócio? Altera só a entity.
>
> Mudou o banco de dados? Altera só o model/mapper/repository.
>
> Mudou a API HTTP? Altera só o controller/dto/presenter. Nova funcionalidade? Cria um use case novo.

## 1.1 Domain — A receita

É o coração do módulo. Aqui não existe banco de dados, não existe HTTP, não existe framework. É TypeScript puro — só regras de negócio.

### Entity

A entity é a representação de uma negociação (ou qualquer conceito do negócio) no mundo real. Ela tem os dados (nome, status, etapa do pipeline, dados do cliente) e os comportamentos (avançar etapa, cancelar, reativar, validar campos obrigatórios). A validação fica no método `validate()`, chamado pelo `create()`. A entidade herda de uma classe base `Entity`.

Regra importante: se amanhã você trocar o banco de dados ou o framework, a entidade continua funcionando igual. Ela não sabe que o Sequelize existe.

### Enums

Enums são listas fixas de valores possíveis. Em vez de espalhar strings como `"cancelada"` pelo código todo, centraliza-se num enum. Um arquivo por enum do domínio. Se amanhã surgir um status novo, você altera num lugar só.

### Interface do Repositório (Contracts)

A interface é um contrato. Ela diz "eu preciso que alguém saiba salvar e buscar negociações", mas não diz como. É tipo um cardápio — lista o que tem, mas não explica como preparar. Define `InputParams` (filtros, paginação, ordenação) e `OutputParams` (resultado paginado). Nunca referencia Sequelize ou qualquer ORM aqui.

Estrutura de pastas do domain:

```text
core/{modulo}/domain/
├── entities/{modulo}.entity.ts
├── enums/
│   ├── {modulo}-status.enum.ts
│   └── pipeline-stage.enum.ts
└── contracts/{modulo}-repository.interface.ts
```

## 1.2 Application — A cozinha

Cada use case é uma ação do sistema. Criar negociação, cancelar, enviar pra assinatura — cada um é um arquivo separado. O use case é o chefe de cozinha: coordena tudo, mas não vai na geladeira.

### Use Cases

O use case orquestra: pega a entity, valida, chama o repositório pra salvar. Ele faz 3 coisas: recebe os dados de entrada (um DTO/tipo de input), executa a lógica (cria a entidade, valida, chama o repositório) e retorna a saída formatada. Cada use case recebe o repositório por injeção de dependência e usa `ApplicationService.run()` para transações. Ele não sabe que existe HTTP, controller ou NestJS.

### Output Mapper

O output mapper é o "empratamento". Transforma o objeto interno (entity) num formato limpo pra devolver pro mundo externo. Tem um método estático `toOutput(entity)`. A entidade pode ter métodos, lógica interna e campos sensíveis — o output é uma fotografia limpa dos dados.

Estrutura de pastas do application:

```text
core/{modulo}/application/
├── shared/{modulo}.output.ts
└── use_case/
    ├── create-{modulo}.use-case.ts
    ├── get-all-{modulo}s.use-case.ts
    ├── get-{modulo}-by-id.use-case.ts
    ├── update-{modulo}.use-case.ts
    └── cancel-{modulo}.use-case.ts
```

## 1.3 Infrastructure — O estoque / a geladeira

Aqui é a implementação real do banco. É a única camada que sabe que o Sequelize existe.

### Model

O model é a tabela no PostgreSQL. Cada `@Column` é uma coluna, cada `@ForeignKey` é um relacionamento. A entidade diz "uma negociação tem um nome"; o model diz "a coluna name é VARCHAR(255) na tabela negotiations".

### Model Mapper

O tradutor entre os dois mundos. Faz a conversão bidirecional: `toModel(entity)` pega uma entidade e transforma num model do Sequelize (para salvar no banco), e `toEntity(model)` pega um registro do banco e transforma numa entidade (para usar na lógica). Sem ele, a entidade teria que conhecer o Sequelize.

### Repository

Implementa o contrato que o domain definiu. Aqui sim tem Sequelize, SQL, queries. Usa `this.uow.getTransaction()` em operações de escrita (`store`, `update`, `delete`).

Se amanhã a gente trocar de Sequelize pra Prisma, só muda aqui dentro. Nada acima quebra.

Estrutura de pastas da infrastructure:

```text
core/{modulo}/infrastructure/database/sequelize/
├── models/
│   ├── {modulo}.model.ts
│   └── {modulo}.model.mapper.ts
└── repositories/{modulo}.repository.ts
```

## 1.4 Apresentação (nest_modules) — O garçom

Aqui é onde o NestJS entra em cena. O controller recebe a requisição HTTP, valida com os DTOs, chama o use case, e devolve a resposta pelo presenter.

### Module e Providers

O module registra tudo: controllers, providers e imports de outros módulos. Os providers são onde a gente faz a "fiação" — dizem pro NestJS: "quando alguém pedir o `CreateNegotiationUseCase`, monta ele com essas dependências". É o factory pattern com `useFactory` e `inject`. Nunca use `useClass` direto.

### Controller

Recebe as requisições HTTP (`GET`, `POST`, `PATCH`), valida os dados com DTOs e chama o use case. Deve ter `@RequirePermissions()` em rotas protegidas, `@AuditContext()` em rotas de mutação, e `@ApiOperation()` + `@ApiResponse()` para cada status code. Nunca use `any` nos parâmetros — sempre DTOs tipados.

### DTOs

Classes com decorators do `class-validator` (`@IsString`, `@IsOptional`, `@MaxLength`, etc.) e `@ApiProperty` do Swagger. Garantem que o que chegou na API está no formato certo antes de chegar no use case.

### Presenter

Formata a saída para o HTTP. Tem métodos estáticos `toHTTP(output)` e `toHTTPList(outputs)` que transformam o output do use case no formato final da API.

Estrutura de pastas da apresentação:

```text
nest_modules/{modulo}/
├── {modulo}.module.ts
├── {modulo}.providers.ts
├── {modulo}.controller.ts
├── presenters/{modulo}.presenter.ts
└── dto/
    ├── create-{modulo}.dto.ts
    ├── update-{modulo}.dto.ts
    └── list-{modulo}s.dto.ts
```

## 1.5 Documentação automática com Swagger

Um dos padrões importantes do projeto: as rotas são documentadas automaticamente no Swagger. Não é necessário registrar nada manualmente — o NestJS junto com o pacote `@nestjs/swagger` escaneia todos os controllers registrados nos modules e gera a documentação.

Ou seja, conforme você cria uma rota nova com os decorators corretos, ela já aparece no Swagger na próxima vez que o backend inicia. Toda rota nova já nasce documentada.

> 🔗 **Swagger de Homologação**
>
> https://homolog.ixeroficial.com.br/sistema-gerenciamento/api/docs
>
> Acesse para ver a documentação viva de todas as rotas existentes.

### Decorators de Swagger utilizados

Ao criar qualquer rota no controller, utilize os seguintes decorators para que a documentação seja gerada corretamente:

| Decorator | Função |
| --- | --- |
| `@ApiTags("NomeDoModulo")` | Agrupa as rotas sob uma aba no Swagger |
| `@ApiOperation({ summary: "..." })` | Descrição da rota |
| `@ApiResponse({ status: 200, ... })` | Documenta as respostas possíveis |
| `@ApiParam({ name: "id", ... })` | Documenta os parâmetros da URL |
| `@ApiBearerAuth()` | Mostra o cadeado de autenticação |

Importante: esses decorators são adicionados junto com a criação de cada rota — não é algo feito separadamente depois. Faz parte do padrão do projeto que toda rota nova já nasça com os decorators de Swagger.

## 1.6 Fluxo completo de uma requisição

Veja o que acontece quando alguém clica em "Criar Negociação" no frontend:

1. Frontend faz `POST /v1/negotiations` com os dados
2. Controller recebe, valida o DTO (nome obrigatório? tipos certos?)
3. Use Case cria a entity, roda as validações de negócio, chama o repository
4. Repository usa o mapper pra converter entity → model e salva no banco
5. Volta: mapper converte model → entity → output → presenter formata → resposta HTTP
6. HTTP Response (`201 Created`)

Cada peça faz só uma coisa. Se der bug, você já sabe em qual camada procurar.

# 2. Guia Prático: Criando um Novo Módulo

Quando for necessário criar um módulo novo, siga este passo a passo. Cada módulo segue exatamente a mesma estrutura descrita na seção anterior.

## 2.1 Stack utilizada

| Tecnologia | Papel |
| --- | --- |
| TypeScript | Linguagem principal |
| NestJS | Framework HTTP / injeção de dependências |
| Sequelize | ORM para PostgreSQL |
| PostgreSQL | Banco de dados relacional |
| class-validator | Validação de DTOs de entrada |
| Swagger / OpenAPI | Documentação automática da API |

## 2.2 Passo a passo

### Passo 1 — Domain

1. Crie a entity com propriedades, `validate()` e métodos de negócio
2. Crie os enums necessários (um arquivo por enum)
3. Crie a interface do repositório com `InputParams` e `OutputParams`

### Passo 2 — Application

1. Crie o output mapper (`shared/{modulo}.output.ts`) com `toOutput()`
2. Crie os use cases: Create, GetAll, GetById, Update, Delete/Cancel
3. Cada use case recebe o repositório por injeção e usa `ApplicationService.run()`

### Passo 3 — Infrastructure

1. Crie o model Sequelize com `@Table`, `@Column`, `@ForeignKey`, `@BelongsTo`
2. Crie o model mapper com `toModel()` e `toEntity()`
3. Crie o repositório implementando a interface do domínio
4. Crie a migration no diretório compartilhado (formato: `YYYY.MM.DDThh.mm.ss.descricao.ts`)

### Passo 4 — Apresentação (NestJS)

1. Crie o module com imports, controllers, providers e exports
2. Crie os providers com factory pattern (`useFactory` + `inject`)
3. Crie o controller com decorators de permissão, auditoria e Swagger
4. Crie os DTOs de entrada com `class-validator` e `@ApiProperty`
5. Crie o presenter com `toHTTP()` e `toHTTPList()`

### Passo 5 — Testes

A gente tem helpers que geram payloads prontos — um completo, um mínimo e um inválido. Cada endpoint tem um spec de integração que testa o fluxo real batendo no banco.

1. Crie o helper com `createPayload()`, `createMinimalPayload()` e `createInvalidPayload(field)`
2. Exporte o helper em `_tests_/helpers/index.ts`
3. Crie specs de integração: um arquivo por endpoint cobrindo sucesso, validação, 401 e 404

## 2.3 Checklist de registro

Ao criar um módulo novo, não esqueça de registrar em:

1. `app.module.ts` — importar o module
2. `database.module.ts` — adicionar o(s) model(s)
3. `permission.enum.ts` — criar a permission do módulo
4. `_tests_/helpers/index.ts` — exportar o helper

# 3. Referência Rápida

Quando for mexer em algo, primeiro identifica a camada:

| O que mudou? | Onde alterar? |
| --- | --- |
| Regra de negócio | `domain/entities/{modulo}.entity.ts` |
| Banco de dados / query | `infrastructure/models` + `repositories` |
| API HTTP / rota nova | `nest_modules/{modulo}/controller` + `dto` |
| Formato da resposta | `nest_modules/{modulo}/presenters` |
| Nova funcionalidade | Criar um novo use case em `application/use_case/` |
| Novo módulo completo | Seguir seção 2 deste documento |

> **Resumindo em uma frase**
>
> Domain é o que o negócio é. Application é o que o sistema faz. Infrastructure é como o banco funciona. Nest_modules é como o mundo externo acessa.
