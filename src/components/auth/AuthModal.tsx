import React, { useState } from 'react';
import {
  X,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  KeyRound,
  RotateCw
} from 'lucide-react';
import {
  registerAccount,
  loginAccount,
  loginWithOAuth,
  requestPasswordReset,
  resendVerificationEmail,
  verifyEmailOtp,
  AuthUser
} from '../../services/authService';
import { getMfaStatus, verifyTotp } from '../../services/mfaService';
import { isSupabaseConfigured } from '../../services/supabaseClient';
import { useTheme } from '../../services/themeService';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: AuthUser) => void;
  initialMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess,
  initialMode = 'login'
}) => {
  const { activeColor } = useTheme();
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isResetMode, setIsResetMode] = useState(false);

  // A2F / 2FA Challenge State
  const [isA2FChallenge, setIsA2FChallenge] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [pendingAuthUser, setPendingAuthUser] = useState<AuthUser | null>(null);
  const [pendingFactorId, setPendingFactorId] = useState<string | null>(null);

  // Email Verification State
  const [isVerifyEmailMode, setIsVerifyEmailMode] = useState(false);
  const [verificationOtp, setVerificationOtp] = useState('');
  const [isResendingEmail, setIsResendingEmail] = useState(false);

  // Apple Login Coming Soon Pop-up State
  const [showAppleComingSoon, setShowAppleComingSoon] = useState(false);

  if (!isOpen) return null;

  const isSupabase = isSupabaseConfigured();

  // Simple password strength calculation
  const getPasswordStrength = (pass: string) => {
    if (pass.length === 0) return { label: '', color: 'bg-slate-200', score: 0 };
    if (pass.length < 6) return { label: 'Fraca (mínimo 6 caracteres)', color: 'bg-rose-500', score: 1 };
    let score = 1;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;

    if (score >= 3) return { label: 'Forte e Segura', color: 'bg-emerald-500', score: 3 };
    return { label: 'Média', color: 'bg-amber-500', score: 2 };
  };

  const strength = getPasswordStrength(password);

  // Social Login Handler (Google / Apple)
  const handleOAuthLogin = async (provider: 'google' | 'apple') => {
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await loginWithOAuth(provider);
      setIsLoading(false);

      if (res.success) {
        if (res.redirecting) {
          setSuccessMsg(res.message);
          return;
        }
        if (res.user) {
          setSuccessMsg(res.message);
          setTimeout(() => {
            onAuthSuccess(res.user!);
            onClose();
          }, 800);
        }
      } else {
        setErrorMsg(res.message);
      }
    } catch (err: any) {
      setIsLoading(false);
      setErrorMsg(err.message || `Erro ao conectar com ${provider}`);
    }
  };

  // Submit Password / Register / Reset / A2F
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    // A2F Challenge flow
    if (isA2FChallenge) {
      if (twoFactorCode.trim().length !== 6) {
        setErrorMsg('O código de dois fatores deve conter 6 dígitos.');
        return;
      }

      setIsLoading(true);
      try {
        if (!pendingFactorId) throw new Error('Fator A2F não encontrado. Entre novamente.');
        await verifyTotp(pendingFactorId, twoFactorCode);
        setIsLoading(false);
        setSuccessMsg('Autenticação de Dois Fatores confirmada!');
        setTimeout(() => {
          if (pendingAuthUser) {
            onAuthSuccess(pendingAuthUser);
          }
          onClose();
        }, 700);
      } catch (error) {
        setIsLoading(false);
        setErrorMsg(error instanceof Error ? error.message : 'Código A2F incorreto ou expirado.');
      }
      return;
    }

    // Email OTP Verification flow
    if (isVerifyEmailMode) {
      setIsLoading(true);
      const res = await verifyEmailOtp(email, verificationOtp);
      setIsLoading(false);
      if (res.success) {
        setSuccessMsg(res.message);
        setTimeout(() => {
          if (pendingAuthUser) {
            onAuthSuccess({ ...pendingAuthUser, isEmailVerified: true });
          }
          onClose();
        }, 800);
      } else {
        setErrorMsg(res.message);
      }
      return;
    }

    // Password reset flow
    if (isResetMode) {
      if (!email.trim()) {
        setErrorMsg('Por favor, informe seu e-mail para recuperação.');
        return;
      }
      setIsLoading(true);
      const res = await requestPasswordReset(email);
      setIsLoading(false);
      if (res.success) {
        setSuccessMsg(res.message);
      } else {
        setErrorMsg(res.message);
      }
      return;
    }

    // Register flow
    if (mode === 'register') {
      if (!name.trim()) {
        setErrorMsg('Por favor, insira seu nome completo.');
        return;
      }
      if (password.length < 6) {
        setErrorMsg('A senha precisa ter pelo menos 6 caracteres.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg('As senhas digitadas não coincidem. Verifique a confirmação.');
        return;
      }

      setIsLoading(true);
      const res = await registerAccount(name, email, password);
      setIsLoading(false);

      if (res.success && res.user) {
        setPendingAuthUser(res.user);
        // Transition to Email Verification screen
        setIsVerifyEmailMode(true);
        setSuccessMsg('Conta criada! Enviamos uma confirmação para seu e-mail.');
      } else {
        setErrorMsg(res.message);
      }
      return;
    }

    // Login flow
    setIsLoading(true);
    const res = await loginAccount(email, password);
    setIsLoading(false);

    if (res.success && res.user) {
      // Check if user has A2F enabled
      if (isSupabase) {
        try {
          const status = await getMfaStatus();
          if (status.required && status.factorId) {
            setPendingAuthUser(res.user);
            setPendingFactorId(status.factorId);
            setIsA2FChallenge(true);
            setSuccessMsg('Confirme seu código de dois fatores.');
            return;
          }
          if (status.required) {
            setErrorMsg('Há um segundo fator cadastrado que este app não consegue verificar. Contate o suporte.');
            return;
          }
        } catch (error) {
          setErrorMsg(error instanceof Error ? error.message : 'Não foi possível verificar a A2F.');
          return;
        }
      }

      setSuccessMsg(res.message);
      setTimeout(() => {
        onAuthSuccess(res.user!);
        onClose();
      }, 700);
    } else {
      setErrorMsg(res.message);
    }
  };

  const handleResendEmail = async () => {
    setIsResendingEmail(true);
    const res = await resendVerificationEmail(email);
    setIsResendingEmail(false);
    if (res.success) {
      setSuccessMsg(res.message);
    } else {
      setErrorMsg(res.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200 select-none">
      <div className="bg-white dark:bg-[#232D29] w-full max-w-md rounded-t-[32px] sm:rounded-[32px] p-6 shadow-2xl animate-in slide-in-from-bottom duration-250 max-h-[95vh] overflow-y-auto relative border border-[#AEBDB5]/20 dark:border-[#394842]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#F7F4EE] dark:bg-[#18201D] text-[#6F7C76] dark:text-[#A8B8B1] hover:text-[#3F4B46] dark:hover:text-[#EDF2EF] flex items-center justify-center transition-colors"
          aria-label="Fechar"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mt-1 mb-4">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-md mb-2.5"
            style={{ backgroundColor: activeColor.primary }}
          >
            {isA2FChallenge ? (
              <KeyRound className="w-7 h-7 stroke-[2.2]" />
            ) : isVerifyEmailMode ? (
              <Mail className="w-7 h-7 stroke-[2.2]" />
            ) : (
              <ShieldCheck className="w-7 h-7 stroke-[2.2]" />
            )}
          </div>
          <h3 className="text-xl font-extrabold text-[#3F4B46] dark:text-[#EDF2EF]">
            {isA2FChallenge
              ? 'Verificação A2F'
              : isVerifyEmailMode
              ? 'Verifique seu E-mail'
              : isResetMode
              ? 'Recuperar Senha'
              : mode === 'login'
              ? 'Acessar NutriFam'
              : 'Criar Conta no NutriFam'}
          </h3>
          <p className="text-xs text-[#6F7C76] dark:text-[#A8B8B1] max-w-xs mt-1">
            {isA2FChallenge
              ? 'Sua conta está protegida com autenticação em dois fatores. Digite o código de 6 dígitos do app.'
              : isVerifyEmailMode
              ? `Enviamos as instruções de confirmação para ${email || 'seu e-mail'}.`
              : isResetMode
              ? 'Digite o e-mail cadastrado para redefinir sua senha com segurança.'
              : mode === 'login'
              ? 'Entre com suas credenciais ou redes sociais para sincronizar sua evolução na nuvem.'
              : 'Cadastre-se para monitorar nutrição, saúde, pet e sua rotina diária.'}
          </p>
        </div>

        {/* Social Login Buttons (Google & Apple) */}
        {!isResetMode && !isA2FChallenge && !isVerifyEmailMode && (
          <div className="space-y-2.5 mb-4">
            {/* Google Button */}
            <button
              type="button"
              onClick={() => handleOAuthLogin('google')}
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-full bg-white dark:bg-[#18201D] border border-[#AEBDB5]/30 dark:border-[#394842] hover:bg-[#ECEFE7]/50 dark:hover:bg-[#2B3732] text-[#3F4B46] dark:text-[#EDF2EF] font-bold text-xs flex items-center justify-center gap-3 transition-all shadow-2xs active:scale-98"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.02 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>Continuar com o Google</span>
            </button>

            {/* Apple Button */}
            <button
              type="button"
              onClick={() => setShowAppleComingSoon(true)}
              className="w-full py-2.5 px-4 rounded-full bg-black dark:bg-[#18201D] border border-[#AEBDB5]/30 dark:border-[#394842] text-white font-bold text-xs flex items-center justify-center gap-3 transition-all shadow-2xs active:scale-98"
            >
              <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 170 170">
                <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.08-7.78-7.94-12.28-14.59-6.08-9.04-10.84-19.12-14.28-30.24-3.44-11.12-5.16-21.73-5.16-31.83 0-13.88 3.53-25.26 10.59-34.14 7.05-8.88 16.03-13.41 26.93-13.6 4.9.12 10.42 1.48 16.56 4.08 6.14 2.6 10.05 3.96 11.73 4.08 1.45-.24 5.39-1.63 11.83-4.18 6.44-2.54 11.77-3.72 15.99-3.52 11.85.6 21.6 4.74 29.25 12.42-10.35 6.27-15.39 14.88-15.13 25.82.26 8.58 3.49 15.82 9.7 21.72 6.21 5.9 13.57 9.38 22.09 10.44-2.12 6.53-4.7 13.06-7.75 19.59zM119.22 31.82c0-7.39 2.66-14.25 7.98-20.58 5.32-6.33 11.85-10.56 19.59-12.69 1.13 7.85-.79 14.93-5.76 21.25-4.97 6.32-11.66 10.54-20.07 12.66-.56-.22-1.14-.38-1.74-.64z" />
              </svg>
              <span>Continuar com a Apple</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-white/20 text-white/90 ml-auto">
                Em breve
              </span>
            </button>

            {/* Divider */}
            <div className="relative flex items-center justify-center my-3">
              <div className="border-t border-[#AEBDB5]/20 dark:border-[#394842] w-full"></div>
              <span className="bg-white dark:bg-[#232D29] px-3 text-[11px] font-bold text-[#6F7C76] dark:text-[#A8B8B1] uppercase tracking-wider shrink-0">
                ou com seu e-mail
              </span>
            </div>
          </div>
        )}

        {/* Tab Switcher (Login vs Criar Conta) */}
        {!isResetMode && !isA2FChallenge && !isVerifyEmailMode && (
          <div className="flex bg-[#F7F4EE] dark:bg-[#18201D] border border-[#AEBDB5]/30 dark:border-[#394842] p-1 rounded-full mb-4">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`flex-1 py-2 rounded-full text-xs font-bold transition-all ${
                mode === 'login'
                  ? 'text-white shadow-xs'
                  : 'text-[#6F7C76] dark:text-[#A8B8B1] hover:text-[#3F4B46] dark:hover:text-[#EDF2EF]'
              }`}
              style={mode === 'login' ? { backgroundColor: activeColor.primary } : undefined}
            >
              Fazer Login
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`flex-1 py-2 rounded-full text-xs font-bold transition-all ${
                mode === 'register'
                  ? 'text-white shadow-xs'
                  : 'text-[#6F7C76] dark:text-[#A8B8B1] hover:text-[#3F4B46] dark:hover:text-[#EDF2EF]'
              }`}
              style={mode === 'register' ? { backgroundColor: activeColor.primary } : undefined}
            >
              Criar Conta
            </button>
          </div>
        )}

        {/* Feedback Messages */}
        {errorMsg && (
          <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-2xl flex items-start gap-2 text-rose-700 dark:text-rose-300 text-xs animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="font-semibold leading-tight">{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 rounded-2xl flex items-center gap-2 text-emerald-700 dark:text-emerald-300 text-xs">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span className="font-bold leading-tight">{successMsg}</span>
          </div>
        )}

        {/* MAIN FORM */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* CASE 1: A2F / 2FA Challenge Mode */}
          {isA2FChallenge ? (
            <div className="space-y-4 py-2">
              <div className="bg-[#ECEFE7] dark:bg-[#18201D] border border-[#AEBDB5]/30 dark:border-[#394842] rounded-2xl p-4 text-center">
                <p className="text-xs font-bold text-[#3F4B46] dark:text-[#EDF2EF] mb-1">
                  Código de Autenticação em Dois Fatores
                </p>
                <p className="text-[11px] text-[#6F7C76] dark:text-[#A8B8B1] leading-snug">
                  Abra o Google Authenticator ou Apple Passwords e digite o código de 6 dígitos correspondente ao NutriFam:
                </p>
                <div className="mt-3">
                  <input
                    type="text"
                    maxLength={6}
                    autoFocus
                    value={twoFactorCode}
                    onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="000000"
                    className="w-full max-w-[220px] mx-auto p-3 text-center text-2xl font-mono font-black tracking-[0.4em] rounded-xl border border-[#AEBDB5]/30 dark:border-[#394842] focus:outline-none bg-white dark:bg-[#232D29] text-[#3F4B46] dark:text-[#EDF2EF]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || twoFactorCode.trim().length !== 6}
                className="w-full py-3.5 px-4 rounded-full text-white font-bold text-sm shadow-sm disabled:opacity-50 transition-all flex items-center justify-center gap-2 active:scale-98"
                style={{ backgroundColor: activeColor.primary }}
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                <span>Confirmar Acesso Seguro</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsA2FChallenge(false);
                  setTwoFactorCode('');
                }}
                className="w-full text-center text-xs font-bold text-[#6F7C76] dark:text-[#A8B8B1] hover:text-[#3F4B46] dark:hover:text-[#EDF2EF] block"
              >
                Voltar ao Login
              </button>
            </div>
          ) : isVerifyEmailMode ? (
            /* CASE 2: Email Verification Mode */
            <div className="space-y-4 py-2">
              <div className="bg-[#ECEFE7] dark:bg-[#18201D] border border-[#AEBDB5]/30 dark:border-[#394842] rounded-2xl p-4 text-center">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2 text-white"
                  style={{ backgroundColor: activeColor.primary }}
                >
                  <Mail className="w-5 h-5" />
                </div>
                <p className="text-xs font-extrabold text-[#3F4B46] dark:text-[#EDF2EF]">
                  Confirmação de E-mail Enviada!
                </p>
                <p className="text-[11px] text-[#6F7C76] dark:text-[#A8B8B1] mt-1 leading-relaxed">
                  Verifique a caixa de entrada de <strong>{email}</strong> e clique no link de ativação, ou digite o código de 6 dígitos abaixo:
                </p>
                <div className="mt-3">
                  <input
                    type="text"
                    maxLength={6}
                    value={verificationOtp}
                    onChange={(e) => setVerificationOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="Código OTP (opcional)"
                    className="w-full max-w-[200px] mx-auto p-2.5 text-center text-lg font-mono font-black tracking-[0.25em] rounded-xl border border-[#AEBDB5]/30 dark:border-[#394842] focus:outline-none bg-white dark:bg-[#232D29] text-[#3F4B46] dark:text-[#EDF2EF]"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleResendEmail}
                  disabled={isResendingEmail}
                  className="flex-1 py-2.5 px-3 rounded-full bg-[#F7F4EE] dark:bg-[#18201D] border border-[#AEBDB5]/30 dark:border-[#394842] text-[#3F4B46] dark:text-[#EDF2EF] font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <RotateCw className={`w-3.5 h-3.5 ${isResendingEmail ? 'animate-spin' : ''}`} />
                  <span>Reenviar E-mail</span>
                </button>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 py-2.5 px-3 rounded-full text-white font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5"
                  style={{ backgroundColor: activeColor.primary }}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirmar Código</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (pendingAuthUser) onAuthSuccess(pendingAuthUser);
                  onClose();
                }}
                className="w-full text-center text-xs font-bold text-[#6F7C76] dark:text-[#A8B8B1] hover:text-[#3F4B46] dark:hover:text-[#EDF2EF] hover:underline block"
              >
                Prosseguir para o Aplicativo
              </button>
            </div>
          ) : (
            /* CASE 3: Standard Login / Register / Reset Form */
            <>
              {/* Name (Only in Register mode) */}
              {mode === 'register' && (
                <div>
                  <label className="text-xs font-bold text-[#3F4B46] dark:text-[#EDF2EF] block mb-1">
                    Nome Completo
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-[#6F7C76] dark:text-[#A8B8B1] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ex: Arthur Davi"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#AEBDB5]/30 dark:border-[#394842] text-xs font-semibold focus:outline-none focus:border-[#6F7C76] bg-[#F7F4EE] dark:bg-[#18201D] text-[#3F4B46] dark:text-[#EDF2EF] placeholder-[#6F7C76]/60 dark:placeholder-[#A8B8B1]/60 transition-all"
                    />
                  </div>
                </div>
              )}

              {/* Email */}
              <div>
                <label className="text-xs font-bold text-[#3F4B46] dark:text-[#EDF2EF] block mb-1">
                  Endereço de E-mail
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#6F7C76] dark:text-[#A8B8B1] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu.email@exemplo.com"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#AEBDB5]/30 dark:border-[#394842] text-xs font-semibold focus:outline-none focus:border-[#6F7C76] bg-[#F7F4EE] dark:bg-[#18201D] text-[#3F4B46] dark:text-[#EDF2EF] placeholder-[#6F7C76]/60 dark:placeholder-[#A8B8B1]/60 transition-all"
                  />
                </div>
              </div>

              {/* Password (Not needed in Reset mode) */}
              {!isResetMode && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-[#3F4B46] dark:text-[#EDF2EF]">
                      Senha
                    </label>
                    {mode === 'login' && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsResetMode(true);
                          setErrorMsg(null);
                          setSuccessMsg(null);
                        }}
                        className="text-[11px] font-bold text-[#6F7C76] dark:text-[#A8B8B1] hover:underline"
                      >
                        Esqueci minha senha
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#6F7C76] dark:text-[#A8B8B1] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-[#AEBDB5]/30 dark:border-[#394842] text-xs font-semibold focus:outline-none focus:border-[#6F7C76] bg-[#F7F4EE] dark:bg-[#18201D] text-[#3F4B46] dark:text-[#EDF2EF] placeholder-[#6F7C76]/60 dark:placeholder-[#A8B8B1]/60 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#6F7C76] dark:text-[#A8B8B1] hover:text-[#3F4B46] dark:hover:text-[#EDF2EF]"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Password Strength Meter for Registration */}
                  {mode === 'register' && password.length > 0 && (
                    <div className="mt-1.5">
                      <div className="flex items-center justify-between text-[10px] mb-1 font-bold text-[#6F7C76] dark:text-[#A8B8B1]">
                        <span>Segurança da Senha:</span>
                        <span className="font-extrabold">{strength.label}</span>
                      </div>
                      <div className="h-1 w-full bg-[#ECEFE7] dark:bg-[#18201D] rounded-full overflow-hidden flex gap-1">
                        <div className={`h-full flex-1 ${strength.score >= 1 ? strength.color : 'bg-transparent'}`}></div>
                        <div className={`h-full flex-1 ${strength.score >= 2 ? strength.color : 'bg-transparent'}`}></div>
                        <div className={`h-full flex-1 ${strength.score >= 3 ? strength.color : 'bg-transparent'}`}></div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Confirm Password (Only in Register mode) */}
              {mode === 'register' && (
                <div>
                  <label className="text-xs font-bold text-[#3F4B46] dark:text-[#EDF2EF] block mb-1">
                    Confirmar Senha
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#6F7C76] dark:text-[#A8B8B1] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repita sua senha"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-[#AEBDB5]/30 dark:border-[#394842] text-xs font-semibold focus:outline-none focus:border-[#6F7C76] bg-[#F7F4EE] dark:bg-[#18201D] text-[#3F4B46] dark:text-[#EDF2EF] placeholder-[#6F7C76]/60 dark:placeholder-[#A8B8B1]/60 transition-all"
                    />
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3.5 px-4 rounded-full text-white font-bold text-sm shadow-sm disabled:opacity-50 transition-all flex items-center justify-center gap-2 active:scale-98"
                style={{ backgroundColor: activeColor.primary }}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processando com Criptografia...</span>
                  </>
                ) : (
                  <>
                    <span>
                      {isResetMode
                        ? 'Enviar Link de Redefinição'
                        : mode === 'login'
                        ? 'Entrar no NutriFam'
                        : 'Criar Minha Conta Segura'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </>
          )}
        </form>

        {/* Back to login if in reset mode */}
        {isResetMode && (
          <button
            type="button"
            onClick={() => {
              setIsResetMode(false);
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            className="w-full mt-3 py-2 text-xs font-bold text-[#6F7C76] dark:text-[#A8B8B1] hover:text-[#3F4B46] dark:hover:text-[#EDF2EF] text-center block"
          >
            Voltar para o Login
          </button>
        )}

        {/* Security / Encryption Badge Footer */}
        <div className="mt-4 pt-3 border-t border-[#AEBDB5]/20 dark:border-[#394842] flex flex-col items-center text-center space-y-2">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#3F4B46] dark:text-[#EDF2EF] bg-[#ECEFE7] dark:bg-[#18201D] px-3 py-1 rounded-full border border-[#AEBDB5]/30 dark:border-[#394842]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>
              {isSupabase
                ? 'Conexão Criptografada (Supabase Auth • Postgres Argon2)'
                : 'Criptografia SHA-256 Local (Sem senhas expostas)'}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-[11px] font-bold text-[#6F7C76] dark:text-[#A8B8B1] hover:text-[#3F4B46] dark:hover:text-[#EDF2EF] transition-colors"
          >
            Continuar como Convidado (Modo Offline)
          </button>
        </div>

        {/* Pop-up: Apple Login Coming Soon */}
        {showAppleComingSoon && (
          <div className="fixed inset-0 z-60 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-[#232D29] w-full max-w-sm rounded-[32px] p-6 shadow-2xl text-center animate-in zoom-in-95 duration-200 border border-[#AEBDB5]/20 dark:border-[#394842] relative">
              <button
                type="button"
                onClick={() => setShowAppleComingSoon(false)}
                className="absolute top-4 right-4 text-[#6F7C76] dark:text-[#A8B8B1] hover:text-[#3F4B46] dark:hover:text-[#EDF2EF] p-1"
                aria-label="Fechar"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="w-14 h-14 bg-slate-900 text-white rounded-2xl mx-auto flex items-center justify-center shadow-md mb-3">
                <svg className="w-7 h-7 fill-current" viewBox="0 0 170 170">
                  <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.08-7.78-7.94-12.28-14.59-6.08-9.04-10.84-19.12-14.28-30.24-3.44-11.12-5.16-21.73-5.16-31.83 0-13.88 3.53-25.26 10.59-34.14 7.05-8.88 16.03-13.41 26.93-13.6 4.9.12 10.42 1.48 16.56 4.08 6.14 2.6 10.05 3.96 11.73 4.08 1.45-.24 5.39-1.63 11.83-4.18 6.44-2.54 11.77-3.72 15.99-3.52 11.85.6 21.6 4.74 29.25 12.42-10.35 6.27-15.39 14.88-15.13 25.82.26 8.58 3.49 15.82 9.7 21.72 6.21 5.9 13.57 9.38 22.09 10.44-2.12 6.53-4.7 13.06-7.75 19.59zM119.22 31.82c0-7.39 2.66-14.25 7.98-20.58 5.32-6.33 11.85-10.56 19.59-12.69 1.13 7.85-.79 14.93-5.76 21.25-4.97 6.32-11.66 10.54-20.07 12.66-.56-.22-1.14-.38-1.74-.64z" />
                </svg>
              </div>

              <div className="inline-flex items-center gap-1 bg-[#ECEFE7] dark:bg-[#18201D] text-[#3F4B46] dark:text-[#EDF2EF] text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-[#AEBDB5]/30 dark:border-[#394842] mb-2">
                <span>⏳ Disponível em Breve</span>
              </div>

              <h4 className="text-base font-extrabold text-[#3F4B46] dark:text-[#EDF2EF]">
                Sign in with Apple
              </h4>

              <p className="text-xs text-[#6F7C76] dark:text-[#A8B8B1] mt-2 leading-relaxed">
                O login com a <strong>Apple ID</strong> estará disponível em breve com a publicação oficial do NutriFam na App Store para iOS.
              </p>
              <p className="text-xs text-[#6F7C76] dark:text-[#A8B8B1] mt-1.5 leading-relaxed">
                Enquanto isso, você pode entrar normalmente utilizando o <strong>Google</strong> ou seu <strong>e-mail e senha</strong> com total segurança!
              </p>

              <div className="mt-5 space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAppleComingSoon(false);
                    handleOAuthLogin('google');
                  }}
                  className="w-full py-2.5 px-4 rounded-full text-white font-bold text-xs transition-transform active:scale-98 shadow-sm flex items-center justify-center gap-2"
                  style={{ backgroundColor: activeColor.primary }}
                >
                  <span>Continuar com o Google</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowAppleComingSoon(false)}
                  className="w-full py-2 px-4 rounded-full bg-[#F7F4EE] dark:bg-[#18201D] border border-[#AEBDB5]/30 dark:border-[#394842] text-[#3F4B46] dark:text-[#EDF2EF] font-bold text-xs transition-colors"
                >
                  <span>Fechar</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
