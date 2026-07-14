# IXER Manager System
## Arquitetura Frontend
### Guia de Onboarding Técnico

---

## 1. Arquitetura do Frontend

O frontend do IXER Manager System é uma **SPA (Single Page Application)** construída com React + Vite. O código segue uma separação de responsabilidades inspirada na mesma filosofia do backend: cada arquivo tem um único motivo para mudar.

### Analogia: o mesmo restaurante, mas do lado do salão

O garçom do backend cuida da cozinha. Aqui, a gente cuida do salão — o que o cliente vê e interage.

- A **Página** é a mesa do restaurante. Ela sabe o que está sendo pedido (estado da tela), mas não vai até a cozinha buscar os ingredientes.
- O **Hook** é o garçom do salão: vai buscar o pedido (chama a API), traz o resultado e avisa quando está pronto.
- O **Service** é o ramal direto para a cozinha: sabe o endereço, o formato do pedido, e trata os erros de comunicação.
- O **Componente** é o prato: reutilizável, isolado, não sabe de onde vieram os ingredientes.

Se amanhã a API mudar de endpoint, só o Service muda. Se o layout mudar, só o Componente muda. A Página não sabe que o Axios existe.

### Princípio fundamental

Cada arquivo muda por um motivo diferente:

| O que mudou? | Onde alterar? |
|---|---|
| URL ou formato da API | `services/{modulo}.service.js` |
| Lógica de busca, estado, efeitos | `hooks/use{Modulo}.js` |
| Estrutura visual da tela | `pages/{Modulo}/{Modulo}.jsx` |
| Elemento de UI reutilizável | `components/Common/{Componente}/` |
| Estado global (auth, UI) | `context/AuthContext.jsx` ou `UIContext.jsx` |

---

## 2. Stack Utilizada

| Tecnologia | Papel |
|---|---|
| React 19 | Framework de UI / componentes |
| Vite | Build tool e dev server |
| React Router DOM 7 | Roteamento client-side |
| Axios | Cliente HTTP para chamadas de API |
| CSS Modules | Estilização encapsulada por componente |
| React Context | Estado global (autenticação e UI) |
| Jest + Testing Library | Testes unitários e de integração |

---

## 3. Estrutura de Pastas

```
src/
├── assets/                  # Fontes e imagens estáticas
│   ├── fonts/
│   └── images/
│
├── components/              # Componentes reutilizáveis
│   └── Common/              # UI genérico: botões, inputs, tabelas, modais...
│       └── NomeComponente/
│           ├── NomeComponente.jsx
│           └── NomeComponente.module.css
│
├── context/                 # Estado global
│   ├── AuthContext.jsx      # Autenticação (token, usuário, login, logout)
│   └── UIContext.jsx        # UI global (tema, sidebar, toasts, loading)
│
├── hooks/                   # Hooks customizados por domínio
│   └── use{Modulo}.js       # Ex: useEmpresas.js, usePlanos.js
│
├── pages/                   # Telas organizadas por domínio
│   └── {Modulo}/
│       ├── {Modulo}.jsx           # Tela principal (listagem)
│       ├── Cadastro{Modulo}/
│       │   ├── Cadastro{Modulo}.jsx
│       │   └── Cadastro{Modulo}.module.css
│       └── Consultar{Modulo}/
│           ├── Consultar{Modulo}.jsx
│           └── Consultar{Modulo}.module.css
│
├── services/                # Camada de comunicação com a API
│   ├── api.js               # Instâncias do Axios + interceptors
│   └── {modulo}.service.js  # Funções de API por domínio
│
├── utils/                   # Funções utilitárias puras
├── routes.jsx               # Definição de rotas
└── App.jsx
```

---

## 4. As Quatro Camadas

### 4.1 Service — O ramal da cozinha

**É a única camada que sabe que o Axios existe.**

Cada domínio tem seu próprio arquivo de service. O service não tem `useState`, não tem `useEffect`, não renderiza nada. É só uma coleção de funções assíncronas que fazem chamadas HTTP e retornam os dados.

