# BarberTime — Front-end Web

Interface web (React) do **BarberTime**, sistema de agendamentos para barbearias.
Consome a API REST (Django REST Framework + JWT) descrita na documentação do
backend.

> Escopo atual: **essencial** — autenticação (login/cadastro/logout), perfil do
> usuário, listagem pública de serviços e de barbeiros. Os endpoints de
> agendamento (US05–US08) ainda não existem no backend e serão adicionados
> quando disponíveis.

---

## Stack

- **React 18** + **Vite** (JavaScript)
- **React Router** — roteamento SPA
- **TanStack Query** — cache, loading e refetch de dados de servidor
- **Axios** — cliente HTTP com interceptors (injeção de JWT + refresh automático)
- **CSS puro** com design tokens — tema preto/laranja/glassmorphism

## Pré-requisitos

- Node.js 18+ e npm
- Backend do BarberTime rodando (por padrão em `http://localhost:8000`)

## Configuração

1. Instale as dependências:

   ```bash
   npm install
   ```

2. Crie o arquivo `.env` a partir do exemplo e ajuste a URL da API:

   ```bash
   cp .env.example .env
   ```

   ```env
   VITE_API_BASE_URL=http://localhost:8000
   ```

3. Rode em desenvolvimento:

   ```bash
   npm run dev
   ```

   App disponível em `http://localhost:5173`.

4. Build de produção:

   ```bash
   npm run build
   npm run preview
   ```

## Estrutura de pastas

```
src/
├── api/              # Camada de acesso à API (axios + endpoints por domínio)
│   ├── client.js     # Instância axios, interceptors JWT/refresh, parse de erros
│   ├── tokenStorage.js
│   ├── auth.js       # login, cadastro, logout
│   ├── usuarios.js   # perfil (get/patch)
│   ├── barbeiros.js  # lista pública
│   └── servicos.js   # lista e detalhe
├── context/
│   └── AuthContext.jsx   # Estado global de autenticação/sessão
├── hooks/            # Hooks de dados (TanStack Query) por domínio
├── components/       # UI reutilizável (Navbar, Layout, Cards, Loader, rota protegida)
├── pages/            # Telas (Home, Login, Cadastro, Serviços, Barbeiros, Perfil, 404)
├── styles/           # Tokens de tema + layout (CSS)
├── utils/            # Formatação (preço, duração, iniciais)
├── App.jsx           # Definição de rotas
└── main.jsx          # Providers (QueryClient, Router, Auth) + bootstrap
```

## Mapa de telas → endpoints

| Tela | Rota | Endpoint(s) da API |
|------|------|--------------------|
| Login | `/login` | `POST /api/token/` |
| Cadastro | `/cadastro` | `POST /api/usuarios/cadastro/` (+ login) |
| Perfil | `/perfil` 🔒 | `GET` / `PATCH /api/usuarios/perfil/` |
| Serviços | `/servicos` | `GET /api/servicos/` |
| Barbeiros | `/barbeiros` | `GET /api/barbeiros/` |
| Logout | (navbar) | `POST /api/token/logout/` |

🔒 = exige autenticação.

## Autenticação (como funciona no front)

- O `access` e o `refresh` são guardados em `localStorage` (`tokenStorage`).
- O interceptor de **request** injeta `Authorization: Bearer <access>`.
- O interceptor de **response** detecta `401`, chama `POST /api/token/refresh/`
  automaticamente, repete a requisição original e enfileira chamadas
  concorrentes para evitar múltiplos refresh simultâneos.
- Se o refresh falhar, a sessão é limpa e o usuário volta para o login.
- No logout, o `refresh` é invalidado no servidor (blacklist) e removido local.

## Documentação

- [`docs/REQUISITOS.md`](docs/REQUISITOS.md) — requisitos funcionais e não funcionais.
- [`docs/SYSTEM_DESIGN.md`](docs/SYSTEM_DESIGN.md) — arquitetura e componentes.
