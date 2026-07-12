# Sprint 1 - Planejamento do backend de calendario

## Objetivo

Definir o recorte inicial do modulo de calendario para o Portal, seguindo o mesmo padrao arquitetural ja usado em `communications` e `support-tickets`.

O Sprint 1 nao implementa codigo de dominio nem rotas em producao. Ele fecha o contrato tecnico para que a implementacao do Sprint 2 aconteca sem retrabalho.

## Escopo do MVP

O primeiro corte do backend deve cobrir:

- cadastro de eventos
- edicao de eventos
- exclusao logica ou fisica simples
- listagem de eventos por dia
- listagem de eventos por intervalo de datas
- visualizacao dos marcadores do mes para o calendario da home
- controle de status do evento
- permissao administrativa para criar, editar e excluir

Fica fora do MVP:

- recorrencia
- anexos
- convidados
- notificacoes
- sincronizacao com calendario externo
- auditoria detalhada
- categorias administraveis por CRUD proprio

## Regras de negocio

### Campos obrigatorios

- `title`
- `eventDate`
- `status`
- `allDay`
- `createdBy`

### Regras de horario

- se `allDay = true`, `startTime` e `endTime` devem ser `null`
- se `allDay = false`, `startTime` e `endTime` sao obrigatorios
- `endTime` deve ser maior que `startTime`

### Regras de status

Status iniciais do MVP:

- `active`
- `completed`
- `canceled`

Regras:

- evento novo nasce como `active`, salvo quando um admin informar outro status
- evento `canceled` continua visivel no historico e no dia correspondente
- evento `completed` continua visivel no historico e no dia correspondente

### Regras de busca

- a home vai precisar consultar eventos de um dia especifico
- a grade mensal vai precisar consultar apenas os dias do mes que possuem eventos
- a area administrativa vai precisar consultar por intervalo, busca textual e status

### Permissoes

No primeiro corte:

- usuarios autenticados podem ler eventos
- apenas `ADMIN` e `MANAGER` podem criar, editar e excluir

Isso segue a mesma linha usada em `admin/communications`.

## Modelo de dados proposto

Tabela proposta: `calendar_events`

| Campo | Tipo | Obrigatorio | Observacoes |
| --- | --- | --- | --- |
| `id` | UUID | sim | chave primaria |
| `title` | VARCHAR(180) | sim | nome do evento |
| `description` | TEXT | nao | detalhes do evento |
| `event_date` | DATE | sim | data principal do evento |
| `all_day` | BOOLEAN | sim | default `true` |
| `start_time` | TIME | nao | obrigatorio se `all_day = false` |
| `end_time` | TIME | nao | obrigatorio se `all_day = false` |
| `category` | VARCHAR(80) | nao | texto simples no MVP |
| `status` | ENUM | sim | `active`, `completed`, `canceled` |
| `created_by` | UUID | sim | FK para `users(id)` |
| `updated_by` | UUID | nao | FK para `users(id)` |
| `created_at` | TIMESTAMPTZ | sim | default `NOW()` |
| `updated_at` | TIMESTAMPTZ | sim | default `NOW()` |
| `deleted_at` | TIMESTAMPTZ | nao | opcional se adotarmos soft delete |

### Indices recomendados

- indice por `event_date`
- indice composto por `status, event_date`
- indice por `deleted_at` se houver soft delete

## Contrato inicial de API

### Rotas publicas autenticadas

#### `GET /calendar-events`

Objetivo:

- listar eventos por filtros
- servir tanto a home quanto paginas administrativas simples

Query params do MVP:

- `date`: data exata no formato `YYYY-MM-DD`
- `from`: inicio do intervalo
- `to`: fim do intervalo
- `status`: `active | completed | canceled`
- `search`: busca por titulo
- `page`
- `limit`

Regra:

- `date` tem prioridade sobre `from/to`

Resposta esperada:

```json
{
  "data": [
    {
      "id": "uuid",
      "title": "Treinamento com coordenadores",
      "description": "Alinhar metas da semana.",
      "eventDate": "2026-07-16",
      "allDay": false,
      "startTime": "09:00",
      "endTime": "10:30",
      "category": "Campanha",
      "status": "active",
      "createdAt": "2026-07-12T10:00:00.000Z",
      "updatedAt": "2026-07-12T10:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 1
  }
}
```

#### `GET /calendar-events/month-markers`

Objetivo:

- retornar somente os dias do mes que possuem evento
- reduzir payload para a home

Query params:

- `year`
- `month`

