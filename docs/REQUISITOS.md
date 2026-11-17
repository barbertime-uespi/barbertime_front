# BarberTime Front-end — Documento de Requisitos

**Versão:** 1.0
**Data:** 2026-11-17
**Produto:** Interface web (React) do BarberTime — sistema de agendamentos para barbearias
**Escopo desta versão:** Essencial (autenticação, perfil, consulta de serviços e barbeiros)

---

## 1. Visão geral

O BarberTime centraliza os agendamentos de barbearias que hoje acontecem por
WhatsApp, telefone e agenda de papel. Este documento descreve os requisitos do
**front-end web**, que consome a API REST (Django REST Framework + JWT) do
backend.

Esta versão entrega as funcionalidades já disponíveis na API: cadastro e login
de clientes, gestão do próprio perfil e consulta pública de serviços e barbeiros.
As funcionalidades de agendamento (US05–US08) dependem de endpoints que **ainda
não existem** no backend e ficam fora do escopo atual.

### 1.1 Perfis de usuário

| Papel | Descrição |
|-------|-----------|
| **Visitante** | Não autenticado. Vê serviços e barbeiros; pode se cadastrar. |
| **Cliente** | Autenticado. Consulta serviços/barbeiros e gerencia o próprio perfil. |
| **Barbeiro** | Autenticado. (Perfil reconhecido pela API; telas de gestão fora do escopo essencial.) |
| **Administrador** | Autenticado. (Gestão de barbeiros/serviços fora do escopo essencial.) |

---

## 2. Requisitos Funcionais (RF)

### RF01 — Cadastro de cliente
- **Descrição:** o visitante pode criar uma conta de cliente informando nome,
  e-mail, telefone, usuário e senha.
- **Critérios de aceite:**
  - Senha deve ter no mínimo 6 caracteres (validado no front antes do envio).
  - Em caso de sucesso (`201`), o usuário é autenticado automaticamente e
    redirecionado para a Home.
  - Erros da API (e-mail/usuário em uso, dados inválidos) são exibidos de forma
    legível.
- **Endpoint:** `POST /api/usuarios/cadastro/`

### RF02 — Login
- **Descrição:** usuário cadastrado autentica-se com usuário e senha.
- **Critérios de aceite:**
  - Em sucesso, `access` e `refresh` são armazenados e o usuário é levado ao
    destino original (ou Home).
  - Credenciais inválidas (`401`) exibem mensagem clara.
- **Endpoint:** `POST /api/token/`

### RF03 — Renovação de sessão (refresh)
- **Descrição:** quando o `access` expira, o sistema renova a sessão de forma
  transparente, sem forçar novo login.
- **Critérios de aceite:**
  - Em `401`, o front chama o refresh e repete a requisição original.
  - Requisições concorrentes aguardam um único refresh (sem chamadas duplicadas).
  - Se o refresh falhar, a sessão é encerrada e o usuário é levado ao login.
- **Endpoint:** `POST /api/token/refresh/`

### RF04 — Logout
- **Descrição:** o usuário autenticado pode encerrar a sessão.
- **Critérios de aceite:**
  - O `refresh` é invalidado no servidor (blacklist).
  - Os tokens são removidos localmente mesmo se a chamada remota falhar.
  - Usuário é redirecionado para o login.
- **Endpoint:** `POST /api/token/logout/`

### RF05 — Visualizar perfil
- **Descrição:** o usuário autenticado vê seus dados (nome, e-mail, telefone,
  usuário, tipo/papel).
- **Critérios de aceite:**
  - A tela de perfil só é acessível autenticado (rota protegida).
  - O campo `tipo` é exibido (cliente/barbeiro/admin/usuario).
- **Endpoint:** `GET /api/usuarios/perfil/`

### RF06 — Editar perfil
- **Descrição:** o usuário edita nome, e-mail e telefone.
- **Critérios de aceite:**
  - Alterações parciais são suportadas (PATCH).
  - Sucesso exibe confirmação; erros exibem mensagem.
  - O usuário em memória (contexto) é atualizado após salvar.