```
// ✅ CORRETO — src/services/empresas.service.js
import { authApi } from './api';

export async function getEmpresas(params) {
  const response = await authApi.get('/v1/empresas', { params });
  return response.data;
}

export async function createEmpresa(data) {
  const response = await authApi.post('/v1/empresas', data);
  return response.data;
}

export async function updateEmpresa(id, data) {
  const response = await authApi.patch(`/v1/empresas/${id}`, data);
  return response.data;
}
```

```
// ❌ ERRADO — chamada de API direto na página
function Empresas() {
  const fetchEmpresas = async () => {
    const response = await authApi.get('/v1/empresas'); // não faça isso
    setEmpresas(response.data.data.items);
  };
}
```

**Regra:** se você está importando `authApi` dentro de uma página ou componente, há algo errado. A página não deveria saber sobre o Axios.

---

### 4.2 Hook — O garçom do salão

**O hook é o intermediário entre a página e o service.** Ele gerencia o estado local da busca (loading, erro, dados), chama o service e expõe tudo para a página consumir.

Um hook por domínio ou por tela complexa.

```
// ✅ CORRETO — src/hooks/useEmpresas.js
import { useState, useCallback } from 'react';
import { getEmpresas } from '../services/empresas.service';
import { useUI } from '../context/UIContext';

export function useEmpresas() {
  const [empresas, setEmpresas] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const { showLoading, addToast } = useUI();

  const fetchEmpresas = useCallback(async (params) => {
    showLoading(true);
    try {
      const data = await getEmpresas(params);
      setEmpresas(data.items);
      setTotalPages(data.totalPages);
    } catch {
      addToast('Erro ao carregar empresas.', 'error');
    } finally {
      showLoading(false);
    }
  }, [showLoading, addToast]);

  return { empresas, totalPages, fetchEmpresas };
}
```

```
// ✅ CORRETO — a página só consome o hook
function Empresas() {
  const { empresas, totalPages, fetchEmpresas } = useEmpresas();

  useEffect(() => {
    fetchEmpresas({ page: 1 });
  }, [fetchEmpresas]);

  return <Table data={empresas} />;
}
```

**Regra:** a página não tem `try/catch`, não tem chamada de API, não sabe nada de HTTP. Ela só usa o que o hook expõe.

---

### 4.3 Página — A mesa do restaurante

**A página monta o layout e orquestra os hooks e componentes.** Ela sabe _o que_ mostrar e _quando_ mostrar, mas não sabe _como_ buscar os dados nem _como_ renderizar os detalhes de cada elemento.

Uma página bem escrita tem poucos `useState` próprios (estado de UI local: aba ativa, modal aberto, filtro selecionado). O estado de dados fica no hook.

```
// ✅ CORRETO — página enxuta e orquestradora
function Empresas() {
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const { empresas, totalPages, fetchEmpresas } = useEmpresas();

  useEffect(() => {
    fetchEmpresas({ page });
  }, [page, fetchEmpresas]);

  return (
    <PageLayout>
      <Header title="Empresas" onAdd={() => setModalOpen(true)} />
      <Table data={empresas} />
      <Pagination current={page} total={totalPages} onChange={setPage} />
      {modalOpen && <Modal onClose={() => setModalOpen(false)} />}
    </PageLayout>
  );
}
```

**Sinais de que uma página ficou grande demais:**
- Mais de 3-4 `useState` para dados (não para estado de UI)
- `try/catch` com chamadas de API dentro da página
- Funções de transformação/formatação de dados dentro do arquivo
- Markup JSX com mais de 150-200 linhas

Quando isso acontecer, extraia a lógica para um hook e considere quebrar seções da tela em subcomponentes.

---

### 4.4 Componente — O prato

**O componente é reutilizável e não sabe de onde vieram seus dados.** Ele recebe props, renderiza e dispara callbacks. Nada de chamadas de API, nada de lógica de negócio.

```
// ✅ CORRETO — componente puro e reutilizável
function EmpresaCard({ nome, cnpj, status, onEdit }) {
  return (
    <div className={styles.card}>
      <strong>{nome}</strong>
      <span>{cnpj}</span>
      <StatusBadge status={status} />
      <ButtonBlue onClick={onEdit}>Editar</ButtonBlue>
    </div>
  );
}
```

