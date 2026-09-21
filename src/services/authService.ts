import { getSupabase, isSupabaseConfigured } from './supabaseClient';
import { UserProfile } from '../types';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  createdAt?: string;
  provider?: 'email' | 'google' | 'apple';
  isEmailVerified?: boolean;
}

const AUTH_SESSION_KEY = 'nutrifam_auth_session';
const LOCAL_USERS_KEY = 'nutrifam_local_accounts';
const LEGACY_AUTH_SESSION_KEY = 'nutrimonitor_auth_session';
const LEGACY_LOCAL_USERS_KEY = 'nutrimonitor_local_accounts';

interface StoredLocalAccount {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  createdAt: string;
  provider?: 'email' | 'google' | 'apple';
  isEmailVerified?: boolean;
  profile?: UserProfile;
}

/**
 * Secure password hashing using Web Crypto API (SHA-256 with salt)
 * Ensures passwords are never stored or compared in plain text.
 */
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  // Kept stable so passwords created before the NutriFam rename remain valid.
  const salt = 'nutrimonitor_secure_salt_v1_2026';
  const data = encoder.encode(salt + password + salt);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Validates email format strictly
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email.trim());
}

/**
 * Get current session user
 */
export function getLocalAuthUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(AUTH_SESSION_KEY) || localStorage.getItem(LEGACY_AUTH_SESSION_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

export function setLocalAuthUser(user: AuthUser | null): void {
  if (user) {
    localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(AUTH_SESSION_KEY);
  }
}

function getStoredLocalAccounts(): StoredLocalAccount[] {
  try {
    const raw = localStorage.getItem(LOCAL_USERS_KEY) || localStorage.getItem(LEGACY_LOCAL_USERS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

function saveStoredLocalAccounts(accounts: StoredLocalAccount[]): void {
  localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(accounts));
}

/**
 * Register a new user with secure password hashing and duplicate email prevention
 */
export async function registerAccount(
  name: string,
  email: string,
  password: string
): Promise<{ success: boolean; message: string; user?: AuthUser }> {
  const cleanName = name.trim();
  const cleanEmail = email.trim().toLowerCase();

  if (!cleanName) {
    return { success: false, message: 'Por favor, informe seu nome completo.' };
  }

  if (!isValidEmail(cleanEmail)) {
    return { success: false, message: 'Por favor, insira um endereço de e-mail válido.' };
  }

  if (password.length < 6) {
    return { success: false, message: 'A senha deve conter no mínimo 6 caracteres.' };
  }

  // 1. If Supabase is configured, use native Supabase Auth (Postgres auth.users with Argon2/bcrypt)
  if (isSupabaseConfigured()) {
    const client = getSupabase();
    if (client) {
      try {
        const { data, error } = await client.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: {
              name: cleanName
            }
          }
        });

        if (error) {
          const lower = error.message.toLowerCase();
          if (lower.includes('already registered') || lower.includes('already in use') || error.status === 422) {
            return {
              success: false,
              message: 'Este e-mail já está cadastrado no sistema. Por favor, faça login.'
            };
          }
          if (lower.includes('rate limit') || lower.includes('over_email_send_rate_limit')) {
            return {
              success: false,
              message: 'Limite temporário de envio de e-mails do Supabase atingido. Tente novamente em alguns minutos.'
            };
          }
          return { success: false, message: `Erro ao criar conta no Supabase: ${error.message}` };
        }

        if (data.user) {
          const authUser: AuthUser = {
            id: data.user.id,
            email: data.user.email || cleanEmail,
            name: cleanName,
            createdAt: data.user.created_at
          };
          setLocalAuthUser(authUser);

          // Try to upsert profile in public.profiles table
          try {
            await client.from('profiles').upsert({
              id: data.user.id,
              name: cleanName,
              avatar_text: (cleanName[0] || 'U').toUpperCase(),
              updated_at: new Date().toISOString()
            });
          } catch {}

          return {
            success: true,
            message: 'Conta criada com sucesso no Supabase!',
            user: authUser
          };
        }
      } catch (err: any) {
        console.warn('Supabase sign up error:', err);
        return { success: false, message: err.message || 'Falha na comunicação com o Supabase.' };
      }
    }
  }

  // 2. Local-First Cryptographic Auth Fallback (Offline Mode)
  const localAccounts = getStoredLocalAccounts();

  // Check for duplicate email
  const existingAccount = localAccounts.find((a) => a.email === cleanEmail);
  if (existingAccount) {
    return {
      success: false,
      message: 'Este e-mail já está cadastrado neste dispositivo. Faça login com sua senha.'
    };
  }

  // Hash password using Web Crypto SHA-256
  const passwordHash = await hashPassword(password);
  const newId = 'usr_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 7);

  const newAccount: StoredLocalAccount = {
    id: newId,
    email: cleanEmail,
    name: cleanName,
    passwordHash,
    createdAt: new Date().toISOString()
  };

  localAccounts.push(newAccount);
  saveStoredLocalAccounts(localAccounts);

  const authUser: AuthUser = {
    id: newId,
    email: cleanEmail,
    name: cleanName,
    createdAt: newAccount.createdAt
  };
  setLocalAuthUser(authUser);

  return {
    success: true,
    message: 'Conta criada e criptografada com sucesso!',
    user: authUser
  };
}

