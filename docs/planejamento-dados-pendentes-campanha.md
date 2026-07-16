# Planejamento de dados pendentes - telas da campanha

Este documento resume apenas o que ainda falta do lado de dados reais, integrações e backend para as telas da campanha.

Ele ignora o que já foi resolvido no sistema interno e foca no que precisa ser entregue para a aplicação sair do dado local/mockado e passar a operar com fontes reais.

## Resumo executivo

Hoje, o núcleo operacional do sistema já está bem encaminhado em:

- Meus Dados
- Equipes
- Check-in
- Custos
- parte operacional da Visão Geral

As maiores pendências agora estão em:

- Visão Geral - parte eleitoral
- Municípios
- Inteligência Eleitoral
- Pesquisa de Campo

Essas telas dependem principalmente de:

- base eleitoral real
- base territorial normalizada
- base de pesquisa de campo real

---

## 1. Visão Geral - o que falta

A Visão Geral ainda precisa principalmente da camada eleitoral real.

### 1.1 Cards eleitorais do topo

#### O que falta

- `Meta de votos` ficar 100% alinhada ao perfil/campanha real
- `Votos necessários` deixar de ser cálculo parcial/local e usar dado eleitoral consolidado
- `Total de votos` vir de resultado real

#### Dados necessários

- `vote_goal`
- `total_votes`
- `votes_needed`
- `election_year`
- `office`
- `state`
- `candidate_id` ou identificador do candidato na base eleitoral

#### Fonte

- `vote_goal`: sistema interno
- `total_votes`: TSE / apuração importada
- `votes_needed`: cálculo no backend a partir de meta + votos reais

#### O que o backend precisa entregar

Um resumo eleitoral do candidato.

Exemplo:

```json
{
  "vote_goal": 120000,
  "total_votes": 84620,
  "votes_needed": 35380
}
```

---

### 1.2 Mapa - modo "Apuração dos votos"

#### O que falta

Hoje o mapa já funciona no modo operacional, mas falta o modo eleitoral real.

#### Dados necessários

Por município:

- `municipality_ibge_code`
- `municipality_name`
- `votes`
- `vote_percent`
- `performance_level` ou valor bruto para o frontend colorir

#### Fonte

- TSE / base importada de resultados eleitorais

#### O que o backend precisa entregar

- uma lista por município com os votos reais do candidato
- idealmente já casada com o código IBGE

Exemplo:

```json
{
  "mode": "votes",
  "municipalities": [
    {
      "municipality_ibge_code": "3550308",
      "municipality_name": "Sao Paulo",
      "votes": 18234,
      "vote_percent": 12.4
    }
  ]
}
```

---

### 1.3 Desempenho por região

#### O que falta

Esse bloco precisa virar desempenho eleitoral agregado, não só territorial.

#### Dados necessários

Por região:

- `region_id`
- `region_name`
- `total_votes`
- `percent_of_goal`
- `municipalities_count`
- `ranking_position` opcional

#### Fonte

- TSE + regra interna de agrupamento por região de campanha

#### O que o backend precisa entregar

- agregação de votos por região
- cálculo de percentual contra meta

---

### 1.4 Ranking de municípios

#### O que falta

O ranking precisa deixar de depender de dado local e passar a usar regra real.

#### Dados necessários

- `municipality_ibge_code`
- `municipality_name`
- `region_name`
- `votes`
- `percent_of_goal` ou métrica definida
- `position`

#### Fonte

- TSE + regra de ranking definida pelo time

#### O que o backend precisa decidir

Se o ranking vai ser por:

- total de votos
- percentual da meta
- desempenho relativo
- outro índice

---

### 1.5 Resumo do dia

#### O que falta

Só o que depende de consolidação mais precisa no backend.

#### Blocos que ainda podem precisar integração futura

- `Eventos` se a fonte final vier do calendário real do portal
- `Municipios visitados` se quiserem consolidar só por check-in real
- `Atividades registradas` se quiserem consolidar tudo com precisão no backend

#### Fonte

- calendário interno
- check-ins internos
- atividades internas

#### Observação

Essa parte é muito mais consolidação backend do que API externa.

---

## 2. Municípios - o que falta

Essa é uma das telas que mais dependem de dado real.

### 2.1 Lista real de municípios

#### O que falta

Hoje a tela está em dado local e precisa de fonte real.

#### Dados necessários

- `municipality_ibge_code`
- `municipality_name`
- `state`
- `region_name`
- `population`
- `voters`

#### Fonte

- IBGE para município/código/população/região
- TSE para eleitores

