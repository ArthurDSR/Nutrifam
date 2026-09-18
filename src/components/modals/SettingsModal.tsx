import React, { useState } from 'react';
import { X, Key, CheckCircle2, AlertCircle, Loader2, User, LogIn, LogOut, ShieldCheck, Heart, KeyRound, Globe, Sparkles, Bot, Eye, EyeOff, Palette, Sun, Moon, Laptop, Check } from 'lucide-react';
import { UserProfile } from '../../types';
import { useTranslation, Language } from '../../services/i18n';
import { testAIConnection } from '../../services/aiService';
import { useTheme, PASTEL_COLORS, SecondaryColor, ThemeMode } from '../../services/themeService';
import { FoodBudMascot } from '../pet/FoodBudMascot';
import { isCapacitorNative } from '../../services/healthSyncService';

interface SettingsModalProps {
  profile: UserProfile;
  onClose: () => void;
  onSaveApiKey?: (key: string) => void;
  onSaveAISettings: (
    provider: 'gemini' | 'openai' | 'openrouter',
    geminiKey: string,
    openaiKey: string,
    openaiModel: string,
    openrouterKey?: string,
    openrouterModel?: string,
    geminiModel?: string
  ) => void;
  onOpenAuth?: () => void;
  onLogout?: () => void;
  onOpenTwoFactorModal?: () => void;
  onToggleSplashAnimation?: (enabled: boolean) => void;
  onSyncHealth?: () => void;
  onRedoOnboarding?: () => void;
}

const OPENROUTER_PRESETS = [
  { id: 'openrouter/free', label: 'openrouter/free (Roteador Automático - 100% Grátis Oficial)' },
  { id: 'google/gemini-3.5-flash-lite', label: 'google/gemini-3.5-flash-lite (Google Gemini 3.5 Flash-Lite)' },
  { id: 'deepseek/deepseek-v4-flash-0731:free', label: 'deepseek/deepseek-v4-flash-0731:free (Rápido e 100% Grátis)' },
  { id: 'qwen/qwen3.8-27b:free', label: 'qwen/qwen3.8-27b:free (Nutrição & Raciocínio Grátis)' },
  { id: 'google/gemma-4-31b-it:free', label: 'google/gemma-4-31b-it:free (Google Gemma 4 31B Grátis)' },
  { id: 'inclusionai/ling-3.0-flash-vl:free', label: 'inclusionai/ling-3.0-flash-vl:free (Visão & Fotos de Pratos Grátis)' },
  { id: 'nvidia/nemotron-3-super-120b-a12b:free', label: 'nvidia/nemotron-3-super-120b-a12b:free (NVIDIA 120B Grátis)' },
];

