import React from 'react';
import { Pencil, Users, Settings, LogIn, LogOut, ShieldCheck } from 'lucide-react';
import { UserProfile, ProfileSubTab } from '../../types';
import { useTranslation } from '../../services/i18n';
import { useTheme } from '../../services/themeService';

interface ProfileHeaderProps {
  profile: UserProfile;
  activeSubTab: ProfileSubTab;
  onChangeSubTab: (tab: ProfileSubTab) => void;
  onEditProfile: () => void;
  onOpenSettings: () => void;
  onOpenScientificAssessment?: () => void;
  onOpenAuth?: () => void;
  onLogout?: () => void;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  profile,
  activeSubTab,
  onChangeSubTab,
  onEditProfile,
  onOpenSettings,
  onOpenScientificAssessment,
  onOpenAuth,
  onLogout
}) => {
  const { t } = useTranslation();
  const { isDark, activeColor } = useTheme();

  return (
    <div className="bg-white dark:bg-[#232D29] rounded-b-[36px] px-5 pt-4 pb-4 border-b border-[#AEBDB5]/30 dark:border-[#394842] shadow-cozy select-none transition-colors duration-200">
      {/* Top row: Avatar + Name/Goal + Action Icons */}
      <div className="flex items-center justify-between">
        {/* Left: Avatar with initial and pencil edit badge */}
        <div className="relative cursor-pointer group" onClick={onEditProfile}>
          <div
            className="w-[72px] h-[72px] rounded-[24px] border-[2.5px] shadow-sm flex items-center justify-center text-3xl font-black transition-all overflow-hidden"
            style={{
              background: isDark
                ? `linear-gradient(135deg, ${activeColor.darkBg} 0%, #18201D 100%)`
                : `linear-gradient(135deg, ${activeColor.pastel} 0%, ${activeColor.bgTintLight} 100%)`,
              borderColor: activeColor.primary,
              boxShadow: isDark
                ? `0 4px 16px ${activeColor.primary}25`
                : `0 4px 16px ${activeColor.primary}30`,
              color: isDark ? activeColor.darkText : activeColor.primary
            }}
          >
            {profile.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt={profile.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="select-none tracking-tight">{profile.avatarText}</span>
            )}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEditProfile();
            }}
            className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full shadow-md flex items-center justify-center transition-transform active:scale-90 border-2"
            style={{
              backgroundColor: activeColor.primary,
              borderColor: isDark ? '#232D29' : '#ffffff',
              color: '#ffffff'
            }}
            aria-label="Editar foto"
          >
            <Pencil className="w-3.5 h-3.5 text-white stroke-[2.5]" />
          </button>
        </div>

        {/* Middle: Name, Goal, Target Cal */}
        <div className="flex-1 ml-4 min-w-0">
          <div className="flex items-center gap-1.5 cursor-pointer group" onClick={onEditProfile}>
            <h2 className="font-bold text-[#3F4B46] dark:text-[#EDF2EF] text-lg leading-tight truncate transition-colors">
              {profile.name}
            </h2>
            <Pencil className="w-3.5 h-3.5 text-[#6F7C76] dark:text-[#A8B8B1] stroke-[2.5] shrink-0" />
          </div>

          <p className="text-xs font-medium text-[#6F7C76] dark:text-[#A8B8B1] mt-0.5">
            {profile.goalType}
          </p>

          <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
            <button
              onClick={onOpenScientificAssessment}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-all active:scale-95 shadow-2xs"
              style={{
                backgroundColor: isDark ? activeColor.darkBg : activeColor.bgTintLight,
                borderColor: isDark ? activeColor.darkBorder : activeColor.border,
                color: isDark ? activeColor.darkText : activeColor.textDark
              }}
              title="Calcular cientificamente (Mifflin-St Jeor)"
            >
              <span>{profile.dailyCaloriesTarget} kcal / d</span>
              <span className="text-[11px]" style={{ color: activeColor.primary }}>🔬</span>
            </button>
          </div>
        </div>

        {/* Right: Community & Settings */}
        <div className="flex items-center gap-2">
          {onOpenScientificAssessment && (
            <button
              onClick={onOpenScientificAssessment}
              className="w-10 h-10 rounded-full bg-[#F7F4EE] dark:bg-[#18201D] hover:bg-[#ECEFE7] dark:hover:bg-[#2B3732] text-[#3F4B46] dark:text-[#EDF2EF] flex items-center justify-center transition-colors border border-[#AEBDB5]/30 dark:border-[#394842] shadow-2xs"
              title="Avaliação Científica (Mifflin-St Jeor)"
            >
              <span className="text-base">🔬</span>
            </button>
          )}

          <button
            onClick={() => alert('Comunidade NutriFam em breve!')}
            className="relative w-10 h-10 rounded-full bg-[#F7F4EE] dark:bg-[#18201D] hover:bg-[#ECEFE7] dark:hover:bg-[#2B3732] text-[#3F4B46] dark:text-[#EDF2EF] flex items-center justify-center transition-colors border border-[#AEBDB5]/30 dark:border-[#394842] shadow-2xs"
            aria-label="Comunidade"
          >
            <Users className="w-4 h-4 stroke-[2]" />
            <span
              className="absolute -top-1 -right-1 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-xs"
              style={{ backgroundColor: activeColor.primary }}
            >
              0
            </span>
          </button>

          <button
            onClick={onOpenSettings}
            className="w-10 h-10 rounded-full bg-[#F7F4EE] dark:bg-[#18201D] hover:bg-[#ECEFE7] dark:hover:bg-[#2B3732] text-[#3F4B46] dark:text-[#EDF2EF] flex items-center justify-center transition-colors border border-[#AEBDB5]/30 dark:border-[#394842] shadow-2xs"
            aria-label="Configurações"
          >
            <Settings className="w-4 h-4 stroke-[2]" />
          </button>
        </div>
      </div>

      {/* Account / Session Bar */}
      <div className="mt-3.5 bg-[#F7F4EE] dark:bg-[#18201D] rounded-2xl px-3.5 py-2.5 border border-[#AEBDB5]/30 dark:border-[#394842]">
        {profile.email ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <span
                className="w-2 h-2 rounded-full shrink-0 shadow-2xs"
                style={{ backgroundColor: activeColor.primary }}
              />
              <div className="min-w-0">
                <div className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 inline" style={{ color: activeColor.primary }} />
                  <span
                    className="text-[10px] uppercase tracking-wider font-bold leading-none"
                    style={{ color: isDark ? activeColor.darkText : activeColor.primary }}
                  >
                    {t('account.active')}
                  </span>
                </div>
                <p className="text-xs font-semibold text-[#3F4B46] dark:text-[#EDF2EF] truncate max-w-[210px]" title={profile.email}>
                  {profile.email}
                </p>
              </div>
            </div>
            {onLogout && (
              <button
                onClick={onLogout}
                className="flex items-center gap-1 text-xs font-bold text-rose-600 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 border border-rose-200/60 dark:border-rose-900/40 px-2.5 py-1 rounded-xl transition-colors shrink-0 ml-2"
                title="Sair da conta"
              >
                <LogOut className="w-3 h-3" />
                <span>{t('account.logout')}</span>
              </button>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0"></span>
              <div>
                <p className="text-xs font-bold text-[#3F4B46] dark:text-[#EDF2EF]">{t('account.guest')}</p>
                <p className="text-[10px] text-[#6F7C76] dark:text-[#A8B8B1]">{t('account.guestDesc')}</p>
              </div>
            </div>
            {onOpenAuth && (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 text-xs font-bold text-white px-3 py-1.5 rounded-xl shadow-xs active:scale-95 transition-all shrink-0 ml-2"
                style={{ backgroundColor: activeColor.primary }}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>{t('account.login')}</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Segmented Pill Subtabs ("Peso & Metas" vs "Análise Nutricional") */}
      <div className="mt-4 bg-[#ECEFE7] dark:bg-[#18201D] p-1 rounded-full border border-[#AEBDB5]/30 dark:border-[#394842] flex items-center select-none">
        <button
          onClick={() => onChangeSubTab('weight')}
          className={`flex-1 py-2 text-center text-xs font-bold rounded-full transition-all ${
            activeSubTab === 'weight'
              ? 'bg-white dark:bg-[#232D29] text-[#3F4B46] dark:text-[#EDF2EF] shadow-xs'
              : 'text-[#6F7C76] dark:text-[#A8B8B1] hover:text-[#3F4B46] dark:hover:text-[#EDF2EF]'
          }`}
        >
          {t('profile.tabWeight')}
        </button>

        <button
          onClick={() => onChangeSubTab('nutrition')}
          className={`flex-1 py-2 text-center text-xs font-bold rounded-full transition-all ${
            activeSubTab === 'nutrition'
              ? 'bg-white dark:bg-[#232D29] text-[#3F4B46] dark:text-[#EDF2EF] shadow-xs'
              : 'text-[#6F7C76] dark:text-[#A8B8B1] hover:text-[#3F4B46] dark:hover:text-[#EDF2EF]'
          }`}
        >
          {t('profile.tabNutrition')}
        </button>
      </div>
    </div>
  );
};