#### O que o backend precisa entregar

- listagem paginada
- busca
- modo de visualização

---

### 2.2 Toggle "Período de campanha / Apuração dos votos"

#### O que falta

Os dois modos precisam de dados reais distintos.

#### Modo 1 - Período de campanha

Dados necessários:

- `representatives_count`
- `teams_count`
- `leaders_count` opcional
- `amendments_value` ou `costs_value`
- `amendments_count` ou `costs_count`
- `has_operational_presence`

Fonte:

- interno:
  - teams
  - campaign-operations
  - campaign-costs

#### Modo 2 - Apuração dos votos

Dados necessários:

- `votes`
- `vote_percent`
- `rank`
- `goal_progress` opcional

Fonte:

- TSE / base importada

---

### 2.3 Cards do topo

#### O que falta

Os indicadores do topo virarem cálculo real.

#### Dados possíveis por modo

Modo campanha:

- total de municípios
- municípios ativos
- municípios prioritários
- municípios com equipe
- municípios com representante/liderança

Modo apuração:

- municípios com votos
- municípios acima da média
- municípios estratégicos
- municípios com melhor conversão

#### Fonte

- interno no modo campanha
- TSE/importação no modo apuração

---

### 2.4 Backend ideal da tela

#### Endpoints sugeridos

- `GET /municipalities/summary?mode=campaign|votes`
- `GET /municipalities?mode=campaign|votes&search=&page=&page_size=`
- `GET /municipalities/:ibgeCode`

---

## 3. Inteligência Eleitoral - o que falta

Essa tela está estruturalmente pronta, mas quase toda a fonte ainda falta.

### 3.1 Filtros reais

#### O que falta

UF, região e município saírem do dado local.

#### Dados necessários

- lista de UFs
- regiões por UF
- municípios por região/UF

#### Fonte

- IBGE
- ou uma base própria derivada do IBGE

#### Backend ideal

- `GET /electoral-intelligence/filters`

---

### 3.2 Cenário analítico do município

#### O que falta

O cenário completo vir de dados reais.

#### Dados necessários

- `uf`
- `region`
- `city`
- `population`
- `voters`
- `salary_insight`
- `workforce_text`
- `city_stats`
- `ballot_stats`
- `business_stats`

#### Fonte

- IBGE
- TSE
- possivelmente outras bases públicas

---

### 3.3 Mais votados 2022

#### O que falta

Trocar ranking local por ranking real.

#### Dados necessários

- `candidate_name`
- `party`
- `votes`
- `percent`
- `office`
- `election_year`
- `score` se quiserem manter barra visual

#### Fonte

- TSE

---

### 3.4 Perfil de eleitores

#### O que falta

Gênero, idade e média etária reais.

#### Dados necessários

- `gender_distribution`
- `age_ranges`
- `average_age`

#### Fonte

- TSE, IBGE ou outra base pública definida pelo time

---

### 3.5 Backend ideal da tela

#### Endpoints sugeridos

- `GET /electoral-intelligence/filters`
- `GET /electoral-intelligence?uf=&region=&city=`

---

## 4. Pesquisa de Campo - o que falta

Essa tela depende quase inteira da coleta real.

### 4.1 Fonte real da pesquisa

#### O que falta

Definir de onde os dados entram:

- Google Forms
- Google Sheets
- banco próprio
- importação CSV

#### Dados necessários por resposta

- `survey_id`
- `type`
- `year`
- `status`
- `city`
- `entity/team`
- respostas das perguntas
- data/hora da coleta

#### Fonte

- formulário externo ou banco interno

---

### 4.2 Agregações da tela

#### O que falta

Todos os gráficos e rankings passarem a ser calculados com base nas respostas reais.

#### Dados necessários

- distribuição por cidade
- problema principal da cidade
- áreas prioritárias
- influência no voto
- pesquisa espontânea
- crescimento de candidatos
- percepção do candidato
- gênero
- faixa etária
- idade média

#### Fonte

- respostas reais da pesquisa

---

### 4.3 Cards do topo

#### O que falta

Os cards passarem a refletir coleta real.

#### Dados necessários

- `surveys_completed`
- `answers_collected`
- `visited_cities`
- `teams_in_field`
- `response_rate`

#### Fonte

- pesquisa real + eventualmente check-in/equipes

---

### 4.4 Backend ideal da tela

#### Endpoints sugeridos

- `GET /field-research/summary`
- `GET /field-research/scenarios?type=&year=&status=&city=&entity=&search=`
- opcionalmente: `GET /field-research/filters`

---