**Onde criar um componente novo vs usar um existente:**

- Antes de criar, verifique `src/components/Common/` — provavelmente já existe.
- Componentes de UI genérico (botão, input, tabela, modal) → `components/Common/`
- Componentes específicos de um domínio usados em mais de uma tela → `components/{Modulo}/`
- Componentes usados em só uma tela e com mais de ~60 linhas → subpasta dentro da própria página

---

## 5. Estado Global vs Estado Local

### Use Context para estado verdadeiramente global

| Context | O que gerencia |
|---|---|
| `AuthContext` | Token, dados do usuário logado, login, logout |
| `UIContext` | Tema, sidebar, loading global, toasts |

**Regra:** se um estado só importa para uma tela ou um fluxo, ele fica no hook da tela — não vai para o Context. Context é para o que toda a aplicação precisa saber.

```
// ✅ Estado local — fica no hook da tela
const [filtroStatus, setFiltroStatus] = useState('ativo');

// ✅ Estado global — usa Context
const { addToast, showLoading } = useUI();
const { user } = useAuth();
```

### Não abuse do Context

Colocar estado de negócio no Context cria acoplamento global desnecessário. Se a tela de Empresas precisa de dados de Planos, o hook `useEmpresas` pode chamar o service de planos — não é preciso criar um `PlanosContext`.

---

## 6. Formulários

Formulários tendem a crescer rápido. Siga estas regras para mantê-los sustentáveis:

**1. Use um único objeto de estado para campos relacionados:**

```
// ❌ Ruim — 10 useState separados
const [nome, setNome] = useState('');
const [email, setEmail] = useState('');
const [telefone, setTelefone] = useState('');

// ✅ Bom — um objeto, um handler
const [form, setForm] = useState({ nome: '', email: '', telefone: '' });

const handleChange = (field) => (e) => {
  setForm(prev => ({ ...prev, [field]: e.target.value }));
};
```

**2. A submissão do formulário chama o hook, não o service diretamente:**

```
// ✅ Correto
const { createEmpresa } = useEmpresas();

const handleSubmit = async (e) => {
  e.preventDefault();
  await createEmpresa(form);
};
```

**3. Validação de campos obrigatórios antes da chamada:**

```
const validate = () => {
  if (!form.nome) return 'Nome é obrigatório';
  if (!form.cnpj) return 'CNPJ é obrigatório';
  return null;
};
```

---

## 7. Tratamento de Erros

**O service lança o erro. O hook captura e trata. A página não sabe que houve erro.**

```
// service — só lança
export async function createEmpresa(data) {
  const response = await authApi.post('/v1/empresas', data);
  return response.data;
}

// hook — captura e trata
const createEmpresa = async (data) => {
  showLoading(true);
  try {
    await createEmpresaService(data);
    addToast('Empresa criada com sucesso!', 'success');
  } catch (err) {
    const msg = err.response?.data?.message || 'Erro ao criar empresa.';
    addToast(msg, 'error');
  } finally {
    showLoading(false);
  }
};
```

Nunca swallow silently: se um `catch` não faz nada, o usuário fica sem feedback e você fica sem log.

---

## 8. Fluxo Completo de uma Requisição

O que acontece quando o usuário clica em "Salvar" numa tela de cadastro:

1. **Página** chama `onSubmit` → chama a função exposta pelo hook
2. **Hook** valida os dados → chama o service → atualiza estado (loading, erro, sucesso)
3. **Service** monta a requisição → chama `authApi.post(...)` → retorna os dados
4. **`api.js`** adiciona o Bearer token automaticamente via interceptor
5. **Backend** processa e responde
6. **Hook** recebe o resultado → chama `addToast('Sucesso', 'success')`
7. **Página** re-renderiza automaticamente com o novo estado

Cada camada faz só uma coisa. Se der bug, você já sabe onde procurar.

---

## 9. Padrões de Nomenclatura

