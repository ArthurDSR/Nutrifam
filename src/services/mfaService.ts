import { getSupabase } from './supabaseClient';

export interface TotpEnrollment {
  factorId: string;
  qrCode: string;
  secret: string;
}

/** Remove the former device-only MFA secret. It never represented a server-side factor. */
export function clearLegacyMfaData(): void {
  for (const key of ['nutrifam_2fa_registry', 'nutrimonitor_2fa_registry']) localStorage.removeItem(key);
  const keys = Object.keys(localStorage).filter((key) =>
    ['nutrifam_auth_session', 'nutrimonitor_auth_session', 'nutrifam_local_accounts', 'nutrimonitor_local_accounts'].includes(key)
    || key.startsWith('nutrifam_user_profile') || key.startsWith('nutrimonitor_user_profile'));
  for (const key of keys) {
    const raw = localStorage.getItem(key);
    if (!raw) continue;
    try {
      const parsed = JSON.parse(raw);
      const scrub = (value: Record<string, unknown>) => {
        delete value.twoFactorSecret;
        delete value.isTwoFactorEnabled;
      };
      if (Array.isArray(parsed)) parsed.forEach(scrub);
      else if (parsed && typeof parsed === 'object') scrub(parsed);
      localStorage.setItem(key, JSON.stringify(parsed));
    } catch { /* Leave unrelated or malformed local data untouched. */ }
  }
}

function client() {
  const supabase = getSupabase();
  if (!supabase) throw new Error('A2F requer uma conta conectada ao Supabase.');
  return supabase;
}

export async function getMfaStatus(): Promise<{ required: boolean; verified: boolean; factorId?: string }> {
  const supabase = client();
  const assurance = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (assurance.error) throw assurance.error;
  const factors = await supabase.auth.mfa.listFactors();
  if (factors.error) throw factors.error;
  const factor = factors.data.totp[0];
  return {
    required: assurance.data.nextLevel === 'aal2' && assurance.data.currentLevel !== 'aal2',
    verified: assurance.data.currentLevel === 'aal2',
    factorId: factor?.id
  };
}

export async function enrollTotp(): Promise<TotpEnrollment> {
  const { data, error } = await client().auth.mfa.enroll({ factorType: 'totp', friendlyName: 'NutriFam' });
  if (error) throw error;
  if (data.type !== 'totp') throw new Error('O Supabase não retornou um fator TOTP.');
  return { factorId: data.id, qrCode: data.totp.qr_code, secret: data.totp.secret };
}

export async function verifyTotp(factorId: string, code: string): Promise<void> {
  if (!/^\d{6}$/.test(code)) throw new Error('Digite os 6 dígitos do aplicativo autenticador.');
  const { error } = await client().auth.mfa.challengeAndVerify({ factorId, code });
  if (error) throw error;
}

export async function removeTotp(factorId: string): Promise<void> {
  const { error } = await client().auth.mfa.unenroll({ factorId });
  if (error) throw error;
}