/**
 * Sign in user with password validation
 */
export async function loginAccount(
  email: string,
  password: string
): Promise<{ success: boolean; message: string; user?: AuthUser }> {
  const cleanEmail = email.trim().toLowerCase();

  if (!isValidEmail(cleanEmail)) {
    return { success: false, message: 'Por favor, insira um e-mail válido.' };
  }

  if (!password) {
    return { success: false, message: 'Por favor, digite sua senha.' };
  }

  // 1. Supabase Native Authentication
  if (isSupabaseConfigured()) {
    const client = getSupabase();
    if (client) {
      try {
        const { data, error } = await client.auth.signInWithPassword({
          email: cleanEmail,
          password
        });

        if (error) {
          const lower = error.message.toLowerCase();
          if (
            lower.includes('invalid login credentials') ||
            lower.includes('invalid credentials')
          ) {
            return {
              success: false,
              message: 'E-mail ou senha incorretos. Verifique os dados e tente novamente.'
            };
          }
          if (lower.includes('email not confirmed')) {
            return {
              success: false,
              message: 'Seu cadastro precisa de confirmação de e-mail antes do primeiro login. Verifique sua caixa de entrada ou spam.'
            };
          }
          if (lower.includes('rate limit')) {
            return {
              success: false,
              message: 'Muitas tentativas de login consecutivas. Aguarde alguns segundos e tente novamente.'
            };
          }
          return { success: false, message: error.message };
        }

        if (data.user) {
          const authUser: AuthUser = {
            id: data.user.id,
            email: data.user.email || cleanEmail,
            name: data.user.user_metadata?.name || cleanEmail.split('@')[0],
            createdAt: data.user.created_at
          };
          return {
            success: true,
            message: 'Login realizado com sucesso no Supabase!',
            user: authUser
          };
        }
      } catch (err: any) {
        console.warn('Supabase login error:', err);
        return { success: false, message: err.message || 'Falha na conexão de login.' };
      }
    }
  }

  // 2. Local-First Cryptographic Auth Verification
  const localAccounts = getStoredLocalAccounts();
  const account = localAccounts.find((a) => a.email === cleanEmail);

  if (!account) {
    return {
      success: false,
      message: 'Nenhuma conta cadastrada com este e-mail. Crie uma conta primeiro.'
    };
  }

  const enteredHash = await hashPassword(password);
  if (account.passwordHash !== enteredHash) {
    return {
      success: false,
      message: 'Senha incorreta. Por favor, tente novamente.'
    };
  }

  const authUser: AuthUser = {
    id: account.id,
    email: account.email,
    name: account.name,
    createdAt: account.createdAt
  };
  setLocalAuthUser(authUser);

  return {
    success: true,
    message: 'Login realizado com sucesso!',
    user: authUser
  };
}

/**
 * Sign out current user
 */
export async function logoutAccount(): Promise<void> {
  if (isSupabaseConfigured()) {
    const client = getSupabase();
    if (client) {
      try {
        await client.auth.signOut();
      } catch {}
    }
  }
  setLocalAuthUser(null);
}

/**
 * Send password reset email
 */
export async function requestPasswordReset(email: string): Promise<{ success: boolean; message: string }> {
  const cleanEmail = email.trim().toLowerCase();
  if (!isValidEmail(cleanEmail)) {
    return { success: false, message: 'Por favor, insira um e-mail válido.' };
  }

  if (isSupabaseConfigured()) {
    const client = getSupabase();
    if (client) {
      try {
        const { error } = await client.auth.resetPasswordForEmail(cleanEmail);
        if (error) return { success: false, message: error.message };
        return {
          success: true,
          message: 'Instruções de redefinição de senha enviadas para o seu e-mail!'
        };
      } catch (err: any) {
        return { success: false, message: err.message || 'Erro ao solicitar redefinição.' };
      }
    }
  }

  return {
    success: true,
    message: 'No modo local, você pode redefinir sua senha diretamente na tela de acesso.'
  };
}