| Tipo | Padrão | Exemplo |
|---|---|---|
| Página | PascalCase | `CadastroEmpresa.jsx` |
| Componente | PascalCase | `EmpresaCard.jsx` |
| Hook | camelCase com prefixo `use` | `useEmpresas.js` |
| Service | camelCase com sufixo `.service` | `empresas.service.js` |
| CSS Module | mesmo nome do componente | `EmpresaCard.module.css` |
| Função de fetch | `fetch` + entidade | `fetchEmpresas` |
| Função de mutação | verbo + entidade | `createEmpresa`, `updateEmpresa` |

---

## 10. Checklist para Criar uma Tela Nova

**Passo 1 — Service**
- [ ] Criar `src/services/{modulo}.service.js`
- [ ] Exportar uma função por operação de API (get, create, update, delete)
- [ ] Usar `authApi` de `src/services/api.js`

**Passo 2 — Hook**
- [ ] Criar `src/hooks/use{Modulo}.js`
- [ ] Gerenciar loading e erros com `useUI()`
- [ ] Expor estado e funções para a página

**Passo 3 — Página**
- [ ] Criar `src/pages/{Modulo}/{Modulo}.jsx` + `.module.css`
- [ ] Consumir o hook, não o service diretamente
- [ ] Manter estado de UI local (modal aberto, filtro ativo)
- [ ] Registrar a rota em `routes.jsx`

**Passo 4 — Componentes**
- [ ] Antes de criar, checar `src/components/Common/`
- [ ] Componentes de domínio em `src/components/{Modulo}/`
- [ ] Cada componente com seu próprio `.module.css`

---

## 11. Referência Rápida

| Sintoma | Causa provável | O que fazer |
|---|---|---|
| Página com 300+ linhas | Lógica de dados misturada com UI | Extrair hook + subcomponentes |
| `authApi.get()` dentro de página | Service não foi criado | Criar `{modulo}.service.js` |
| 8+ `useState` na mesma página | Formulário sem estrutura | Agrupar em objeto de estado |
| `try/catch` repetido em várias páginas | Lógica de erro duplicada | Centralizar no hook |
| Componente recebe 10+ props | Componente faz coisas demais | Quebrar em subcomponentes |
| Estado de dados no Context | Dado não é realmente global | Mover para hook da tela |

---

---

## 12. Testes

### Estrutura de pastas

Os testes ficam em `tests/src/`, espelhando a estrutura do `src/`:

```
tests/
├── setupTests.js              # Setup global (polyfills, mocks de browser)
├── __mocks__/
│   └── fileMock.cjs           # Stub para imports de imagem/fonte
├── src/
│   ├── components/
│   │   └── Common/
│   │       └── ButtonBlue/
│   │           └── ButtonBlue.test.jsx
│   ├── context/
│   │   ├── AuthContext.test.jsx
│   │   └── UIContext.test.jsx
│   ├── pages/
│   │   └── Empresas/
│   │       └── Empresas.test.jsx
│   └── utils/
│       └── companyValidation.test.js
```

### Scripts disponíveis

```bash
npm test                   # roda testes unitários
npm run test:watch         # modo watch
npm run test:cov           # com cobertura de código
npm run test:integration   # testes de integração
npm run test:all           # unit + integration + e2e
```

---

### O que testar em cada camada

**Componentes** — renderização e interação do usuário:

```jsx
// tests/src/components/Common/ButtonBlue/ButtonBlue.test.jsx
import { render, fireEvent, screen } from '@testing-library/react';
import ButtonBlue from '../../../../../src/components/Common/ButtonBlue/ButtonBlue';

describe('ButtonBlue', () => {
  it('renderiza o texto do botão', () => {
    render(<ButtonBlue>Salvar</ButtonBlue>);
    expect(screen.getByText('Salvar')).toBeInTheDocument();
  });

  it('chama onClick ao ser clicado', () => {
    const onClick = jest.fn();
    render(<ButtonBlue onClick={onClick}>Salvar</ButtonBlue>);
    fireEvent.click(screen.getByText('Salvar'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
```

**Utils** — funções puras com casos de borda, use `test.each` para múltiplos cenários:

