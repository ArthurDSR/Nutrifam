import React, { useEffect, useState } from 'react';
import { Check, Copy, KeyRound, Loader2, ShieldCheck, X } from 'lucide-react';
import { enrollTotp, getMfaStatus, removeTotp, TotpEnrollment, verifyTotp } from '../../services/mfaService';
import { useTheme } from '../../services/themeService';

interface TwoFactorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus: (enabled: boolean) => void;
}

export const TwoFactorModal: React.FC<TwoFactorModalProps> = ({ isOpen, onClose, onUpdateStatus }) => {
  const { activeColor } = useTheme();
  const [factorId, setFactorId] = useState<string | null>(null);
  const [enrollment, setEnrollment] = useState<TotpEnrollment | null>(null);
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setEnrollment(null);
    setCode('');
    setError(null);
    setBusy(true);
    getMfaStatus().then((status) => {
      setFactorId(status.factorId || null);
      onUpdateStatus(Boolean(status.factorId));
    }).catch((cause) => setError(cause instanceof Error ? cause.message : 'Não foi possível consultar a A2F.'))
      .finally(() => setBusy(false));
  }, [isOpen]);

  if (!isOpen) return null;

  const startEnrollment = async () => {
    setBusy(true);
    setError(null);
    try { setEnrollment(await enrollTotp()); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Não foi possível iniciar a A2F.'); }
    finally { setBusy(false); }
  };

  const confirmEnrollment = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!enrollment) return;
    setBusy(true);
    setError(null);
    try {
      await verifyTotp(enrollment.factorId, code);
      setFactorId(enrollment.factorId);
      setEnrollment(null);
      setCode('');
      onUpdateStatus(true);
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Código inválido ou expirado.'); }
    finally { setBusy(false); }
  };

  const disable = async () => {
    if (!factorId) return;
    setBusy(true);
    setError(null);
    try {
      await removeTotp(factorId);
      setFactorId(null);
      onUpdateStatus(false);
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Não foi possível desativar a A2F. Confirme o segundo fator antes.'); }
    finally { setBusy(false); }
  };

  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
    <div role="dialog" aria-modal="true" aria-label="Autenticação em dois fatores" className="w-full max-w-sm max-h-[90dvh] overflow-y-auto rounded-3xl bg-white dark:bg-[#232D29] p-5 space-y-4 text-[#18201D] dark:text-white">
      <div className="flex items-center justify-between"><h2 className="flex items-center gap-2 text-base font-bold"><KeyRound className="w-5 h-5" /> Autenticação em dois fatores</h2><button onClick={onClose} aria-label="Fechar" className="p-2 rounded-xl bg-[#F7F4EE] dark:bg-[#34423C]"><X className="w-4 h-4" /></button></div>
      {error && <p role="alert" className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs">{error}</p>}
      {busy && <div className="flex items-center gap-2 text-xs"><Loader2 className="w-4 h-4 animate-spin" /> Aguarde...</div>}
      {factorId ? <div className="space-y-4"><p className="flex items-center gap-2 text-sm font-semibold text-emerald-700 dark:text-emerald-400"><ShieldCheck className="w-5 h-5" /> A2F ativo no Supabase</p><p className="text-xs text-[#6F7C76] dark:text-[#A8B8B1]">Um código do seu autenticador será exigido ao entrar na conta em qualquer aparelho.</p><button type="button" disabled={busy} onClick={disable} className="w-full py-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs font-bold disabled:opacity-50">Desativar A2F</button></div>
      : enrollment ? <form onSubmit={confirmEnrollment} className="space-y-4"><p className="text-xs text-[#6F7C76] dark:text-[#A8B8B1]">Escaneie o QR no aplicativo autenticador. O código será verificado pelo Supabase.</p><div className="flex justify-center rounded-2xl bg-white p-3"><img src={enrollment.qrCode} alt="QR para configurar o autenticador" className="w-40 h-40" /></div><div><label className="block text-xs font-semibold mb-1">Chave manual</label><div className="flex gap-2"><input readOnly type="text" value={enrollment.secret} className="min-w-0 flex-1 p-2 rounded-xl bg-[#F7F4EE] dark:bg-[#34423C] text-xs font-mono" /><button type="button" onClick={async () => { await navigator.clipboard.writeText(enrollment.secret); setCopied(true); }} aria-label="Copiar chave" className="p-2 rounded-xl bg-[#F7F4EE] dark:bg-[#34423C]">{copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}</button></div></div><label className="block text-xs font-semibold">Código de 6 dígitos<input inputMode="numeric" autoComplete="one-time-code" value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))} className="block w-full mt-1 p-3 rounded-xl bg-[#F7F4EE] dark:bg-[#34423C] text-center font-mono text-lg tracking-widest" /></label><button type="submit" disabled={busy || code.length !== 6} style={{ backgroundColor: activeColor.primary }} className="w-full py-3 rounded-xl text-white text-xs font-bold disabled:opacity-50">Confirmar e ativar</button></form>
      : !busy && !error && <div className="space-y-4"><p className="text-xs text-[#6F7C76] dark:text-[#A8B8B1]">Proteja sua conta com códigos temporários gerados por um aplicativo autenticador.</p><button type="button" onClick={startEnrollment} style={{ backgroundColor: activeColor.primary }} className="w-full py-3 rounded-xl text-white text-xs font-bold">Configurar A2F</button></div>}
    </div>
  </div>;
};
