import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, QrCode, Copy, Check, AlertCircle, Loader2, KeyRound } from 'lucide-react';
import { generateTwoFactorSecret, enableTwoFactor, disableTwoFactor } from '../../services/authService';
import { useTheme } from '../../services/themeService';

interface TwoFactorModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
  userEmail?: string;
  isEnabled: boolean;
  onUpdateStatus: (enabled: boolean, secret?: string) => void;
}

export const TwoFactorModal: React.FC<TwoFactorModalProps> = ({
  isOpen,
  onClose,
  userId = 'local_user',
  userEmail = 'usuario@nutrifam.app',
  isEnabled,
  onUpdateStatus
}) => {
  const { activeColor } = useTheme();
  const [secretData, setSecretData] = useState<{ secret: string; otpauthUrl: string } | null>(null);
  const [verifyCode, setVerifyCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && !isEnabled) {
      const generated = generateTwoFactorSecret(userEmail);
      setSecretData(generated);
      setVerifyCode('');
      setErrorMsg(null);
      setSuccessMsg(null);
    }
  }, [isOpen, isEnabled, userEmail]);

  if (!isOpen) return null;

  const handleCopySecret = () => {
    if (secretData?.secret) {
      navigator.clipboard.writeText(secretData.secret);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleEnable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!secretData) return;

    if (verifyCode.trim().length !== 6) {
      setErrorMsg('Por favor, digite o código de 6 dígitos gerado pelo aplicativo.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    try {
      const result = await enableTwoFactor(userId, secretData.secret, verifyCode, userEmail);
      setIsLoading(false);
      if (result.success) {
        setSuccessMsg(result.message);
        onUpdateStatus(true, secretData.secret);
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setErrorMsg(result.message);
      }
    } catch (err: any) {
      setIsLoading(false);
      setErrorMsg(err.message || 'Erro ao ativar autenticação de dois fatores.');
    }
  };

  const handleDisable = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const result = await disableTwoFactor(userId, userEmail);
      setIsLoading(false);
      if (result.success) {
        setSuccessMsg(result.message);
        onUpdateStatus(false);
        setTimeout(() => {
          onClose();
        }, 1200);
      }
    } catch (err: any) {
      setIsLoading(false);
      setErrorMsg(err.message || 'Erro ao desativar A2F.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs select-none">
      <div className="bg-white dark:bg-[#232D29] w-full max-w-sm rounded-[32px] p-6 shadow-2xl animate-in zoom-in-95 duration-150 text-[#3F4B46] dark:text-[#EDF2EF] max-h-[90vh] overflow-y-auto border border-[#AEBDB5]/20 dark:border-[#394842]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#AEBDB5]/20 dark:border-[#394842]">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white shadow-xs"
              style={{ backgroundColor: activeColor.primary }}
            >
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-[#3F4B46] dark:text-[#EDF2EF] text-sm">Autenticação em Dois Fatores</h3>
              <p className="text-[10px] text-[#6F7C76] dark:text-[#A8B8B1] font-semibold">Segurança Reforçada (A2F / 2FA)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-[#F7F4EE] dark:bg-[#18201D] text-[#6F7C76] dark:text-[#A8B8B1] hover:text-[#3F4B46] dark:hover:text-[#EDF2EF] flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Status Messages */}
        {errorMsg && (
          <div className="mt-3 p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-2xl flex items-start gap-2 text-rose-700 dark:text-rose-300 text-xs animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <p className="font-semibold leading-tight">{errorMsg}</p>
          </div>
        )}

        {successMsg && (
          <div className="mt-3 p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 rounded-2xl flex items-center gap-2 text-emerald-700 dark:text-emerald-300 text-xs">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <p className="font-bold leading-tight">{successMsg}</p>
          </div>
        )}

        {/* Content based on enabled state */}
        {isEnabled ? (
          <div className="mt-4 space-y-4">
            <div className="bg-[#ECEFE7] dark:bg-[#18201D] border border-[#AEBDB5]/30 dark:border-[#394842] rounded-2xl p-4 text-center">
              <div
                className="w-12 h-12 rounded-full text-white flex items-center justify-center mx-auto mb-2 shadow-xs"
                style={{ backgroundColor: activeColor.primary }}
              >
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h4 className="font-extrabold text-[#3F4B46] dark:text-[#EDF2EF] text-sm">A2F Ativo e Protegendo sua Conta</h4>
              <p className="text-xs text-[#6F7C76] dark:text-[#A8B8B1] mt-1 leading-relaxed">
                Toda vez que você fizer login no NutriFam, será exigido um código de verificação temporário de 6 dígitos gerado pelo seu app autenticador.
              </p>
            </div>

            <button
              onClick={handleDisable}
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-full bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-700 dark:text-rose-300 font-bold text-xs border border-rose-200 dark:border-rose-900 transition-all flex items-center justify-center gap-2 active:scale-98"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Desativar Autenticação em Dois Fatores'}
            </button>
          </div>
        ) : (
          <form onSubmit={handleEnable} className="mt-4 space-y-4">
            <p className="text-xs text-[#6F7C76] dark:text-[#A8B8B1] leading-relaxed">
              Vincule seu aplicativo autenticador favorito (Google Authenticator, Apple Passwords ou Microsoft Authenticator) para proteger sua conta.
            </p>

            {/* Visual Scannable QR Code */}
            <div className="bg-[#F7F4EE] dark:bg-[#18201D] border border-[#AEBDB5]/30 dark:border-[#394842] rounded-2xl p-4 flex flex-col items-center justify-center text-center">
              {secretData?.otpauthUrl ? (
                <div className="bg-white p-2.5 rounded-2xl border border-slate-200 shadow-xs flex flex-col items-center">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(
                      secretData.otpauthUrl
                    )}`}
                    alt="QR Code A2F"
                    className="w-36 h-36 object-contain rounded-lg"
                  />
                  <span
                    className="text-[9px] font-bold uppercase tracking-wider text-white px-2.5 py-0.5 rounded-full mt-2"
                    style={{ backgroundColor: activeColor.primary }}
                  >
                    NutriFam A2F
                  </span>
                </div>
              ) : (
                <div className="w-32 h-32 bg-white dark:bg-[#232D29] rounded-xl border-2 border-dashed border-[#AEBDB5]/40 dark:border-[#394842] p-2 flex flex-col items-center justify-center shadow-xs">
                  <QrCode className="w-20 h-20 text-[#6F7C76] dark:text-[#A8B8B1] stroke-[1.5]" />
                </div>
              )}
              <p className="text-[10px] text-[#6F7C76] dark:text-[#A8B8B1] font-semibold mt-2">
                Aponte a câmera com o Google Authenticator ou Apple Passwords:
              </p>
            </div>

            {/* Secret Key Display */}
            {secretData && (
              <div>
                <label className="text-[11px] font-bold text-[#3F4B46] dark:text-[#EDF2EF] block mb-1">
                  Chave Secreta de Configuração:
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={secretData.secret}
                    className="flex-1 p-2 rounded-xl bg-[#F7F4EE] dark:bg-[#18201D] border border-[#AEBDB5]/30 dark:border-[#394842] text-xs font-mono font-bold tracking-widest text-[#3F4B46] dark:text-[#EDF2EF] text-center select-all"
                  />
                  <button
                    type="button"
                    onClick={handleCopySecret}
                    className="p-2 rounded-xl bg-[#F7F4EE] dark:bg-[#18201D] hover:bg-[#ECEFE7] dark:hover:bg-[#2B3732] text-[#3F4B46] dark:text-[#EDF2EF] border border-[#AEBDB5]/30 dark:border-[#394842] transition-colors shrink-0"
                    title="Copiar Chave Secreta"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {/* 6-Digit Code Confirmation */}
            <div>
              <label className="text-[11px] font-bold text-[#3F4B46] dark:text-[#EDF2EF] block mb-1">
                Digite o Código de 6 Dígitos do Aplicativo:
              </label>
              <input
                type="text"
                maxLength={6}
                value={verifyCode}
                onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, ''))}
                placeholder="000 000"
                className="w-full p-2.5 rounded-xl border border-[#AEBDB5]/30 dark:border-[#394842] focus:outline-none focus:border-[#6F7C76] text-center font-mono font-bold text-base tracking-[0.3em] bg-[#F7F4EE] dark:bg-[#18201D] text-[#3F4B46] dark:text-[#EDF2EF]"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || verifyCode.trim().length !== 6}
              className="w-full py-3.5 px-4 rounded-full text-white font-bold text-xs shadow-sm disabled:opacity-50 transition-all flex items-center justify-center gap-2 active:scale-98"
              style={{ backgroundColor: activeColor.primary }}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Ativando A2F...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Confirmar e Ativar A2F</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