export const SettingsModal: React.FC<SettingsModalProps> = ({
  profile,
  onClose,
  onSaveApiKey,
  onSaveAISettings,
  onOpenAuth,
  onLogout,
  onOpenTwoFactorModal,
  onToggleSplashAnimation,
  onSyncHealth,
  onRedoOnboarding
}) => {
  const { t, language, setLanguage } = useTranslation();
  const [aiProvider, setAiProvider] = useState<'gemini' | 'openai' | 'openrouter'>(profile.aiProvider || 'openrouter');
  const [geminiKey, setGeminiKey] = useState(profile.geminiApiKey || '');
  const [geminiModel, setGeminiModel] = useState(profile.geminiModel || 'gemini-3.5-flash-lite');
  const [openaiKey, setOpenaiKey] = useState(profile.openaiApiKey || '');
  const [openaiModel, setOpenaiModel] = useState(profile.openaiModel || 'gpt-4o-mini');
  const [openrouterKey, setOpenrouterKey] = useState(profile.openrouterApiKey || '');
  const [openrouterModel, setOpenrouterModel] = useState(profile.openrouterModel || 'openrouter/free');
  const [isCustomOpenrouter, setIsCustomOpenrouter] = useState(
    Boolean(profile.openrouterModel && !OPENROUTER_PRESETS.some((p) => p.id === profile.openrouterModel))
  );
  const [showKey, setShowKey] = useState(false);
  const [isTestingAI, setIsTestingAI] = useState(false);
  const [aiTestStatus, setAiTestStatus] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showSplashAnimation, setShowSplashAnimation] = useState<boolean>(profile.showSplashAnimation !== false);
  const { mode, secondaryColor, isDark, activeColor, setMode, setSecondaryColor } = useTheme();

  const handleToggleSplash = () => {
    const nextVal = !showSplashAnimation;
    setShowSplashAnimation(nextVal);
    if (onToggleSplashAnimation) {
      onToggleSplashAnimation(nextVal);
    }
  };

  const handleTestAI = async () => {
    let activeKey = geminiKey;
    let activeModel = geminiModel;
    if (aiProvider === 'openrouter') {
      activeKey = openrouterKey;
      activeModel = openrouterModel;
    } else if (aiProvider === 'openai') {
      activeKey = openaiKey;
      activeModel = openaiModel;
    }
    setIsTestingAI(true);
    setAiTestStatus(null);

    const result = await testAIConnection(aiProvider, activeKey, activeModel);
    setIsTestingAI(false);
    setAiTestStatus({
      type: result.success ? 'success' : 'error',
      text: result.message
    });
  };

  const handleSaveAll = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveAISettings(
      aiProvider,
      geminiKey.trim(),
      openaiKey.trim(),
      openaiModel,
      openrouterKey.trim(),
      openrouterModel.trim(),
      geminiModel
    );
    if (onSaveApiKey) {
      onSaveApiKey(geminiKey.trim());
    }
    if (onToggleSplashAnimation) {
      onToggleSplashAnimation(showSplashAnimation);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white dark:bg-[#232D29] text-[#3F4B46] dark:text-[#EDF2EF] w-full max-w-sm rounded-t-3xl sm:rounded-3xl p-5 shadow-cozy animate-in slide-in-from-bottom duration-200 text-xs max-h-[92vh] overflow-y-auto border border-[#AEBDB5]/30 dark:border-[#394842]">
        <div className="flex items-center justify-between pb-3 border-b border-[#AEBDB5]/20 dark:border-[#394842]">
          <h4 className="font-bold text-[#3F4B46] dark:text-[#EDF2EF] text-base">{t('settings.title')}</h4>
          <button onClick={onClose} className="text-[#6F7C76] hover:text-[#3F4B46] dark:text-[#A8B8B1] dark:hover:text-[#EDF2EF] transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSaveAll} className="mt-4 space-y-4">
          {/* Language Selector Section */}
          <div className="p-3.5 bg-[#F7F4EE] dark:bg-[#18201D] rounded-2xl border border-[#AEBDB5]/30 dark:border-[#394842] space-y-2.5 shadow-2xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-bold text-[#3F4B46] dark:text-[#EDF2EF]">
                <Globe className="w-4 h-4" style={{ color: activeColor.primary }} />
                <span>{t('settings.language')}</span>
              </div>
              <span
                className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border"
                style={{
                  backgroundColor: isDark ? activeColor.darkBg : activeColor.bgTintLight,
                  borderColor: isDark ? activeColor.darkBorder : activeColor.border,
                  color: isDark ? activeColor.darkText : activeColor.textDark
                }}
              >
                {language.toUpperCase()}
              </span>
            </div>
            <p className="text-[11px] text-[#6F7C76] dark:text-[#A8B8B1] leading-snug">
              {t('settings.languageDesc')}
            </p>
            <div className="grid grid-cols-3 gap-2 pt-0.5">
              {[
                { code: 'pt', label: 'Português', flag: '🇧🇷' },
                { code: 'en', label: 'English', flag: '🇺🇸' },
                { code: 'es', label: 'Español', flag: '🇪🇸' },
              ].map((item) => {
                const active = language === item.code;
                return (
                  <button
                    key={item.code}
                    type="button"
                    onClick={() => setLanguage(item.code as Language)}
                    className={`py-2 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 border ${
                      active
                        ? 'text-white shadow-xs'
                        : 'bg-white dark:bg-[#232D29] text-[#3F4B46] dark:text-[#EDF2EF] border-[#AEBDB5]/30 dark:border-[#394842] hover:bg-[#ECEFE7] dark:hover:bg-[#2B3732]'
                    }`}
                    style={
                      active
                        ? { backgroundColor: activeColor.primary, borderColor: activeColor.primary }
                        : undefined
                    }
                  >
                    <span>{item.flag}</span>
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Appearance & Pastel Colors Section */}
          <div className="p-3.5 bg-[#F7F4EE] dark:bg-[#18201D] rounded-2xl border border-[#AEBDB5]/30 dark:border-[#394842] space-y-3 shadow-2xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-bold text-[#3F4B46] dark:text-[#EDF2EF]">
                <Palette className="w-4 h-4" style={{ color: activeColor.primary }} />
                <span>Aparência e Cores</span>
              </div>
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded-full border transition-colors"
                style={{
                  backgroundColor: isDark ? activeColor.darkBg : activeColor.pastel,
                  color: isDark ? activeColor.darkText : activeColor.textDark,
                  borderColor: isDark ? activeColor.darkBorder : activeColor.border
                }}
              >
                {activeColor.emoji} {activeColor.label}
              </span>
            </div>

            {/* Theme mode: System / Light / Dark */}
            <div>
              <span className="text-[10px] font-bold text-[#6F7C76] dark:text-[#A8B8B1] uppercase tracking-wider block mb-1.5">
                Modo de Exibição
              </span>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { m: 'system' as ThemeMode, label: 'Aparelho', icon: Laptop },
                  { m: 'light' as ThemeMode, label: 'Claro', icon: Sun },
                  { m: 'dark' as ThemeMode, label: 'Escuro', icon: Moon }
                ].map((item) => {
                  const Icon = item.icon;
                  const isActive = mode === item.m;
                  return (
                    <button
                      key={item.m}
                      type="button"
                      onClick={() => setMode(item.m)}
                      className={`py-2 px-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 border ${
                        isActive
                          ? 'text-white border-transparent shadow-xs'
                          : 'bg-white dark:bg-[#232D29] text-[#3F4B46] dark:text-[#EDF2EF] border-[#AEBDB5]/30 dark:border-[#394842] hover:bg-[#ECEFE7] dark:hover:bg-[#2B3732]'
                      }`}
                      style={
                        isActive
                          ? { backgroundColor: activeColor.primary }
                          : undefined
                      }
                    >
                      <Icon className="w-3.5 h-3.5 shrink-0" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Secondary Pastel Colors */}
            <div>
              <span className="text-[10px] font-bold text-[#6F7C76] dark:text-[#A8B8B1] uppercase tracking-wider block mb-1.5">
                Cor Secundária (Tons Pastéis)
              </span>
              <div className="grid grid-cols-7 gap-1.5 pt-0.5">
                {(Object.keys(PASTEL_COLORS) as SecondaryColor[]).map((colId) => {
                  const col = PASTEL_COLORS[colId];
                  const isSelected = secondaryColor === colId;
                  return (
                    <button
                      key={colId}
                      type="button"
                      onClick={() => setSecondaryColor(colId)}
                      title={col.label}
                      className={`group relative flex flex-col items-center justify-center p-1 rounded-xl border transition-all active:scale-90 ${
                        isSelected
                          ? 'scale-105 border-transparent'
                          : 'border-[#AEBDB5]/30 dark:border-[#394842] hover:scale-105'
                      }`}
                      style={{
                        backgroundColor: isSelected
                          ? (isDark ? col.darkBg : col.pastel)
                          : (isDark ? '#232D29' : '#ffffff'),
                        boxShadow: isSelected ? `0 0 0 2px ${col.primary}` : undefined
                      }}
                    >
                      <span className="text-base leading-none mb-0.5">{col.emoji}</span>
                      <div
                        className="w-3 h-3 rounded-full border border-black/10 flex items-center justify-center"
                        style={{ backgroundColor: col.primary }}
                      >
                        {isSelected && <Check className="w-2 h-2 text-white stroke-[3]" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          {/* User Account / Auth Section */}
          <div className="p-3.5 bg-[#F7F4EE] dark:bg-[#18201D] rounded-2xl border border-[#AEBDB5]/30 dark:border-[#394842] space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-bold text-[#3F4B46] dark:text-[#EDF2EF]">
                <User className="w-4 h-4" style={{ color: activeColor.primary }} />
                <span>{t('account.title')}</span>
              </div>
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1"
                style={{
                  backgroundColor: isDark ? activeColor.darkBg : activeColor.bgTintLight,
                  borderColor: isDark ? activeColor.darkBorder : activeColor.border,
                  color: isDark ? activeColor.darkText : activeColor.textDark
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: activeColor.primary }} />
                {profile.email ? t('account.active') : t('account.offline')}
              </span>
            </div>

            {profile.email ? (
              <div className="bg-white dark:bg-[#232D29] p-2.5 rounded-xl border border-[#AEBDB5]/30 dark:border-[#394842] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 inline" style={{ color: activeColor.primary }} />
                      <span className="text-[10px] uppercase tracking-wider font-bold leading-none" style={{ color: activeColor.primary }}>
                        {t('account.linkedEmail')}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-[#3F4B46] dark:text-[#EDF2EF] truncate mt-0.5" title={profile.email}>
                      {profile.email}
                    </p>
                  </div>
                  {onLogout && (
                    <button
                      type="button"
                      onClick={onLogout}
                      className="flex items-center gap-1 py-1 px-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-600 dark:text-rose-300 border border-rose-200/50 dark:border-rose-900/40 font-bold text-xs shrink-0 transition-colors"
                    >
                      <LogOut className="w-3 h-3" />
                      <span>{t('account.logout')}</span>
                    </button>
                  )}
                </div>

                {/* 2FA Action */}
                <div className="pt-2 border-t border-[#AEBDB5]/20 dark:border-[#394842] flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-indigo-500" />
                    <div>
                      <p className="text-xs font-bold text-[#3F4B46] dark:text-[#EDF2EF]">{t('account.twoFactorTitle')}</p>
                      <p className="text-[10px] text-[#6F7C76] dark:text-[#A8B8B1]">
                        {profile.isTwoFactorEnabled ? t('account.twoFactorActive') : t('account.twoFactorDisabled')}
                      </p>
                    </div>
                  </div>
                  {onOpenTwoFactorModal && (
                    <button
                      type="button"
                      onClick={onOpenTwoFactorModal}
                      className={`text-xs font-bold px-2.5 py-1 rounded-lg transition-colors ${
                        profile.isTwoFactorEnabled
                          ? 'bg-[#ECEFE7] dark:bg-[#132C23] text-[#3F4B46] dark:text-[#A7F3D0]'
                          : 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-300'
                      }`}
                    >
                      {profile.isTwoFactorEnabled ? t('account.twoFactorIsActive') : t('account.twoFactorConfigure')}
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between bg-white dark:bg-[#232D29] p-2.5 rounded-xl border border-[#AEBDB5]/30 dark:border-[#394842]">
                <div className="pr-2">
                  <p className="text-xs font-bold text-[#3F4B46] dark:text-[#EDF2EF]">{t('account.guestTitle')}</p>
                  <p className="text-[10px] text-[#6F7C76] dark:text-[#A8B8B1]">{t('account.guestSubtitle')}</p>
                </div>
                {onOpenAuth && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenAuth();
                    }}
                    className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-white font-bold text-xs shrink-0 shadow-xs active:scale-95 transition-all"
                    style={{ backgroundColor: activeColor.primary }}
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>{t('account.loginBtn')}</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Health & Devices Section */}
          <div className="p-3.5 bg-[#F7F4EE] dark:bg-[#18201D] rounded-2xl border border-[#AEBDB5]/30 dark:border-[#394842] space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-bold text-[#3F4B46] dark:text-[#EDF2EF]">
                <Heart className="w-4 h-4" style={{ color: activeColor.primary, fill: activeColor.pastel }} />
                <span>{t('health.title')}</span>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                  profile.appleHealthSynced
                    ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                    : isCapacitorNative()
                    ? 'bg-slate-200 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300'
                    : 'bg-amber-100/70 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-300/40 dark:border-amber-800/40'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${profile.appleHealthSynced ? 'bg-emerald-500' : (isCapacitorNative() ? 'bg-slate-400' : 'bg-amber-400')}`} />
                {profile.appleHealthSynced ? t('health.linked') : (isCapacitorNative() ? t('health.disconnected') : 'Exclusivo do App')}
              </span>
            </div>

            <p className="text-[11px] text-[#6F7C76] dark:text-[#A8B8B1] leading-snug">
              {t('health.desc')}
            </p>

            {onSyncHealth && (
              <button
                type="button"
                onClick={onSyncHealth}
                className="w-full py-2 px-3 rounded-full hover:brightness-95 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all active:scale-98"
                style={{ backgroundColor: activeColor.primary }}
              >
                <span>❤️</span>
                <span>{t('health.syncBtn')}</span>
              </button>
            )}
          </div>

          {/* Launch Animation Toggle Switch */}
          <div className="p-3.5 bg-[#F7F4EE] dark:bg-[#18201D] rounded-2xl border border-[#AEBDB5]/30 dark:border-[#394842] flex items-center justify-between">
            <div className="pr-3">
              <p className="text-xs font-bold text-[#3F4B46] dark:text-[#EDF2EF]">{t('splash.title')}</p>
              <p className="text-[11px] text-[#6F7C76] dark:text-[#A8B8B1] leading-snug">{t('splash.desc')}</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={showSplashAnimation}
              onClick={handleToggleSplash}
              className="w-11 h-6 shrink-0 flex items-center rounded-full p-1 transition-colors"
              style={{
                backgroundColor: showSplashAnimation ? activeColor.primary : (isDark ? '#394842' : '#CBD5E1')
              }}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  showSplashAnimation ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Redo Onboarding Survey Button */}
          {onRedoOnboarding && (
            <div className="p-3.5 bg-[#F7F4EE] dark:bg-[#18201D] rounded-2xl border border-[#AEBDB5]/30 dark:border-[#394842] flex items-center justify-between">
              <div className="pr-3">
                <div className="flex items-center gap-1.5 font-bold text-[#3F4B46] dark:text-[#EDF2EF] text-xs mb-0.5">
                  <div className="w-5 h-5 flex items-center justify-center shrink-0">
                    <FoodBudMascot headOnly className="w-full h-full" mood="happy" petLevel={1} />
                  </div>
                  <span>Pesquisa Inicial com Guaxinim</span>
                </div>
                <p className="text-[11px] text-[#6F7C76] dark:text-[#A8B8B1] leading-snug">
                  Refaça a pesquisa interativa e recalcule suas metas com peso real.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onRedoOnboarding();
                }}
                className="py-1.5 px-3 rounded-xl text-white font-bold text-xs shrink-0 shadow-xs active:scale-95 transition-all"
                style={{ backgroundColor: activeColor.primary }}
              >
                Refazer
              </button>
            </div>
          )}

          {/* AI Provider & Custom Key Section */}
          <div className="p-3.5 bg-[#F7F4EE] dark:bg-[#18201D] rounded-2xl border border-[#AEBDB5]/30 dark:border-[#394842] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-bold text-[#3F4B46] dark:text-[#EDF2EF]">
                <Sparkles className="w-4 h-4 text-purple-500" />
                <span>{t('ai.title')}</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/40 text-purple-800 dark:text-purple-300">
                {aiProvider === 'openrouter' ? t('ai.freeOpenRouter') : aiProvider === 'openai' ? t('ai.openAiGpt') : t('ai.geminiStudio')}
              </span>
            </div>

            <p className="text-[11px] text-[#6F7C76] dark:text-[#A8B8B1] leading-snug">
              {t('ai.desc')}
            </p>

            {/* Provider Selector 3 Tabs */}
            <div className="grid grid-cols-3 gap-1 bg-[#ECEFE7] dark:bg-[#243730] p-1 rounded-xl">
              <button
                type="button"
                onClick={() => {
                  setAiProvider('openrouter');
                  setAiTestStatus(null);
                }}
                className={`py-1.5 rounded-lg font-bold text-[10px] flex items-center justify-center gap-1 transition-all ${
                  aiProvider === 'openrouter'
                    ? 'bg-white dark:bg-[#232D29] text-[#3F4B46] dark:text-[#EDF2EF] shadow-xs'
                    : 'text-[#6F7C76] dark:text-[#A8B8B1] hover:text-[#3F4B46] dark:hover:text-[#EDF2EF]'
                }`}
              >
                <Sparkles className="w-3 h-3 text-purple-500" />
                <span>OpenRouter</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAiProvider('openai');
                  setAiTestStatus(null);
                }}
                className={`py-1.5 rounded-lg font-bold text-[10px] flex items-center justify-center gap-1 transition-all ${
                  aiProvider === 'openai'
                    ? 'bg-white dark:bg-[#232D29] text-[#3F4B46] dark:text-[#EDF2EF] shadow-xs'
                    : 'text-[#6F7C76] dark:text-[#A8B8B1] hover:text-[#3F4B46] dark:hover:text-[#EDF2EF]'
                }`}
              >
                <Bot className="w-3 h-3 text-emerald-500" />
                <span>OpenAI</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAiProvider('gemini');
                  setAiTestStatus(null);
                }}
                className={`py-1.5 rounded-lg font-bold text-[10px] flex items-center justify-center gap-1 transition-all ${
                  aiProvider === 'gemini'
                    ? 'bg-white dark:bg-[#232D29] text-[#3F4B46] dark:text-[#EDF2EF] shadow-xs'
                    : 'text-[#6F7C76] dark:text-[#A8B8B1] hover:text-[#3F4B46] dark:hover:text-[#EDF2EF]'
                }`}
              >
                <Sparkles className="w-3 h-3 text-blue-500" />
                <span>Gemini</span>
              </button>
            </div>

            {/* OpenRouter Configuration */}
            {aiProvider === 'openrouter' ? (
              <div className="space-y-2.5 pt-1">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-[#3F4B46] dark:text-[#EDF2EF] text-[11px]">
                      {t('ai.keyOpenRouterLabel')}
                    </label>
                    <a
                      href="https://openrouter.ai/keys"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-purple-600 dark:text-purple-400 hover:underline font-semibold"
                    >
                      {t('ai.createKeyFree')}
                    </a>
                  </div>
                  <div className="relative">
                    <input
                      type={showKey ? 'text' : 'password'}
                      value={openrouterKey}
                      onChange={(e) => setOpenrouterKey(e.target.value)}
                      placeholder="sk-or-v1-..."
                      className="w-full pl-3 pr-9 py-2 rounded-xl border border-[#AEBDB5]/40 dark:border-[#394842] focus:outline-none font-mono text-[11px] bg-white dark:bg-[#232D29] text-[#3F4B46] dark:text-[#EDF2EF]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowKey(!showKey)}
                      className="absolute inset-y-0 right-2.5 flex items-center text-[#6F7C76] hover:text-[#3F4B46] dark:text-[#A8B8B1] dark:hover:text-[#EDF2EF]"
                    >
                      {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-[#3F4B46] dark:text-[#EDF2EF] text-[11px]">
                      {t('ai.modelOpenRouter')}
                    </label>
                    {isCustomOpenrouter ? (
                      <button
                        type="button"
                        onClick={() => {
                          setIsCustomOpenrouter(false);
                          setOpenrouterModel('openrouter/free');
                        }}
                        className="text-[10px] text-purple-600 dark:text-purple-400 hover:underline font-semibold"
                      >
                        Ver modelos sugeridos
                      </button>
                    ) : null}
                  </div>

                  {!isCustomOpenrouter ? (
                    <select
                      value={openrouterModel}
                      onChange={(e) => {
                        if (e.target.value === '__custom__') {
                          setIsCustomOpenrouter(true);
                        } else {
                          setOpenrouterModel(e.target.value);
                        }
                      }}
                      className="w-full p-2 rounded-xl border border-[#AEBDB5]/40 dark:border-[#394842] focus:outline-none text-[11px] bg-white dark:bg-[#232D29] font-medium text-[#3F4B46] dark:text-[#EDF2EF]"
                    >
                      {OPENROUTER_PRESETS.map((preset) => (
                        <option key={preset.id} value={preset.id}>
                          {preset.label}
                        </option>
                      ))}
                      <option value="__custom__">
                        Outro modelo personalizado...
                      </option>
                    </select>
                  ) : (
                    <div className="space-y-1">
                      <input
                        type="text"
                        value={openrouterModel}
                        onChange={(e) => setOpenrouterModel(e.target.value)}
                        placeholder={t('ai.customModelPlaceholder')}
                        className="w-full p-2 rounded-xl border border-[#AEBDB5]/40 dark:border-[#394842] focus:outline-none text-[11px] font-mono bg-white dark:bg-[#232D29] text-[#3F4B46] dark:text-[#EDF2EF]"
                      />
                      <p className="text-[10px] text-[#6F7C76] dark:text-[#A8B8B1]">
                        Dica: use qualquer slug oficial do catálogo OpenRouter (ex: deepseek/deepseek-chat ou openrouter/free).
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : aiProvider === 'openai' ? (
              <div className="space-y-2.5 pt-1">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-[#3F4B46] dark:text-[#EDF2EF] text-[11px]">
                      {t('ai.keyOpenAiLabel')}
                    </label>
                    <a
                      href="https://platform.openai.com/api-keys"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline font-semibold"
                    >
                      {t('ai.createKeyOpenAi')}
                    </a>
                  </div>
                  <div className="relative">
                    <input
                      type={showKey ? 'text' : 'password'}
                      value={openaiKey}
                      onChange={(e) => setOpenaiKey(e.target.value)}
                      placeholder="sk-proj-..."
                      className="w-full pl-3 pr-9 py-2 rounded-xl border border-[#AEBDB5]/40 dark:border-[#394842] focus:outline-none font-mono text-[11px] bg-white dark:bg-[#232D29] text-[#3F4B46] dark:text-[#EDF2EF]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowKey(!showKey)}
                      className="absolute inset-y-0 right-2.5 flex items-center text-[#6F7C76] hover:text-[#3F4B46] dark:text-[#A8B8B1] dark:hover:text-[#EDF2EF]"
                    >
                      {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-[#3F4B46] dark:text-[#EDF2EF] block mb-1 text-[11px]">
                    {t('ai.modelOpenAI')}
                  </label>
                  <select
                    value={openaiModel}
                    onChange={(e) => setOpenaiModel(e.target.value)}
                    className="w-full p-2 rounded-xl border border-[#AEBDB5]/40 dark:border-[#394842] focus:outline-none text-[11px] bg-white dark:bg-[#232D29] font-medium text-[#3F4B46] dark:text-[#EDF2EF]"
                  >
                    <option value="gpt-4o-mini">gpt-4o-mini (Recomendado - Ultra rápido e econômico)</option>
                    <option value="gpt-4o">gpt-4o (Máxima precisão nutricional e visão avançada)</option>
                  </select>
                </div>
              </div>
            ) : (
              /* Gemini Configuration */
              <div className="space-y-2.5 pt-1">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-[#3F4B46] dark:text-[#EDF2EF] text-[11px]">
                      {t('ai.keyGeminiLabel')}
                    </label>
                    <a
                      href="https://aistudio.google.com/app/apikey"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline font-semibold"
                    >
                      {t('ai.createKeyGemini')}
                    </a>
                  </div>
                  <div className="relative">
                    <input
                      type={showKey ? 'text' : 'password'}
                      value={geminiKey}
                      onChange={(e) => setGeminiKey(e.target.value)}
                      placeholder="AIzaSy..."
                      className="w-full pl-3 pr-9 py-2 rounded-xl border border-[#AEBDB5]/40 dark:border-[#394842] focus:outline-none font-mono text-[11px] bg-white dark:bg-[#232D29] text-[#3F4B46] dark:text-[#EDF2EF]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowKey(!showKey)}
                      className="absolute inset-y-0 right-2.5 flex items-center text-[#6F7C76] hover:text-[#3F4B46] dark:text-[#A8B8B1] dark:hover:text-[#EDF2EF]"
                    >
                      {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-[#3F4B46] dark:text-[#EDF2EF] block mb-1 text-[11px]">
                    {t('ai.modelGemini')}
                  </label>
                  <select
                    value={geminiModel}
                    onChange={(e) => setGeminiModel(e.target.value)}
                    className="w-full p-2 rounded-xl border border-[#AEBDB5]/40 dark:border-[#394842] focus:outline-none text-[11px] bg-white dark:bg-[#232D29] font-medium text-[#3F4B46] dark:text-[#EDF2EF]"
                  >
                    <option value="gemini-3.5-flash-lite">
                      gemini-3.5-flash-lite (Recomendado - Mais Novo, Ultra Rápido & Grátis)
                    </option>
                    <option value="gemini-3.5-flash">
                      gemini-3.5-flash (Nova geração 3.5 Flash)
                    </option>
                    <option value="gemini-2.5-flash">
                      gemini-2.5-flash (Geração 2.5 Flash)
                    </option>
                    <option value="gemini-2.0-flash">
                      gemini-2.0-flash (Geração 2.0 com visão de fotos)
                    </option>
                  </select>
                  <p className="text-[10px] text-[#6F7C76] dark:text-[#A8B8B1] mt-1">
                    {t('ai.geminiModelNotice')}
                  </p>
                </div>
              </div>
            )}

            {/* Test AI Connection Button */}
            <div className="pt-1">
              <button
                type="button"
                onClick={handleTestAI}
                disabled={
                  isTestingAI ||
                  (aiProvider === 'openrouter'
                    ? !openrouterKey.trim()
                    : aiProvider === 'openai'
                    ? !openaiKey.trim()
                    : !geminiKey.trim())
                }
                className="w-full py-2 px-3 rounded-full text-white font-bold text-[11px] flex items-center justify-center gap-1.5 disabled:opacity-50 transition-all shadow-xs"
                style={{ backgroundColor: activeColor.primary }}
              >
                {isTestingAI ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <>
                    <Key className="w-3.5 h-3.5" />
                    <span>
                      {t('ai.testKeyWith')} ({aiProvider === 'openrouter' ? 'OpenRouter' : aiProvider === 'openai' ? 'OpenAI' : 'Gemini'})
                    </span>
                  </>
                )}
              </button>
            </div>

            {aiTestStatus && (
              <div
                className={`p-2.5 rounded-xl text-[11px] flex items-start gap-1.5 ${
                  aiTestStatus.type === 'success'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800/40'
                    : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 border border-rose-200 dark:border-rose-800/40'
                }`}
              >
                {aiTestStatus.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                )}
                <span>{aiTestStatus.text}</span>
              </div>
            )}
          </div>

          {/* Matcha Pill Submit Button from Design System */}
          <button
            type="submit"
            className="w-full py-3 rounded-full bg-[#C9D9C8] hover:bg-[#C8E6C9] text-[#3F4B46] font-bold border-2 border-[#6F7C76] shadow-sm active:scale-95 transition-all text-xs"
          >
            {t('settings.save')}
          </button>
        </form>
      </div>
    </div>
  );
};