Resposta esperada:

```json
{
  "year": 2026,
  "month": 7,
  "days": ["2026-07-16", "2026-07-18", "2026-07-26"]
}
```

#### `GET /calendar-events/:id`

Objetivo:

- buscar um evento especifico para edicao ou detalhe

### Rotas administrativas

#### `POST /admin/calendar-events`

Body:

```json
{
  "title": "Treinamento com coordenadores",
  "description": "Alinhar metas da semana.",
  "eventDate": "2026-07-16",
  "allDay": false,
  "startTime": "09:00",
  "endTime": "10:30",
  "category": "Campanha",
  "status": "active"
}
```

#### `PATCH /admin/calendar-events/:id`

Permite atualizar:

- `title`
- `description`
- `eventDate`
- `allDay`
- `startTime`
- `endTime`
- `category`
- `status`

#### `DELETE /admin/calendar-events/:id`

Decisao recomendada:

- usar soft delete desde o inicio

Motivo:

- evita perda de historico
- simplifica futuras auditorias
- reduz risco operacional

## DTOs propostos

### `ListCalendarEventsDto`

- `date?: string`
- `from?: string`
- `to?: string`
- `status?: CalendarEventStatus`
- `search?: string`
- `page?: number`
- `limit?: number`

### `ListCalendarMonthMarkersDto`

- `year: number`
- `month: number`

### `CreateCalendarEventDto`

- `title: string`
- `description?: string`
- `eventDate: string`
- `allDay: boolean`
- `startTime?: string | null`
- `endTime?: string | null`
- `category?: string | null`
- `status?: CalendarEventStatus`

### `UpdateCalendarEventDto`

Mesmo shape do create, com todos os campos opcionais.

## Estrutura tecnica sugerida

Seguir o mesmo desenho de modulos ja existente:

- `backend/src/core/calendar-events`
- `backend/src/nest_modules/calendar-events`

Estrutura esperada:

- `domain/entities/calendar-event.entity.ts`
- `domain/enums/calendar-event-status.enum.ts`
- `domain/contracts/calendar-event-repository.interface.ts`
- `application/use_case/create-calendar-event.use-case.ts`
- `application/use_case/update-calendar-event.use-case.ts`
- `application/use_case/delete-calendar-event.use-case.ts`
- `application/use_case/get-calendar-event.use-case.ts`
- `application/use_case/list-calendar-events.use-case.ts`
- `application/use_case/list-calendar-month-markers.use-case.ts`
- `infrastructure/database/sequelize/models/calendar-event.model.ts`
- `infrastructure/database/sequelize/repositories/calendar-event.repository.ts`
- `nest_modules/calendar-events/calendar-events.controller.ts`
- `nest_modules/calendar-events/calendar-events.module.ts`
- `nest_modules/calendar-events/calendar-events.providers.ts`
- `nest_modules/calendar-events/dto/calendar-events.dto.ts`
- `nest_modules/calendar-events/presenters/calendar-event.presenter.ts`

## Criterios de aceite do Sprint 1

- regras de negocio do MVP definidas
- modelo de dados inicial definido
- contrato de API definido
- estrategia de permissao definida
- estrutura tecnica alinhada ao padrao do projeto
- backlog do Sprint 2 pronto para execucao

## Backlog do Sprint 2

1. Criar enum de status de eventos.
2. Criar migration `005-create-calendar-events-table`.
3. Criar model Sequelize e mapper.
4. Criar entidade de dominio com validacoes.
5. Criar contrato de repositorio.
6. Implementar repositorio Sequelize.
7. Criar casos de uso de create, update, delete, get, list e month markers.
8. Criar DTOs e presenters.
9. Criar controller publico e controller admin.
10. Registrar `CalendarEventsModule` no `AppModule`.
11. Cobrir o modulo com testes unitarios e e2e basicos.

## Decisoes abertas para alinhar antes do Sprint 2

- se o endpoint de leitura deve permitir acesso a todos os autenticados ou apenas perfis internos
- se `category` continua texto livre no MVP ou vira tabela propria
- se exclusao sera soft delete obrigatoriamente
- se a home vai consumir `GET /calendar-events?date=...` e `GET /calendar-events/month-markers` ou um endpoint agregado

## Recomendacao final

Para manter velocidade e reduzir risco:

- manter `category` como texto simples no MVP
- adotar soft delete desde o inicio
- separar `month-markers` de `list` para a home ficar leve
- deixar recorrencia para depois do CRUD estabilizado