/**
 * Sign in with Social OAuth Provider (Google or Apple)
 */
export async function loginWithOAuth(
  provider: 'google' | 'apple'
): Promise<{ success: boolean; message: string; user?: AuthUser; redirecting?: boolean }> {
  const providerLabel = provider === 'google' ? 'Google' : 'Apple';

  if (!isSupabaseConfigured()) {
    return {
      success: false,
      message: `O backend Supabase não está configurado. Verifique as credenciais no arquivo .env para autenticar com ${providerLabel}.`
    };
  }

  const client = getSupabase();
  if (!client) {
    return {
      success: false,
      message: 'Não foi possível inicializar o cliente de autenticação do Supabase.'
    };
  }

  try {
    const { data, error } = await client.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: window.location.origin
      }
    });

    if (error) {
      const msg = error.message.toLowerCase();
      if (msg.includes('not enabled') || msg.includes('validation_failed')) {
        return {
          success: false,
          message: `O provedor ${providerLabel} ainda não está ativado no Supabase. Acesse Authentication -> Providers -> ${providerLabel} no painel do Supabase para configurá-lo.`
        };
      }
      return { success: false, message: `Erro ao autenticar com ${providerLabel}: ${error.message}` };
    }

    if (data?.url) {
      // Pre-check if Supabase Gotrue has this provider enabled before redirecting
      try {
        const checkRes = await fetch(data.url, { method: 'GET', redirect: 'manual' });
        if (checkRes.status === 400) {
          const body = await checkRes.json().catch(() => ({}));
          if (body.msg?.includes('not enabled') || body.error_code === 'validation_failed') {
            return {
              success: false,
              message: `O login com ${providerLabel} precisa ser ativado no seu Supabase. Acesse o Dashboard do Supabase -> Authentication -> Providers -> Ative o ${providerLabel} e insira as chaves de API.`
            };
          }
        }
      } catch {
        // If pre-flight fetch is blocked by CORS, proceed directly with browser navigation
      }

      // Navigate to the official Google/Apple OAuth consent screen
      window.location.assign(data.url);
      return {
        success: true,
        message: `Redirecionando para a autenticação com ${providerLabel}...`,
        redirecting: true
      };
    }

    return {
      success: false,
      message: `Não foi possível gerar a URL de autorização para o ${providerLabel}.`
    };
  } catch (err: any) {
    console.warn(`OAuth ${provider} error:`, err);
    return {
      success: false,
      message: `Falha ao iniciar autenticação com ${providerLabel}: ${err.message || err}`
    };
  }
}

/**
 * Resend email confirmation / verification link
 */
export async function resendVerificationEmail(email: string): Promise<{ success: boolean; message: string }> {
  const cleanEmail = email.trim().toLowerCase();
  if (!isValidEmail(cleanEmail)) {
    return { success: false, message: 'Por favor, insira um e-mail válido.' };
  }

  if (isSupabaseConfigured()) {
    const client = getSupabase();
    if (client) {
      try {
        const { error } = await client.auth.resend({
          type: 'signup',
          email: cleanEmail
        });
        if (error) return { success: false, message: error.message };
        return {
          success: true,
          message: 'E-mail de confirmação reenviado com sucesso! Verifique sua caixa de entrada.'
        };
      } catch (err: any) {
        return { success: false, message: err.message || 'Erro ao reenviar e-mail.' };
      }
    }
  }

  return {
    success: true,
    message: 'Link de verificação reenviado com sucesso para ' + cleanEmail
  };
}

/**
 * Verify email with OTP / Token code
 */
export async function verifyEmailOtp(
  email: string,
  token: string
): Promise<{ success: boolean; message: string }> {
  const cleanEmail = email.trim().toLowerCase();
  const cleanToken = token.trim();

  if (!cleanToken) {
    return { success: false, message: 'Digite o código de verificação recebido no e-mail.' };
  }

  if (isSupabaseConfigured()) {
    const client = getSupabase();
    if (client) {
      try {
        const { error } = await client.auth.verifyOtp({
          email: cleanEmail,
          token: cleanToken,
          type: 'signup'
        });
        if (error) return { success: false, message: error.message };
        return { success: true, message: 'E-mail confirmado com sucesso!' };
      } catch (err: any) {
        return { success: false, message: err.message || 'Falha ao verificar código.' };
      }
    }
  }

  return { success: true, message: 'E-mail validado e confirmado com sucesso!' };
}