## 5. Visão Geral + Municípios + Inteligência - base eleitoral comum

Essas três telas compartilham uma pendência grande: vocês precisam de uma base eleitoral consolidada.

### 5.1 Cadastro/identificação do candidato eleitoral

#### O que falta

Casar o usuário da plataforma com o candidato real.

#### Dados necessários

- `candidate_id`
- `candidate_name`
- `ballot_name` opcional
- `office`
- `state`
- `election_year`
- `party`
- `number` opcional

#### Fonte

- TSE

---

### 5.2 Resultado eleitoral por município

#### O que falta

Criar a base comum para:

- mapa
- ranking
- municípios
- inteligência

#### Dados necessários

- `candidate_id`
- `municipality_ibge_code`
- `municipality_name`
- `votes`
- `vote_percent`
- `election_year`
- `office`

#### Fonte

- TSE

---

### 5.3 Agregação por região de campanha

#### O que falta

Criar a base comum para:

- desempenho por região
- visão territorial
- comparativos

#### Dados necessários

- mapeamento município -> região de campanha
- soma dos votos por região
- percentual por região

#### Fonte

- TSE + regra interna de região

---

## 6. Emendas / Custos - o que falta

### 6.1 Custos

Do lado de sistema, está praticamente pronto.

#### O que ainda pode faltar

Só se o time quiser enriquecer com dado público externo.

---

### 6.2 Emendas públicas reais

Se a ideia for ter emendas além dos custos internos.

#### Dados necessários

- município beneficiado
- valor
- ano
- órgão/origem
- status
- quantidade
- região

#### Fonte

- Portal da Transparência
- base pública de emendas

#### Backend ideal

- `GET /public-amendments`
- `GET /public-amendments/summary`

Se o time não for usar isso agora, pode deixar fora.

---

## 7. Equipes - o que falta

Equipes está quase toda pronta.

### 7.1 Validação territorial opcional

#### O que pode faltar

Se quiserem enriquecer o cadastro:

- município
- código IBGE
- UF
- região

#### Fonte

- IBGE

#### Observação

Não é obrigatório, mas ajuda na consistência territorial.

---

## 8. Check-in - o que falta

Check-in também está quase todo interno e pronto.

### 8.1 Consolidação de backend para dashboards

#### O que pode faltar

- check-ins do dia
- check-outs do dia
- atividades por tipo
- novos cadastros do dia
- equipes ativas agora
- municípios visitados

#### Fonte

- totalmente interna

---

## 9. Login / Primeiro acesso - o que falta

Praticamente nada externo.

### 9.1 Contratos a confirmar

- contrato real de `role` / `roles`
- `must_change_password`
- como o perfil do usuário se relaciona com a campanha

---

## 10. Prioridade recomendada para implementação

### Prioridade 1 - mais urgente

Telas que mais dependem de backend/dado real neste momento:

- Visão Geral - parte eleitoral
- Municípios
- Inteligência Eleitoral
- Pesquisa de Campo

### Prioridade 2 - base compartilhada que destrava várias telas

Implementar primeiro:

#### Base de candidato

- quem é o candidato na base eleitoral real

#### Base de votos por município

- alimenta Visão Geral, Municípios e Inteligência

#### Base territorial normalizada

- município
- código IBGE
- região
- UF

#### Base de pesquisa de campo

- integração com formulário/coleta

### Prioridade 3 - enriquecimento opcional

- emendas públicas
- validação IBGE em equipes
- indicadores socioeconômicos extras da inteligência

---

## 11. Pacote técnico ideal para organizar o backend

### Módulo A - electoral-data

Responsável por:

- candidato
- candidaturas
- eleições passadas
- votos por município
- agregações eleitorais

### Módulo B - territorial-data

Responsável por:

- municípios
- IBGE
- população
- regiões/sub-regiões

### Módulo C - field-research

Responsável por:

- ingestão do formulário
- consolidação de respostas
- métricas da pesquisa

### Módulo D - dashboard-electoral

Responsável por:

- unir base interna + base eleitoral
- devolver payload pronto para a Visão Geral

---

## 12. Resumo final para repasse

Se for resumir isso para execução, a mensagem principal é:

1. O sistema interno principal já existe.
2. O que falta agora é, majoritariamente, dado real.
3. As maiores pendências estão em Visão Geral eleitoral, Municípios, Inteligência Eleitoral e Pesquisa de Campo.
4. A primeira grande entrega do backend deveria ser:
   - identificação do candidato
   - votos por município
   - base territorial normalizada
   - integração da pesquisa de campo

