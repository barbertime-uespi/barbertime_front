# BarberTime Front-end — System Design

**Versão:** 1.0
**Data:** 2026-11-17
**Escopo:** SPA React que consome a API REST do BarberTime (DRF + JWT).

---

## 1. Objetivo e contexto

O front-end é uma **Single Page Application (SPA)** que roda no navegador e se
comunica exclusivamente com a **API REST** do BarberTime via HTTP/JSON. Não há
backend próprio do front: toda persistência e regra de negócio vive no servidor
Django. O front é responsável por **apresentação, navegação, gestão de sessão
(JWT) e orquestração de chamadas à API**.

### Diagrama de contexto

```
┌──────────────┐     HTTP/JSON (Bearer JWT)     ┌──────────────────────┐
│   Navegador  │  ───────────────────────────▶  │  API BarberTime      │
│  (SPA React) │  ◀───────────────────────────  │  Django REST + JWT   │
└──────────────┘      access / refresh          └──────────────────────┘
       │                                                   │
       │ localStorage (access, refresh)                    │ DB
       ▼                                                   ▼
  tokenStorage                                        PostgreSQL/SQLite
```

---

## 2. Arquitetura em camadas

O código é organizado em camadas com responsabilidades bem definidas, de modo
que a UI nunca fale HTTP diretamente e a troca de endpoints não impacte telas.

```
┌─────────────────────────────────────────────────────────────┐
│  Pages (telas)        → Home, Login, Cadastro, Serviços...   │  Apresentação
├─────────────────────────────────────────────────────────────┤
│  Components (UI)      → Navbar, Layout, Cards, ProtectedRoute │  Apresentação
├─────────────────────────────────────────────────────────────┤
│  Hooks (dados)        → useServicos, useBarbeiros, usePerfil  │  Estado de servidor
│  Context              → AuthContext (sessão/usuário)          │  Estado global
├─────────────────────────────────────────────────────────────┤
│  API layer            → auth, usuarios, barbeiros, servicos   │  Acesso a dados
│  client.js            → axios + interceptors + parse de erro  │
│  tokenStorage.js      → persistência de tokens                │
├─────────────────────────────────────────────────────────────┤
│  Utils / Styles       → format, tokens de tema (CSS)          │  Transversal
└─────────────────────────────────────────────────────────────┘
```

**Regra de dependência:** camadas de cima dependem das de baixo, nunca o
contrário. Páginas usam hooks/contexto; hooks usam a API layer; a API layer usa
o `client` e o `tokenStorage`.

---

## 3. Principais componentes

### 3.1 Camada de API (`src/api/`)

- **`client.js`** — coração da comunicação. Cria a instância Axios com `baseURL`
  derivada de `VITE_API_BASE_URL`. Responsabilidades:
  - *Request interceptor:* injeta `Authorization: Bearer <access>`.
  - *Response interceptor:* em `401`, dispara o fluxo de refresh (ver §5),
    repete a requisição original e **enfileira** chamadas concorrentes para que
    apenas um refresh ocorra por vez.
  - `parseApiError()` — normaliza mensagens de erro do DRF (`{campo: [msg]}`,
    `detail`, string) em texto amigável para a UI.
  - `setOnSessionExpired()` — ponto de extensão para o `AuthContext` reagir à
    expiração definitiva (refresh falhou).
- **`tokenStorage.js`** — abstrai a persistência dos tokens (`localStorage`),
  com API mínima (`get/set/clear/hasSession`). Centralizar aqui permite trocar
  a estratégia de armazenamento sem tocar no resto do app.
- **Módulos por domínio** (`auth.js`, `usuarios.js`, `barbeiros.js`,
  `servicos.js`) — funções finas que mapeiam 1:1 os endpoints documentados,
  retornando apenas `data`. Isolam as telas das URLs/contratos.

### 3.2 Gestão de autenticação (`src/context/AuthContext.jsx`)

Provedor React que mantém o **estado global de sessão**:
- `usuario`, `autenticado`, `carregando`.
- `entrar()` — login + busca de perfil; `sair()` — logout remoto + limpeza local.
- **Reidratação:** ao montar, se existe sessão salva, busca `GET /usuarios/perfil/`
  para recuperar o usuário após refresh de página.
- Registra-se como `onSessionExpired` no `client` para limpar a sessão quando o
  refresh falhar.

### 3.3 Estado de servidor (`src/hooks/` com TanStack Query)

- **`useServicos` / `useBarbeiros`** — `useQuery` com `queryKey` por domínio e
  `staleTime` de 1 min; fornecem `isLoading`, `isError` e `data` prontos.
- **`useAtualizarPerfil`** — `useMutation` que, ao salvar, sincroniza o usuário
  no `AuthContext`.
- **Por que TanStack Query:** cache, deduplicação de requisições, estados de
  carregamento/erro e refetch sem *boilerplate* manual.

### 3.4 Roteamento e proteção (`App.jsx`, `ProtectedRoute.jsx`, `Layout.jsx`)

- **`App.jsx`** — define as rotas. Telas de auth (`/login`, `/cadastro`) ficam
  fora da casca; as demais usam `Layout` (navbar + footer).