```js
// tests/src/utils/companyValidation.test.js
const casos = [
  ['12.345.678/0001-95', true],
  ['00.000.000/0000-00', false],
  [null, false],
  ['', false],
];

test.each(casos)('cnpj "%s" → válido: %s', (cnpj, esperado) => {
  expect(validarCnpj(cnpj)).toBe(esperado);
});
```

**Context** — teste via um componente auxiliar (`Probe`) que consome o hook:

```jsx
// tests/src/context/UIContext.test.jsx
function Probe() {
  const { theme, toggleTheme } = useUI();
  return <button onClick={toggleTheme}>{theme}</button>;
}

it('alterna o tema ao clicar', () => {
  render(<UIProvider><Probe /></UIProvider>);
  expect(screen.getByText('light')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button'));
  expect(screen.getByText('dark')).toBeInTheDocument();
});
```

**Páginas** — mock de dependências externas, use uma função `renderPage()` para evitar repetição:

```jsx
// tests/src/pages/Empresas/Empresas.test.jsx
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Empresas from '../../../../src/pages/Empresas/Empresas';

// mock da API — nunca use a instância real nos testes
jest.mock('../../../../src/services/api', () => ({
  authApi: { get: jest.fn() },
}));

// mock de componentes externos pesados (charts, mapas)
jest.mock('react-apexcharts', () => ({ default: () => <div /> }));

// mock de contextos quando a página depende deles
jest.mock('../../../../src/context/AuthContext', () => ({
  useAuth: () => ({ user: { nome: 'Admin' } }),
}));

const { authApi } = require('../../../../src/services/api');

function renderPage() {
  return render(
    <MemoryRouter>
      <Empresas />
    </MemoryRouter>
  );
}

describe('Empresas', () => {
  beforeEach(() => {
    authApi.get.mockResolvedValue({
      data: { data: { items: [{ id: '1', nome: 'Acme' }], totalPages: 1 } },
    });
  });

  it('exibe a lista de empresas após carregar', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Acme')).toBeInTheDocument();
    });
  });

  it('exibe mensagem de erro quando a API falha', async () => {
    authApi.get.mockRejectedValueOnce(new Error('Erro de rede'));
    renderPage();
    await waitFor(() => {
      expect(screen.getByText(/erro/i)).toBeInTheDocument();
    });
  });
});
```

---

### Regras de mock

**1. Sempre mocke o módulo de API — nunca faça chamadas reais nos testes:**

```js
jest.mock('../../../../src/services/api', () => ({
  authApi: { get: jest.fn(), post: jest.fn(), patch: jest.fn() },
}));
```

**2. Mocke bibliotecas pesadas que não têm relevância no teste:**

```js
jest.mock('leaflet', () => ({}));
jest.mock('react-apexcharts', () => ({ default: () => <div data-testid="chart" /> }));
```

**3. Mocke componentes filhos quando o teste é da página pai:**

```js
jest.mock('../../../../src/components/Common/Table/Table', () => ({
  default: ({ data }) => <ul>{data.map(d => <li key={d.id}>{d.nome}</li>)}</ul>,
}));
```

**4. Use `mockResolvedValueOnce` e `mockRejectedValueOnce` para controlar respostas por teste:**

```js
// sucesso
authApi.get.mockResolvedValueOnce({ data: { ... } });

// erro
authApi.get.mockRejectedValueOnce(new Error('500'));
```

---

### Checklist para cada teste novo

- [ ] Arquivo em `tests/src/` espelhando o caminho do `src/`
- [ ] `describe()` com o nome do componente/hook/página
- [ ] Cada `it()` testa uma coisa só (renderização, interação, estado de erro)
- [ ] API mockada — sem chamadas reais
- [ ] `beforeEach()` reinicia os mocks e limpa o `localStorage` se necessário
- [ ] `waitFor()` em operações assíncronas (fetch, estado que muda depois do mount)
- [ ] Rodar `npm test` antes de abrir PR

---

> **Resumindo em uma frase:**
> Service é como a API é chamada. Hook é o que o dado significa para a tela. Página é o que o usuário vê. Componente é um pedaço reutilizável do que o usuário vê. Teste é a prova de que tudo isso funciona junto.
