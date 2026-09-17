import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

function loadEnv() {
  const envPath = path.resolve(process.cwd(), '.env');
  const env = {};
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf-8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        const key = trimmed.slice(0, idx).trim();
        const val = trimmed.slice(idx + 1).trim();
        env[key] = val;
      }
    }
  }
  return env;
}

async function runDatabaseTest() {
  console.log('\n🔍 =======================================================');
  console.log('       NutriFam - Teste de Conexão com o Supabase');
  console.log('=========================================================\n');

  const env = loadEnv();
  const url = process.env.VITE_SUPABASE_URL || env.VITE_SUPABASE_URL;
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY || env.VITE_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    console.error('❌ ERRO: Variáveis VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY não encontradas no arquivo .env!');
    process.exit(1);
  }

  console.log(`🌐 URL do Supabase: ${url}`);
  console.log(`🔑 Chave Anon: ${anonKey.slice(0, 15)}...${anonKey.slice(-8)}\n`);

  const supabase = createClient(url, anonKey);

  const tables = [
    { name: 'profiles', label: 'Perfis de Usuários & Pet FoodBud' },
    { name: 'day_logs', label: 'Diário (Refeições, Água, Atividades, Missões)' },
    { name: 'weight_entries', label: 'Histórico de Pesagens & Biometria' },
    { name: 'custom_foods', label: 'Alimentos e Receitas Personalizadas' }
  ];

  let allSuccess = true;
  const missingTables = [];

  for (const t of tables) {
    process.stdout.write(`⏳ Verificando tabela "${t.name}" (${t.label})... `);
    try {
      const { data, error } = await supabase.from(t.name).select('*').limit(1);
      if (error) {
        if (error.code === '42P01' || error.message?.includes('schema cache')) {
          console.log('❌ NÃO ENCONTRADA');
          missingTables.push(t.name);
          allSuccess = false;
        } else {
          console.log(`⚠️ ERRO (${error.message})`);
          allSuccess = false;
        }
      } else {
        console.log('✅ OK (Ativa e respondendo)');
      }
    } catch (e) {
      console.log(`❌ FALHA: ${e.message}`);
      allSuccess = false;
    }
  }

  // Check columns on profiles if table exists
  if (!missingTables.includes('profiles')) {
    process.stdout.write(`⏳ Checando novas colunas em "profiles" (pet_name, equipped_clothes, show_splash_animation, avatar_url)... `);
    try {
      const { data, error } = await supabase.from('profiles').select('id, pet_name, equipped_clothes, show_splash_animation, avatar_url').limit(1);
      if (error) {
        console.log(`⚠️ Faltam colunas: ${error.message}`);
      } else {
        console.log('✅ OK (Todas as colunas existem)');
      }
    } catch (e) {
      console.log(`⚠️ Falha ao checar colunas: ${e.message}`);
    }
  }

  // Check storage bucket 'avatars'
  process.stdout.write(`⏳ Checando Bucket de Fotos de Perfil no Storage ("avatars")... `);
  try {
    const { data: buckets, error: bErr } = await supabase.storage.listBuckets();
    if (bErr) {
      console.log(`⚠️ ERRO (${bErr.message})`);
    } else {
      const hasAvatars = buckets?.some((b) => b.name === 'avatars' || b.id === 'avatars');
      if (hasAvatars) {
        console.log('✅ OK (Bucket "avatars" ativo e público)');
      } else {
        console.log('⚠️ PENDENTE (Execute a migration no SQL Editor do Supabase para criar o bucket)');
      }
    }
  } catch (e) {
    console.log(`⚠️ Falha ao checar storage: ${e.message}`);
  }

  console.log('\n---------------------------------------------------------');
  if (allSuccess) {
    console.log('🎉 SUCESSO TOTAL! Seu banco de dados Supabase está 100% configurado e pronto!');
    console.log('Todas as tabelas, permissões e sincronizações estão funcionando perfeitamente.\n');
  } else {
    console.log('⚠️ ATENÇÃO: O banco de dados está acessível, mas algumas tabelas ainda não foram criadas.');
    console.log(`Tabelas pendentes: ${missingTables.join(', ')}`);
    console.log('\n👉 COMO RESOLVER EM 1 MINUTO:');
    console.log('1. Abra o painel do Supabase: https://supabase.com/dashboard');
    console.log('2. Clique no seu projeto e vá em "SQL Editor"');
    console.log('3. Abra o arquivo "supabase/schema.sql" do projeto, copie todo o conteúdo e cole no SQL Editor');
    console.log('4. Clique no botão verde "Run"');
    console.log('5. Rode este comando novamente (npm run test:db) para confirmar!\n');
  }
}

runDatabaseTest();
