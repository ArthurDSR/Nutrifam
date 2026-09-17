# NutriFam

Aplicativo mobile-first para acompanhar alimentação, hidratação, peso, jejum e hábitos. O FoodBud transforma o progresso diário em missões, níveis e recompensas.

## Tecnologias

- React 18, TypeScript e Vite
- Tailwind CSS
- Supabase para autenticação e sincronização opcional
- Open Food Facts para busca e leitura de códigos de barras
- Integrações opcionais com Gemini, OpenAI e OpenRouter

## Desenvolvimento local

```bash
npm install
cp .env.example .env
npm run dev
```

O aplicativo funciona em modo local sem conta. Para ativar a nuvem, configure `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` no `.env` e aplique o arquivo `supabase/schema.sql` no projeto Supabase.

## Comandos

- `npm run dev`: inicia o servidor local.
- `npm run build`: valida o TypeScript e gera o build de produção.
- `npm run preview`: serve o build localmente.
- `npm run test:db`: verifica a conexão e as tabelas do Supabase.

## Estrutura principal

- `src/components/pet/FoodBudView.tsx`: área interativa do FoodBud.
- `src/components/journal`: diário de alimentação, água, atividades e jejum.
- `src/components/profile`: peso, metas e análise nutricional.
- `src/services`: persistência, autenticação, tema, IA e integrações.
- `supabase`: schema e migrations do banco.

O arquivo `.env` não deve ser versionado.