- **Endpoint:** `PATCH /api/usuarios/perfil/`

### RF07 — Listar serviços
- **Descrição:** qualquer usuário (inclusive visitante) consulta a lista de
  serviços ativos.
- **Critérios de aceite:**
  - `preco` (string decimal) é formatado como moeda (BRL).
  - `duracao` (`HH:MM:SS`) é exibida de forma legível (ex.: "30 min").
  - Estados de carregamento, erro e lista vazia são tratados.
- **Endpoint:** `GET /api/servicos/`

### RF08 — Listar barbeiros
- **Descrição:** qualquer usuário consulta a lista de barbeiros ativos.
- **Critérios de aceite:**
  - Exibe nome, e-mail, telefone e status (ativo).
  - Estados de carregamento, erro e lista vazia são tratados.
- **Endpoint:** `GET /api/barbeiros/`

### RF09 — Navegação e controle de acesso
- **Descrição:** a navegação reflete o estado de autenticação.
- **Critérios de aceite:**
  - Visitante vê "Entrar"/"Criar conta"; autenticado vê nome + "Sair" + "Perfil".
  - Rota `/perfil` redireciona ao login quando não autenticado, preservando o
    destino.

---

## 3. Requisitos Não Funcionais (RNF)

| ID | Categoria | Requisito |
|----|-----------|-----------|
| RNF01 | Usabilidade | Interface responsiva (desktop e mobile), com feedback visual de loading, erro e sucesso. |
| RNF02 | Identidade visual | Tema escuro (preto) com destaque laranja e efeito *glassmorphism*. |
| RNF03 | Segurança | Tokens enviados apenas via header `Authorization`; refresh automático; logout invalida o refresh no servidor. |
| RNF04 | Performance | Cache de dados de leitura (serviços/barbeiros) com *stale time* para reduzir chamadas. |
| RNF05 | Manutenibilidade | Camada de API isolada por domínio; componentes e hooks reutilizáveis. |
| RNF06 | Internacionalização | Textos e formatação (moeda/duração) em pt-BR. |
| RNF07 | Compatibilidade | Navegadores modernos com suporte a `backdrop-filter`. |
| RNF08 | Configurabilidade | URL base da API parametrizável por variável de ambiente (`VITE_API_BASE_URL`). |

---

## 4. Regras de negócio relevantes (do backend)

- **RN01:** `access` expira em 60 min; `refresh` em 1 dia (com rotação + blacklist).
- **RN02:** Visitantes/clientes veem apenas serviços **ativos**.
- **RN03:** `preco` chega como string decimal (ex.: `"35.00"`) — parse na UI.
- **RN04:** `duracao` chega como `"HH:MM:SS"` — conversão na UI.
- **RN05:** Senha mínima de 6 caracteres no cadastro.
- **RN06:** E-mail e usuário são únicos.

---

## 5. Fora de escopo (versões futuras)

- US05 — Consulta de horários livres por barbeiro.
- US06 — Realização de agendamento.
- US07 — Consulta e cancelamento de agendamentos.
- US08 — Agenda do barbeiro e atualização de status.
- Telas administrativas de CRUD de barbeiros e serviços (a API já expõe os
  endpoints `/api/admin/barbeiros/` e escrita em `/api/servicos/`, mas não fazem
  parte do escopo essencial contratado).

---

## 6. Matriz de rastreabilidade (RF → API → Tela)

| RF | História (backend) | Endpoint | Tela |
|----|--------------------|----------|------|
| RF01 | US01 | `POST /api/usuarios/cadastro/` | Cadastro |
| RF02 | US02 | `POST /api/token/` | Login |
| RF03 | US02 | `POST /api/token/refresh/` | (transparente) |
| RF04 | US02 | `POST /api/token/logout/` | Navbar |
| RF05 | US01 | `GET /api/usuarios/perfil/` | Perfil |
| RF06 | US01 | `PATCH /api/usuarios/perfil/` | Perfil |
| RF07 | US04 | `GET /api/servicos/` | Serviços |
| RF08 | US03 | `GET /api/barbeiros/` | Barbeiros |
