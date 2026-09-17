# Guia de configuração e migrations do Supabase — NutriFam

Este guia orienta como executar as migrations no seu projeto Supabase para ativar a persistência em nuvem, controle de contas e segurança por usuário (RLS).

---

## Passo a Passo Rápido (Execução em 1 Minuto no Supabase Dashboard)

1. Acesse seu painel no [Supabase Dashboard](https://supabase.com/dashboard).
2. Selecione ou crie seu projeto (recomendamos a região **São Paulo - `sa-east-1`**).
3. No menu lateral esquerdo, clique no ícone **SQL Editor** (`>_`).
4. Clique em **New Query** (Nova Consulta).
5. Abra o arquivo [`supabase/schema.sql`](./schema.sql), copie todo o conteúdo e cole no editor do Supabase.
6. Clique no botão verde **Run** no canto inferior direito.
7. Pronto! Todas as tabelas, índices, gatilhos de criação de usuário e políticas de segurança RLS estarão ativas.

---

## O Que Foi Criado

| Tabela | Descrição | Segurança |
| :--- | :--- | :--- |
| `public.profiles` | Armazena dados antropométricos, metas calóricas, macros e estado do Pet Guaxinim | Vinculado a `auth.users(id)` com RLS estrito |
| `public.day_logs` | Diário completo de refeições, ingestão de água, sessões de jejum e notas diárias | Isolado por `user_id` com chave composta `(user_id, date)` |
| `public.weight_entries` | Histórico de pesagens e anotações para o gráfico de evolução | Isolado por `user_id` |
| `public.custom_foods` | Alimentos e receitas personalizadas com grupos NOVA e alternativas saudáveis | Isolado por `user_id` |

### Trigger Automático de Novos Usuários (`on_auth_user_created`)
Quando um usuário se cadastra pelo app via `supabase.auth.signUp()`, o gatilho `handle_new_user()` cria automaticamente a linha de perfil correspondente na tabela `public.profiles` com o nome e e-mail informados, evitando inconsistências.

---

## Como conectar ao NutriFam

Abra o arquivo `.env` na raiz do projeto e preencha suas chaves encontradas em **Project Settings -> API**:

```env
VITE_SUPABASE_URL=https://seuidprojeto.supabase.co
VITE_SUPABASE_ANON_KEY=eyJh...
```

O aplicativo detectará as credenciais automaticamente e sincronizará em segundo plano.