- **`ProtectedRoute`** — envolve rotas privadas (`/perfil`): aguarda a
  reidratação, redireciona ao login quando não autenticado e preserva o destino
  original via `state.from`.
- **`Layout`** — casca visual comum (navbar sticky + conteúdo + footer).

### 3.5 Componentes de UI (`src/components/`)

- **`Navbar`** — navegação adaptada ao estado de auth (links + ações).
- **`ServicoCard` / `BarbeiroCard`** — apresentação de cada item, aplicando a
  formatação de `utils/format` (preço em BRL, duração legível, iniciais).
- **`Loader`**, **`Brand`** — peças reutilizáveis de feedback e identidade.

### 3.6 Camada visual (`src/styles/`)

- **`theme.css`** — *design tokens* (cores, raios, blur, sombras) e classes base
  (`glass`, `btn`, `field`, `badge`, `alert`...). Centraliza o tema
  preto/laranja/glass e garante consistência.
- **`layout.css`** — composições específicas (navbar, cards, auth, perfil).

---

## 4. Fluxos principais

### 4.1 Login

```
Login.jsx → AuthContext.entrar()
  → POST /api/token/           (obtém access + refresh)
  → tokenStorage.setTokens()
  → GET /api/usuarios/perfil/  (hidrata usuário)
  → navega para destino/Home
```

### 4.2 Cadastro

```
Cadastro.jsx
  → POST /api/usuarios/cadastro/   (cria cliente)
  → AuthContext.entrar()           (login automático)
  → Home
```

### 4.3 Consulta de serviços/barbeiros

```
Página → hook (useQuery) → api/*.js → GET /api/{recurso}/
       ← cache + estados (loading/erro/vazio) ←
```

---

## 5. Gestão de token (sequência de refresh)

Ponto mais sensível do design. Objetivo: renovar o `access` de forma
transparente, sem corridas (uma requisição falha → **um** refresh → repetição).

```
Requisição protegida
      │
      ▼
   401? ──não──▶ retorna normalmente
      │ sim
      ▼
 há refresh salvo? ──não──▶ limpa sessão → onSessionExpired() → /login
      │ sim
      ▼
 refresh em andamento? ──sim──▶ enfileira (pendingQueue) e aguarda o novo access
      │ não
      ▼
 POST /api/token/refresh/
      │
   sucesso? ──não──▶ limpa sessão → rejeita fila → /login
      │ sim
      ▼
 salva novo access → resolve fila → repete a requisição original
```

Mecanismos-chave: flag `isRefreshing`, fila `pendingQueue` e marca `_retry` na
requisição (evita loop). A instância `rawApi` (sem interceptors) faz o refresh
para não reentrar no próprio interceptor.

---

## 6. Decisões de arquitetura (e trade-offs)

| Decisão | Motivo | Trade-off |
|---------|--------|-----------|
| **SPA (Vite + React)** sem SSR | App só consome API; simplicidade e build rápido. | Sem SEO/SSR (irrelevante para app autenticado). |
| **TanStack Query** para leitura | Cache e estados prontos, menos código. | +1 dependência e curva de aprendizado. |
| **Axios com interceptors** | Refresh automático e injeção de token centralizados. | Acoplamento ao Axios (isolado em `client.js`). |
| **Tokens em `localStorage`** | Persistência simples entre sessões. | Exposto a XSS; mitigado por isolar em `tokenStorage` (trocável por cookie httpOnly se o backend suportar). |
| **API layer por domínio** | Telas desacopladas de URLs/contratos. | Mais arquivos, porém mais testável e manutenível. |
| **CSS puro + tokens** | Controle total do tema glass, zero dependência de UI kit. | Sem componentes prontos; mais CSS escrito à mão. |

---

## 7. Segurança

- Tokens trafegam apenas no header `Authorization`.
- Refresh automático reduz reautenticação; logout faz *blacklist* do refresh.
- `ProtectedRoute` impede acesso a telas privadas sem sessão.
- Mensagens de erro são normalizadas (não expõem detalhes internos do servidor).
- **Recomendação futura:** migrar tokens para cookie `httpOnly`/`SameSite` caso
  o backend ofereça esse fluxo, mitigando XSS.

---

## 8. Escalabilidade e evolução

A estrutura por domínio já acomoda as próximas histórias (US05–US08) sem
reescrita:

- **Novos domínios** (ex.: `agendamentos`) → novo módulo em `api/`, novos hooks e
  páginas, reaproveitando `client`, `AuthContext`, `Layout` e tokens de tema.
- **Controle por papel** (cliente/barbeiro/admin) → o `usuario.tipo` já é exposto;
  basta derivar guardas de rota/menus a partir dele.
- **Telas administrativas** (CRUD de barbeiros/serviços) → adicionar mutations e
  rotas protegidas por papel, consumindo endpoints `/api/admin/...` e escrita em
  `/api/servicos/`.

---

## 9. Tecnologias

| Camada | Tecnologia |
|--------|------------|
| UI / Runtime | React 18 |
| Build / Dev server | Vite |
| Roteamento | React Router |
| Estado de servidor | TanStack Query |
| HTTP | Axios |
| Estilo | CSS (design tokens, glassmorphism) |
| Linguagem | JavaScript (ES2022) |
